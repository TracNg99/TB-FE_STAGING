// ExperienceDetailSkeleton component
import { Skeleton } from '@mantine/core';

import Section from '../layouts/section';

// Assuming you're using Mantine

const ExperienceDetailSkeleton = () => {
  return (
    <div className="overflow-x-hidden">
      {/* Header Skeleton */}
      <div className="relative w-full h-80 bg-gray-200 animate-pulse">
        <div className="absolute bottom-6 left-6 w-1/2">
          <Skeleton height={40} radius="md" mb={10} />
          <Skeleton height={20} radius="md" mb={6} width="70%" />
          <div className="flex gap-2 mt-4">
            <Skeleton height={36} width={100} radius="md" />
          </div>
        </div>
      </div>

      {/* Activities Section Skeleton - align with updated card UI */}
      <div className="mt-20 container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-8">
          <Skeleton circle height={40} width={40} />
          <div>
            <Skeleton height={28} width={240} radius="md" mb={6} />
            <Skeleton height={18} width={320} radius="md" />
          </div>
        </div>

        {/* Activities Carousel Skeleton */}
        <div className="mt-10 flex gap-8 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-full sm:w-1/2 md:w-1/3 flex-shrink-0">
              <div className="flex flex-col gap-4 lg:gap-8">
                <Skeleton height={220} radius="lg" />
                <div className="flex flex-col gap-2 lg:gap-4">
                  <Skeleton height={20} width="80%" radius="md" />
                  <Skeleton height={14} radius="md" />
                  <Skeleton height={14} radius="md" />
                  <Skeleton height={14} width="90%" radius="md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Iconic Photos Skeleton */}
      <div className="mt-20 container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Skeleton circle height={40} width={40} />
          <Skeleton height={28} width={180} radius="md" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} height={i % 3 === 0 ? 220 : 180} radius="lg" />
          ))}
        </div>
      </div>

      {/* Photos from Travelers Skeleton */}
      <div className="mt-20 container mx-auto px-4 mb-20">
        <div className="flex items-center gap-3 mb-8">
          <Skeleton circle height={40} width={40} />
          <Skeleton height={28} width={220} radius="md" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={200} radius="lg" />
          ))}
        </div>
      </div>
    </div>
  );
};

const ExperienceDetailHeaderSkeleton = () => (
  <>
    <div className="relative w-full aspect-[4/3] lg:aspect-video max-h-[800px] bg-gray-200 animate-pulse" />
    <Section className="flex flex-col lg:flex-row relative -mt-24 px-0 lg:px-4">
      <div className="animate-pulse space-y-4 flex-1">
        <div className="h-12 bg-gray-300 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
        </div>
      </div>

      <div className="mt-20 bg-orange-50 py-8 px-16 lg:flex-1/3 h-max rounded-bl-xl relative animate-pulse">
        <div className="absolute bg-orange-50 top-0 left-full w-lvw h-full" />
        <div className="h-12 lg:h-[72px] w-full bg-gray-300 rounded"></div>
      </div>
    </Section>
  </>
);

export { ExperienceDetailHeaderSkeleton, ExperienceDetailSkeleton };
