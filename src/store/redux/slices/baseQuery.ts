import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseQuery = fetchBaseQuery({
  baseUrl:
    // process.env.NODE_ENV === 'development'
    // ? 'http://localhost:3001/api/v1':
    'https://fork-travel-buddy.vercel.app/api/v1', // Base URL for all API routes
  prepareHeaders: (headers) => {
    // Add custom headers if needed, like Authorization
    const token = localStorage?.getItem('jwt') || '';
    headers.set('Content-Type', 'application/json');
    headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

export const baseQueryMultipart = fetchBaseQuery({
  baseUrl:
    // process.env.NODE_ENV === 'development'
    //   ? 'http://localhost:3001/api/v1':
    'https://fork-travel-buddy.vercel.app/api/v1', // Base URL for all API routes
  prepareHeaders: (headers) => {
    // Add custom headers if needed, like Authorization
    const token = localStorage?.getItem('jwt') || '';
    headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

export const baseQueryAgent = fetchBaseQuery({
  baseUrl:
    // process.env.NODE_ENV === 'development'
    // ? 'http://localhost:8080/api/v1':
    'https://travelbuddy-agents-server-797173526974.us-central1.run.app/api/v1', // Base URL for all API routes
  prepareHeaders: (headers) => {
    // Add custom headers if needed, like Authorization
    const token = localStorage?.getItem('jwt');
    // headers.set('Content-Type', 'application/json');
    headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

export const baseUrl =
  process.env.NODE_ENV !== 'production'
    ? process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : process.env.NEXT_PUBLIC_STAGING_URL
    : process.env.NEXT_PUBLIC_BASE_URL;

export const agentServerUrl =
  // process.env.NODE_ENV === 'development'
  // ? 'http://localhost:8080/api/v1':
  'https://travelbuddy-agents-server-797173526974.us-central1.run.app/api/v1';
