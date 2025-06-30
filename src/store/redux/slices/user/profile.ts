import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQuery } from '../baseQuery';
import { BusinessProfile } from '../business/profile';

// Define TypeScript interfaces for the request and response data
interface ProfileReq {
  username?: string;
  businessname?: string;
  email?: string;
  firstname?: string;
  lastname?: string;
  facebook?: string;
  instagram?: string;
  x?: string;
  phone?: string;
  references?: string;
  description?: string;
  avatarUrl?: string;
}

export interface Profile {
  userid: string;
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  preferences: string;
  facebook: string;
  instagram: string;
  x: string;
  phone: string;
  createdAt: string;
  avatar_id: string;
  media_assets: {
    url: string;
  };
}

interface ProfileRes {
  data: Profile & BusinessProfile;
  error?: string;
}

const UserProfileApi = createApi({
  reducerPath: 'userprofile',
  baseQuery,
  endpoints: (builder) => ({
    getProfile: builder.query<ProfileRes, void>({
      query: () => ({
        url: `/profile`,
        params: { role: 'user' },
      }),
    }),

    updateProfile: builder.mutation<ProfileRes, ProfileReq>({
      query: (payload) => ({
        url: `/profile`,
        params: { role: 'user' },
        method: 'PUT',
        body: payload,
      }),
    }),

    updateAvatar: builder.mutation<ProfileRes, ProfileReq>({
      query: ({ avatarUrl }) => ({
        url: `/profile/avatar`,
        params: { role: 'user' },
        method: 'PUT',
        body: { 'avatar-url': avatarUrl },
      }),
    }),

    getProfileAlt: builder.query<ProfileRes, { role: string }>({
      query: ({ role }) => ({
        url: `/profile`,
        params: { role: role },
      }),
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUpdateAvatarMutation,
  useGetProfileAltQuery,
} = UserProfileApi;
export { UserProfileApi };
