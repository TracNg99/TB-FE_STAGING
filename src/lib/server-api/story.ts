// lib/server-api/server-api/story.ts/streamImage
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
        cache: 'no-cache',
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
        cache: 'no-cache',
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
        cache: 'no-cache',
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

// Server-side image generation streaming API
export async function generateImageStream(
  payload: {
    prompt?: string;
    experience_id: string;
    media: string[];
  },
  onProgress?: (event: string, data: { image?: string }) => void,
  onError?: (error: string) => void,
) {
  try {
    const response = await fetch(
      'https://travelbuddy-agents-server-797173526974.us-central1.run.app/api/v1/story/image/generations',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify(payload),
        cache: 'no-cache',
      },
    );

    if (!response.ok) {
      const errorMessage = `Failed to generate image stream: ${response.statusText}`;
      onError?.(errorMessage);
      throw new Error(errorMessage);
    }

    // Check if response is SSE
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('text/event-stream')) {
      console.warn(
        '⚠️ Response is not SSE, falling back to regular JSON parsing',
      );
      const rawData = await response.json();

      if (!rawData?.data?.url) {
        console.warn('⚠️ No image URL received:', rawData);
      }

      // onComplete?.(rawData);
      return {
        data: rawData,
        isLoading: false,
        error: null,
        isSuccess: true,
      };
    }

    // Handle SSE stream
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let eventCount = 0;
    let lastValidStreamRes: any | null = null;
    let finalData = null;

    try {
      const { done, value } = await reader.read();

      if (done) {
        if (lastValidStreamRes) {
          onProgress?.('done', lastValidStreamRes);
        } else if (buffer.trim()) {
          finalData = JSON.parse(buffer.trim());
          onProgress?.('done', finalData);
        } else {
          onError?.(
            'Stream ended without a conclusive SSE event from accumulated data.',
          );
        }
      }

      // Decode the chunk and add to buffer
      buffer = decoder.decode(value, { stream: true });

      let eventBoundaryIndex;
      while ((eventBoundaryIndex = buffer.indexOf('\n\n')) >= 0) {
        eventCount++;
        const eventString = buffer.substring(0, eventBoundaryIndex);
        buffer = buffer.substring(eventBoundaryIndex + 2);

        if (eventString.trim()) {
          const parsedRawEvent = JSON.parse(eventString);
          debugApiResponse(parsedRawEvent, '/api/v1/story/image/generations');

          if (
            parsedRawEvent &&
            typeof parsedRawEvent.event === 'string' &&
            parsedRawEvent.data
          ) {
            const currentChunkRes = {
              event: parsedRawEvent.event,
              data: parsedRawEvent.data,
            };
            lastValidStreamRes = currentChunkRes;
            console.log(
              `[STREAM DEBUG server-api/story.ts/streamImage] processStream: Event #${eventCount} is valid. Calling onChunk with:`,
              currentChunkRes,
            );
            onProgress?.(currentChunkRes.event, currentChunkRes.data);
          } else {
            console.log(
              `[STREAM DEBUG server-api/story.ts/streamImage] processStream: Event #${eventCount} parsed but not valid for storing (event type or data missing).`,
            );
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    // return {
    //   data: finalData,
    //   isLoading: false,
    //   error: null,
    //   isSuccess: true,
    // };
  } catch (error) {
    console.error('❌ Error generating image stream:', error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to generate image stream';
    onError?.(errorMessage);
    // return {
    //   data: null,
    //   isLoading: false,
    //   error: errorMessage,
    //   isSuccess: false,
    // };
  }
}
