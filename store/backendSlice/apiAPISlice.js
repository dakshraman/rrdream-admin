import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "./authReducer";

const normalizeBaseUrl = (url) => (url.endsWith("/") ? url : `${url}/`);

const configuredPublicApiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;

// Server-side calls should use the direct API URL.
const serverApiBaseUrl =
  configuredPublicApiBaseUrl ||
  process.env.API_URL ||
  "https://game.rrdream.in/api/";

// Browser calls prefer direct public API URL (if configured); otherwise fallback to /api rewrite.
const browserApiBaseUrl = configuredPublicApiBaseUrl || "/api/";

const apiBaseUrl = normalizeBaseUrl(
  typeof window === "undefined" ? serverApiBaseUrl : browserApiBaseUrl,
);

const normalizeUsersResponse = (response) => {
  if (Array.isArray(response)) {
    return { users: response };
  }

  if (response && typeof response === "object") {
    if (Array.isArray(response.users)) {
      return response;
    }

    if (Array.isArray(response.data?.users)) {
      return { ...response, users: response.data.users };
    }

    if (Array.isArray(response.data)) {
      return { ...response, users: response.data };
    }

    return { ...response, users: [] };
  }

  return { users: [] };
};

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const withNoStoreForGet = (args, method) => {
  if (typeof args === "string" || method !== "GET") {
    return args;
  }

  return {
    ...args,
    cache: "no-store",
  };
};

const withRetryBustParam = (args) => {
  const retryKey = `_rt=${Date.now()}`;

  if (typeof args === "string") {
    const separator = args.includes("?") ? "&" : "?";
    return `${args}${separator}${retryKey}`;
  }

  const params = isPlainObject(args.params) ? args.params : {};
  return {
    ...args,
    cache: "no-store",
    params: {
      ...params,
      _rt: Date.now(),
    },
  };
};

const isUnauthorizedError = (status) =>
  status === 401 || status === 403 || status === 422;

const baseQuery = fetchBaseQuery({
  baseUrl: apiBaseUrl,
  // Keep cookies only for same-origin calls; avoid cross-origin credential mode.
  credentials: "same-origin",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth?.token;
    headers.set("Accept", "application/json");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithLogging = async (args, api, extraOptions) => {
  const endpoint = typeof args === "string" ? args : args.url;
  const method = (typeof args === "string" ? "GET" : args.method || "GET").toUpperCase();
  const requestArgs = withNoStoreForGet(args, method);
  console.log(
    `%c[API Request] ${method} ${apiBaseUrl}${endpoint}`,
    "color: #00bcd4; font-weight: bold;",
  );

  let result = await baseQuery(requestArgs, api, extraOptions);
  let retriedForEmpty = false;

  const initialStatus = result.meta?.response?.status;
  const shouldRetryEmptyResponse =
    method === "GET" && !result.error && initialStatus === 200 && result.data === null;

  if (shouldRetryEmptyResponse) {
    retriedForEmpty = true;
    console.log(
      `%c[API Retry Empty] ${endpoint} (status: ${initialStatus})`,
      "color: #ff9800; font-weight: bold;",
    );
    result = await baseQuery(withRetryBustParam(requestArgs), api, extraOptions);
  }

  if (result.error) {
    console.log(
      `%c[API Error] ${endpoint}${retriedForEmpty ? " (after retry)" : ""}`,
      "color: #f44336; font-weight: bold;",
      result.error,
    );
  } else {
    const status = result.meta?.response?.status;
    if (result.data === null) {
      console.log(
        `%c[API Success Empty] ${endpoint} (status: ${status ?? "unknown"})${retriedForEmpty ? " after retry" : ""}`,
        "color: #ff9800; font-weight: bold;",
        result.data,
      );
    } else {
      console.log(
        `%c[API Success] ${endpoint} (status: ${status ?? "unknown"})${retriedForEmpty ? " after retry" : ""}`,
        "color: #4caf50; font-weight: bold;",
        result.data,
      );
    }
  }

  const errorStatus = result.error?.status;
  const hasTokenInState = Boolean(api.getState()?.auth?.token);
  const shouldForceLogout =
    hasTokenInState &&
    api.endpoint !== "login" &&
    isUnauthorizedError(errorStatus);

  if (shouldForceLogout) {
    console.warn(
      `[Auth] Session invalid for endpoint "${api.endpoint}". Logging out.`,
    );
    api.dispatch(logout());
    api.dispatch(apiAPISlice.util.resetApiState());

    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.replace("/login");
    }
  }

  return result;
};

export const apiAPISlice = createApi({
  reducerPath: "apiAPISlice",
  baseQuery: baseQueryWithLogging,
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
    "Inquiries",
    "StarlineGames",
    "StarlineGames",
    "StarlineRates",
  ],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body) => ({
        url: "admin-login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Admin"],
    }),
    checkLogin: builder.query({
      query: () => ({
        url: "getadmin",
        method: "GET",
      }),
      providesTags: ["Admin"],
    }),
    getUsers: builder.query({
      query: () => ({
        url: "getallusers",
        method: "GET",
      }),
      transformResponse: normalizeUsersResponse,
      providesTags: ["Users"],
    }),
    getInactiveUsers: builder.query({
      query: () => ({
        url: "get-inactiveusers",
        method: "GET",
      }),
      transformResponse: normalizeUsersResponse,
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
        Object.keys(rest).forEach((key) => {
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
        Object.keys(rest).forEach((key) => {
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
        Object.keys(rest).forEach((key) => {
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
        Object.keys(rest).forEach((key) => {
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
        Object.keys(arg).forEach((key) => {
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
    updateGameSchedule: builder.mutation({
      query: ({ id, open_time, close_time }) => ({
        url: `game-schedules/${id}`,
        method: "PUT",
        params: { open_time, close_time },
      }),
      invalidatesTags: ["Games"],
    }),
    toggleScheduleStatus: builder.mutation({
      query: (schedule_id) => {
        const formData = new FormData();
        formData.append("schedule_id", schedule_id);
        return {
          url: "toggleschedulestatus",
          method: "POST",
          body: formData,
          formData: true,
        };
      },
      invalidatesTags: ["Games"],
      async onQueryStarted(schedule_id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          apiAPISlice.util.updateQueryData(
            "getGameSchedules",
            undefined,
            (draft) => {
              if (draft?.data) {
                // Find all games and their schedules
                draft.data.forEach((game) => {
                  if (game.schedule) {
                    Object.values(game.schedule).forEach((daySchedules) => {
                      daySchedules.forEach((schedule) => {
                        if (schedule.schedule_id === schedule_id) {
                          // Toggle the status optimistically
                          schedule.status =
                            schedule.status === "Active"
                              ? "Inactive"
                              : "Active";
                        }
                      });
                    });
                  }
                });
              }
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
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
          let value = params[key];
          if (key === "user_status") {
            if (value === true || value === 1 || value === "1" || value === "true") {
              value = 1;
            } else if (
              value === false ||
              value === 0 ||
              value === "0" ||
              value === "false"
            ) {
              value = 0;
            }
          }
          if (
            value !== undefined &&
            value !== null &&
            value !== ""
          ) {
            queryParams[key] = value;
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
    // GET /api/starline-allgames  →  fetch all starline games
    getStarlineGames: builder.query({
      query: () => ({ url: "starline-allgames", method: "GET" }),
      providesTags: ["StarlineGames"],
    }),
    addStarlineGame: builder.mutation({
      query: ({ name, name_hindi, time }) => {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("name_hindi", name_hindi);
        formData.append("time", time);
        return { url: "starline-addgame", method: "POST", body: formData };
      },
      invalidatesTags: ["StarlineGames"],
    }),
    updateStarlineGame: builder.mutation({
      query: ({ id, name, name_hindi, time }) => {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("name_hindi", name_hindi);
        formData.append("time", time);
        return {
          url: `starline-updategame/${id}`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["StarlineGames"],
    }),
    toggleStarlineGame: builder.mutation({
      query: (id) => ({
        url: `starline-tooglestatus/${id}`,
        method: "POST",
      }),
      invalidatesTags: ["StarlineGames"],
    }),
    getStarlineRates: builder.query({
      query: () => ({ url: "starline-rates", method: "GET" }),
      providesTags: ["StarlineRates"],
    }),
    updateStarlineRate: builder.mutation({
      query: ({ id, rate, base }) => {
        const formData = new FormData();
        formData.append("id", id);
        formData.append("rate", rate);
        formData.append("base", base);
        return { url: "updaterates-starline", method: "POST", body: formData };
      },
      invalidatesTags: ["StarlineRates"],
    }),
    starlineDeclareResult: builder.mutation({
      query: ({ result_date, game_id, pana, digit }) => {
        const formData = new FormData();
        formData.append("result_date", result_date);
        formData.append("game_id", game_id);
        formData.append("pana", pana);
        formData.append("digit", digit);
        return {
          url: "starline-declareresult",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["DeclaredResultsStarline"],
    }),
    starlineCheckWinner: builder.mutation({
      query: ({ result_date, game_id, pana, digit }) => ({
        url: "starline-checkwinner",
        method: "POST",
        params: { result_date, game_id, pana, digit },
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
  useUpdateGameScheduleMutation,
  useToggleScheduleStatusMutation,
  useDeclareResultMutation,
  useGetConfigQuery,
  useUpdateConfigMutation,
  useUpdateWithdrawStatusMutation,
  useGetTransactionsMutation,
  useGetInquiryUsersQuery,
  useGetUserInquiriesQuery,
  useCheckWinnerMutation,
  useLoginMutation,
  useCheckLoginQuery,
  // Starline Game Name
  useGetStarlineGamesQuery,
  useAddStarlineGameMutation,
  useUpdateStarlineGameMutation,
  useToggleStarlineGameMutation,
  useGetStarlineRatesQuery,
  useUpdateStarlineRateMutation,
  useStarlineDeclareResultMutation,
  useStarlineCheckWinnerMutation,
} = apiAPISlice;
