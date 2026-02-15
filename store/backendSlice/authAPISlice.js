import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";

export const authAPISlice = createApi({
  reducerPath: "authAPISlice",
  baseQuery: retry(
    fetchBaseQuery({
      baseUrl: "/api",
      credentials: "include",
      prepareHeaders: (headers) => {
        headers.set("Content-Type", "application/json");
        return headers;
      },
    }),
    { maxRetries: 3 }
  ),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body) => ({
        url: "admin-login",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useLoginMutation } = authAPISlice;