'use client';

import { Box } from '@mantine/core';
import Image from 'next/image';

interface ChannelIconButtonProps {
  icon: React.ReactNode;
  isClicked: boolean;
  isReady: boolean;
  isMobile?: boolean;
  onClick?: () => void;
}

const ChannelIconButton = ({
  icon,
  isClicked,
  isMobile,
  onClick,
  isReady = true,
}: ChannelIconButtonProps) => {
  return (
    <Box
      onClick={onClick}
      className={`
        grid grid-cols-3 rounded-xl
        ${isClicked ? 'bg-orange-50 border-[2px] border-orange-500' : 'bg-white'}
        ${isMobile ? 'w-[64px] h-[54px]' : 'w-[128px] h-[108px]'}
        cursor-pointer
      `}
    >
      <div className="flex col-start-2 col-span-1 justify-self-center items-center">
        {icon}
      </div>
      {isReady && (
        <div
          className={`
          flex col-start-3 col-span-1
          justify-self-end items-start
        `}
        >
          <Image
            src="/assets/channel_ready_tick.svg"
            alt="Ready"
            width={18}
            height={18}
          />
        </div>
      )}
    </Box>
  );
};

export default ChannelIconButton;
