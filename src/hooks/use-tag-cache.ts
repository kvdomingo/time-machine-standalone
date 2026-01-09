import { useLiveQuery } from "@tanstack/react-db";
import { useMemo } from "react";
import { checkinsCollection } from "@/db-collections";

export function useTagCache() {
  const tagQuery = useLiveQuery((q) =>
    q
      .from({ c: checkinsCollection })
      .select(({ c }) => ({ tag: c.tag }))
      .distinct()
      .orderBy(({ c }) => c.tag),
  );

  return useMemo(() => tagQuery.data.map((t) => t.tag), [tagQuery.data]);
}
