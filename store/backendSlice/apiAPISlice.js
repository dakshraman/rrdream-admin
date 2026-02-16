import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export const apiAPISlice = createApi({
  reducerPath: "apiAPISlice",
  baseQuery: baseQuery,
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
    "Inquiries"
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
      query: (arg = {}) => {
        const { page = 1, per_page = 10, ...rest } = arg;
        // Filter out empty values to match original logic
        const params = { page, per_page };
        Object.keys(rest).forEach(key => {
            if (rest[key]) params[key] = rest[key];
        });

        return {
          url: "getbiddinghistory",
          method: "GET",
          params,
        };
      },
      providesTags: ["BiddingHistory"],
    }),
    getBiddingHistoryStarline: builder.query({
      query: (arg = {}) => {
        const { page = 1, per_page = 10, ...rest } = arg;
        const params = { page, per_page };
        Object.keys(rest).forEach(key => {
            if (rest[key]) params[key] = rest[key];
        });

        return {
          url: "getbiddinghistory-starline",
          method: "GET",
          params,
        };
      },
      providesTags: ["BiddingHistoryStarline"],
    }),
    getDeclaredResultsStarline: builder.query({
      query: (arg = {}) => {
        const { page = 1, per_page = 10, ...rest } = arg;
        const params = { page, per_page };
        Object.keys(rest).forEach(key => {
            if (rest[key]) params[key] = rest[key];
        });

        return {
          url: "getdeclaredresults-starline",
          method: "GET",
          params,
        };
      },
      providesTags: ["DeclaredResultsStarline"],
    }),
    getBiddingHistoryGali: builder.query({
      query: (arg = {}) => {
        const { page = 1, per_page = 15, ...rest } = arg;
        const params = { page, per_page };
        Object.keys(rest).forEach(key => {
            if (rest[key]) params[key] = rest[key];
        });

        return {
          url: "getbiddinghistory-gali",
          method: "GET",
          params,
        };
      },
      providesTags: ["BiddingHistoryGali"],
    }),
    getProfit: builder.query({
      query: (arg = {}) => {
        const params = {};
        Object.keys(arg).forEach(key => {
            if (arg[key]) params[key] = arg[key];
        });

        return {
          url: "getprofit",
          method: "GET",
          params,
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
        url: `declareresult`,
        method: "POST",
        params: { result_date, game_id, session, pana, digit },
      }),
      invalidatesTags: ["BiddingHistory", "DeclaredResults"],
    }),
    getGameSchedules: builder.query({
      query: () => ({
        url: "game-schedules",
        method: "GET",
      }),
      providesTags: ["Games"],
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
        const queryParams = {};
        Object.keys(params).forEach((key) => {
          if (
            params[key] !== undefined &&
            params[key] !== null &&
            params[key] !== ""
          ) {
            queryParams[key] = params[key];
          }
        });
        return {
          url: "config",
          method: "PUT",
          params: queryParams,
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
    getInquiryUsers: builder.query({
      query: () => ({
        url: "inquiry",
        method: "GET",
      }),
      providesTags: ["Inquiries"],
    }),
    getUserInquiries: builder.query({
      query: (userId) => ({
        url: `inquiry/message/${userId}`,
        method: "GET",
      }),
      providesTags: (result, error, userId) => [
        { type: "Inquiries", id: userId },
      ],
    }),
    checkWinner: builder.mutation({
      query: ({ result_date, game_id, session, pana, digit }) => ({
        url: "checkwinner",
        method: "POST",
        params: { result_date, game_id, session, pana, digit },
      }),
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
  useGetGameSchedulesQuery,
  useDeclareResultMutation,
  useGetConfigQuery,
  useUpdateConfigMutation,
  useUpdateWithdrawStatusMutation,
  useGetTransactionsMutation,
  useGetInquiryUsersQuery,
  useGetUserInquiriesQuery,
  useCheckWinnerMutation
} = apiAPISlice;
