import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQuery } from '../baseQuery';

// Define TypeScript interfaces for the request and response data
interface SearchAgentReq {
  query: string;
  word_limit?: number;
  custom_system_prompt?: string;
  topic?: string;
}

interface SearchAgentRes {
  answer?: string;
  error?: any;
}

const SearchAgentApi = createApi({
  reducerPath: 'searchAgent',
  baseQuery,
  tagTypes: ['Submission'],
  keepUnusedDataFor: 1,
  endpoints: (builder) => ({
    // ------------------QUERY SearchAgent BY ID--------------------------
    callSearchAgent: builder.mutation<SearchAgentRes, SearchAgentReq>({
      query: (payload) => ({
        url: `/agents/search`,
        method: 'POST',
        body: payload,
      }),
    }),
  }),
});

export const { useCallSearchAgentMutation } = SearchAgentApi;
export { SearchAgentApi };
