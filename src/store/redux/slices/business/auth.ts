import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQuery } from '../baseQuery';
import { BusinessProfile } from './profile';

// TypeScript interfaces
interface AuthReq {
  businessName?: string;
  email: string;
  phone?: string;
  password: string;
}

interface AuthRes {
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
  userId?: string;
  error?: any;
}

const BusinessAuthApi = createApi({
  reducerPath: 'businessauth',
  baseQuery,
  endpoints: (builder) => ({
    signUp: builder.mutation<AuthRes, AuthReq>({
      query: (body) => ({
        url: '/auth/business/sign-up',
        method: 'POST',
        body,
      }),
    }),

    logIn: builder.mutation<AuthRes, AuthReq>({
      query: (body) => ({
        url: '/auth/business/login',
        method: 'POST',
        body,
      }),
    }),

    fetchUserAfterOAuth: builder.query<
      {
        access_token: string;
        userId: string;
        user: BusinessProfile;
      },
      {
        accessToken: string;
        refreshToken: string;
      }
    >({
      query: ({ accessToken, refreshToken }) => ({
        url: `/auth/business/callback`,
        params: { access_token: accessToken, refresh_token: refreshToken },
      }),
    }),
  }),
});

export const {
  useSignUpMutation,
  useLogInMutation,
  useFetchUserAfterOAuthQuery,
} = BusinessAuthApi;
export { BusinessAuthApi };
