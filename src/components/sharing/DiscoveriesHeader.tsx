'use client';

import Image from 'next/image';
import React from 'react';

import { cn } from '@/utils/class';

interface StickyTitleChipsHeaderProps {
  title: string;
  subTitle: string;
  className?: string;
}

const DiscoveriesHeader: React.FC<StickyTitleChipsHeaderProps> = ({
  title,
  subTitle,
  className,
}) => {
  return (
    <div className={cn('flex flex-col gap-5', className)}>
      <Image
        src="/assets/wink-discoveries.jpg"
        alt="Discoveries"
        width={1920}
        height={100}
        className="h-28 rounded-sm object-cover"
      />
      <h1 className="text-3xl font-bold -mb-2">{title}</h1>
      <h2>{subTitle}</h2>
    </div>
  );
};

export default DiscoveriesHeader;
