'use client';

import Link from 'next/link';

import PageWrapper from '@/components/layouts/PageWrapper';
import { useAuth } from '@/contexts/auth-provider';
import {
  StoryProps,
  useGetAllStoryQuery,
} from '@/store/redux/slices/user/story';

import StoriesLoading from './loading';

function getErrorMessage(error: any) {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error)
    return error.message;
  return 'Failed to fetch stories';
}

export default function StoriesPage() {
  const { user } = useAuth();

  // Only fetch stories if user is logged in
  const { data, isLoading, isError, error } = useGetAllStoryQuery();

  // Show loading while user is being determined or stories are loading
  if (!user?.userid) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center">
        <h1 className="text-3xl font-bold mb-6">My Travel Stories</h1>
        <p className="text-gray-600">Please log in to view your stories.</p>
      </div>
    );
  }

  if (isLoading) {
    return <StoriesLoading />;
  }
  if (isError) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center text-red-600">
        {getErrorMessage(error)}
      </div>
    );
  }

  const stories: StoryProps[] = data?.data || [];

  // Filter stories to only show current user's stories
  const userStories = stories.filter((story) => story.user_id === user?.userid);

  return (
    <PageWrapper>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Travel Stories</h1>
        <Link
          href="/stories/new"
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
        >
          Create New Story
        </Link>
      </div>

      {userStories.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            No Stories Found
          </h2>
          <p className="text-gray-500 mb-6">
            {`You haven't created any travel stories yet. Start sharing your
            adventures!`}
          </p>
          <Link
            href="/stories/new"
            className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            Create Your First Story
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {userStories.map((story: StoryProps) => (
            <div
              key={story.id}
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3"
            >
              {/* Image preview if available */}
              {story.media_assets && story.media_assets.length > 0 ? (
                <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden mb-2">
                  <img
                    src={story.media_assets[0].url}
                    alt="Story photo"
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-gray-100 mb-2"></div>
              )}
              <h2 className="text-xl font-semibold mb-1 line-clamp-2">
                {story.seo_title_tag ||
                  story.experiences?.name ||
                  'Untitled Story'}
              </h2>
              <div className="text-sm text-gray-500 mb-1">
                By {story.userprofiles?.firstname}{' '}
                {story.userprofiles?.lastname}
                {story.created_at &&
                  ` • ${new Date(story.created_at).toLocaleDateString()}`}
              </div>
              {/* Hashtags */}
              {story.hashtags && story.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1">
                  {story.hashtags
                    .slice(0, 3)
                    .map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                </div>
              )}
              <p className="text-gray-600 mb-2 line-clamp-3">
                {story.seo_meta_desc ||
                  story.story_content?.slice(0, 150) ||
                  'No description available'}
              </p>
              <Link
                href={`/stories/${story.id}`}
                className="inline-block text-orange-600 hover:text-orange-800 font-medium"
              >
                Read Story →
              </Link>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
