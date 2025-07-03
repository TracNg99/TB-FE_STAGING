import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQuery, baseUrl } from '../baseQuery';

interface AuthReq {
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  password: string;
}

interface AuthRes {
  message?: string;
  access_token?: string;
  userId?: string;
  error?: string;
}

const UserAuthApi = createApi({
  reducerPath: 'userauth',
  baseQuery, // Use the reusable baseQuery
  endpoints: (builder) => ({
    authWithGoogle: builder.mutation<any, void>({
      query: () => ({
        url: '/auth/oauth',
        method: 'POST',
        body: {
          provider: 'google',
          redirectLink: `${baseUrl}/auth/callbackv1`,
        },
      }),
    }),

    authWithX: builder.mutation<any, void>({
      query: () => ({
        url: '/auth/oauth',
        method: 'POST',
        body: {
          provider: 'twitter',
          redirectLink: `${baseUrl}/auth/callbackv1`,
        },
      }),
    }),

    fetchUserAfterOAuth: builder.query({
      query: ({ accessToken, refreshToken }) => ({
        url: `/auth/callback`,
        params: { access_token: accessToken, refresh_token: refreshToken },
      }),
    }),

    authWithFacebook: builder.mutation<any, void>({
      query: () => ({
        url: '/auth/oauth',
        method: 'POST',
        body: { provider: 'facebook', redirectLink: baseUrl },
      }),
    }),

    signUp: builder.mutation<AuthRes, AuthReq>({
      query: (body) => ({
        url: '/auth/sign-up',
        method: 'POST',
        body,
      }),
    }),

    logIn: builder.mutation<AuthRes, AuthReq>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
    }),

    logOut: builder.mutation<AuthRes, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useFetchUserAfterOAuthQuery,
  useSignUpMutation,
  useLogInMutation,
  useLogOutMutation,
  useAuthWithFacebookMutation,
  useAuthWithGoogleMutation,
  useAuthWithXMutation,
} = UserAuthApi;

export { UserAuthApi };
