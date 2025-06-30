import { Avatar } from '@mantine/core';
import React, { useEffect, useRef, useState } from 'react';

import { handleImageUpload } from './image-picker';

interface AvatarUploaderProps {
  onImageUpload: (
    images: { image: string | null; name: string | null }[],
  ) => void;
  avatar: { image: string | null; name: string | null };
  withResize?: boolean;
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  onImageUpload,
  avatar,
  withResize = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImages, setSelectedImages] = useState<
    {
      image: string | null;
      name: string | null;
    }[]
  >([{ image: '', name: '' }]);

  useEffect(() => {
    if (avatar) {
      setSelectedImages([avatar]);
    }
  }, [avatar]);

  const paramObj = {
    withResize,
    allowMultiple: false,
    selectedImages,
    setImageError,
    setSelectedImages,
    onImageUpload,
  };

  return (
    <div className="flex flex-col lg:mx gap-4">
      <div className="flex flex-wrap gap-2">
        <Avatar
          component="button"
          src={imageError ? '' : selectedImages?.[0]?.image}
          name={''}
          className="flex-1 max-w-px cursor-pointer"
          imageProps={{ width: '10px', height: '10px' }}
          color="initials"
          size={70}
          onClick={() => fileInputRef.current?.click()}
        />
        <input
          type="file"
          hidden
          onChange={(e) =>
            handleImageUpload({
              acceptedFiles: e.target.files as any,
              ...paramObj,
            })
          }
          ref={fileInputRef}
        />
      </div>
      <></>
    </div>
  );
};

export default AvatarUploader;
