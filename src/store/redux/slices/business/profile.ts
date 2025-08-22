import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQuery } from '../baseQuery';
import { CompanyProps } from './company';

// Define a type for business profiles
export interface BusinessProfile {
  businessid: string;
  businessname: string;
  username?: string;
  email?: string;
  phone?: string;
  description?: string;
  references?: string;
  facebook?: string;
  instagram?: string;
  x?: string;
  type: string;
  avatar_id: string;
  media_assets: {
    url: string;
  };
  created?: string;
  companies?: CompanyProps[];
  company_members?: {
    id: string;
    role: string;
    company_accounts: CompanyProps[];
  }[];
}

interface ProfileReq {
  businessname?: string;
  email?: string;
  facebook?: string;
  instagram?: string;
  x?: string;
  phone?: string;
  description?: string;
  type?: string;
}

interface ProfileRes {
  email?: string | null;
  firstname?: string | null;
  id?: string;
  lastname?: string | null;
  preferences?: string | null;
  role?: string | null;
  travelhistory?: string | null;
  username?: string | null;
  [key: string]: any; // Allow additional properties
}

const BusinessProfileApi = createApi({
  reducerPath: 'businessprofile',
  baseQuery,
  endpoints: (builder) => ({
    getAllBusinessProfiles: builder.query<BusinessProfile[], void>({
      query: () => ({
        url: `/profile/business`,
      }),
      transformResponse: (response: { data: BusinessProfile[] }) =>
        response.data,
    }),
    getBusinessProfile: builder.query<ProfileRes, void>({
      query: () => ({
        url: `/profile`,
        params: { role: 'business' },
      }),
      transformResponse: (response: { data: BusinessProfile[] }) =>
        response.data,
    }),
    getCurrentBusinessProfile: builder.query<BusinessProfile, void>({
      query: () => ({
        url: `/profile/business`,
        params: { user_id: '' },
      }),
      transformResponse: (response: { data: BusinessProfile }) => response.data,
    }),
    updateBusinessProfile: builder.mutation<ProfileRes, ProfileReq>({
      query: (payload) => ({
        url: `/profile`,
        params: { role: 'business' },
        method: 'PUT',
        body: payload,
      }),
      transformResponse: (response: { data: BusinessProfile[] }) =>
        response.data,
    }),
  }),
});

export const {
  useGetBusinessProfileQuery,
  useGetAllBusinessProfilesQuery,
  useGetCurrentBusinessProfileQuery,
  useUpdateBusinessProfileMutation,
} = BusinessProfileApi;
export { BusinessProfileApi };
