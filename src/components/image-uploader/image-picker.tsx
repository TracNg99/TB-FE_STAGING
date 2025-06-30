// import { Button } from '@mantine/core';
import { IconCloudUpload } from '@tabler/icons-react';
import React, { useEffect, useRef, useState } from 'react';

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
  selectedImages: Array<{ image: string | null; name: string | null }>;
  setImageError?: (state: boolean) => void;
  setSelectedImages: (
    images: Array<{ image: string | null; name: string | null }>,
  ) => void;
  onImageUpload: (
    images: Array<{ image: string | null; name: string | null } & File>,
  ) => void;
  withResize?: boolean;
  allowMultiple?: boolean;
}

export const handleImageUpload = ({
  acceptedFiles,
  withResize,
  allowMultiple,
  selectedImages,
  setImageError,
  setSelectedImages,
  onImageUpload,
  asBlob = false,
}: UploadHandlerProps) => {
  if (acceptedFiles && acceptedFiles.length > 0) {
    const files =
      typeof acceptedFiles === 'object'
        ? Array.from(acceptedFiles)
        : acceptedFiles;
    const images = files.map((file) => {
      const reader = new FileReader();
      if (!withResize) {
        return new Promise<{
          image: string | null;
          name: string | null;
        }>((resolve) => {
          reader.onload = () => {
            resolve({ image: reader.result as string, name: file.name });
          };
          reader.onerror = () => {
            setImageError?.(true);
            resolve({ image: null, name: file.name });
          };
          reader.readAsDataURL(file);
        });
      } else {
        // Resize image

        return new Promise<{
          image: string | null;
          name: string | null;
        }>((resolve) => {
          handleResize(file).then((image) => {
            resolve(image);
          });
        });
      }
    });

    Promise.all(images).then((uploadedImages) => {
      const updatedImages = allowMultiple
        ? [...selectedImages, ...uploadedImages]
        : uploadedImages.slice(0, 1); // Only take the first image if allowMultiple is false
      setSelectedImages(updatedImages);
      setImageError?.(false);

      const updatedFiles = updatedImages.map((image) => {
        if (asBlob && image.image) {
          const file = base64ToBlob(image.image);
          return file;
        }
        return image; // Return the image object directly if not asBlob
      });

      onImageUpload(updatedFiles as any); // Notify parent component
    });
  }
};

interface ImageUploaderProps {
  onImageUpload: (
    images: (File & { image: string | null; name: string | null })[],
  ) => void;
  withDropzone?: boolean;
  allowMultiple?: boolean; // New prop for choosing and displaying multiple images
  allowAddNew?: boolean;
  fetchImages?: { image: string | null; name: string | null }[];
  withResize?: boolean;
  isStandalone?: boolean;
  asBlob?: boolean;
  className?: string;
  children?: React.ReactNode;
  isCleared?: boolean;
  setIsCleared?: (state: boolean) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUpload,
  setIsCleared,
  className,
  children,
  allowAddNew = true,
  allowMultiple = false,
  asBlob = false,
  fetchImages = [],
  withResize = false,
  isCleared = false,
  isStandalone = false,
}) => {
  const [selectedImages, setSelectedImages] = useState<
    {
      image: string | null;
      name: string | null;
    }[]
  >([]);
  const [imageError, setImageError] = useState(false);

  const handleRemoveImage = (index: number) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(updatedImages);

    const updatedFiles = updatedImages.map((image) => {
      if (asBlob && image.image) {
        const file = base64ToBlob(image.image);
        return file;
      }
      return image;
    });
    onImageUpload(updatedFiles as any); // Notify parent component
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (fetchImages.length > 0) {
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
    asBlob,
    setImageError,
    setSelectedImages,
    onImageUpload,
  };

  return isStandalone ? (
    <DropzoneUploader
      allowAddNew={allowAddNew}
      imageError={imageError}
      handleRemoveImage={handleRemoveImage}
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
