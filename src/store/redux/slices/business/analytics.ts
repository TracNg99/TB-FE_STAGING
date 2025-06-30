import { createApi } from '@reduxjs/toolkit/query/react';

import {
  DailyStats,
  DailyStatsUniqueUsers,
  ExperienceStat,
} from '@/types/dashboard';

import { baseQuery } from '../baseQuery';

interface DailyStatsRes {
  data: DailyStats[];
  error?: any;
}

interface DailyStatsUniqueUsersRes {
  data: DailyStatsUniqueUsers[];
  error?: any;
}

const BusinessAnalyticsApi = createApi({
  reducerPath: 'businessAnalytics',
  baseQuery,
  endpoints: (builder) => ({
    getDailyStats: builder.query<DailyStats[], { businessId: string }>({
      query: ({ businessId }) => ({
        url: `/analytics/business/daily/stories-photos`,
        params: { 'business-id': businessId },
      }),
      transformResponse: (res: DailyStatsRes) => res.data,
    }),
    getDailyStatsUniqueUsers: builder.query<
      DailyStatsUniqueUsers[],
      { businessId: string }
    >({
      query: ({ businessId }) => ({
        url: `/analytics/business/daily/unique-users`,
        params: { 'business-id': businessId },
      }),
      transformResponse: (res: DailyStatsUniqueUsersRes) => res.data,
    }),
    getNumExperiences: builder.query<
      { experience_count: number },
      { businessId: string }
    >({
      query: ({ businessId }) => ({
        url: `/analytics/business/overview/experiences`,
        params: { 'business-id': businessId },
      }),
      transformResponse: (res: { data: { experience_count: number } }) =>
        res.data,
    }),
    getNumExplorers: builder.query<
      { cnt_visits: number },
      { businessId: string }
    >({
      query: ({ businessId }) => ({
        url: `/analytics/business/overview/explorers`,
        params: { 'business-id': businessId },
      }),
      transformResponse: (res: { data: { cnt_visits: number } }) => res.data,
    }),
    getNumStories: builder.query<
      { cnt_stories: number },
      { businessId: string }
    >({
      query: ({ businessId }) => ({
        url: `/analytics/business/overview/stories`,
        params: { 'business-id': businessId },
      }),
      transformResponse: (res: { data: { cnt_stories: number } }) => res.data,
    }),
    getTopExpByVisitors: builder.query<
      ExperienceStat[],
      { businessId: string }
    >({
      query: ({ businessId }) => ({
        url: `/analytics/business/top/visitors`,
        params: { 'business-id': businessId },
      }),
      transformResponse: (res: { data: ExperienceStat[] }) => res.data,
    }),
    getAllStatsByExp: builder.query<ExperienceStat[], { businessId: string }>({
      query: ({ businessId }) => ({
        url: `/analytics/business/all/experiences`,
        params: { 'business-id': businessId },
      }),
      transformResponse: (res: { data: ExperienceStat[] }) => res.data,
    }),
  }),
});

export const {
  useGetDailyStatsQuery,
  useGetDailyStatsUniqueUsersQuery,
  useGetNumExperiencesQuery,
  useGetNumExplorersQuery,
  useGetNumStoriesQuery,
  useGetTopExpByVisitorsQuery,
  useGetAllStatsByExpQuery,
} = BusinessAnalyticsApi;
export { BusinessAnalyticsApi };
