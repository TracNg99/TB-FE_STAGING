'use client';

import { useSearchParams } from 'next/navigation';

import StoriesGallery from '@/components/stories/StoriesGallery';

export default function StoriesPage() {
  const searchParams = useSearchParams();
  const selectedFilter = searchParams.get('filter') || 'All Stories';

  return <StoriesGallery selectedFilter={selectedFilter} />;
}
