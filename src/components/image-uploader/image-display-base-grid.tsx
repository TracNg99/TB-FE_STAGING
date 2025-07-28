import { Box, Image as ImageDisplay, Tooltip } from '@mantine/core';
import { IconPlus, IconX } from '@tabler/icons-react';
import React from 'react';

import { cn } from '@/utils/class';

// import { handleImageUpload } from './image-picker';

interface ImageDisplayProps {
  allowMultiple?: boolean; // New prop for choosing and displaying multiple images
  allowAddNew?: boolean;
  selectedImages: Array<{
    image: string | null;
    name: string | null;
    isExisting?: boolean;
  }>;
  imageError?: boolean;
  setImageError?: (state: boolean) => void;
  className?: string;
  singleImageClassName?: string;
  loadingFiles?: { name: string }[];
  handleRemoveImage: (index: number) => void;
  onAdd?: () => void;
  CustomChildren?: React.FC<{
    index: number;
    image: string | null;
    name: string | null;
    handleRemoveImage: (index: number) => void;
  }>;
}

const BaseImageGridDisplay: React.FC<ImageDisplayProps> = ({
  allowAddNew = true,
  allowMultiple = false,
  selectedImages,
  imageError,
  className,
  singleImageClassName,
  loadingFiles,
  setImageError,
  handleRemoveImage,
  CustomChildren,
  onAdd,
}) => {
  return (
    <div
      className={cn(
        className ??
          `grid 
          grid-cols-[repeat(auto-fit,minmax(5rem,1fr))]
          md:grid-cols-[repeat(auto-fit,minmax(7.5rem,1fr))]
          lg:grid-cols-[repeat(auto-fit,minmax(8.75rem,1fr))]
          gap-4`,
        // Remove grid/grid-cols-4, always use flex
      )}
    >
      {allowAddNew && allowMultiple && (
        <Box
          className={`
            ${singleImageClassName && 'hidden'}
            w-20 h-20 md:w-30 md:h-30 lg:w-35 lg:h-35
            relative 
            overflow-hidden 
            rounded-md border 
            border-gray-300 bg-black/80
            flex items-center justify-center 
        `}
        >
          <button
            type="button"
            className="w-[80%] h-[80%] flex items-center justify-center cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAdd?.();
            }}
          >
            <IconPlus className="text-white" />
          </button>
        </Box>
      )}
      {loadingFiles?.map((_file, index) => (
        <Box
          key={`loading-${index}`}
          className={`
            relative 
            overflow-hidden 
            rounded-md border 
            border-gray-300 bg-gray-200 animate-pulse
            flex items-center justify-center
            w-20 h-20 md:w-30 md:h-30 lg:w-35 lg:h-35
          `}
        >
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-xs text-gray-500">Converting...</p>
          </div>
        </Box>
      ))}
      {selectedImages.map((img, index) => (
        <React.Fragment key={index}>
          {CustomChildren ? (
            <CustomChildren
              index={index}
              image={img.image}
              name={img.name}
              handleRemoveImage={handleRemoveImage}
            />
          ) : (
            <Box
              data-image-container="true"
              className={
                singleImageClassName ??
                `relative overflow-hidden rounded-md border border-gray-300 flex items-center justify-center w-20 h-20 md:w-30 md:h-30 lg:w-35 lg:h-35`
              }
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <ImageDisplay
                src={
                  imageError || !img.image
                    ? 'https://via.placeholder.com/100x100?text=No+Image'
                    : img.image
                }
                alt={img.name || 'Uploaded'}
                onError={() => setImageError?.(true)}
                style={{
                  objectFit: 'contain',
                  height: '100%',
                  width: '100%',
                  maxHeight: '100%',
                  maxWidth: '100%',
                  display: 'block',
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              />

              {allowAddNew && (
                <Tooltip label="Remove">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveImage(index);
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className={`
                   absolute top-[-5px] right-[-5px] 
                   p-1 text-black bg-white/70 
                   hover:bg-white/80 z-[9999]
                   rounded-full cursor-pointer
                   pointer-events-auto remove-button
                 `}
                  >
                    <IconX size="0.8rem" />
                  </button>
                </Tooltip>
              )}
            </Box>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default BaseImageGridDisplay;
