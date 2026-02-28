"use client";

import { useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { backendStore } from "../backendStore";
import { logout } from "./authReducer";
import { getQueryClient, resetApiCache } from "../queryClient";

const normalizeBaseUrl = (url) => (url.endsWith("/") ? url : `${url}/`);

const configuredPublicApiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;

const serverApiBaseUrl =
  configuredPublicApiBaseUrl ||
  process.env.API_URL ||
  "https://game.rrdream.in/api/";

const browserApiBaseUrl = configuredPublicApiBaseUrl || "/api/";

const getApiBaseUrl = () =>
  normalizeBaseUrl(
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

const isUnauthorizedError = (status) => status === 401 || status === 403;

const appendParamsToUrl = (url, params) => {
  if (!isPlainObject(params) || Object.keys(params).length === 0) return url;

  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, String(item)));
      return;
    }
    query.append(key, String(value));
  });

  const queryString = query.toString();
  if (!queryString) return url;
  return `${url}${url.includes("?") ? "&" : "?"}${queryString}`;
};

const buildError = async (response) => {
  let data = null;
  const contentType = response.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text ? { message: text } : null;
    }
  } catch {
    data = null;
  }

  return {
    status: response.status,
    data,
    message: data?.message || response.statusText || "Request failed",
  };
};

const parseSuccess = async (response) => {
  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";
  if (!contentType) {
    const text = await response.text();
    return text ? text : null;
  }

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
};

const getToken = () => backendStore.getState()?.auth?.token;

const forceLogoutIfNeeded = (errorStatus, endpointName) => {
  const token = getToken();
  const shouldForceLogout =
    Boolean(token) &&
    endpointName !== "login" &&
    isUnauthorizedError(errorStatus);

  if (!shouldForceLogout) return;

  console.warn(
    `[Auth] Session invalid for endpoint "${endpointName}". Logging out.`,
  );
  backendStore.dispatch(logout());
  resetApiCache();

  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
};

const withRetryBustParam = (request) => ({
  ...request,
  url: appendParamsToUrl(request.url, { _rt: Date.now() }),
  cache: "no-store",
});

const normalizeRequest = (requestLike) => {
  if (typeof requestLike === "string") {
    return { url: requestLike, method: "GET" };
  }

  return {
    method: "GET",
    ...requestLike,
  };
};

const executeRequest = async (requestLike, { endpointName }) => {
  const request = normalizeRequest(requestLike);
  const method = (request.method || "GET").toUpperCase();
  const apiBaseUrl = getApiBaseUrl();

  const runOnce = async (nextRequest) => {
    const fullUrl = `${apiBaseUrl}${appendParamsToUrl(nextRequest.url, nextRequest.params)}`;
    const headers = new Headers(nextRequest.headers || {});
    headers.set("Accept", "application/json");

    const token = getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const fetchOptions = {
      method,
      headers,
      credentials: "same-origin",
      cache: method === "GET" ? "no-store" : nextRequest.cache,
    };

    if (nextRequest.body !== undefined) {
      if (
        typeof FormData !== "undefined" &&
        nextRequest.body instanceof FormData
      ) {
        fetchOptions.body = nextRequest.body;
      } else {
        headers.set("Content-Type", "application/json");
        fetchOptions.body = JSON.stringify(nextRequest.body);
      }
    }

    console.log(
      `%c[API Request] ${method} ${fullUrl}`,
      "color: #00bcd4; font-weight: bold;",
    );

    let response;
    try {
      response = await fetch(fullUrl, fetchOptions);
    } catch (networkError) {
      console.log(
        `%c[API Error] ${nextRequest.url}`,
        "color: #f44336; font-weight: bold;",
        networkError,
      );
      throw {
        status: "FETCH_ERROR",
        data: null,
        message: networkError?.message || "Network error",
      };
    }

    if (!response.ok) {
      const error = await buildError(response);
      console.log(
        `%c[API Error] ${nextRequest.url}`,
        "color: #f44336; font-weight: bold;",
        error,
      );
      forceLogoutIfNeeded(error.status, endpointName);
      throw error;
    }

    const data = await parseSuccess(response);
    console.log(
      `%c[API Success] ${nextRequest.url} (status: ${response.status})`,
      "color: #4caf50; font-weight: bold;",
      data,
    );

    return { data, status: response.status, request: nextRequest };
  };

  let result = await runOnce(request);
  const shouldRetryEmptyResponse =
    method === "GET" && result.status === 200 && result.data === null;

  if (shouldRetryEmptyResponse) {
    console.log(
      `%c[API Retry Empty] ${request.url} (status: ${result.status})`,
      "color: #ff9800; font-weight: bold;",
    );
    result = await runOnce(withRetryBustParam(request));
  }

  return result.data;
};

const normalizeQueryOptions = (options = {}) => {
  const {
    skip = false,
    pollingInterval,
    refetchOnMountOrArgChange,
    enabled,
  } = options;

  return {
    enabled: enabled ?? !skip,
    refetchInterval: pollingInterval || false,
    refetchOnMount:
      typeof refetchOnMountOrArgChange === "boolean"
        ? refetchOnMountOrArgChange
        : undefined,
  };
};

const toQueryState = (query, enabled) => ({
  data: query.data,
  error: query.error,
  isError: query.isError,
  isSuccess: query.isSuccess,
  isFetching: query.isFetching,
  isLoading: query.isLoading,
  isUninitialized: !enabled,
  refetch: query.refetch,
});

const toMutationState = (mutation) => ({
  data: mutation.data,
  error: mutation.error,
  isError: mutation.isError,
  isIdle: mutation.isIdle,
  isLoading: mutation.isPending,
  isSuccess: mutation.isSuccess,
  reset: mutation.reset,
});

const invalidateAllQueries = async () => {
  await getQueryClient().invalidateQueries();
};

const createQueryHook = ({
  endpointName,
  queryKey,
  request,
  transformResponse,
}) => {
  return function useCompatQuery(arg, options = {}) {
    const normalized = normalizeQueryOptions(options);
    const key = useMemo(
      () => [endpointName, queryKey ? queryKey(arg) : arg],
      [arg],
    );

    const query = useQuery({
      queryKey: key,
      queryFn: async () => {
        const data = await executeRequest(request(arg), { endpointName });
        return transformResponse ? transformResponse(data) : data;
      },
      enabled: normalized.enabled,
      refetchInterval: normalized.refetchInterval,
      refetchOnMount: normalized.refetchOnMount,
    });

    return toQueryState(query, normalized.enabled);
  };
};

const createMutationHook = ({ endpointName, request, onSuccess }) => {
  return function useCompatMutation() {
    const mutation = useMutation({
      mutationFn: async (arg) => executeRequest(request(arg), { endpointName }),
      onSuccess: async (data, variables) => {
        if (onSuccess) {
          await onSuccess(data, variables);
          return;
        }
        await invalidateAllQueries();
      },
    });

    const trigger = (arg) => {
      const promise = mutation.mutateAsync(arg);
      promise.unwrap = () => promise;
      return promise;
    };

    return [trigger, toMutationState(mutation)];
  };
};

const cleanTruthyParams = (arg = {}) => {
  const params = {};
  Object.keys(arg || {}).forEach((key) => {
    if (arg[key]) params[key] = arg[key];
  });
  return params;
};

const cleanNonEmptyParams = (arg = {}) => {
  const params = {};
  Object.keys(arg || {}).forEach((key) => {
    if (arg[key] !== undefined && arg[key] !== null && arg[key] !== "") {
      params[key] = arg[key];
    }
  });
  return params;
};

const queries = {
  checkLogin: {
    endpointName: "checkLogin",
    request: () => ({ url: "getadmin", method: "GET" }),
  },
  getUsers: {
    endpointName: "getUsers",
    request: () => ({ url: "getallusers", method: "GET" }),
    transformResponse: normalizeUsersResponse,
  },
  getInactiveUsers: {
    endpointName: "getInactiveUsers",
    request: () => ({ url: "get-inactiveusers", method: "GET" }),
    transformResponse: normalizeUsersResponse,
  },
  getBanners: {
    endpointName: "getBanners",
    request: () => ({ url: "banner", method: "GET" }),
  },
  getAdmin: {
    endpointName: "getAdmin",
    request: () => ({ url: "getadmin", method: "GET" }),
  },
  getWithdrawRequests: {
    endpointName: "getWithdrawRequests",
    request: () => ({ url: "withdraw-requests", method: "GET" }),
  },
  getFundRequests: {
    endpointName: "getFundRequests",
    request: () => ({ url: "getfundrequests", method: "GET" }),
  },
  getBiddingHistory: {
    endpointName: "getBiddingHistory",
    request: (arg = {}) => {
      const { page = 1, per_page = 10, ...rest } = arg || {};
      const params = { page, per_page };
      Object.keys(rest).forEach((key) => {
        if (rest[key]) params[key] = rest[key];
      });
      return { url: "getbiddinghistory", method: "GET", params };
    },
  },
  getBiddingHistoryStarline: {
    endpointName: "getBiddingHistoryStarline",
    request: () => ({ url: "starline-getbid", method: "GET" }),
  },
  getDeclaredResultsStarline: {
    endpointName: "getDeclaredResultsStarline",
    request: (arg = {}) => {
      const { page = 1, per_page = 10, ...rest } = arg || {};
      const params = { page, per_page };
      Object.keys(rest).forEach((key) => {
        if (rest[key]) params[key] = rest[key];
      });
      return { url: "getdeclaredresults-starline", method: "GET", params };
    },
  },
  getDeclaredResults: {
    endpointName: "getDeclaredResults",
    request: (arg = {}) => {
      const params = cleanNonEmptyParams(arg);
      return {
        url: "getdeclaredresults",
        method: "GET",
        ...(Object.keys(params).length ? { params } : {}),
      };
    },
  },
  getBiddingHistoryGali: {
    endpointName: "getBiddingHistoryGali",
    request: (arg = {}) => {
      const { page = 1, per_page = 15, ...rest } = arg || {};
      const params = { page, per_page };
      Object.keys(rest).forEach((key) => {
        if (rest[key]) params[key] = rest[key];
      });
      return { url: "getbiddinghistory-gali", method: "GET", params };
    },
  },
  getProfit: {
    endpointName: "getProfit",
    request: (arg = {}) => ({
      url: "getprofit",
      method: "GET",
      params: cleanTruthyParams(arg),
    }),
  },
  getUserById: {
    endpointName: "getUserById",
    request: (id) => ({ url: `user/${id}`, method: "GET" }),
  },
  getGames: {
    endpointName: "getGames",
    request: () => ({ url: "games", method: "GET" }),
  },
  getGameSchedules: {
    endpointName: "getGameSchedules",
    request: () => ({ url: "game-schedules", method: "GET" }),
  },
  getConfig: {
    endpointName: "getConfig",
    request: () => ({ url: "get-config", method: "GET" }),
  },
  getInquiryUsers: {
    endpointName: "getInquiryUsers",
    request: () => ({ url: "inquiry", method: "GET" }),
  },
  getUserInquiries: {
    endpointName: "getUserInquiries",
    request: (userId) => ({ url: `inquiry/message/${userId}`, method: "GET" }),
  },
  getStarlineGames: {
    endpointName: "getStarlineGames",
    request: () => ({ url: "starline-allgames", method: "GET" }),
  },
  getStarlineRates: {
    endpointName: "getStarlineRates",
    request: () => ({ url: "starline-rates", method: "GET" }),
  },
};

const mutations = {
  login: {
    endpointName: "login",
    request: (body) => ({ url: "admin-login", method: "POST", body }),
  },
  addBanner: {
    endpointName: "addBanner",
    request: (formData) => ({
      url: "addbanner",
      method: "POST",
      body: formData,
    }),
  },
  deleteBanner: {
    endpointName: "deleteBanner",
    request: (id) => ({ url: `banner/${id}`, method: "DELETE" }),
  },
  approveFundRequest: {
    endpointName: "approveFundRequest",
    request: (id) => {
      const formData = new FormData();
      return { url: `approvefund/${id}`, method: "POST", body: formData };
    },
  },
  rejectFundRequest: {
    endpointName: "rejectFundRequest",
    request: (id) => {
      const formData = new FormData();
      return { url: `rejectfund/${id}`, method: "POST", body: formData };
    },
  },
  toggleUser: {
    endpointName: "toggleUser",
    request: (user_id) => ({
      url: "toggleuser",
      method: "POST",
      body: { user_id },
    }),
  },
  declareResult: {
    endpointName: "declareResult",
    request: ({ result_date, game_id, session, pana, digit }) => ({
      url: "declareresult",
      method: "POST",
      params: { result_date, game_id, session, pana, digit },
    }),
  },
  deleteResult: {
    endpointName: "deleteResult",
    request: (id) => {
      const formData = new FormData();
      formData.append("id", id);
      return { url: "deleteresult", method: "POST", body: formData };
    },
  },
  updateGame: {
    endpointName: "updateGame",
    request: ({ id, game_name, game_name_hindi, status }) => {
      const formData = new FormData();
      if (game_name !== undefined) formData.append("game_name", game_name);
      if (game_name_hindi !== undefined)
        formData.append("game_name_hindi", game_name_hindi);
      if (status !== undefined) formData.append("status", status);
      return { url: `updategame/${id}`, method: "POST", body: formData };
    },
  },
  updateGameSchedule: {
    endpointName: "updateGameSchedule",
    request: ({ id, open_time, close_time }) => ({
      url: `game-schedules/${id}`,
      method: "PUT",
      params: { open_time, close_time },
    }),
  },
  toggleScheduleStatus: {
    endpointName: "toggleScheduleStatus",
    request: (schedule_id) => {
      const formData = new FormData();
      formData.append("schedule_id", schedule_id);
      return { url: "toggleschedulestatus", method: "POST", body: formData };
    },
  },
  updateConfig: {
    endpointName: "updateConfig",
    request: (params) => {
      const queryParams = {};
      Object.keys(params || {}).forEach((key) => {
        let value = params[key];
        if (key === "user_status") {
          if (
            value === true ||
            value === 1 ||
            value === "1" ||
            value === "true"
          )
            value = 1;
          else if (
            value === false ||
            value === 0 ||
            value === "0" ||
            value === "false"
          )
            value = 0;
        }
        if (value !== undefined && value !== null && value !== "") {
          queryParams[key] = value;
        }
      });
      return { url: "config", method: "PUT", params: queryParams };
    },
  },
  updateWithdrawStatus: {
    endpointName: "updateWithdrawStatus",
    request: ({ id, status }) => {
      const formData = new FormData();
      formData.append("status", status);
      return { url: `withdraw-update/${id}`, method: "POST", body: formData };
    },
  },
  getTransactions: {
    endpointName: "getTransactions",
    request: ({ start_date, end_date }) => {
      const formData = new FormData();
      formData.append("start_date", start_date);
      formData.append("end_date", end_date);
      return { url: "transactions", method: "POST", body: formData };
    },
  },
  checkWinner: {
    endpointName: "checkWinner",
    request: ({ result_date, game_id, session, pana, digit }) => ({
      url: "checkwinner",
      method: "POST",
      params: { result_date, game_id, session, pana, digit },
    }),
  },
  addStarlineGame: {
    endpointName: "addStarlineGame",
    request: ({ name, name_hindi, time }) => {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("name_hindi", name_hindi);
      formData.append("time", time);
      return { url: "starline-addgame", method: "POST", body: formData };
    },
  },
  updateStarlineGame: {
    endpointName: "updateStarlineGame",
    request: ({ id, name, name_hindi, time }) => {
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
  },
  toggleStarlineGame: {
    endpointName: "toggleStarlineGame",
    request: (id) => ({ url: `starline-tooglestatus/${id}`, method: "POST" }),
  },
  updateStarlineRate: {
    endpointName: "updateStarlineRate",
    request: ({ id, rate, base }) => {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("rate", rate);
      formData.append("base", base);
      return { url: "updaterates-starline", method: "POST", body: formData };
    },
  },
  starlineDeclareResult: {
    endpointName: "starlineDeclareResult",
    request: ({ result_date, game_id, pana, digit }) => {
      const formData = new FormData();
      formData.append("result_date", result_date);
      formData.append("game_id", game_id);
      formData.append("pana", pana);
      formData.append("digit", digit);
      return { url: "starline-declareresult", method: "POST", body: formData };
    },
  },
  starlineCheckWinner: {
    endpointName: "starlineCheckWinner",
    request: ({ result_date, game_id, pana, digit }) => ({
      url: "starline-checkwinner",
      method: "POST",
      params: { result_date, game_id, pana, digit },
    }),
  },
  addGame: {
    endpointName: "addGame",
    request: ({ game_name, game_name_hindi, open_time, close_time }) => {
      const formData = new FormData();
      formData.append("game_name", game_name);
      formData.append("game_name_hindi", game_name_hindi);
      formData.append("open_time", open_time);
      formData.append("close_time", close_time);
      return { url: "addgame", method: "POST", body: formData };
    },
  },
  adminAddFunds: {
    endpointName: "adminAddFunds",
    request: ({ user_id, amount }) => {
      const formData = new FormData();
      formData.append("user_id", user_id);
      formData.append("amount", amount);
      return { url: "admin-addfunds", method: "POST", body: formData };
    },
  },
  deleteUser: {
    endpointName: "deleteUser",
    request: (id) => {
      const formData = new FormData();
      formData.append("id", id);
      return { url: "deleteuser", method: "POST", body: formData };
    },
  },
};

export const useCheckLoginQuery = createQueryHook(queries.checkLogin);
export const useGetUsersQuery = createQueryHook(queries.getUsers);
export const useGetInactiveUsersQuery = createQueryHook(
  queries.getInactiveUsers,
);
export const useGetBannersQuery = createQueryHook(queries.getBanners);
export const useGetAdminQuery = createQueryHook(queries.getAdmin);
export const useGetWithdrawRequestsQuery = createQueryHook(
  queries.getWithdrawRequests,
);
export const useGetFundRequestsQuery = createQueryHook(queries.getFundRequests);
export const useGetBiddingHistoryQuery = createQueryHook(
  queries.getBiddingHistory,
);
export const useGetBiddingHistoryStarlineQuery = createQueryHook(
  queries.getBiddingHistoryStarline,
);
export const useGetDeclaredResultsStarlineQuery = createQueryHook(
  queries.getDeclaredResultsStarline,
);
export const useGetDeclaredResultsQuery = createQueryHook(
  queries.getDeclaredResults,
);
export const useGetBiddingHistoryGaliQuery = createQueryHook(
  queries.getBiddingHistoryGali,
);
export const useGetProfitQuery = createQueryHook(queries.getProfit);
export const useGetUserByIdQuery = createQueryHook(queries.getUserById);
export const useGetGamesQuery = createQueryHook(queries.getGames);
export const useGetGameSchedulesQuery = createQueryHook(
  queries.getGameSchedules,
);
export const useGetConfigQuery = createQueryHook(queries.getConfig);
export const useGetInquiryUsersQuery = createQueryHook(queries.getInquiryUsers);
export const useGetUserInquiriesQuery = createQueryHook(
  queries.getUserInquiries,
);
export const useGetStarlineGamesQuery = createQueryHook(
  queries.getStarlineGames,
);
export const useGetStarlineRatesQuery = createQueryHook(
  queries.getStarlineRates,
);

export const useLoginMutation = createMutationHook(mutations.login);
export const useAddBannerMutation = createMutationHook(mutations.addBanner);
export const useDeleteBannerMutation = createMutationHook(
  mutations.deleteBanner,
);
export const useApproveFundRequestMutation = createMutationHook(
  mutations.approveFundRequest,
);
export const useRejectFundRequestMutation = createMutationHook(
  mutations.rejectFundRequest,
);
export const useToggleUserMutation = createMutationHook(mutations.toggleUser);
export const useDeclareResultMutation = createMutationHook(
  mutations.declareResult,
);
export const useDeleteResultMutation = createMutationHook(
  mutations.deleteResult,
);
export const useUpdateGameMutation = createMutationHook(mutations.updateGame);
export const useUpdateGameScheduleMutation = createMutationHook(
  mutations.updateGameSchedule,
);
export const useToggleScheduleStatusMutation = createMutationHook(
  mutations.toggleScheduleStatus,
);
export const useUpdateConfigMutation = createMutationHook(
  mutations.updateConfig,
);
export const useUpdateWithdrawStatusMutation = createMutationHook(
  mutations.updateWithdrawStatus,
);
export const useGetTransactionsMutation = createMutationHook(
  mutations.getTransactions,
);
export const useCheckWinnerMutation = createMutationHook(mutations.checkWinner);
export const useAddStarlineGameMutation = createMutationHook(
  mutations.addStarlineGame,
);
export const useUpdateStarlineGameMutation = createMutationHook(
  mutations.updateStarlineGame,
);
export const useToggleStarlineGameMutation = createMutationHook(
  mutations.toggleStarlineGame,
);
export const useUpdateStarlineRateMutation = createMutationHook(
  mutations.updateStarlineRate,
);
export const useStarlineDeclareResultMutation = createMutationHook(
  mutations.starlineDeclareResult,
);
export const useStarlineCheckWinnerMutation = createMutationHook(
  mutations.starlineCheckWinner,
);
export const useAddGameMutation = createMutationHook(mutations.addGame);
export const useAdminAddFundsMutation = createMutationHook(
  mutations.adminAddFunds,
);
export const useDeleteUserMutation = createMutationHook(mutations.deleteUser);

export const apiAPISlice = {
  util: {

    resetApiState: () => () => {
      resetApiCache();
    },
  },
};
