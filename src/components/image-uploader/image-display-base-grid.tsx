import { Box, Tooltip } from '@mantine/core';
import { Image as ImageDisplay } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconPlus, IconX } from '@tabler/icons-react';
import React from 'react';

import { cn } from '@/utils/class';

// import { handleImageUpload } from './image-picker';

interface ImageDisplayProps {
  allowMultiple?: boolean; // New prop for choosing and displaying multiple images
  allowAddNew?: boolean;
  selectedImages: Array<{ image: string | null; name: string | null }>;
  imageError?: boolean;
  setImageError?: (state: boolean) => void;
  className?: string;
  singleImageClassName?: string;
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
  setImageError,
  handleRemoveImage,
  CustomChildren,
  // onAdd
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return (
    <div
      className={cn(
        className ??
          `align-center justify-center items-center
        pointer-events-auto`,
        allowMultiple ? `grid grid-cols-4` : `flex`,
      )}
    >
      {allowAddNew && allowMultiple && (
        <Box
          className={`
            ${singleImageClassName && 'hidden'}
            relative 
            overflow-hidden 
            rounded-md border 
            ${isMobile ? `w-[80px] h-[80px]` : `w-[150px] h-[150px]`}
            border-gray-300 bg-black/80
        `}
        >
          <button
            type="button"
            className="w-full h-full flex items-center justify-center cursor-pointer"
            // onClick={onAdd}
          >
            <IconPlus className="text-white" />
          </button>
        </Box>
      )}
      {selectedImages.map((img, index) => (
        <>
          {CustomChildren ? (
            <CustomChildren
              index={index}
              image={img.image}
              name={img.name}
              handleRemoveImage={handleRemoveImage}
            />
          ) : (
            <Box
              key={index}
              className={
                singleImageClassName ??
                `
              relative 
              overflow-hidden 
              rounded-md border 
              ${
                allowMultiple
                  ? `w-[${isMobile ? 80 : 150}px] 
                h-[${isMobile ? 80 : 150}px]`
                  : 'w-[350px] h-full items-center'
              } 
              border-gray-300`
              }
            >
              <ImageDisplay
                src={
                  imageError || !img.image
                    ? 'https://via.placeholder.com/100x100?text=No+Image'
                    : img.image
                }
                alt={img.name || 'Uploaded'}
                onError={() => setImageError?.(true)}
                //   width={allowMultiple ? multipleDisplaySize ?? 100 : undefined}
                //   height={allowMultiple ? multipleDisplaySize ?? 100 : undefined}
                style={{
                  objectFit: 'cover',
                  width: allowMultiple ? (isMobile ? 80 : '100%') : undefined,
                  height: allowMultiple ? (isMobile ? 80 : '100px') : undefined,
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
                    className={`
                  absolute top-[-5px] right-[-5px] 
                  p-1 text-black bg-white/70 
                  hover:bg-white/80 z-100 
                  rounded-full cursor-pointer
                `}
                  >
                    <IconX size="0.8rem" />
                  </button>
                </Tooltip>
              )}
            </Box>
          )}
        </>
      ))}
    </div>
  );
};

export default BaseImageGridDisplay;
