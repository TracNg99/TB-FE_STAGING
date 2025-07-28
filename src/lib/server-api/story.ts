// lib/server-api/story.ts
// Server-side story API functions for Next.js server components
//
// This file provides server-side equivalents of RTK Query story endpoints that:
// - Work in Next.js server components (no localStorage, no client-side dependencies)
// - Return the same data structures as client-side queries
// - Include proper error handling and loading states
//
// Usage in server components:
// const result = await getSinglePublishedStory(storyId);
// const story = result.data; // Same structure as RTK Query response
import { StoryProps } from '@/store/redux/slices/user/story';
import {
  debugApiResponse,
  extractStoryData,
  validateStoryData,
} from '@/utils/debug-api';

// Get single published story by ID (mirrors getSinglePublishedStory)
export async function getSinglePublishedStory(storyId: string): Promise<{
  data: StoryProps | null;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
}> {
  try {
    const response = await fetch(
      `https://fork-travel-buddy.vercel.app/api/v1/story/public?story-id=${storyId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'force-cache',
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch story: ${response.statusText}`);
    }

    const rawData = await response.json();

    // Debug the response structure
    debugApiResponse(rawData, `getSinglePublishedStory(${storyId})`);

    // Extract story data safely
    const storyData = extractStoryData(rawData);

    // Validate the story data
    if (!validateStoryData(storyData)) {
      console.warn('⚠️ Story data validation failed:', storyData);
    }

    return {
      data: storyData,
      isLoading: false,
      error: null,
      isSuccess: true,
    };
  } catch (error) {
    console.error('❌ Error fetching story:', error);
    return {
      data: null,
      isLoading: false,
      error: error instanceof Error ? error.message : 'Failed to fetch story',
      isSuccess: false,
    };
  }
}

// Get all published stories (mirrors getAllPublishedStory)
export async function getAllPublishedStories(): Promise<{
  data: StoryProps[] | null;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
}> {
  try {
    const response = await fetch(
      'https://fork-travel-buddy.vercel.app/api/v1/story/public',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch stories: ${response.statusText}`);
    }

    const rawData = await response.json();

    // Debug the response structure
    debugApiResponse(rawData, 'getAllPublishedStories');

    // Extract stories data safely
    const storiesData = extractStoryData(rawData);

    return {
      data: storiesData,
      isLoading: false,
      error: null,
      isSuccess: true,
    };
  } catch (error) {
    console.error('❌ Error fetching stories:', error);
    return {
      data: null,
      isLoading: false,
      error: error instanceof Error ? error.message : 'Failed to fetch stories',
      isSuccess: false,
    };
  }
}

// Upload story using agent server (mirrors uploadStory but with agentServerUrl)
export async function uploadStoryAgent(payload: any): Promise<{
  data: StoryProps | null;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
}> {
  try {
    const response = await fetch(
      'https://travelbuddy-agents-server-797173526974.us-central1.run.app/api/v1/story',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to upload story: ${response.statusText}`);
    }

    const rawData = await response.json();

    // Debug the response structure
    debugApiResponse(rawData, 'uploadStoryAgent');

    // Extract story data safely
    const storyData = extractStoryData(rawData);

    // Validate the story data
    if (!validateStoryData(storyData)) {
      console.warn('⚠️ Story data validation failed:', storyData);
    }

    return {
      data: storyData,
      isLoading: false,
      error: null,
      isSuccess: true,
    };
  } catch (error) {
    console.error('❌ Error uploading story:', error);
    return {
      data: null,
      isLoading: false,
      error: error instanceof Error ? error.message : 'Failed to upload story',
      isSuccess: false,
    };
  }
}
