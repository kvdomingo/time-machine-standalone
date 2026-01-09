import nunito200 from "@fontsource/nunito/200?url";
import nunito300 from "@fontsource/nunito/300?url";
import nunito400 from "@fontsource/nunito/400?url";
import nunito500 from "@fontsource/nunito/500?url";
import nunito700 from "@fontsource/nunito/700?url";
import nunito900 from "@fontsource/nunito/900?url";
import { CssBaseline, StyledEngineProvider, ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { AxiosInterceptorProvider } from "@/api";
import { GlobalNotification } from "@/components/global-notification";
import { Toaster } from "@/components/ui/sonner";
import theme from "@/themes";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Time Machine",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "stylesheet",
        href: nunito200,
      },
      {
        rel: "stylesheet",
        href: nunito300,
      },
      {
        rel: "stylesheet",
        href: nunito400,
      },
      {
        rel: "stylesheet",
        href: nunito500,
      },
      {
        rel: "stylesheet",
        href: nunito700,
      },
      {
        rel: "stylesheet",
        href: nunito900,
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="dark">
        <AxiosInterceptorProvider>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <CssBaseline />
                <main>{children}</main>
              </LocalizationProvider>
            </ThemeProvider>
          </StyledEngineProvider>
        </AxiosInterceptorProvider>
        <Toaster position="bottom-left" closeButton />
        <GlobalNotification />

        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
