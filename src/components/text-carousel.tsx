'use client';

import { useMediaQuery } from '@mantine/hooks';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { useEffect, useMemo, useState } from 'react';

import { cn } from '@/utils/class';

import { CarouselSkeleton } from './skeletons/CarouselSkeleton';

type TextCarouselProps<T> = {
  items?: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  classNames?: {
    controls?: string;
  };
  className?: string;
  slideSize?: {
    base?: number;
    sm?: number;
    md?: number;
  };
  slideGap?: number;
  options?: EmblaOptionsType;
  duration?: number;
  showControls?: boolean;
  skeletonCount?: number; // Number of skeleton items to show when loading
};

export default function TextCarousel<T>({
  items,
  renderItem,
  classNames,
  options,
  slideSize,
  slideGap,
  showControls = true,
  className,
  skeletonCount = 4, // Default to 4 skeleton items
  duration,
}: TextCarouselProps<T>) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ duration, ...options });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isSm = useMediaQuery('(min-width: 640px)');
  const isMd = useMediaQuery('(min-width: 768px)');

  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
    }
  }, [emblaApi, items]); // FIX: Re-initialize when items change

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    // Set initial state
    onSelect();
  }, [emblaApi]);

  useEffect(() => {
    // Set loading state based on whether items are available
    setIsLoading(!items || items.length === 0);
  }, [items]);

  const variables = useMemo(() => {
    let size = slideSize?.base || 100;
    if (isSm && slideSize?.sm) {
      size = slideSize.sm;
    }
    if (isMd && slideSize?.md) {
      size = slideSize.md;
    }

    return {
      '--slide-size': `${size}%`,
      '--slide-spacing': `${slideGap || 16}px`,
    } as React.CSSProperties;
  }, [isSm, isMd, slideSize, slideGap]);

  // Render skeleton items when loading
  const renderSkeletonItems = () => {
    return Array.from({ length: skeletonCount }).map((_, index) => (
      <div
        key={`skeleton-${index}`}
        className="flex-[0_0_var(--slide-size)] pl-[var(--slide-spacing)]"
      >
        <CarouselSkeleton className="w-full h-[300px]" />
      </div>
    ));
  };

  return (
    <div className={cn('flex items-center gap-x-2', className)}>
      {showControls && !isLoading && items && items.length > 0 && (
        <button
          className={cn(
            'shrink-0 rounded-full size-10 flex items-center justify-center transition-all cursor-pointer',
            classNames?.controls,
            !canScrollPrev && 'invisible',
          )}
          onClick={() => emblaApi?.scrollPrev()}
        >
          <IconChevronLeft className="size-6 text-base-black" />
        </button>
      )}

      <div
        style={variables}
        className="overflow-hidden flex-grow"
        ref={emblaRef}
      >
        <div className="flex touch-pan-y touch-pinch-zoom ml-[calc(var(--slide-spacing)*-1)]">
          {isLoading
            ? renderSkeletonItems()
            : items?.map((item, index) => (
                <div
                  key={index}
                  className="flex-[0_0_var(--slide-size)] pl-[var(--slide-spacing)]"
                >
                  <div>{renderItem(item, index)}</div>
                </div>
              ))}
        </div>
      </div>

      {showControls && !isLoading && items && items.length > 0 && (
        <button
          className={cn(
            'shrink-0 rounded-full size-10 flex items-center justify-center bg-transparent transition-all cursor-pointer',
            classNames?.controls,
            !canScrollNext && 'invisible',
          )}
          onClick={() => emblaApi?.scrollNext()}
        >
          <IconChevronRight className="size-6 text-base-black" />
        </button>
      )}
    </div>
  );
}
