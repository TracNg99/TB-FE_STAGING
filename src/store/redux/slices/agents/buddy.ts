import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryAgent } from '../baseQuery';

// Define TypeScript interfaces for the request and response data
export interface BuddyAgentReq {
  query: string;
  images?: string[];
  num_results?: number;
  filters?: { [key: string]: string | undefined } | string;
  session_id?: string | null;
}

interface Source {
  id: number;
  logo: string;
  name: string;
  url: string;
  title: string;
  snippet: string;
}

interface BuddyAgentRes {
  data?: any;
  error?: any;
}

interface BuddyHistoryProps {
  id: string;
  user_id: string;
  created_at: string;
  context?: string;
  chat_messages: {
    id: string;
    user_id: string;
    role: string;
    content: string;
    metadata?: {
      images?: string[];
      sources?: Source[];
      suggestions?: string[];
      follow_up_questions?: string[];
    };
    created_at: string;
    thread_id: string;
  }[];
}
interface BuddyHistoryRes {
  data?: BuddyHistoryProps[];
  error?: any;
}

interface StreamMessageProps {
  response?: string;
  images?: string[];
  sources?: Source[];
  suggestions?: string[];
  follow_ups?: string[];
  event?: string;
  emoticon?: string;
  emoji?: string;
  error?: string;
}

// src/services/types.ts
export type StreamMessage = {
  event: string;
  data: StreamMessageProps;
  timestamp?: number;
  [key: string]: any;
};

// SSE Event Parser Utility
export class SSEEventDecoder {
  parseEvent(incomingEvent: string): Omit<StreamMessage, 'timestamp'> | null {
    const eventObj = JSON.parse(incomingEvent);
    return eventObj ? { event: eventObj.event, data: eventObj.data } : null;
  }
}

const BuddyAgentApi = createApi({
  reducerPath: 'buddyAgent',
  baseQuery: baseQueryAgent,
  tagTypes: ['Submission'],
  keepUnusedDataFor: 1,
  endpoints: (builder) => ({
    // ------------------QUERY SearchAgent BY ID--------------------------
    callBuddyAgent: builder.mutation<BuddyAgentRes, BuddyAgentReq>({
      query: (payload) => ({
        url: `/chat`,
        method: 'POST',
        body: payload,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    }),

    getAllChatThreads: builder.query<BuddyHistoryRes, void>({
      query: () => ({
        url: `/chat/history`,
        method: 'GET',
      }),
    }),

    getThreadById: builder.query<
      { data: BuddyHistoryProps },
      { session_id: string | null }
    >({
      query: ({ session_id }) => ({
        url: `/chat/history/thread`,
        method: 'GET',
        params: {
          session_id: session_id,
        },
      }),
    }),

    getInitialSuggestions: builder.query<
      { data: string[] },
      { experienceId: string; companyId: string }
    >({
      query: ({ experienceId, companyId }) => ({
        url: `/chat/suggestions`,
        method: 'GET',
        params: {
          experience_id: experienceId,
          company_id: companyId,
        },
      }),
    }),

    resetChatMemory: builder.query<
      { data: { session_id?: string | null } | string },
      { session_id: string | null }
    >({
      query: ({ session_id }) => ({
        url: `/reset-memory`,
        method: 'GET',
        params: {
          session_id: session_id,
        },
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('jwt')}`,
        },
      }),
    }),
  }),
});

const streamBuddyApi = createApi({
  reducerPath: 'streamBuddyApi',
  baseQuery: baseQueryAgent,
  endpoints: (builder) => ({
    buddyStream: builder.mutation<
      StreamMessage,
      {
        body: BuddyAgentReq;
        onChunk: (chunk: StreamMessage) => void;
      }
    >({
      query: ({ body, onChunk }) => ({
        url: '/chat/stream_v2',
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          Authorization: `Bearer ${localStorage.getItem('jwt')}`,
        },
        responseHandler: async (response: any) => {
          if (!response.ok) {
            // console.error(
            //   '[STREAM DEBUG story.ts] Response not OK:',
            //   response.status,
            //   response.statusText,
            // );
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
          // console.log(
          //   '[STREAM DEBUG story.ts] Response OK, body exists. Starting stream processing.',
          // );

          return new Promise<StreamMessage>((resolve, reject) => {
            const reader = response.body!.getReader();
            const decoder = new TextDecoder();
            const sseDecoder = new SSEEventDecoder();
            let accumulatedData = '';
            let eventCount = 0;
            let lastValidStoryStreamRes: StreamMessage | null = null;

            const processStream = async () => {
              try {
                const { done, value } = await reader.read();

                if (done) {
                  if (lastValidStoryStreamRes) {
                    onChunk({
                      event: 'done',
                      data: lastValidStoryStreamRes.data,
                      channel_type: lastValidStoryStreamRes.channel_type,
                    });
                    resolve(lastValidStoryStreamRes);
                  } else if (accumulatedData.trim()) {
                    const finalRawEvent = sseDecoder.parseEvent(
                      accumulatedData.trim(),
                    );
                    if (
                      finalRawEvent &&
                      typeof finalRawEvent.event === 'string' &&
                      finalRawEvent.data
                    ) {
                      const channelTypeFromEvent = finalRawEvent.channel_type;
                      const finalStoryStreamRes: StreamMessage = {
                        event: finalRawEvent.event,
                        data: finalRawEvent.data as StreamMessageProps,
                        channel_type: channelTypeFromEvent!,
                      };
                      onChunk({
                        event: 'done',
                        data: finalStoryStreamRes.data,
                        channel_type: channelTypeFromEvent!,
                      });
                      resolve(finalStoryStreamRes);
                    } else {
                      console.warn(
                        '[STREAM DEBUG buddy.ts] processStream: Stream ended. Accumulated data did not parse into a conclusive event. Rejecting.',
                      );
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
                    console.warn(
                      '[STREAM DEBUG buddy.ts] processStream: Stream ended. No valid events processed and no remaining data. Rejecting.',
                    );
                    onChunk({
                      event: 'done',
                      data: {
                        error: 'Stream ended without any valid SSE event.',
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
                      // console.log(
                      //   '[STREAM DEBUG story.ts] processStream: Channel: ',
                      //   parsedRawEvent.channel_type,
                      // );
                      const channelTypeFromEvent = parsedRawEvent.channel_type;
                      const currentChunkRes: StreamMessage = {
                        event: parsedRawEvent.event,
                        data: parsedRawEvent.data as StreamMessageProps,
                        channel_type: channelTypeFromEvent || '',
                      };
                      lastValidStoryStreamRes = currentChunkRes;
                      onChunk(currentChunkRes);
                    } else {
                      console.log(
                        `[STREAM DEBUG buddy.ts] processStream: Event #${eventCount} parsed but not valid for storing (event type or data missing).`,
                      );
                    }
                  }
                }

                processStream();
              } catch (error) {
                console.error(
                  '[STREAM DEBUG buddy.ts] processStream: ERROR during stream processing:',
                  error,
                );
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

export const {
  useCallBuddyAgentMutation,
  useResetChatMemoryQuery,
  useGetThreadByIdQuery,
  useGetAllChatThreadsQuery,
  useGetInitialSuggestionsQuery,
} = BuddyAgentApi;

export const { useBuddyStreamMutation } = streamBuddyApi;
export { BuddyAgentApi, streamBuddyApi };
