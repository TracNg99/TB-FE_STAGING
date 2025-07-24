import { createApi } from '@reduxjs/toolkit/query/react';
import { HYDRATE } from 'next-redux-wrapper';

import { baseQuery, baseQueryAgent } from '../baseQuery';

export interface StoryReqProps {
  id?: string;
  experience_id?: string;
  channel_id?: string;
  reporter_id?: string;
  title?: string;
  notes?: string;
  story_content?: string;
  media?: string[];
  status?: string;
  activities?: string[];
  experienceName?: string;
  storyLength?: number;
  brandVoice?: string;
  channelType?: string;
  seo_title_tag?: string;
  seo_meta_desc?: string;
  seo_excerpt?: string;
  seo_slug?: string;
  long_tail_keyword?: string;
  hashtags?: string[];
  user_profile?: {
    email: string;
    firstname: string;
    lastname: string;
    username: string;
    media_assets: {
      url: string;
    };
  };
  created_at?: string;
  updated_at?: string;
  follow_up_questions?: string[];
}

export interface StoryReq {
  storyId?: string;
  experienceId?: string;
  payload?: StoryReqProps;
}

export interface StoryProps {
  id?: string;
  user_id?: string;
  experience_id?: string;
  created_at?: string;
  status?: string;
  notes?: string;
  story_content?: string;
  seo_title_tag?: string;
  seo_excerpt?: string;
  seo_meta_desc?: string;
  long_tail_keyword?: string;
  hashtags?: string[];
  channel_id?: string;
  seo_slug?: string;
  destination_id?: string;
  follow_up_questions?: string[];
  // Related data from joins
  experiences?: {
    name?: string;
    description?: string;
  };
  userprofiles?: {
    email: string;
    firstname: string;
    lastname: string;
    media_assets?: {
      url: string;
    };
  };
  channels?: {
    name?: string;
    type?: string;
  };
  destinations?: {
    name?: string;
    description?: string;
  };
  media_assets?: { url: string }[];
}

export interface StoryRes {
  data?: StoryProps[];
  error?: any;
}

export interface StorySingleRes {
  data?: StoryProps;
  error?: any;
}

const StoryApi = createApi({
  reducerPath: 'story',
  baseQuery,
  endpoints: (builder) => ({
    generateStory: builder.mutation<any, StoryReq>({
      query: ({ payload }) => ({
        url: `/story/generate`,
        method: 'POST',
        body: {
          experience: payload?.experienceName,
          activities: payload?.activities,
          notes: payload?.notes,
          media_urls: payload?.media,
          brand_voice: payload?.brandVoice,
          channel_type: payload?.channelType,
          story_length: payload?.storyLength,
          // with_new_source: true
        },
      }),
    }),

    uploadStory: builder.mutation<StorySingleRes, StoryReq>({
      query: ({ payload }) => ({
        url: `/story`,
        method: 'POST',
        body: payload,
      }),
    }),

    getStory: builder.query<StorySingleRes, StoryReq>({
      query: ({ storyId }) => ({
        url: `/story`,
        params: { 'story-id': storyId },
      }),
    }),

    getAllStory: builder.query<StoryRes, void>({
      query: () => ({
        url: `/story`,
      }),
    }),

    getAllPublishedStory: builder.query<StoryRes, void>({
      query: () => ({
        url: `/story/public`,
      }),
    }),

    getSinglePublishedStory: builder.query<StorySingleRes, StoryReq>({
      query: ({ storyId }) => ({
        url: `/story/public`,
        params: { 'story-id': storyId },
      }),
    }),
    //--------------------UPDATE A STORY-------------------
    updateStory: builder.mutation<StorySingleRes, StoryReq>({
      query: ({ storyId, payload }) => ({
        url: `story`,
        params: { 'story-id': storyId },
        method: 'PUT',
        body: payload,
      }),
    }),
    //--------------------DELETE A STORY-------------------
    deleteStory: builder.mutation<StorySingleRes, StoryReq>({
      query: ({ storyId }) => ({
        url: `story`,
        params: { 'story-id': storyId },
        method: 'DELETE',
      }),
    }),
  }),
  extractRehydrationInfo(action, { reducerPath }) {
    if (action.type === HYDRATE) {
      return (action.payload as { [key: string]: any })[reducerPath];
    }
  },
});

// TargetFile: /Applications/E8/TBP/GitRepo/travel-buddy-fe/src/store/redux/slices/user/story.ts

// ... (imports and other interface definitions remain the same) ...

// Define the expected structure of a single story item/update from the stream

// Define the structure of the fully parsed SSE event you expect to resolve with
export interface StoryStreamRes {
  event: string;
  data: StoryReqProps | { message?: string; error?: string };
  channel_type: string;
}

// SSE Event Parser Utility
export class SSEEventDecoder {
  parseEvent(incomingEvent: string): Omit<StoryStreamRes, 'timestamp'> | null {
    const eventObj = JSON.parse(incomingEvent);
    return eventObj
      ? {
          event: eventObj.event,
          data: eventObj.data,
          channel_type: eventObj.channel_type,
        }
      : null;
  }
}

// Define the argument type for the streamStory mutation
interface StreamStoryArgs {
  formData: FormData;
  onChunk: (chunk: StoryStreamRes) => void;
}

const streamStoryApi = createApi({
  reducerPath: 'streamStoryApi',
  baseQuery: baseQueryAgent,
  endpoints: (builder) => ({
    streamStory: builder.mutation<StoryStreamRes, StreamStoryArgs>({
      query: ({ formData, onChunk }) => ({
        url: '/story/stream',
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'text/event-stream',
        },
        responseHandler: async (response: any) => {
          if (!response.ok) {
            console.error(
              '[STREAM DEBUG story.ts] Response not OK:',
              response.status,
              response.statusText,
            );
            const errorText = await response
              .text()
              .catch(() => `Request failed with status ${response.status}`);
            onChunk({
              event: 'error',
              data: {
                error:
                  errorText || `Request failed with status ${response.status}`,
              },
              channel_type: 'error_channel',
            });
            throw new Error(
              errorText || `Request failed with status ${response.status}`,
            );
          }
          if (!response.body) {
            console.error('[STREAM DEBUG story.ts] No response body.');
            onChunk({
              event: 'error',
              data: { error: 'No response body received for streaming.' },
              channel_type: 'error_channel',
            });
            throw new Error('No response body received for streaming.');
          }
          console.log(
            '[STREAM DEBUG story.ts] Response OK, body exists. Starting stream processing.',
          );

          return new Promise<StoryStreamRes>((resolve, reject) => {
            const reader = response.body!.getReader();
            const decoder = new TextDecoder();
            const sseDecoder = new SSEEventDecoder();
            let accumulatedData = '';
            let eventCount = 0;
            let lastValidStoryStreamRes: StoryStreamRes | null = null;

            const processStream = async () => {
              try {
                console.log(
                  '[STREAM DEBUG story.ts] processStream: Calling reader.read()...',
                );
                const { done, value } = await reader.read();

                if (done) {
                  // console.log('[STREAM DEBUG story.ts] processStream: Stream is DONE.');
                  if (lastValidStoryStreamRes) {
                    // console.log('[STREAM DEBUG story.ts] processStream: Resolving with the last valid parsed event:', lastValidStoryStreamRes);
                    onChunk({
                      event: 'done',
                      data: lastValidStoryStreamRes.data,
                      channel_type: lastValidStoryStreamRes.channel_type,
                    });
                    resolve(lastValidStoryStreamRes);
                  } else if (accumulatedData.trim()) {
                    // console.log('[STREAM DEBUG story.ts] processStream: Stream DONE, no prior valid events, but accumulatedData exists:', accumulatedData);
                    const finalRawEvent = sseDecoder.parseEvent(
                      accumulatedData.trim(),
                    );
                    // console.log('[STREAM DEBUG story.ts] processStream: Parsed finalRawEvent from accumulatedData:', finalRawEvent);
                    if (
                      finalRawEvent &&
                      typeof finalRawEvent.event === 'string' &&
                      finalRawEvent.data
                    ) {
                      console.log(
                        '[STREAM DEBUG story.ts] processStream: Channel: ',
                        finalRawEvent.channel_type,
                      );
                      const channelTypeFromEvent = finalRawEvent.channel_type;
                      const finalStoryStreamRes: StoryStreamRes = {
                        event: finalRawEvent.event,
                        data: finalRawEvent.data as StoryReqProps,
                        channel_type: channelTypeFromEvent!,
                      };
                      console.log(
                        '[STREAM DEBUG story.ts] processStream: Resolving with final event from accumulatedData:',
                        finalStoryStreamRes,
                      );
                      onChunk({
                        event: 'done',
                        data: finalStoryStreamRes.data,
                        channel_type: channelTypeFromEvent!,
                      });
                      resolve(finalStoryStreamRes);
                    } else {
                      // console.warn('[STREAM DEBUG story.ts] processStream: Stream ended. Accumulated data did not parse into a conclusive event. Rejecting.');
                      onChunk({
                        event: 'error',
                        data: {
                          error:
                            'Stream ended without a conclusive SSE event from accumulated data.',
                        },
                        channel_type: 'error_channel',
                      });
                      reject(
                        new Error(
                          'Stream ended without a conclusive SSE event from accumulated data.',
                        ),
                      );
                    }
                  } else {
                    // console.warn('[STREAM DEBUG story.ts] processStream: Stream ended. No valid events processed and no remaining data. Rejecting.');
                    onChunk({
                      event: 'done',
                      data: {
                        message: 'Stream ended without any valid SSE event.',
                      },
                      channel_type: '',
                    });
                    reject(
                      new Error('Stream ended without any valid SSE event.'),
                    );
                  }
                  return;
                }

                const chunk = decoder.decode(value, { stream: true });
                // console.log('[STREAM DEBUG story.ts] processStream: Received CHUNK:', chunk);
                accumulatedData += chunk;

                let eventBoundaryIndex;
                while (
                  (eventBoundaryIndex = accumulatedData.indexOf('\n\n')) >= 0
                ) {
                  eventCount++;
                  const eventString = accumulatedData.substring(
                    0,
                    eventBoundaryIndex,
                  );
                  accumulatedData = accumulatedData.substring(
                    eventBoundaryIndex + 2,
                  );
                  // console.log(`[STREAM DEBUG story.ts] processStream: Found event string #${eventCount}:`, eventString);

                  if (eventString.trim()) {
                    const parsedRawEvent = sseDecoder.parseEvent(eventString);
                    // console.log(`[STREAM DEBUG story.ts] processStream: Parsed event #${eventCount}:`, parsedRawEvent);

                    if (
                      parsedRawEvent &&
                      typeof parsedRawEvent.event === 'string' &&
                      parsedRawEvent.data
                    ) {
                      console.log(
                        '[STREAM DEBUG story.ts] processStream: Channel: ',
                        parsedRawEvent.channel_type,
                      );
                      const channelTypeFromEvent = parsedRawEvent.channel_type;
                      const currentChunkRes: StoryStreamRes = {
                        event: parsedRawEvent.event,
                        data: parsedRawEvent.data as StoryReqProps,
                        channel_type: channelTypeFromEvent || '',
                      };
                      lastValidStoryStreamRes = currentChunkRes;
                      console.log(
                        `[STREAM DEBUG story.ts] processStream: Event #${eventCount} is valid. Calling onChunk with:`,
                        currentChunkRes,
                      );
                      onChunk(currentChunkRes);
                    } else {
                      console.log(
                        `[STREAM DEBUG story.ts] processStream: Event #${eventCount} parsed but not valid for storing (event type or data missing).`,
                      );
                    }
                  }
                }

                // console.log('[STREAM DEBUG story.ts] processStream: No complete event in current accumulation or processed all in chunk, continuing to read stream...');
                processStream();
              } catch (error) {
                // console.error('[STREAM DEBUG story.ts] processStream: ERROR during stream processing:', error);
                const errorMessage =
                  error instanceof Error
                    ? error.message
                    : 'Unknown streaming error';
                onChunk({
                  event: 'error',
                  data: { error: errorMessage },
                  channel_type: 'error_channel',
                });
                reject(
                  error instanceof Error
                    ? error
                    : new Error('Unknown streaming error'),
                );
              }
            };

            // console.log('[STREAM DEBUG story.ts] Kicking off processStream...');
            processStream();
          });
        },
      }),
    }),
  }),
});

export const { useStreamStoryMutation } = streamStoryApi;

// ... (rest of the file, e.g., StoryApi and its exports)

export const {
  useGenerateStoryMutation,
  useUploadStoryMutation,
  useGetStoryQuery,
  useGetAllStoryQuery,
  useUpdateStoryMutation,
  useDeleteStoryMutation,
  useGetAllPublishedStoryQuery,
  useGetSinglePublishedStoryQuery,
} = StoryApi;

export { StoryApi, streamStoryApi };
