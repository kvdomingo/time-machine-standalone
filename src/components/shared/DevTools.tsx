import { lazy } from "react";

export const RouterDevTools = import.meta.env.PROD
  ? () => null
  : lazy(() =>
      import("@tanstack/router-devtools").then((res) => ({
        default: res.TanStackRouterDevtools,
      })),
    );

export const QueryDevTools = import.meta.env.PROD
  ? () => null
  : lazy(() =>
      import("@tanstack/react-query-devtools").then((res) => ({
        default: res.ReactQueryDevtools,
      })),
    );
