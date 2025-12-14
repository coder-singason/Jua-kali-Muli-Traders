"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 10 minutes (longer cache)
        staleTime: 1000 * 60 * 10,
        // Keep unused data in cache for 30 minutes
        gcTime: 1000 * 60 * 30,
        // Retry failed requests once
        retry: 1,
        // Refetch on window focus only for critical data
        refetchOnWindowFocus: false,
        // Don't refetch on reconnect immediately
        refetchOnReconnect: false,
        // Use cached data immediately
        refetchOnMount: false,
      },
      mutations: {
        // Retry mutations once
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: use singleton pattern to keep the same query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

