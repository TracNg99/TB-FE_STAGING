import Image from 'next/image';

export const ImageUploadIcon = ({
  className,
  size,
}: {
  className?: string;
  size?: number;
}) => {
  return (
    <Image
      src="/assets/media_upload.png"
      alt="media upload icon"
      width={size || 24}
      height={size || 24}
      className={className}
    />
  );
};
