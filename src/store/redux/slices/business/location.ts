import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQuery } from '../baseQuery';
import { LocationInfo } from '../user/experience';

export interface Location {
  id: string;
  experience_id: string;
  title: string;
  primary_photo: string;
  primary_photo_id?: string;
  photos?: string[];
  hours?: string;
  description: string;
  description_thumbnail: string;
  location_info?: LocationInfo[];
  order_of_appearance: number;
}

interface LocationResponse {
  data: Location;
  error?: string;
}

export type LocationReq = Omit<Location, 'id'>;

const LocationBusinessApi = createApi({
  reducerPath: 'createLocation',
  baseQuery,
  endpoints: (builder) => ({
    createLocation: builder.mutation<LocationResponse, LocationReq>({
      query: ({
        experience_id,
        title,
        primary_photo,
        primary_photo_id,
        photos,
        hours,
        description,
        description_thumbnail,
        order_of_appearance = -1,
      }) => ({
        url: `/locations`,
        method: 'POST',
        body: {
          experience_id,
          title,
          primary_photo,
          primary_photo_id,
          photos,
          hours,
          description,
          description_thumbnail,
          order_of_appearance,
        },
      }),
    }),
    updateLocation: builder.mutation<
      LocationResponse,
      { id: string; data: any }
    >({
      query: ({ id, data }) => ({
        url: `/locations`,
        params: { 'location-id': id },
        method: 'PUT',
        body: data,
      }),
    }),
  }),
});

export const { useCreateLocationMutation, useUpdateLocationMutation } =
  LocationBusinessApi;
export { LocationBusinessApi };
