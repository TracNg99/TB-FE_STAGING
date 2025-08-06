import Image from 'next/image';
import React, { useState } from 'react';

const ImageHandler: React.FC<{
  src: string;
  className?: string;
  width?: number;
  height?: number;
  alt?: string;
  onError?: () => void;
}> = ({ src, className, width, height, alt, onError }) => {
  const [ImageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
    onError?.();
  };

  return (
    <Image
      src={ImageError ? '/assets/placeholder.jpg' : src}
      alt={alt || 'Image'}
      onError={handleImageError}
      className={className}
      width={width}
      height={height}
      unoptimized
    />
  );
};

export default ImageHandler;
