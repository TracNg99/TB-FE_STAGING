import { createApi } from '@reduxjs/toolkit/query/react';
import { HYDRATE } from 'next-redux-wrapper';

import { baseQueryAgent } from '../baseQuery';
import { StoryReq, StorySingleRes } from './story';

// Agent-specific story API that uses agentServerUrl
const StoryAgentApi = createApi({
  reducerPath: 'storyAgent',
  baseQuery: baseQueryAgent,
  endpoints: (builder) => ({
    uploadStoryAgent: builder.mutation<StorySingleRes, StoryReq>({
      query: ({ payload }) => ({
        url: `/story`,
        method: 'POST',
        body: payload,
      }),
    }),

    generateStoryAgent: builder.mutation<any, StoryReq>({
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
        },
      }),
    }),
  }),
  extractRehydrationInfo(action, { reducerPath }) {
    if (action.type === HYDRATE) {
      return (action.payload as { [key: string]: any })[reducerPath];
    }
  },
});

export const { useUploadStoryAgentMutation, useGenerateStoryAgentMutation } =
  StoryAgentApi;
export default StoryAgentApi;
