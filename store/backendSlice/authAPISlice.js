import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authAPISlice = createApi({
  reducerPath: "authAPISlice",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    credentials: "include",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
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