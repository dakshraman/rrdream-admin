import { QueryClient } from "@tanstack/react-query";

let queryClient;

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 30_000, // 30s — use cache on navigation, refetch in background
        gcTime: 5 * 60_000, // 5 min garbage collection
      },
      mutations: {
        retry: false,
      },
    },
  });

export const getQueryClient = () => {
  if (!queryClient) {
    queryClient = createQueryClient();
  }
  return queryClient;
};

export const resetApiCache = () => {
  getQueryClient().clear();
};
