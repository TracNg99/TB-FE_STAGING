import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQuery } from '../baseQuery';
import { ExperienceDetails } from '../user/experience';

export interface Experience {
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
  primary_video_id?: string | null;
  parent_experience?: string | null; // Use null for optional fields
  owned_by?: string;
  default_questions?: string[];
}

interface ExperienceResponse {
  data: Experience;
  error?: string;
}

interface ExperiencesResponse {
  data: Experience[];
  error?: string;
}

export type ExperienceReq = Omit<
  Experience,
  'id' | 'created_at' | 'updated_at' | 'created_by'
>;

export interface createDesDetailsReq {
  experience_id: string;
  type: string;
  name: string;
  text: string;
  media?: string;
  media_id?: string;
}

const ExperienceBusinessApi = createApi({
  reducerPath: 'createExperience',
  baseQuery,
  endpoints: (builder) => ({
    createExperience: builder.mutation<ExperienceResponse, ExperienceReq>({
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
        parent_experience,
      }) => ({
        url: `/experiences`,
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
          parent_experience,
        },
      }),
    }),
    updateExperience: builder.mutation<
      ExperienceResponse,
      { id: string; data: any }
    >({
      query: ({ id, data }) => ({
        url: `/experiences`,
        params: { 'experience-id': id },
        method: 'PUT',
        body: data,
      }),
    }),
    createExperienceDetails: builder.mutation<any, createDesDetailsReq>({
      query: ({ experience_id, type, name, text, media, media_id }) => ({
        url: `/experiences/details`,
        method: 'POST',
        body: {
          experience_id,
          type,
          name,
          text,
          media,
          media_id,
        },
      }),
    }),
    updateExperienceDetails: builder.mutation<
      ExperienceDetails,
      { dd_id: string; data: { text?: string; name?: string } }
    >({
      query: ({ dd_id, data }) => ({
        url: `/experiences/details`,
        params: { dd_id },
        method: 'PUT',
        body: data,
      }),
      // transformResponse: ((res: ExperienceDetailsRes) => res.data)
    }),
    deleteExperienceDetails: builder.mutation<any, any>({
      query: ({ dd_id }) => ({
        url: `/experiences/details`,
        method: 'DELETE',
        params: { dd_id },
      }),
    }),
    getAllExperiencesBusiness: builder.query<Experience[], void>({
      query: () => ({
        url: `/experiences/business`,
      }),
      transformResponse: (res: ExperiencesResponse) => res.data,
    }),
  }),
});

export const {
  useCreateExperienceMutation,
  useUpdateExperienceMutation,
  useCreateExperienceDetailsMutation,
  useUpdateExperienceDetailsMutation,
  useDeleteExperienceDetailsMutation,
  useGetAllExperiencesBusinessQuery,
} = ExperienceBusinessApi;
export { ExperienceBusinessApi };
