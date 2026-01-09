import { queryOptions } from "@tanstack/react-query";
import api, { BaseQueryKey } from "@/api/index.ts";

export const tagCacheQueryOptions = queryOptions({
  queryFn: api.tagCache.list,
  queryKey: [BaseQueryKey.TAG_CACHE],
  // @ts-expect-error IT DOESN'T MATTER I JUST NEED AN EMPTY ARRAY
  initialData: {
    data: [],
  },
});
