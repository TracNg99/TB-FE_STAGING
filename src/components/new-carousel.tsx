'use client';

import { useMediaQuery } from '@mantine/hooks';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import useEmblaCarousel from 'embla-carousel-react';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';

import { cn } from '@/utils/class';

type FeatureCarouselProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  showControls?: boolean;
  controlsPosition?: 'sides' | 'bottom' | 'none';
  enableInfiniteLoop?: boolean;
  slideGap?: number;
  align?: 'start' | 'center' | 'end';
};

export default function FeatureCarousel<T>({
  items,
  renderItem,
  className,
  showControls = true,
  controlsPosition = 'sides',
  enableInfiniteLoop = false,
  slideGap = 16,
  align,
}: FeatureCarouselProps<T>) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: enableInfiniteLoop,
    align: align || (items.length === 1 ? 'center' : 'start'),
    containScroll: 'trimSnaps',
  });

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const isMobile = useMediaQuery('(max-width: 640px)');

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('reInit', onSelect);
    emblaApi.on('select', onSelect);
  }, [emblaApi, onSelect]);

  // Loading state
  if (!items || items.length === 0) {
    return (
      <div className="w-full">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex" style={{ gap: `${slideGap}px` }}>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex-shrink-0">
                <div className="min-w-[240px] max-w-[260px] h-80 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const shouldShowControls = showControls && controlsPosition !== 'none';
  const showSideControls = shouldShowControls && controlsPosition === 'sides';
  const showBottomControls =
    shouldShowControls && controlsPosition === 'bottom';

  return (
    <div className="w-full">
      <div className={cn('relative', className)}>
        {/* Side Controls */}
        {showSideControls && !isMobile && (
          <>
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              onClick={scrollPrev}
              disabled={prevBtnDisabled && !enableInfiniteLoop}
              style={{ transform: 'translateY(-50%) translateX(-50%)' }}
            >
              <IconChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              onClick={scrollNext}
              disabled={nextBtnDisabled && !enableInfiniteLoop}
              style={{ transform: 'translateY(-50%) translateX(50%)' }}
            >
              <IconChevronRight className="h-5 w-5 text-gray-700" />
            </button>
          </>
        )}

        {/* Carousel - Items control their own width */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div
            className={cn(
              'flex items-stretch',
              items.length === 1 && 'justify-center',
            )}
            style={{ gap: `${slideGap}px` }}
          >
            {items.map((item, index) => (
              <div key={index} className="flex-shrink-0">
                {renderItem(item, index)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      {showBottomControls && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            onClick={scrollPrev}
            disabled={prevBtnDisabled && !enableInfiniteLoop}
          >
            <IconChevronLeft className="h-4 w-4 text-gray-700" />
          </button>
          <span className="text-sm text-gray-500">Navigate slides</span>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            onClick={scrollNext}
            disabled={nextBtnDisabled && !enableInfiniteLoop}
          >
            <IconChevronRight className="h-4 w-4 text-gray-700" />
          </button>
        </div>
      )}

      {/* Mobile swipe indicator */}
      {isMobile && !showBottomControls && (
        <div className="flex justify-center mt-4">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span>Swipe to see more</span>
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-gray-300 rounded-full" />
              <div className="w-1 h-1 bg-gray-300 rounded-full" />
              <div className="w-1 h-1 bg-gray-300 rounded-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
