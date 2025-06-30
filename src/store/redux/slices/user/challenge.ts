import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQuery } from '../baseQuery';

// Define TypeScript interfaces for the request and response data
interface ChallengeReq {
  entity?: string;
  challengeId?: string | string[];
  locationId?: string;
  title?: string;
  thumbnailurl?: string;
  backgroundurl?: string;
  challenge_title?: string;
  status?: string;
  value?: string | null;
  token?: string | null;
  userLocationSubmission?:
    | {
        userQuestionSubmission?: string;
        userMediaSubmission?: (string | undefined)[] | null;
      }[]
    | any;
}

interface ChallengeRes {
  data?: any;
  error?: any;
}

const JoinChallengeApi = createApi({
  reducerPath: 'joinchallenge',
  baseQuery,
  tagTypes: ['Submission'],
  keepUnusedDataFor: 1,
  endpoints: (builder) => ({
    // ------------------QUERY CHALLENGE BY ID--------------------------
    getChallenge: builder.query<ChallengeRes, ChallengeReq>({
      query: ({ challengeId }) => ({
        url: `/challenge/user`,
        params: { challenge_id: challengeId },
      }),
    }),

    // ------------------QUERY ALL AVAILABLE CHALLENGES--------------------------
    getAllChallenges: builder.query<ChallengeRes, void>({
      query: () => ({
        url: `/challenge/user`,
      }),
    }),
  }),
});

export const { useGetChallengeQuery, useGetAllChallengesQuery } =
  JoinChallengeApi;
export { JoinChallengeApi };
