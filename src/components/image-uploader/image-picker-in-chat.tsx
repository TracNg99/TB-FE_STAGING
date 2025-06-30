import React from 'react';

import BaseImageGridDisplay from './image-display-base-grid';

interface ImageSubcomponentProps {
  allowAddNew?: boolean;
  selectedImages: Array<{ image: string | null; name: string | null }>;
  handleRemoveImage: (index: number) => void;
  className?: string;
  CustomChildren?: React.FC<{
    index: number;
    image: string | null;
    name: string | null;
    handleRemoveImage: (index: number) => void;
  }>;
  singleImageClassName?: string;
}

const InchatUploader: React.FC<ImageSubcomponentProps> = ({
  allowAddNew = true,
  selectedImages,
  className,
  handleRemoveImage,
  CustomChildren,
  singleImageClassName,
}) => {
  return (
    <div>
      {selectedImages.length > 0 && (
        <BaseImageGridDisplay
          allowAddNew={allowAddNew}
          allowMultiple={true}
          selectedImages={selectedImages}
          className={className ?? `flex flex-row lg:mx gap-4 my-3`}
          handleRemoveImage={handleRemoveImage}
          CustomChildren={CustomChildren}
          singleImageClassName={singleImageClassName}
        />
      )}
    </div>
  );
};

export default InchatUploader;
