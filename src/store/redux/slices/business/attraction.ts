import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQuery } from '../baseQuery';

export interface Attraction {
  id: string;
  destination_id: string;
  title: string;
  primary_photo: string;
  primary_photo_id?: string;
  photos?: string[];
  hours?: string;
  description: string;
  description_thumbnail: string;
  order_of_appearance: number;
}

interface AttractionResponse {
  data: Attraction;
  error?: string;
}

export type AttractionReq = Omit<Attraction, 'id'>;

const AttractionBusinessApi = createApi({
  reducerPath: 'createAttraction',
  baseQuery,
  endpoints: (builder) => ({
    createAttraction: builder.mutation<AttractionResponse, AttractionReq>({
      query: ({
        destination_id,
        title,
        primary_photo,
        primary_photo_id,
        photos,
        hours,
        description,
        description_thumbnail,
        order_of_appearance = -1,
      }) => ({
        url: `/attraction`,
        method: 'POST',
        body: {
          destination_id,
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
    updateAttraction: builder.mutation<
      AttractionResponse,
      { id: string; data: any }
    >({
      query: ({ id, data }) => ({
        url: `/attraction`,
        params: { attraction_id: id },
        method: 'PUT',
        body: data,
      }),
    }),
  }),
});

export const { useCreateAttractionMutation, useUpdateAttractionMutation } =
  AttractionBusinessApi;
export { AttractionBusinessApi };
