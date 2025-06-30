import { Divider, Skeleton } from '@mantine/core';

export const StoryMetadataLoading = () => (
  <div className="mt-8 flex flex-col md:flex-row gap-10 justify-between">
    {/* Left: Avatar and user info */}
    <div className="flex items-center gap-2 text-base-black font-medium text-sm lg:text-base leading-none">
      <Skeleton height={40} width={40} circle className="size-10" />
      <div>
        <Skeleton height={20} width={120} radius="sm" className="mb-2" />
        <Skeleton height={16} width={80} radius="sm" />
      </div>
    </div>
    {/* Right: Location and date */}
    <div className="flex gap-[18px] text-md lg:text-lg text-base-black/90 items-center h-max">
      <div className="flex items-center gap-1">
        <Skeleton height={24} width={24} circle />
        <Skeleton height={18} width={70} radius="sm" />
      </div>
      <Divider orientation="vertical" />
      <Skeleton height={18} width={120} radius="sm" />
    </div>
  </div>
);

export const GalleryLoading = () => (
  <div className="mt-12">
    <Skeleton height={400} width="100%" />
  </div>
);
