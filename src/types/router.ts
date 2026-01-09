import type { QueryClient } from "@tanstack/react-query";

export interface RouterContext {
  queryClient: QueryClient;
}

export interface CheckinSearchParams {
  start_date: string;
  end_date: string;
  page: number;
  tag?: string;
}
