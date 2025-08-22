'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useMemo } from 'react';

import StoriesListSkeleton from '@/components/loading/StoriesListSkeleton';
import Translation from '@/components/translation';
import { useAuth } from '@/contexts/auth-provider';
import { Profile } from '@/store/redux/slices/user/profile';
import {
  StoryProps,
  useGetAllStoryQuery,
} from '@/store/redux/slices/user/story';

interface StoriesGalleryProps {
  selectedFilter?: string;
}

const StoriesGallery: React.FC<StoriesGalleryProps> = ({
  selectedFilter = 'All Stories',
}) => {
  const { user } = useAuth();
  const router = useRouter();

  const { data, isLoading, isError, error } = useGetAllStoryQuery();

  // All user's stories (unfiltered)
  const userStoriesAll: StoryProps[] = useMemo(() => {
    if (!data?.data) return [];
    return data.data.filter(
      (story) => story.user_id === (user as Profile)?.userid,
    );
  }, [data?.data, (user as Profile)?.userid]);

  // Currently displayed stories based on selected filter
  const stories: StoryProps[] = useMemo(() => {
    const toTime = (value?: string) => (value ? new Date(value).getTime() : 0);

    let filteredStories = [...userStoriesAll];

    if (selectedFilter !== 'All Stories') {
      const f = selectedFilter.toLowerCase();
      filteredStories = filteredStories.filter(
        (story) =>
          (story.seo_title_tag?.toLowerCase().includes(f) ||
            story.story_content?.toLowerCase().includes(f)) ??
          false,
      );
    }

    // Always sort latest to oldest by created_at
    filteredStories.sort((a, b) => toTime(b.created_at) - toTime(a.created_at));

    return filteredStories;
  }, [userStoriesAll, selectedFilter]);

  // Build chips list only for filters that have matching stories
  //   const baseFilters = ['Saigon', 'Danang', 'Hoian', 'Hue', 'Hanoi'];

  if (!user || !(user as Profile)?.userid) {
    return (
      <Translation>
        {(t) => (
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-6">
              {t('stories.myTravelStories')}
            </h1>
            <p className="text-gray-600">{t('stories.loginToView')}</p>
          </div>
        )}
      </Translation>
    );
  }

  if (isLoading) {
    return <StoriesListSkeleton />;
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-red-600">
        {error && typeof error === 'object' && 'message' in error
          ? error.message
          : 'Failed to fetch stories'}
      </div>
    );
  }

  return (
    <Translation>
      {(t) => (
        <div className="h-full relative flex flex-col mb-20">
          <div
            className={
              'sticky top-0 z-30 bg-gray-50 py-6 md-py-8 pb-3 flex-col gap-3 hidden md:flex'
            }
          >
            <h1 className="text-[32px] font-bold" style={{ color: '#333333' }}>
              {t('stories.title')}
            </h1>
          </div>
          {/* Scrollable Content Area (like Discoveries) */}
          <div className="flex-1 py-3 overflow-y-auto overflow-x-hidden bg-gray-50">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedFilter}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
              >
                <div className="space-y-6">
                  {/* First (featured) story */}
                  {stories.length > 0 ? (
                    <div
                      className="rounded-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border relative"
                      style={{ borderColor: '#E2E2E2' }}
                      onClick={() => router.push(`/stories/${stories[0].id}`)}
                    >
                      <div className="aspect-[16/7] overflow-hidden">
                        {stories[0].media_assets &&
                        stories[0].media_assets.length > 0 ? (
                          <img
                            src={stories[0].media_assets[0].url}
                            alt="Story photo"
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">
                              {t('errors.noImage')}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col py-6 px-3 gap-2 text-base text-[#333333]">
                        <h3 className="text-xl font-bold flex-1 break-words">
                          {stories[0].seo_title_tag ||
                            stories[0].experiences?.name ||
                            t('stories.untitledStory')}
                        </h3>
                        <p className="line-clamp-3 font-normal text-md text-black">
                          {stories[0].seo_meta_desc ||
                            stories[0].story_content?.slice(0, 100) ||
                            t('errors.noDescriptionAvailable')}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <h2 className="text-xl font-semibold text-gray-600 mb-2">
                        {t('stories.noStoriesFound')}
                      </h2>
                      <p className="text-gray-500 mb-6 ">
                        {selectedFilter === 'All Stories'
                          ? t('stories.noStoriesFoundAllStories')
                          : t('stories.noStoriesFoundFilter', {
                              filter: selectedFilter,
                            })}
                      </p>
                      <Link
                        href="/stories/new"
                        className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                      >
                        {t('stories.createYourFirstStory')}
                      </Link>
                    </div>
                  )}

                  {/* Grid for the rest */}
                  {stories.length > 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {stories.slice(1).map((story, idx) => (
                        <div
                          key={story.id || idx}
                          className="rounded-md overflow-hidden hover:shadow-lg cursor-pointer transition-shadow border relative"
                          style={{ borderColor: '#E2E2E2' }}
                          onClick={() => router.push(`/stories/${story.id}`)}
                        >
                          <div className="aspect-[4/3] overflow-hidden">
                            {story.media_assets &&
                            story.media_assets.length > 0 ? (
                              <img
                                src={story.media_assets[0].url}
                                alt="Story photo"
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-400">
                                  {t('errors.noImage')}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col py-6 px-3 gap-2 text-base text-[#333333]">
                            <h3 className="text-base font-bold flex-1 break-words">
                              {story.seo_title_tag ||
                                story.experiences?.name ||
                                t('stories.untitledStory')}
                            </h3>
                            <p className="text-sm line-clamp-3 font-normal text-black">
                              {story.seo_meta_desc ||
                                story.story_content?.slice(0, 100) ||
                                t('errors.noDescriptionAvailable')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
    </Translation>
  );
};

export default StoriesGallery;
