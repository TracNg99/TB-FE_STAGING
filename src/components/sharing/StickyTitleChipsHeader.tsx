'use client';

import React from 'react';

import { cn } from '@/utils/class';

interface StickyTitleChipsHeaderProps {
  title: string;
  filters: string[];
  selected: string;
  onSelect: (value: string) => void;
  className?: string;
  hideOnMobile?: boolean;
}

const StickyTitleChipsHeader: React.FC<StickyTitleChipsHeaderProps> = ({
  title,
  filters,
  selected,
  onSelect,
  className,
  hideOnMobile = false,
}) => {
  return (
    <div
      className={cn(
        'z-30 bg-gray-50 py-6 md-py-8 pb-3',
        'flex flex-col gap-3',
        hideOnMobile && 'hidden md:flex',
        className,
      )}
    >
      <h1 className="text-[32px] font-bold" style={{ color: '#333333' }}>
        {title}
      </h1>
      {filters && filters.length > 0 && (
        <div className="flex gap-3 flex-nowrap overflow-x-auto scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter}
              className={cn(
                'px-4 py-2 rounded-full text-md font-medium transition-all border-2 cursor-pointer hover:shadow-sm whitespace-nowrap flex-shrink-0',
                selected === filter
                  ? 'bg-orange-50 text-black border-orange-500'
                  : 'bg-orange-50 text-black border-transparent hover:bg-orange-100',
              )}
              onClick={() => onSelect(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StickyTitleChipsHeader;
