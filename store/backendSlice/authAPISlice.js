import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export const authAPISlice = createApi({
  reducerPath: "authAPISlice",
  baseQuery: baseQuery,
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