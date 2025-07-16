import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryAgent } from '../baseQuery';

export const ttsApi = createApi({
  reducerPath: 'ttsApi',
  baseQuery: baseQueryAgent,
  tagTypes: ['Session'],
  endpoints: (builder) => ({
    startSession: builder.mutation({
      query: (body) => ({
        url: 'tts/sessions/start',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Session'],
    }),
    updateSession: builder.mutation({
      query: ({ sessionId, ...body }) => ({
        url: `tts/sessions`,
        method: 'PATCH',
        body: { session_id: sessionId, ...body },
      }),
    }),
    getSession: builder.query({
      query: (sessionId) => ({
        url: `tts/sessions`,
        params: { session_id: sessionId },
      }),
      providesTags: (result) =>
        result ? [{ type: 'Session', id: result.session_id }] : ['Session'],
    }),
    getAudioStream: builder.query<
      Uint8Array,
      {
        contentId: string;
        language: string;
        range?: string;
        onChunk: (chunk: Uint8Array) => void;
      }
    >({
      query: ({ contentId, language, range, onChunk }) => ({
        url: `tts/audio`,
        params: { content_id: contentId, language },
        headers: range ? { Range: `bytes=${range}` } : undefined,
        responseHandler: async (response) => {
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              errorText || `Request failed with status ${response.status}`,
            );
          }
          if (!response.body) {
            throw new Error('No response body received for streaming.');
          }

          return new Promise<Uint8Array>((resolve, reject) => {
            const reader = response.body!.getReader();
            const processStream = async () => {
              try {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) {
                    resolve(new Uint8Array()); // Resolve with empty array when done
                    break;
                  }
                  onChunk(value);
                }
              } catch (error) {
                reject(error);
              }
            };
            processStream();
          });
        },
      }),
    }),
  }),
});

export const {
  useStartSessionMutation,
  useUpdateSessionMutation,
  useLazyGetSessionQuery,
  useLazyGetAudioStreamQuery,
} = ttsApi;
