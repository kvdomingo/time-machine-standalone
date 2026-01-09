import { Container, Grid, Typography } from "@mui/material";
import { eq, gte, lte, min, sum, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute } from "@tanstack/react-router";
import dateFormat from "dateformat";
import moment from "moment";
import { useMemo } from "react";
import type { PaginatedResponse, TextLogResponse } from "@/api/types/checkIn";
import CheckInView from "@/components/checkin";
import PendingComponent from "@/components/shared/PendingComponent.tsx";
import { type Checkin, checkinsCollection } from "@/db-collections";
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
});

function Index() {
  const { start_date, end_date, page, tag } = Route.useSearch();

  const checkInsQuery = useLiveQuery(
    (q) =>
      q
        .from({ c: checkinsCollection })
        .where(({ c }) => gte(c.record_date, start_date))
        .where(({ c }) => lte(c.record_date, end_date))
        .where(({ c }) => eq(c.tag, tag ?? ""))
        .orderBy(({ c }) => c.start_time, "desc")
        .limit(10)
        .offset((page - 1) * 10),
    [start_date, end_date, page, tag],
  );
  const checkIns: PaginatedResponse<Checkin[]> = {
    count: checkInsQuery.data.length,
    results: checkInsQuery.data,
  };
  console.dir(checkInsQuery, { depth: null });

  const textLogQuery = useLiveQuery(
    (q) =>
      q
        .from({ c: checkinsCollection })
        .select(({ c }) => ({
          record_date: c.record_date,
          tag: c.tag,
          duration: sum(c.duration),
          activities: c.activities,
          start_time: min(c.start_time),
        }))
        .where(({ c }) => gte(c.record_date, start_date))
        .where(({ c }) => lte(c.record_date, end_date))
        .groupBy(({ c }) => [c.record_date, c.tag, c.activities])
        .orderBy(({ c }) => [c.record_date, c.start_time]),
    [start_date, end_date],
  );
  const textLog = useMemo(() => {
    const out: TextLogResponse = {};
    for (const t of textLogQuery.data) {
      out[t.record_date] ??= [];
      out[t.record_date].push({
        tag: t.tag,
        duration: t.duration,
        activities: t.activities.split(",").map((a) => a.trim()),
      });
    }
    return out;
  }, [textLogQuery.data]);

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

        <CheckInView checkIns={checkIns} textLog={textLog} />
      </Container>
    </Grid>
  );
}
