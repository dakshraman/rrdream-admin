import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiAPISlice = createApi({
  reducerPath: "apiAPISlice",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token;
      console.log("Token being sent:", token);
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      // Don't set Content-Type for FormData - browser will set it automatically
      return headers;
    },
  }),
  tagTypes: [
    "Users",
    "InactiveUsers",
    "Banners",
    "Admin",
    "WithdrawRequest",
    "FundRequests",
    "BiddingHistory",
    "BiddingHistoryStarline",
    "DeclaredResultsStarline",
    "BiddingHistoryGali",
    "Profit",
    "User",
    "Games",
    "DeclaredResults",
    "Config",
    "WithdrawRequests",
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
      providesTags: ["FundRequests"],
    }),

    // APPROVE FUND - POST /api/approvefund/{id} with form-data
    approveFundRequest: builder.mutation({
      query: (id) => {
        const formData = new FormData();
        // Add empty form data or any required fields
        return {
          url: `approvefund/${id}`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["FundRequests", "Users"],
    }),

    // REJECT FUND - POST /api/rejectfund/{id} with form-data
    rejectFundRequest: builder.mutation({
      query: (id) => {
        const formData = new FormData();
        // Add empty form data or any required fields
        return {
          url: `rejectfund/${id}`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["FundRequests"],
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
    toggleUser: builder.mutation({
      query: (user_id) => ({
        url: "toggleuser",
        method: "POST",
        body: { user_id },
      }),
      invalidatesTags: ["Users", "InactiveUsers"],
    }),
    getGames: builder.query({
      query: () => ({
        url: "games",
        method: "GET",
      }),
      providesTags: ["Games"],
    }),
    declareResult: builder.mutation({
      query: ({ result_date, game_id, session, pana, digit }) => ({
        url: `declareresult?result_date=${result_date}&game_id=${game_id}&session=${session}&pana=${pana}&digit=${digit}`,
        method: "POST",
      }),
      invalidatesTags: ["BiddingHistory", "DeclaredResults"],
    }),
    getConfig: builder.query({
      query: () => ({
        url: "get-config",
        method: "GET",
      }),
      providesTags: ["Config"],
    }),
    updateConfig: builder.mutation({
      query: (params) => {
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach((key) => {
          if (
            params[key] !== undefined &&
            params[key] !== null &&
            params[key] !== ""
          ) {
            searchParams.append(key, params[key]);
          }
        });
        return {
          url: `config?${searchParams.toString()}`,
          method: "PUT",
        };
      },
      invalidatesTags: ["Config"],
    }),
    updateWithdrawStatus: builder.mutation({
      query: ({ id, status }) => {
        const formData = new FormData();
        formData.append("status", status);
        return {
          url: `withdraw-update/${id}`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["WithdrawRequests"],
    }),
    // TRANSACTIONS - POST /api/transactions (form-data)
    getTransactions: builder.mutation({
      query: ({ start_date, end_date }) => {
        const formData = new FormData();
        formData.append("start_date", start_date);
        formData.append("end_date", end_date);

        return {
          url: "transactions",
          method: "POST",
          body: formData,
        };
      },
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
  useApproveFundRequestMutation,
  useRejectFundRequestMutation,
  useGetBiddingHistoryQuery,
  useGetBiddingHistoryStarlineQuery,
  useGetDeclaredResultsStarlineQuery,
  useGetBiddingHistoryGaliQuery,
  useGetProfitQuery,
  useGetUserByIdQuery,
  useToggleUserMutation,
  useGetGamesQuery,
  useDeclareResultMutation,
  useGetConfigQuery,
  useUpdateConfigMutation,
  useUpdateWithdrawStatusMutation,
  useGetTransactionsMutation,
} = apiAPISlice;
