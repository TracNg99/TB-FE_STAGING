// import { Button } from '@mantine/core';
import { IconCloudUpload } from '@tabler/icons-react';
import heic2any from 'heic2any';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  useDeleteMediaAssetMutation,
  useUploadImageCloudRunMutation,
} from '@/store/redux/slices/storage/upload';

import DropzoneUploader from './image-picker-dropzone';

export function blobToBase64(file: File | Blob): Promise<string> {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

export function base64ToBlob(base64String: string) {
  const byteString = atob(base64String.split(',')[1]);
  const mimeType = base64String.split(',')[0].split(':')[1].split(';')[0];
  const byteArrays = [];

  for (let offset = 0; offset < byteString.length; offset += 512) {
    const slice = byteString.slice(offset, offset + 512);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  return new Blob(byteArrays, { type: mimeType });
}

export function calculateSize(img: any) {
  const width = img?.width;
  const height = img?.height;
  const buffer = Buffer.from(img.src.split(',')[1], 'base64');
  const size = buffer.length / Math.pow(1024, 2); // in MB
  let scale = 0.7 / size;
  // Prevent upscaling small images.
  if (scale > 1) scale = 1;
  // Enforce a minimum scale (you can adjust 0.2 as needed) so images don’t get too tiny.
  if (scale < 0.2) scale = 0.2;

  const newWidth = Math.round(width * scale);
  const newHeight = Math.round(height * scale);

  return [newWidth, newHeight];
}

export async function handleResize(
  file: File | Blob,
  fileName?: string,
): Promise<{ image: string; name: string }> {
  const imageString = await blobToBase64(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageString;

    img.onload = () => {
      const [newWidth, newHeight] = calculateSize(img);
      const canvas = document.createElement('canvas');

      canvas.width = newWidth;
      canvas.height = newHeight;

      // context is where the canvas references to know what data to render
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

      // "compression" occurs below, where the new image is drawn onto the canvas based on the parameters we pass in
      // the second and third parameters tell the canvas where to place the image within its render, starting from the top left corner (i.e. a value greater than 0 will add whitespace from top-down, left-to-right
      // referencing https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // here we specify the quality, which is the second argument in .toDataUrl(...) | here the output should be 50% the quality of the original, lowering the detail and file size
      const newImageUrl = ctx.canvas.toDataURL('image/jpg', 1); // quality ranges 0-1
      // below is not necessary (used for testing)
      // const buffer = Buffer.from(newImageUrl.split(",")[1], "base64");

      resolve({
        image: newImageUrl,
        name: (file as File).name || (fileName as string),
      });
    };
    img.onerror = (e) => reject(e);
  });
}

interface UploadHandlerProps {
  acceptedFiles: File[] | FileList | null;
  asBlob?: boolean;
  selectedImages: Array<{
    image: string | null;
    name: string | null;
    isExisting?: boolean;
    isLoading?: boolean;
    id?: string | null;
  }>;
  setImageError?: (state: boolean) => void;
  setSelectedImages: (
    images: Array<{
      image: string | null;
      name: string | null;
      isExisting?: boolean;
      isLoading?: boolean;
      id?: string | null;
    }>,
  ) => void;
  onImageUpload: (
    images: Array<
      {
        image: string | null;
        name: string | null;
        isExisting?: boolean;
        isLoading?: boolean;
        id?: string | null;
      } & File
    >,
  ) => void;
  withResize?: boolean;
  allowMultiple?: boolean;
  setLoadingFiles?: (updater: React.SetStateAction<{ name: string }[]>) => void;
  handleMediaUploadToStorage?: (
    item: {
      image: string | null;
      name: string | null;
      isExisting?: boolean;
      isLoading?: boolean;
      id?: string | null;
    }[],
  ) => void;
  withUploader?: boolean;
}

export const handleImageUpload = ({
  acceptedFiles,
  withResize,
  allowMultiple,
  selectedImages,
  withUploader,
  setImageError,
  setSelectedImages,
  onImageUpload,
  setLoadingFiles,
  handleMediaUploadToStorage,
  asBlob = false,
}: UploadHandlerProps) => {
  if (acceptedFiles && acceptedFiles.length > 0) {
    const files =
      typeof acceptedFiles === 'object'
        ? Array.from(acceptedFiles)
        : acceptedFiles;

    const heicFiles = files.filter((f) =>
      f.name.toLowerCase().endsWith('.heic'),
    );
    if (setLoadingFiles && heicFiles.length > 0) {
      setLoadingFiles((prev) => [
        ...prev,
        ...heicFiles.map((f) => ({ name: f.name })),
      ]);
    }

    const imageProcessingPromises = files.map(async (file) => {
      try {
        let processedFile = file;
        // Check if the file is a HEIC file and convert it
        if (file.name.toLowerCase().endsWith('.heic')) {
          const conversionResult = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.9, // Adjust quality as needed
          });
          // heic2any can return a single blob or an array of blobs
          const finalBlob = Array.isArray(conversionResult)
            ? conversionResult[0]
            : conversionResult;
          processedFile = new File(
            [finalBlob],
            file.name.replace(/\.heic$/i, '.jpg'),
            {
              type: 'image/jpeg',
            },
          );
        }

        // Now, proceed with the original logic (resize or just read)
        if (withResize) {
          return await handleResize(processedFile);
        } else {
          const image = await blobToBase64(processedFile);
          return { image, name: processedFile.name };
        }
      } catch (error) {
        console.error('Error processing image:', error);
        setImageError?.(true);
        return { image: null, name: file.name }; // Return a consistent object on error
      }
    });

    Promise.all(imageProcessingPromises).then((uploadedImages) => {
      if (setLoadingFiles) {
        const processedFileNames = files.map((f) => f.name);
        setLoadingFiles((prev) =>
          prev.filter((lf) => !processedFileNames.includes(lf.name)),
        );
      }
      const validImages = uploadedImages.filter((img) => img.image !== null);
      const updatedImages = allowMultiple
        ? [...selectedImages, ...validImages]
        : validImages.slice(0, 1); // Only take the first image if allowMultiple is false

      if (withUploader) {
        console.log('uploading to storage');
        const initialMediaWithStates = updatedImages.map(
          (img: {
            image: string | null;
            name: string | null;
            isExisting?: boolean;
            isLoading?: boolean;
            id?: string | null;
          }) => {
            return {
              image: img.image,
              name: img.name,
              isExisting: img.isExisting ?? false,
              isLoading: img.isLoading ?? true,
              id: img.id || null,
            };
          },
        );
        setSelectedImages(initialMediaWithStates);
        onImageUpload(initialMediaWithStates as any);
        handleMediaUploadToStorage?.(
          initialMediaWithStates as {
            image: string | null;
            name: string | null;
            isExisting?: boolean;
            isLoading?: boolean;
            id?: string | null;
          }[],
        );
      } else {
        console.log('not uploading to storage');
        setSelectedImages(updatedImages);
        if (validImages.length < uploadedImages.length) {
          setImageError?.(true);
        } else {
          setImageError?.(false);
        }

        const updatedFiles = updatedImages.map((image) => {
          if (asBlob && image.image) {
            const file = base64ToBlob(image.image as string);
            return file;
          }
          return image; // Return the image object directly if not asBlob
        });

        onImageUpload(updatedFiles as any); // Notify parent component
      }
    });
  }
};

interface ImageUploaderProps {
  onImageUpload: (
    images: (File & {
      image: string | null;
      name: string | null;
      id?: string | null;
      isExisting?: boolean;
      isLoading?: boolean;
      isError?: boolean;
    })[],
  ) => void;
  withDropzone?: boolean;
  dropzoneClassName?: string;
  allowMultiple?: boolean; // New prop for choosing and displaying multiple images
  allowAddNew?: boolean;
  fetchImages?: {
    image: string | null;
    name: string | null;
    isExisting?: boolean;
    isLoading?: boolean;
    isError?: boolean;
    id?: string | null;
  }[];
  withResize?: boolean;
  isStandalone?: boolean;
  asBlob?: boolean;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  withUploader?: boolean;
  uploaderBucketName?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUpload,
  dropzoneClassName,
  className,
  children,
  allowAddNew = true,
  allowMultiple = false,
  asBlob = false,
  fetchImages,
  withResize = false,
  isStandalone = false,
  disabled = false,
  withUploader = false,
  uploaderBucketName = 'experience',
}) => {
  const [selectedImages, setSelectedImages] = useState<
    {
      image: string | null;
      name: string | null;
      id?: string | null;
      isExisting?: boolean;
      isLoading?: boolean;
      isError?: boolean;
    }[]
  >([]);
  const [imageError, setImageError] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState<{ name: string }[]>([]);
  const [isCleared, setIsCleared] = useState<boolean>(false);

  const [uploadImageCloudRun] = useUploadImageCloudRunMutation();
  const [deleteMediaAsset] = useDeleteMediaAssetMutation();

  const handleMediaUploadToStorage = useCallback(
    (
      item: {
        image: string | null;
        name: string | null;
        isExisting?: boolean;
        isLoading?: boolean;
        id?: string | null;
      }[],
    ) => {
      // const existingImages = item.filter((img) => img.isExisting);
      const uploadedImages: {
        image: string | null;
        name: string | null;
        id?: string | null;
        isExisting?: boolean;
        isLoading?: boolean;
      }[] = [];
      const nonExistingImages = item.filter((img) => !img.isExisting);
      nonExistingImages.forEach((img) => {
        const payload = {
          media: {
            mimeType: 'image/jpeg',
            body: img.image as string,
          },
          bucket_name: uploaderBucketName,
        };

        uploadImageCloudRun(payload)
          .unwrap()
          .then(({ url, id }) => {
            setSelectedImages((prev) => {
              return prev.map((selectedImg) => {
                if (
                  selectedImg.isLoading &&
                  !selectedImg.id &&
                  selectedImg.name === img.name
                ) {
                  return {
                    ...selectedImg,
                    isLoading: false,
                    isExisting: true,
                    image: url,
                    id,
                  };
                }
                return selectedImg;
              });
            });
            uploadedImages.push({
              image: url as string,
              name: img.name as string,
              isExisting: true,
              isLoading: false,
              id,
            });

            const updatedImages = item?.map((image) => {
              const uploaded = uploadedImages.find(
                (uploadedImg) => uploadedImg.name === image.name,
              );
              if (uploaded) {
                return uploaded;
              }
              return image;
            });

            console.log('updatedImages after upload:', updatedImages);

            onImageUpload(updatedImages as any); // Notify parent component
          })
          .catch((error) => {
            console.error('Error uploading image:', error);
            // notifications.show({
            //   title: 'Error uploading image',
            //   message: 'Failed to upload one or more images.',
            //   color: 'yellow',
            // });
            setImageError(true);
            setSelectedImages((prev) => {
              return prev.map((img) => {
                if (img.isLoading || !img.id) {
                  return {
                    ...img,
                    isLoading: false,
                    isExisting: false,
                    image: null,
                    id: null,
                    isError: true,
                  };
                }
                return img;
              });
            });
          });
      });
    },
    [onImageUpload, uploadImageCloudRun],
  );

  const handleRemoveImage = (index: number) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index);

    console.log('updatedImages during deletion:', updatedImages);

    if (withUploader) {
      deleteMediaAsset({
        bucket_name: 'story',
        media_query_values: [updatedImages?.[index]?.id as string],
      })
        .unwrap()
        .then(({ message }) => {
          console.log('deleted', message);
        })
        .catch((error) => {
          console.log('error deleting', error);
        });
    }
    setSelectedImages(updatedImages);

    const updatedFiles = updatedImages.map((image) => {
      if (asBlob && image.image) {
        const file = base64ToBlob(image.image as string);
        return file;
      }
      // Ensure the returned object has the expected structure
      return {
        ...image,
        // Add File properties for type compatibility
        size: 0,
        type: 'image/jpeg',
        lastModified: Date.now(),
      } as any;
    });
    onImageUpload(updatedFiles as any); // Notify parent component
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (fetchImages && fetchImages?.length > 0) {
      setSelectedImages(fetchImages);
    }
  }, [fetchImages]);

  useEffect(() => {
    if (isCleared) {
      setSelectedImages([]);
      setIsCleared?.(false);
    }
  }, [isCleared]);

  const paramObj = {
    withResize,
    allowMultiple,
    selectedImages,
    withUploader,
    asBlob,
    setImageError,
    setSelectedImages,
    onImageUpload,
    setLoadingFiles,
    handleMediaUploadToStorage,
  };

  return isStandalone ? (
    <DropzoneUploader
      allowAddNew={allowAddNew}
      imageError={imageError}
      handleRemoveImage={handleRemoveImage}
      loadingFiles={loadingFiles}
      dropzoneClassName={dropzoneClassName}
      {...paramObj}
    >
      {children}
    </DropzoneUploader>
  ) : (
    <button
      // variant="unstyled"
      className={className ?? 'bg-transparent mt-2 size-6 cursor-pointer'}
      type="button"
      onClick={() => fileInputRef.current?.click()}
      disabled={disabled}
    >
      {children ?? <IconCloudUpload className="size-6 text-white" />}
      <input
        type="file"
        multiple={allowMultiple}
        hidden
        onChange={(e) =>
          handleImageUpload({
            acceptedFiles: e.target.files,
            ...paramObj,
          })
        }
        ref={fileInputRef}
      />
    </button>
  );
};

export default ImageUploader;
