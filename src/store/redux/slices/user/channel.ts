import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQuery } from '../baseQuery';

interface ChannelReq {
  channelId?: string;
  payload?: {
    name?: string;
    channel_type?: string;
    url?: string;
    brand_voice?: string;
  };
}

export interface ChannelProps {
  id?: string;
  user_id?: string;
  name?: string;
  channel_type?: string;
  url?: string;
  brand_voice?: string;
  created_at?: string;
  updated_at?: string;
}

interface ChannelRes {
  data?: ChannelProps[];
  error?: any;
}

interface ChannelSingleRes {
  data?: ChannelProps;
  error?: any;
}

const ChannelApi = createApi({
  reducerPath: 'channel',
  baseQuery,
  endpoints: (builder) => ({
    createChannel: builder.mutation<ChannelSingleRes, ChannelReq>({
      query: ({ payload }) => ({
        url: `/channel`,
        method: 'POST',
        body: payload,
      }),
    }),

    getChannel: builder.query<ChannelSingleRes, ChannelReq>({
      query: ({ channelId }) => ({
        url: `/channel`,
        method: 'GET',
        params: { 'channel-id': channelId },
      }),
    }),

    getAllChannels: builder.query<ChannelRes, void>({
      query: () => ({
        url: `/channel`,
      }),
    }),
    //--------------------UPDATE A STORY-------------------
    updateChannel: builder.mutation<ChannelSingleRes, ChannelReq>({
      query: ({ channelId, payload }) => ({
        url: `/channel`,
        params: { 'channel-id': channelId },
        method: 'PUT',
        body: payload,
      }),
    }),
    //--------------------DELETE A STORY-------------------
    deleteChannel: builder.mutation<ChannelSingleRes, ChannelReq>({
      query: ({ channelId }) => ({
        url: `/channel`,
        params: { 'channel-id': channelId },
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useCreateChannelMutation,
  useGetChannelQuery,
  useGetAllChannelsQuery,
  useUpdateChannelMutation,
  useDeleteChannelMutation,
} = ChannelApi;

export { ChannelApi };
