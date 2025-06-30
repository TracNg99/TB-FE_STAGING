import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQuery } from '../baseQuery';
import { Location } from '../user/experience';

interface GetLocationResponse {
  data: Location[];
  error?: string;
}

const LocationUserApi = createApi({
  reducerPath: 'getLocation',
  baseQuery,
  endpoints: (builder) => ({
    getLocationsInExperience: builder.query<
      GetLocationResponse,
      { experience_id: string }
    >({
      query: ({ experience_id }) => ({
        url: `/experiences/public/locations`,
        params: { 'experience-id': experience_id },
        method: 'GET',
      }),
    }),
  }),
});

export const { useGetLocationsInExperienceQuery } = LocationUserApi;
export { LocationUserApi };
