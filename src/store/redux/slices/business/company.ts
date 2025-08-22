import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQuery } from '../baseQuery';

export interface CompanyProps {
  id: string;
  name: string;
  description: string;
  created_at: string;
  members: string[];
  editors: string[];
  owned_by: string;
  role: string;
}

interface CompanyMemberReq {
  emails?: string[];
  role?: string;
  companyId?: string;
  memberId?: string;
  origin?: string;
}

interface CompanyMemberRes {
  data?: any;
  error?: any;
}

export const companyApi = createApi({
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    createCompanyMembers: builder.mutation<CompanyMemberRes, CompanyMemberReq>({
      query: ({ emails, origin }) => ({
        url: '/companies/members',
        method: 'POST',
        body: {
          companyId: process.env.NEXT_PUBLIC_VA_COMPANY_ID,
          emails,
          redirect_link: `${origin}/auth/login`,
        },
      }),
    }),

    updateMemberRole: builder.mutation<CompanyMemberRes, CompanyMemberReq>({
      query: ({ role, memberId }) => ({
        url: '/companies/members',
        method: 'PUT',
        body: {
          'company-id': process.env.NEXT_PUBLIC_VA_COMPANY_ID,
          role,
          'member-id': memberId,
        },
      }),
    }),

    getCompanyMembers: builder.query<CompanyMemberRes, void>({
      query: () => ({
        url: '/companies/members',
        params: { 'company-id': process.env.NEXT_PUBLIC_VA_COMPANY_ID },
      }),
    }),

    deleteCompanyMember: builder.mutation<CompanyMemberRes, CompanyMemberReq>({
      query: ({ memberId }) => ({
        url: '/companies/members',
        method: 'DELETE',
        body: {
          'company-id': process.env.NEXT_PUBLIC_VA_COMPANY_ID,
          'member-id': memberId,
        },
      }),
    }),
  }),
});

export const {
  useCreateCompanyMembersMutation,
  useGetCompanyMembersQuery,
  useUpdateMemberRoleMutation,
  useDeleteCompanyMemberMutation,
} = companyApi;
