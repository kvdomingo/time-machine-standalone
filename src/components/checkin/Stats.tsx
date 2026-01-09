import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import type { Data } from "plotly.js";
import { useMemo, useState } from "react";
import Plot from "react-plotly.js";
import api, { BaseQueryKey } from "@/api";
import type { CheckinStatsItem } from "@/api/types/checkIn.ts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";

type ChartType = "pie" | "bar";

const Route = getRouteApi("/");

interface TabContentProps {
  checkIns: CheckinStatsItem[];
  data: Data;
}

function TabContent({ checkIns, data }: TabContentProps) {
  return checkIns.length === 0 ? (
    "No checkins within the selected period"
  ) : (
    <Plot
      data={[data]}
      layout={{
        width: 400,
        height: 500,
        margin: { t: 0, b: 0, l: 0, r: 0, pad: 0 },
        legend: {
          orientation: "h",
        },
        font: {
          family: "Nunito",
          color: "white",
        },
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
      }}
      config={{
        responsive: true,
        displayModeBar: false,
      }}
    />
  );
}

function Stats() {
  const { start_date, end_date } = Route.useSearch();

  const {
    data: { data: stats },
  } = useSuspenseQuery({
    queryFn: () => api.checkin.getStats(start_date, end_date),
    queryKey: [BaseQueryKey.CHECKIN, "stats", start_date, end_date],
  });

  const [chartSelector, setChartSelector] = useState<ChartType>("pie");

  const data = useMemo<Data>(() => {
    switch (chartSelector) {
      case "pie": {
        return {
          labels: stats.map((s) => s.tag),
          values: stats.map((s) => s.duration.toFixed(2)),
          type: "pie",
          textinfo: "value+percent",
        };
      }
      case "bar": {
        return {
          x: stats.map((s) => s.duration.toFixed(2)),
          y: stats.map((s) => s.tag),
          type: "bar",
          orientation: "h",
          text: stats.map(
            (s) =>
              `#${s.tag} ${s.duration.toFixed(2)} ${s.duration === 1 ? "hr" : "hrs"}`,
          ),
        };
      }
      default: {
        return {};
      }
    }
  }, [stats, chartSelector]);

  return (
    <Tabs
      className="mt-8 flex flex-col items-center"
      value={chartSelector}
      onValueChange={(value) => setChartSelector(value as ChartType)}
    >
      <TabsList>
        <TabsTrigger value="pie">Pie</TabsTrigger>
        <TabsTrigger value="bar">Bar</TabsTrigger>
      </TabsList>
      <TabsContent className="mt-4" value="pie">
        <TabContent checkIns={stats} data={data} />
      </TabsContent>
      <TabsContent value="bar">
        <TabContent checkIns={stats} data={data} />
      </TabsContent>
    </Tabs>
  );
}

export default Stats;
