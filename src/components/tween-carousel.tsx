'use client';

import { useMediaQuery } from '@mantine/hooks';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import {
  EmblaCarouselType,
  EmblaEventType,
  EmblaOptionsType,
  EngineType,
} from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { cn } from '@/utils/class';

import { CarouselSkeleton } from './skeletons/CarouselSkeleton';

const numberWithinRange = (number: number, min: number, max: number): number =>
  Math.min(Math.max(number, min), max);

type TweenCarouselProps<T> = {
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
  tweenFactorBase?: number;
  showControls?: boolean;
  skeletonCount?: number; // Number of skeleton items to show when loading
};

export default function TweenCarousel<T>({
  items,
  renderItem,
  classNames,
  options,
  slideSize,
  slideGap,
  showControls = true,
  tweenFactorBase = 0.22,
  className,
  skeletonCount = 4, // Default to 4 skeleton items
}: TweenCarouselProps<T>) {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState(items.length || 0);
  const [isLoading, setIsLoading] = useState(true);

  const tweenFactor = useRef(0);
  const tweenNodes = useRef<HTMLElement[]>([]);

  const isSm = useMediaQuery('(min-width: 640px)');
  const isMd = useMediaQuery('(min-width: 768px)');

  const setTweenNodes = useCallback((emblaApi: EmblaCarouselType): void => {
    tweenNodes.current = emblaApi.slideNodes().map((slideNode) => {
      return slideNode.querySelector('div') as HTMLElement;
    });
  }, []);

  const setTweenFactor = useCallback(
    (emblaApi: EmblaCarouselType) => {
      tweenFactor.current = tweenFactorBase * emblaApi.scrollSnapList().length;
    },
    [tweenFactorBase],
  );

  const tweenScale = useCallback(
    (emblaApi: EmblaCarouselType, eventName?: EmblaEventType) => {
      if (!emblaApi || !items || items.length === 0) return;

      // Throttle the calculations using requestAnimationFrame
      requestAnimationFrame(() => {
        const engine = emblaApi.internalEngine();
        const scrollProgress = emblaApi.scrollProgress();
        const slidesInView = emblaApi.slidesInView();
        const isScrollEvent = eventName === 'scroll';

        // Simplify calculations
        const snapList = emblaApi.scrollSnapList();
        const tweenFactorValue = tweenFactor.current;

        snapList.forEach((scrollSnap, snapIndex) => {
          let diffToTarget = scrollSnap - scrollProgress;
          const slidesInSnap = engine.slideRegistry[snapIndex];

          slidesInSnap.forEach((slideIndex) => {
            if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

            // Simplified loop handling
            if (engine.options.loop) {
              diffToTarget = handleLoopDifference(
                engine,
                slideIndex,
                scrollSnap,
                scrollProgress,
                diffToTarget,
              );
            }

            const tweenValue = 1 - Math.abs(diffToTarget * tweenFactorValue);
            const scale = numberWithinRange(tweenValue, 0, 1).toString();
            const tweenNode = tweenNodes.current[slideIndex];

            if (tweenNode) {
              tweenNode.style.transform = `scale(${scale})`;
              tweenNode.style.willChange = 'transform, filter'; // Hint for browser optimization
              tweenNode.style.filter = `brightness(${scale})`;
            }
          });
        });
      });
    },
    [items],
  );

  // Helper function for loop calculations
  const handleLoopDifference = (
    engine: EngineType,
    slideIndex: number,
    scrollSnap: number,
    scrollProgress: number,
    diff: number,
  ) => {
    for (const loopItem of engine.slideLooper.loopPoints) {
      if (slideIndex === loopItem.index && loopItem.target() !== 0) {
        const sign = Math.sign(loopItem.target());
        return sign === -1
          ? scrollSnap - (1 + scrollProgress)
          : scrollSnap + (1 - scrollProgress);
      }
    }
    return diff;
  };

  useEffect(() => {
    // Set loading state based on whether items are available
    setIsLoading(!items || items.length === 0);
  }, [items]);

  useEffect(() => {
    if (!emblaApi) return;

    // const setTotal = () => {
    setScrollSnaps(items.length);
    // };

    const setIndex = (emblaApi: EmblaCarouselType) => {
      setCurrentSlide(emblaApi.selectedScrollSnap());
    };

    if (!isLoading) {
      setTweenNodes(emblaApi);
      setTweenFactor(emblaApi);
      tweenScale(emblaApi);
    }

    emblaApi
      // .on('init', setTotal)
      .on('init', setIndex)
      // .on('reInit', setTotal)
      .on('reInit', setIndex)
      .on('reInit', setTweenNodes)
      .on('reInit', setTweenFactor)
      .on('reInit', tweenScale)
      .on('select', setIndex)
      .on('scroll', tweenScale)
      .on('slideFocus', tweenScale);
  }, [emblaApi, setTweenFactor, setTweenNodes, tweenScale, isLoading]);

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
      '--slide-spacing': `${slideGap}px`,
    } as React.CSSProperties;
  }, [isSm, isMd, slideSize, slideGap]);

  // Render skeleton items when loading
  const renderSkeletonItems = () => {
    return Array.from({ length: skeletonCount }).map((_, index) => (
      <div
        key={`skeleton-${index}`}
        className="flex-[0_0_var(--slide-size)] pl-[var(--slide-spacing)] min-w-0"
      >
        <CarouselSkeleton className="w-full h-[300px]" />{' '}
        {/* Adjust height as needed */}
      </div>
    ));
  };

  return (
    <>
      <div style={variables} className={cn(className)}>
        <div ref={emblaRef}>
          <div className="flex touch-pan-y touch-pinch-zoom ml-[calc(var(--slide-spacing)*-1)]">
            {isLoading
              ? renderSkeletonItems()
              : items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex-[0_0_var(--slide-size)] pl-[var(--slide-spacing)] min-w-0"
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
        items.length > 0 && (
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
            <span>{scrollSnaps}</span>
            <button
              className="rounded-full size-[60px] border border-base-black/25 flex items-center justify-center hover:bg-base-black/5 transition-colors disabled:opacity-50 disabled:pointer-events-none"
              onClick={() => emblaApi.scrollNext()}
              disabled={!emblaApi.canScrollNext()}
            >
              <IconChevronRight className="size-7 text-base-black" />
            </button>
          </div>
        )}
    </>
  );
}
