import { Button } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import React from 'react';
import { PiShareNetworkFill } from 'react-icons/pi';

interface ShareButtonProps {
  className?: string;
  shareContents: {
    title: string;
    text: string;
    files: File[];
  };
}

const ShareButton = ({ className, shareContents }: ShareButtonProps) => {
  const { title, text, files } = shareContents;
  const isMobile = useMediaQuery('(max-width: 640px)');

  const handleShare = async () => {
    if (navigator.canShare({ files })) {
      await navigator.share({
        title,
        text,
        files,
      });
    } else {
      notifications.show({
        title: 'Share',
        message: 'File can not be shared',
        color: 'red',
      });
    }
  };

  return (
    <Button className={className} variant="outline" onClick={handleShare}>
      <PiShareNetworkFill
        className={`text-white ${isMobile ? 'text-[20px]' : 'text-[30px]'}`}
      />
    </Button>
  );
};

export default ShareButton;
