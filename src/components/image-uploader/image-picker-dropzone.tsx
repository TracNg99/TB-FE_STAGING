import { Button } from '@mantine/core';
import { Dropzone, DropzoneIdle } from '@mantine/dropzone';
import { IconCloudUpload } from '@tabler/icons-react';
import React from 'react';

import ImageDisplayBaseGrid from './image-display-base-grid';
import { handleImageUpload } from './image-picker';

interface ImageSubcomponentProps {
  onImageUpload: (
    images: (File & { image: string | null; name: string | null })[],
  ) => void;
  children?: React.ReactNode;
  allowMultiple?: boolean; // New prop for choosing and displaying multiple images
  allowAddNew?: boolean;
  fetchImages?: {
    image: string | null;
    name: string | null;
    isExisting?: boolean;
  }[];
  withResize?: boolean;
  loadingFiles?: { name: string }[];
  selectedImages: Array<{
    image: string | null;
    name: string | null;
    isExisting?: boolean;
  }>;
  imageError: boolean;
  asBlob?: boolean;
  setImageError: (state: boolean) => void;
  setSelectedImages: (
    images: Array<{
      image: string | null;
      name: string | null;
      isExisting?: boolean;
    }>,
  ) => void;
  handleRemoveImage: (index: number) => void;
}

const DropzoneUploader: React.FC<ImageSubcomponentProps> = ({
  onImageUpload,
  children,
  allowAddNew = true,
  allowMultiple = false,
  withResize = false,
  asBlob = false,
  selectedImages,
  imageError,
  loadingFiles,
  setImageError,
  setSelectedImages,
  handleRemoveImage,
}) => {
  const paramObj = {
    withResize,
    allowMultiple,
    selectedImages,
    setImageError,
    setSelectedImages,
    onImageUpload,
    asBlob,
  };

  return (
    <div className="flex flex-col lg:mx gap-4">
      <Dropzone
        multiple={allowMultiple}
        accept={{
          'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.heic'],
        }}
        className="border-solid mb-4 lg:mb-0"
        onDrop={(files) => {
          console.log('Dropzone onDrop called with files:', files);
          handleImageUpload({
            acceptedFiles: files,
            ...paramObj,
          });
        }}
        onReject={(files) => {
          console.log('Dropzone onReject called with files:', files);
        }}
      >
        {selectedImages.length > 0 ? (
          <ImageDisplayBaseGrid
            allowAddNew={allowAddNew}
            allowMultiple={allowMultiple}
            selectedImages={selectedImages}
            imageError={imageError}
            setImageError={setImageError}
            handleRemoveImage={handleRemoveImage}
            loadingFiles={loadingFiles}
            onAdd={() => {
              // Trigger file input click
              const input = document.createElement('input');
              input.type = 'file';
              input.multiple = allowMultiple;
              input.accept = 'image/*';
              input.onchange = (e) => {
                const files = (e.target as HTMLInputElement).files;
                if (files) {
                  console.log('File input onchange called with files:', files);
                  handleImageUpload({
                    acceptedFiles: files,
                    ...paramObj,
                  });
                }
              };
              input.click();
            }}
          />
        ) : (
          <DropzoneIdle>
            <div className="flex flex-col items-center justify-center h-80">
              {children ?? <IconCloudUpload className="size-6" />}
              <p className="mt-2 text-base-black/50 text-md">
                {`Select ${allowMultiple ? 'up to 10 photos' : 'a photo'}`}
              </p>
              <Button
                variant="outline"
                className="bg-orange-50 text-orange-500 mt-6"
                type="button"
              >
                Browse File
              </Button>
            </div>
          </DropzoneIdle>
        )}
      </Dropzone>
    </div>
  );
};

export default DropzoneUploader;
