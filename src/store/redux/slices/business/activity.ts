import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQuery } from '../baseQuery';
import { ActivityInfo } from '../user/experience';

export interface Activity {
  id: string;
  experience_id: string;
  title: string;
  primary_photo: string;
  primary_photo_id?: string;
  photos?: string[];
  photo_ids?: string[];
  hours?: string;
  address?: string;
  primary_keyword?: string;
  url_slug?: string;
  description?: string;
  description_thumbnail?: string;
  thumbnail_description?: string;
  activity_info?: ActivityInfo[];
  order_of_appearance?: number;
  highlights?: string[];
}

interface ActivityResponse {
  data: Activity;
  error?: string;
}

export type ActivityReq = Omit<Activity, 'id'>;

const ActivityBusinessApi = createApi({
  reducerPath: 'createActivity',
  baseQuery,
  endpoints: (builder) => ({
    createActivity: builder.mutation<ActivityResponse, ActivityReq>({
      query: ({
        experience_id,
        title,
        primary_photo,
        primary_photo_id,
        photos,
        photo_ids,
        hours,
        address,
        description,
        description_thumbnail,
        order_of_appearance = -1,
        highlights,
      }) => ({
        url: `/activities`,
        method: 'POST',
        body: {
          experience_id,
          title,
          primary_photo,
          primary_photo_id,
          photos,
          photo_ids,
          hours,
          address,
          description,
          description_thumbnail,
          order_of_appearance,
          highlights,
        },
      }),
    }),
    updateActivity: builder.mutation<
      ActivityResponse,
      { id: string; data: any }
    >({
      query: ({ id, data }) => ({
        url: `/activities`,
        params: { 'activity-id': id },
        method: 'PUT',
        body: data,
      }),
    }),
  }),
});

export const { useCreateActivityMutation, useUpdateActivityMutation } =
  ActivityBusinessApi;
export { ActivityBusinessApi };
