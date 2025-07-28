import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { cache } from 'react';

import { getSinglePublishedStory } from '@/lib/server-api/story';
import { StoryProps } from '@/store/redux/slices/user/story';

import StoryClient from './StoryClient';

const queryPost = cache(async (id: string) => {
  const result = await getSinglePublishedStory(id);
  return result;
});

// Generate metadata function for dynamic SEO
export async function generateMetadata({
  params,
}: {
  params: any;
}): Promise<Metadata> {
  const storyId = (await params).storyId;
  const result = await queryPost(storyId);
  // Handle error case for metadata
  if (!result.isSuccess || !result.data) {
    // Only treat as notFound if error is 404 or not found
    if (
      result.error?.toLowerCase().includes('404') ||
      result.error?.toLowerCase().includes('not found')
    ) {
      return {
        title: 'Story Not Found',
        description: 'The requested story could not be found.',
      };
    }
    // Otherwise, throw error for error.tsx
    throw new Error(
      `Metadata fetch error for storyId=${storyId}: ${result.error || 'Unknown error'}`,
    );
  }

  const story: StoryProps = result.data;

  const storyTitle =
    story?.seo_title_tag || story?.experiences?.name || 'Travel Story';
  const storyContent = story?.story_content || story?.notes || '';
  const storyAuthor =
    story?.userprofiles?.firstname && story?.userprofiles?.lastname
      ? `${story.userprofiles.firstname} ${story.userprofiles.lastname}`
      : story?.userprofiles?.email || 'Unknown Author';
  const hashtags = story?.hashtags || [];
  const longTailKeyword = story?.long_tail_keyword || '';
  const seoMetaDesc = story?.seo_meta_desc || storyContent?.slice(0, 160) || '';
  const storyExperience = story?.experiences?.name || '';
  const storyDestination = story?.destinations?.name || '';

  return {
    title: storyTitle,
    description: seoMetaDesc,
    keywords: [...hashtags, longTailKeyword].filter(Boolean).join(', '),
    authors: [{ name: storyAuthor }],
    openGraph: {
      title: storyTitle,
      description: seoMetaDesc,
      type: 'article',
      authors: [storyAuthor],
      publishedTime: story?.created_at,
      url: `https://yourdomain.com/stories/${storyId}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: storyTitle,
      description: seoMetaDesc,
    },
    other: {
      'article:section': storyExperience,
      'article:tag': storyDestination,
    },
  };
}

export default async function Page({ params }: { params: any }) {
  const storyId = (await params).storyId;
  const result = await queryPost(storyId);

  // Handle error cases
  if (!result.isSuccess) {
    // Only treat as notFound if error is 404 or not found
    if (
      result.error?.toLowerCase().includes('404') ||
      result.error?.toLowerCase().includes('not found')
    ) {
      notFound(); // This will show the not-found.tsx page
    }
    // Otherwise, throw error for error.tsx
    throw new Error(
      `Failed to fetch storyId=${storyId}: ${result.error || 'Unknown error'}`,
    );
  }

  if (!result.data) {
    notFound();
  }

  const story: StoryProps = result.data;

  // Generate structured data for SEO
  const storyTitle =
    story?.seo_title_tag || story?.experiences?.name || 'Travel Story';
  const storyContent = story?.story_content || story?.notes || '';
  const storyAuthor =
    story?.userprofiles?.firstname && story?.userprofiles?.lastname
      ? `${story.userprofiles.firstname} ${story.userprofiles.lastname}`
      : story?.userprofiles?.email || 'Unknown Author';
  const seoMetaDesc = story?.seo_meta_desc || storyContent?.slice(0, 160) || '';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'TravelStory',
    headline: storyTitle,
    description: seoMetaDesc,
    author: {
      '@type': 'Person',
      name: storyAuthor,
    },
    datePublished: story?.created_at,
    dateModified: story?.created_at,
    publisher: {
      '@type': 'Organization',
      name: 'Travel Buddy',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://travelbuddy8.com/stories/${storyId}`,
    },
  };

  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <StoryClient story={story} />
    </>
  );
}
