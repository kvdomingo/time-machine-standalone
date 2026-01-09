import { QueryClient } from "@tanstack/react-query";

import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import moment from "moment";
import { type ReactElement, useEffect } from "react";
import { useStore } from "@/store.ts";
import { DEFAULT_DATE_FORMAT } from "../utils/constants";
import type {
  CheckInForm,
  CheckInResponse,
  CheckinStatsItem,
  PaginatedResponse,
  TextLogResponse,
} from "./types/checkIn";

const baseURL = "/api";

const axi = axios.create({
  baseURL,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
});

const api = {
  checkin: {
    list(
      page = 1,
      startDate: string = moment().format(DEFAULT_DATE_FORMAT),
      endDate?: string,
      tag?: string,
    ): Promise<AxiosResponse<PaginatedResponse<CheckInResponse[]>>> {
      const params = {
        page,
        start_date: startDate,
        end_date: endDate ?? undefined,
        tag: tag ?? undefined,
      };
      return axi.get("/checkin", { params });
    },
    listAll(
      startDate: string = moment().format(DEFAULT_DATE_FORMAT),
      endDate?: string,
    ): Promise<AxiosResponse<PaginatedResponse<CheckInResponse[]>>> {
      const params = {
        start_date: startDate,
        end_date: endDate ?? undefined,
      };
      return axi.get("/checkin-all", { params });
    },
    get(id: string): Promise<AxiosResponse<CheckInResponse>> {
      return axi.get(`/checkin/${id}`);
    },
    getStats(
      startDate: string = moment().format(DEFAULT_DATE_FORMAT),
      endDate?: string,
    ): Promise<AxiosResponse<CheckinStatsItem[]>> {
      const params = {
        start_date: startDate,
        end_date: endDate ?? undefined,
      };
      return axi.get("/checkin-stats", { params });
    },
    log(
      startDate: string = moment().format(DEFAULT_DATE_FORMAT),
      endDate?: string,
      tag?: string,
    ): Promise<AxiosResponse<TextLogResponse>> {
      const params = {
        start_date: startDate,
        end_date: endDate ?? undefined,
        tag: tag ?? undefined,
      };
      return axi.get("/textLog", { params });
    },
    create(body: CheckInForm): Promise<AxiosResponse<CheckInResponse>> {
      return axi.post("/checkin", body);
    },
    update(id: string, body: CheckInForm): Promise<AxiosResponse<CheckInResponse>> {
      return axi.put(`/checkin/${id}`, body);
    },
    delete(id: string): Promise<AxiosResponse> {
      return axi.delete(`/checkin/${id}`);
    },
  },
  tagCache: {
    list(): Promise<AxiosResponse<string[]>> {
      return axi.get("/tag");
    },
  },
};

export default api;

export function AxiosInterceptorProvider(props: { children: ReactElement }) {
  const { updateGlobalNotification } = useStore();

  useEffect(() => {
    function requestFulfilledInterceptor(config: InternalAxiosRequestConfig) {
      return config;
    }

    function requestRejectedInterceptor(error: AxiosError) {
      return Promise.reject(error);
    }

    function responseFulfilledInterceptor(response: AxiosResponse) {
      return response;
    }

    async function responseRejectedInterceptor(error: AxiosError) {
      const { status } = error.response ?? { status: 0 };

      if (axios.isCancel(error)) {
        return Promise.reject(error);
      }

      if (status > 400) {
        updateGlobalNotification({
          type: "error",
          message: "An error occurred. Please try again later.",
          visible: true,
        });
      }

      console.error(error);
      return Promise.reject(error);
    }

    const reqInterceptId = axi.interceptors.request.use(
      requestFulfilledInterceptor,
      requestRejectedInterceptor,
    );
    const resInterceptId = axi.interceptors.response.use(
      responseFulfilledInterceptor,
      responseRejectedInterceptor,
    );

    return () => {
      axi.interceptors.request.eject(reqInterceptId);
      axi.interceptors.response.eject(resInterceptId);
    };
  }, [updateGlobalNotification]);

  return props.children;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});

export enum BaseQueryKey {
  CHECKIN = "checkins",
  TEXT_LOG = "textLog",
  TAG_CACHE = "tagCache",
}
