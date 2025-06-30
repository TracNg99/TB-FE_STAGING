import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQuery } from '../baseQuery';
import { DestinationDetails } from '../user/destination';

export interface Destination {
  id: string;
  created_by?: string;
  name: string;
  primary_photo: string;
  primary_photo_id: string;
  photos?: string[];
  photos_id?: string[];
  address?: string;
  status?: string;
  created_at?: string; // Consider using Date type if you want to handle dates
  updated_at?: string; // Consider using Date type if you want to handle dates
  primary_keyword?: string;
  url_slug?: string;
  description?: string;
  thumbnail_description?: string;
  primary_video?: string;
  primary_video_id?: string;
  parent_destination?: string | null; // Use null for optional fields
}

interface DestinationResponse {
  data: Destination;
  error?: string;
}

export type DestinationReq = Omit<
  Destination,
  'id' | 'created_at' | 'updated_at' | 'created_by'
>;

export interface createDesDetailsReq {
  destination_id: string;
  type: string;
  name: string;
  text: string;
  media?: string;
  media_id?: string;
}

const DestinationBusinessApi = createApi({
  reducerPath: 'createDestination',
  baseQuery,
  endpoints: (builder) => ({
    createDestination: builder.mutation<DestinationResponse, DestinationReq>({
      query: ({
        name,
        primary_photo,
        primary_photo_id,
        photos,
        photos_id,
        address,
        primary_keyword,
        url_slug,
        description,
        thumbnail_description,
        primary_video,
        primary_video_id,
        parent_destination,
      }) => ({
        url: `/destination`,
        method: 'POST',
        body: {
          name,
          primary_photo,
          primary_photo_id,
          photos,
          photos_id,
          address,
          primary_keyword,
          url_slug,
          description,
          thumbnail_description,
          primary_video,
          primary_video_id,
          parent_destination,
        },
      }),
    }),
    updateDestination: builder.mutation<
      DestinationResponse,
      { id: string; data: any }
    >({
      query: ({ id, data }) => ({
        url: `/destination`,
        params: { destination_id: id },
        method: 'PUT',
        body: data,
      }),
    }),
    createDestinationDetails: builder.mutation<any, createDesDetailsReq>({
      query: ({ destination_id, type, name, text, media, media_id }) => ({
        url: `/destination/details`,
        method: 'POST',
        body: {
          destination_id,
          type,
          name,
          text,
          media,
          media_id,
        },
      }),
    }),
    updateDestinationDetails: builder.mutation<
      DestinationDetails,
      { dd_id: string; data: { text?: string; name?: string } }
    >({
      query: ({ dd_id, data }) => ({
        url: `/destination/details`,
        params: { dd_id },
        method: 'PUT',
        body: data,
      }),
      // transformResponse: ((res: DestinationDetailsRes) => res.data)
    }),
    deleteDestinationDetails: builder.mutation<any, any>({
      query: ({ dd_id }) => ({
        url: `/destination/details`,
        method: 'DELETE',
        params: { dd_id },
      }),
    }),
  }),
});

export const {
  useCreateDestinationMutation,
  useUpdateDestinationMutation,
  useCreateDestinationDetailsMutation,
  useUpdateDestinationDetailsMutation,
  useDeleteDestinationDetailsMutation,
} = DestinationBusinessApi;
export { DestinationBusinessApi };
