import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQuery } from '../baseQuery';

interface ChallengeReq {
  title: string;
  description: string;
  thumbnail: string | null | undefined;
  backgroundImage: string | null | undefined;
  tourSchedule: string;
}

interface ChallengeRes {
  data?: any;
  error?: any;
}

interface AllChallengesRes {
  data: {
    id: string;
    businessid: string;
    description: string;
    thumbnailUrl: string;
    backgroundUrl: string | null;
    qrurl: string | null;
    price: number;
    created: string;
    title: string;
    tourSchedule: string | null;
    status: string;
  }[];
  error?: any;
}

const ChallengeApi = createApi({
  reducerPath: 'createChallenge',
  baseQuery,
  endpoints: (builder) => ({
    getAllChallenges: builder.query<AllChallengesRes, void>({
      query: () => ({
        url: `/challenge/business`,
        method: 'GET',
      }),
    }),
    createChallenge: builder.mutation<ChallengeRes, ChallengeReq>({
      query: ({
        title,
        description,
        thumbnail,
        backgroundImage,
        tourSchedule,
      }) => ({
        url: `/challenge/business`,
        method: 'POST',
        body: {
          title,
          description,
          thumbnailUrl: thumbnail,
          backgroundUrl: backgroundImage,
          tourSchedule,
        },
      }),
    }),
    updateChallenge: builder.mutation<ChallengeRes, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/challenge/business`,
        params: { challenge_id: id },
        method: 'PUT',
        body: data,
      }),
    }),
    deleteChallenge: builder.mutation<ChallengeRes, { id: string }>({
      query: ({ id }) => ({
        url: `/challenge/business`,
        params: { challenge_id: id },
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useCreateChallengeMutation,
  useGetAllChallengesQuery,
  useUpdateChallengeMutation,
  useDeleteChallengeMutation,
} = ChallengeApi;
export { ChallengeApi };
