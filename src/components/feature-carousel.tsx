'use client';

import { useMediaQuery } from '@mantine/hooks';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
// EmblaCarouselType,
import useEmblaCarousel from 'embla-carousel-react';
import { useEffect, useMemo, useState } from 'react';

import { cn } from '@/utils/class';

import { CarouselSkeleton } from './skeletons/CarouselSkeleton';

type FeatureCarouselProps<T> = {
  items: T[]; // Make items optional
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
  showControls?: boolean;
  skeletonCount?: number; // Number of skeleton items to show when loading
  paginationType?: 'dots' | 'count' | 'none'; // New prop for pagination type
};

export default function FeatureCarousel<T>({
  items,
  renderItem,
  classNames,
  options,
  slideSize,
  slideGap,
  showControls = true,
  className,
  skeletonCount = 4, // Default to 4 skeleton items
  paginationType = 'count',
}: FeatureCarouselProps<T>) {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [totalSlides, setTotalSlides] = useState(items.length || 0);
  const [isLoading, setIsLoading] = useState(true);

  const isSm = useMediaQuery('(min-width: 640px)');
  const isMd = useMediaQuery('(min-width: 768px)');
  const isMobile = useMediaQuery('(max-width: 640px)');

  useEffect(() => {
    if (!emblaApi) return;

    setTotalSlides(items.length);

    const setIndex = (emblaApi: EmblaCarouselType) => {
      let size = 100;
      if (isMd && slideSize?.md) {
        size = slideSize.md;
      }
      setCurrentSlide(
        emblaApi.selectedScrollSnap() + (Math.floor(100 / size) - 1),
      );
    };

    emblaApi
      // .on('init', setTotal)
      .on('init', setIndex)
      // .on('reInit', setTotal)
      .on('reInit', setIndex)
      .on('select', setIndex);
  }, [emblaApi, items]);

  useEffect(() => {
    // Set loading state based on whether items are available
    setIsLoading(!items || items.length === 0);
  }, [items]);

  const variables = useMemo(() => {
    let size = 100;
    if (isSm && slideSize?.sm) {
      size = slideSize.sm;
    }
    if (isMd && slideSize?.md) {
      size = slideSize.md;
    }

    return {
      '--slide-size': `${size}%`,
      '--slide-spacing': `${slideGap}px`,
    } as React.CSSProperties;
  }, [isSm, isMd, slideSize, slideGap]);

  // Render skeleton items when loading
  const renderSkeletonItems = () => {
    return Array.from({ length: skeletonCount }).map((_, index) => (
      <div
        key={`skeleton-${index}`}
        className="flex-[0_0_var(--slide-size)] pl-[var(--slide-spacing)]"
      >
        <CarouselSkeleton className="w-full h-[300px]" />{' '}
        {/* Adjust height as needed */}
      </div>
    ));
  };

  return (
    <div
      className={`
      flex ${paginationType === 'none' ? 'flex-row items-center' : 'flex-col'}
      gap-4`}
    >
      {!!emblaApi &&
        showControls &&
        !isLoading &&
        items &&
        items.length > 0 &&
        paginationType === 'none' && (
          <>
            <div
              className={cn(
                'flex size-8 items-center justify-center rounded-full bg-white/50 cursor-pointer z-100 self-center',
                classNames?.controls,
                emblaApi.selectedScrollSnap() === 0 ? 'hidden' : 'visible',
              )}
            >
              <button
                className={cn(
                  'rounded-full size-[60px] flex items-center justify-center transition-colors cursor-pointer',
                  emblaApi.selectedScrollSnap() === 0 ? 'hidden' : 'visible',
                )}
                onClick={() => emblaApi.scrollPrev()}
                disabled={!emblaApi.canScrollPrev()}
              >
                <IconChevronLeft className="size-7 text-base-black" />
              </button>
            </div>
          </>
        )}
      <div style={variables} className={cn(className)}>
        <div ref={emblaRef}>
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
      </div>
      {!!emblaApi &&
        showControls &&
        !isLoading &&
        items &&
        items.length > 0 &&
        paginationType === 'none' && (
          <>
            <div
              className={cn(
                'flex size-8 items-center justify-center rounded-full bg-white/50 z-100 self-center',
                classNames?.controls,
                currentSlide === totalSlides - 1 ? 'hidden' : 'visible',
              )}
            >
              <button
                className={cn(
                  'rounded-full size-[60px] flex items-center justify-center transition-colors cursor-pointer',
                  currentSlide === totalSlides - 1 ? 'hidden' : 'visible',
                )}
                onClick={() => emblaApi.scrollNext()}
                disabled={!emblaApi.canScrollNext()}
              >
                <IconChevronRight className="size-7 text-base-black" />
              </button>
            </div>
          </>
        )}
      {!!emblaApi &&
        showControls &&
        !isLoading &&
        items &&
        items.length > 0 && (
          <>
            {paginationType === 'count' && (
              <div
                className={cn(
                  'mt-12 flex items-center justify-end gap-4 text-md text-base-black',
                  classNames?.controls,
                )}
              >
                <button
                  className="rounded-full size-[60px] border border-base-black/25 flex items-center justify-center hover:bg-base-black/5 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                  onClick={() => emblaApi.scrollPrev()}
                  disabled={!emblaApi.canScrollPrev()}
                >
                  <IconChevronLeft className="size-7 text-base-black" />
                </button>
                <span className="font-semibold">{currentSlide + 1}</span>
                <span>/</span>
                <span>{totalSlides}</span>
                <button
                  className="rounded-full size-[60px] border border-base-black/25 flex items-center justify-center hover:bg-base-black/5 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                  onClick={() => emblaApi.scrollNext()}
                  disabled={!emblaApi.canScrollNext()}
                >
                  <IconChevronRight className="size-7 text-base-black" />
                </button>
              </div>
            )}
            {paginationType === 'dots' && (
              <div className="mt-1 flex items-center justify-center gap-2">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    className={`
                      flex items-center justify-center
                      ${isMobile ? 'size-[8px]' : 'size-[20px]'} 
                      rounded-full transition-colors
                      ${
                        currentSlide === index
                          ? 'bg-orange-500'
                          : 'bg-gray-400/75 hover:bg-gray-400/50'
                      }
                      ${currentSlide === index ? 'cursor-default' : 'cursor-pointer'}
                    `}
                    onClick={() => emblaApi.scrollTo(index)}
                    aria-current={currentSlide === index ? 'step' : undefined}
                    disabled={index === currentSlide}
                  />
                ))}
              </div>
            )}
          </>
        )}
    </div>
  );
}
