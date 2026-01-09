export interface CheckInResponse {
  id: string;
  created: string;
  modified: string;
  duration: number;
  start_time: string;
  record_date: string;
  tag: string;
  activities: string;
}

export interface CheckInForm {
  duration: number;
  start_time: string;
  record_date: string;
  tag: string;
  activities: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T;
}

export interface TextLogItem {
  tag: string;
  duration: number;
  activities: string[];
}

export type TextLogResponse = Record<string, TextLogItem[]>;

export interface CheckinStatsItem {
  tag: string;
  duration: number;
}
