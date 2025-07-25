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

    forgotPassword: builder.mutation<AuthRes, { email: string }>({
      query: ({ email }) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: {
          email,
          redirect_url: `${baseUrl}/auth/reset-password`,
        },
      }),
    }),

    verifyOTP: builder.mutation<AuthRes, { email: string; token: string }>({
      query: (body) => ({
        url: '/auth/otp-verification',
        method: 'POST',
        body,
      }),
    }),

    resetPassword: builder.mutation<AuthRes, { password: string }>({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
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
  useForgotPasswordMutation,
  useVerifyOTPMutation,
  useResetPasswordMutation,
} = UserAuthApi;

export { UserAuthApi };
