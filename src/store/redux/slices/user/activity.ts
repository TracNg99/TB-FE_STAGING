import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQuery } from '../baseQuery';
import { Activity } from '../user/experience';

interface GetActivityResponse {
  data: Activity[];
  error?: string;
}

const ActivityUserApi = createApi({
  reducerPath: 'getActivity',
  baseQuery,
  endpoints: (builder) => ({
    getActivitiesInExperience: builder.query<
      Activity[],
      { experience_id: string }
    >({
      query: ({ experience_id }) => ({
        url: `/activities/experience`,
        params: { 'experience-id': experience_id },
        method: 'GET',
      }),
      transformResponse: (response: GetActivityResponse): Activity[] =>
        response.data,
    }),

    getActivitiesInExperiencePublic: builder.query<
      Activity[],
      { experience_id: string; language?: string }
    >({
      query: ({ experience_id, language }) => ({
        url: `/experiences/public/activities`,
        params: { 'experience-id': experience_id, language: language || 'en' },
        method: 'GET',
      }),
      transformResponse: (response: GetActivityResponse): Activity[] =>
        response.data,
    }),
  }),
});

export const {
  useGetActivitiesInExperienceQuery,
  useGetActivitiesInExperiencePublicQuery,
} = ActivityUserApi;
export { ActivityUserApi };
