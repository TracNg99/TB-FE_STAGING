import { Box, Image as ImageDisplay, Tooltip } from '@mantine/core';
import { IconPlus, IconX } from '@tabler/icons-react';
import React from 'react';

import { cn } from '@/utils/class';

interface ImageDisplayFlexRowProps {
  allowMultiple?: boolean;
  allowAddNew?: boolean;
  selectedImages: Array<{ image: string | null; name: string | null }>;
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

const ImageDisplayFlexRow: React.FC<ImageDisplayFlexRowProps> = ({
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
}) => {
  return (
    <div
      className={cn(
        className ??
          'align-center justify-left items-center pointer-events-auto flex flex-row gap-3 flex-wrap',
      )}
    >
      {allowAddNew && allowMultiple && (
        <Box
          className={`
            ${singleImageClassName && 'hidden'}
            relative 
            overflow-hidden 
            rounded-md border 
            border-gray-300 bg-black/80
            flex items-center justify-center
            w-24 h-24
        `}
        >
          <button
            type="button"
            className="w-full h-full flex items-center justify-center cursor-pointer"
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
            w-24 h-24
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
              className={
                singleImageClassName ??
                'relative overflow-hidden rounded-md border border-gray-300 flex items-center justify-center'
              }
              style={{
                maxHeight: '150px',
                maxWidth: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
                  height: 'auto',
                  maxHeight: '150px',
                  width: 'auto',
                  maxWidth: '100%',
                  display: 'block',
                }}
              />
              <Tooltip label="Remove">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveImage(index);
                  }}
                  className={cn(
                    'absolute top-2 right-2 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-gray-700 transition-colors',
                    'hover:bg-white z-50',
                  )}
                  style={{
                    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                  }}
                >
                  <IconX size="1rem" />
                </button>
              </Tooltip>
            </Box>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ImageDisplayFlexRow;
