import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQuery, baseQueryAgent, baseQueryMultipart } from '../baseQuery';

interface ImageReq {
  imageBase64: string | null;
  title: string;
  bucket: string;
}

interface CloudRunSupabaseStorageReq {
  media: {
    mimeType: string;
    body: string;
  };
  bucket_name: string;
}

interface CloudRunSupabaseStorageRes {
  url: string;
  path: string;
  id: string;
}

interface VideoReq {
  videoBase64: string | null;
  title: string;
  bucket: string;
}

interface ImagesReq {
  imagesBase64: string[] | null;
  title: string;
  bucket: string;
}

interface UploadRes {
  signedUrl?: string;
  error?: any;
}

interface UploadResMultiple {
  signedUrls?: string[];
  error?: any;
}

const StorageApi = createApi({
  reducerPath: 'storage',
  baseQuery,
  endpoints: (builder) => ({
    uploadImage: builder.mutation<UploadRes, ImageReq>({
      query: (params) => ({
        url: `/storage/upload-image`,
        method: 'POST',
        body: params,
      }),
    }),
    uploadVideo: builder.mutation<UploadRes, VideoReq>({
      query: (params) => ({
        url: `/storage/upload-video`,
        method: 'POST',
        body: params,
      }),
    }),
    uploadImages: builder.mutation<UploadResMultiple, ImagesReq>({
      query: (params) => ({
        url: `/storage/upload-images`,
        method: 'POST',
        body: params,
      }),
    }),
    initResumable: builder.mutation<
      { uploadId?: string; error?: any },
      { fileName: string; totalParts: number }
    >({
      query: (params) => ({
        url: `/storage/upload-image/initialize`,
        method: 'POST',
        body: params,
      }),
    }),
    createMediaAsset: builder.mutation<any, any>({
      query: (params) => ({
        url: `/media-assets`,
        method: 'POST',
        body: params,
      }),
    }),
  }),
});

const MultipartApi = createApi({
  reducerPath: 'multipart',
  baseQuery: baseQueryMultipart,
  endpoints: (builder) => ({
    uploadResumable: builder.mutation<
      {
        message?: string;
        fileName?: string;
        storageUrl?: string;
        error?: any;
        details?: any;
      },
      FormData
    >({
      query: (params) => ({
        url: `/storage/upload-image/resumable`,
        method: 'POST',
        body: params,
      }),
    }),
  }),
});

const StorageCloudRunApi = createApi({
  reducerPath: 'storageCloudRun',
  baseQuery: baseQueryAgent,
  endpoints: (builder) => ({
    uploadImageCloudRun: builder.mutation<
      CloudRunSupabaseStorageRes,
      CloudRunSupabaseStorageReq
    >({
      query: (params) => ({
        url: `/supabase/storage/upload`,
        method: 'POST',
        body: params,
      }),
      transformResponse: (res: { data: CloudRunSupabaseStorageRes }) =>
        res.data,
    }),

    deleteMediaAsset: builder.mutation<
      {
        message?: string;
        detail?: any;
      },
      {
        bucket_name: string;
        media_query_values: string[];
        query_type?: 'url' | 'id';
      }
    >({
      query: (params) => ({
        url: `/supabase/storage/delete`,
        method: 'POST',
        body: params,
      }),
      transformResponse: (res: { data: { message: string } }) => res.data,
    }),
  }),
});

export const {
  useUploadImageMutation,
  useUploadVideoMutation,
  useUploadImagesMutation,
  useCreateMediaAssetMutation,
  useInitResumableMutation,
} = StorageApi;

export const { useUploadResumableMutation } = MultipartApi;

export const { useUploadImageCloudRunMutation, useDeleteMediaAssetMutation } =
  StorageCloudRunApi;

export { StorageApi, MultipartApi, StorageCloudRunApi };
