import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiAPISlice = createApi({
  reducerPath: "apiAPISlice",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://game.milankalyan.org/api",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token;
      console.log("Token being sent:", token);
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: [
    "Users",
    "InactiveUsers",
    "Banners",
    "Admin",
    "WithdrawRequest",
    "FundRequest",
    "BiddingHistory",
    "BiddingHistoryStarline",
    "DeclaredResultsStarline",
    "BiddingHistoryGali",
    "Profit",
    "User",
  ],
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => ({
        url: "getallusers",
        method: "GET",
      }),
      providesTags: ["Users"],
    }),
    getInactiveUsers: builder.query({
      query: () => ({
        url: "get-inactiveusers",
        method: "GET",
      }),
      providesTags: ["InactiveUsers"],
    }),
    getBanners: builder.query({
      query: () => ({
        url: "banner",
        method: "GET",
      }),
      providesTags: ["Banners"],
    }),
    addBanner: builder.mutation({
      query: (formData) => ({
        url: "addbanner",
        method: "POST",
        body: formData,
        formData: true,
      }),
      invalidatesTags: ["Banners"],
    }),
    deleteBanner: builder.mutation({
      query: (id) => ({
        url: `banner/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Banners"],
    }),
    getAdmin: builder.query({
      query: () => ({
        url: "getadmin",
        method: "GET",
      }),
      providesTags: ["Admin"],
    }),
    getWithdrawRequests: builder.query({
      query: () => ({
        url: "withdraw-requests",
        method: "GET",
      }),
      providesTags: ["WithdrawRequest"],
    }),
    getFundRequests: builder.query({
      query: () => ({
        url: "getfundrequests",
        method: "GET",
      }),
      providesTags: ["FundRequest"],
    }),
    getBiddingHistory: builder.query({
      query: ({
        page = 1,
        date = "",
        game_name = "",
        game_type = "",
        session = "",
        search = "",
        per_page = 10,
      } = {}) => {
        const params = new URLSearchParams();
        params.append("page", page);
        if (date) params.append("date", date);
        if (game_name) params.append("game_name", game_name);
        if (game_type) params.append("game_type", game_type);
        if (session) params.append("session", session);
        if (search) params.append("search", search);
        params.append("per_page", per_page);

        return {
          url: `getbiddinghistory?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["BiddingHistory"],
    }),
    getBiddingHistoryStarline: builder.query({
      query: ({
        page = 1,
        date = "",
        game_name = "",
        game_type = "",
        search = "",
        per_page = 10,
      } = {}) => {
        const params = new URLSearchParams();
        params.append("page", page);
        if (date) params.append("date", date);
        if (game_name) params.append("game_name", game_name);
        if (game_type) params.append("game_type", game_type);
        if (search) params.append("search", search);
        params.append("per_page", per_page);

        return {
          url: `getbiddinghistory-starline?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["BiddingHistoryStarline"],
    }),
    getDeclaredResultsStarline: builder.query({
      query: ({
        page = 1,
        date = "",
        game_name = "",
        game_type = "",
        session = "",
        search = "",
        per_page = 10,
      } = {}) => {
        const params = new URLSearchParams();
        params.append("page", page);
        if (date) params.append("date", date);
        if (game_name) params.append("game_name", game_name);
        if (game_type) params.append("game_type", game_type);
        if (session) params.append("session", session);
        if (search) params.append("search", search);
        params.append("per_page", per_page);

        return {
          url: `getdeclaredresults-starline?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["DeclaredResultsStarline"],
    }),
    getBiddingHistoryGali: builder.query({
      query: ({
        page = 1,
        date = "",
        game_name = "",
        search = "",
        per_page = 15,
      } = {}) => {
        const params = new URLSearchParams();
        params.append("page", page);
        if (date) params.append("date", date);
        if (game_name) params.append("game_name", game_name);
        if (search) params.append("search", search);
        params.append("per_page", per_page);

        return {
          url: `getbiddinghistory-gali?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["BiddingHistoryGali"],
    }),
    getProfit: builder.query({
      query: ({
        page,
        date,
        game_name,
        game_type,
        session,
        search,
        per_page,
      } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append("page", page);
        if (date) params.append("date", date);
        if (game_name) params.append("game_name", game_name);
        if (game_type) params.append("game_type", game_type);
        if (session) params.append("session", session);
        if (search) params.append("search", search);
        if (per_page) params.append("per_page", per_page);

        return {
          url: `getprofit?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Profit"],
    }),
    getUserById: builder.query({
      query: (id) => ({
        url: `user/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetInactiveUsersQuery,
  useGetBannersQuery,
  useAddBannerMutation,
  useDeleteBannerMutation,
  useGetAdminQuery,
  useGetWithdrawRequestsQuery,
  useGetFundRequestsQuery,
  useGetBiddingHistoryQuery,
  useGetBiddingHistoryStarlineQuery,
  useGetDeclaredResultsStarlineQuery,
  useGetBiddingHistoryGaliQuery,
  useGetProfitQuery,
  useGetUserByIdQuery,
} = apiAPISlice;
