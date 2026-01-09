import { Container, Grid, Typography } from "@mui/material";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import dateFormat from "dateformat";
import moment from "moment";
import api, { BaseQueryKey } from "@/api";
import { tagCacheQueryOptions } from "@/api/queryOptions.ts";
import CheckInView from "@/components/checkin";
import PendingComponent from "@/components/shared/PendingComponent.tsx";
import type { CheckinSearchParams } from "@/types/router.ts";
import { DEFAULT_DATE_FORMAT } from "@/utils/constants.ts";

export const Route = createFileRoute("/")({
  component: Index,
  pendingComponent: PendingComponent,
  validateSearch: (search: Partial<CheckinSearchParams>): CheckinSearchParams => {
    const start_date = search.start_date ?? moment().format(DEFAULT_DATE_FORMAT);
    const end_date = search.end_date ?? moment().format(DEFAULT_DATE_FORMAT);
    const page = search.page != null ? Number(search.page) : 1;

    return { start_date, end_date, page, tag: search.tag };
  },
  loaderDeps: ({ search }) => search,
  loader: ({ deps: { page, start_date, end_date, tag }, context: { queryClient } }) => {
    return Promise.all([
      queryClient.ensureQueryData({
        queryFn: () => api.checkin.list(page, start_date, end_date, tag),
        queryKey: [BaseQueryKey.CHECKIN, page, start_date, end_date, tag],
        initialData: {
          data: {
            count: 0,
            next: null,
            previous: null,
            results: [],
          },
        },
      }),
      queryClient.ensureQueryData({
        queryFn: () => api.checkin.log(start_date, end_date),
        queryKey: [BaseQueryKey.TEXT_LOG, start_date, end_date],
        initialData: {
          data: { "": [] },
        },
      }),
      queryClient.ensureQueryData(tagCacheQueryOptions),
      queryClient.ensureQueryData({
        queryFn: () => api.checkin.getStats(start_date, end_date),
        queryKey: [BaseQueryKey.CHECKIN, "stats", start_date, end_date],
        initialData: { data: [] },
      }),
    ]);
  },
});

function Index() {
  const { start_date, end_date, page, tag } = Route.useSearch();

  const {
    data: { data: checkins },
  } = useSuspenseQuery({
    queryFn: () => api.checkin.list(page, start_date, end_date, tag),
    queryKey: [BaseQueryKey.CHECKIN, page, start_date, end_date, tag],
  });

  const {
    data: { data: textLog },
  } = useSuspenseQuery({
    queryFn: () => api.checkin.log(start_date, end_date),
    queryKey: [BaseQueryKey.TEXT_LOG, start_date, end_date],
  });

  return (
    <Grid container spacing={1} my={5} px={4}>
      <Container maxWidth={false}>
        <Grid container>
          <Grid item xs={12}>
            <Typography variant="h4">
              {dateFormat(new Date(), "dddd, d mmmm yyyy")}
            </Typography>
          </Grid>
        </Grid>

        <CheckInView checkIns={checkins} textLog={textLog} />
      </Container>
    </Grid>
  );
}
