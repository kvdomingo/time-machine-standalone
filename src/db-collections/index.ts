import { init as initCuid } from "@paralleldrive/cuid2";
import { createCollection } from "@tanstack/react-db";
import { dexieCollectionOptions } from "tanstack-dexie-db-collection";
import { z } from "zod";

const createId = initCuid({
  length: 32,
});

const Checkin = z.object({
  id: z.cuid2().default(createId()),
  created: z.date().default(new Date()),
  modified: z.date().default(new Date()),
  duration: z.number().positive(),
  start_time: z.iso.datetime().default(new Date().toISOString()),
  record_date: z.iso.date(),
  tag: z.string().nonempty(),
  activities: z.string().nonempty(),
});
export type Checkin = z.infer<typeof Checkin>;

export const checkinsCollection = createCollection(
  dexieCollectionOptions({
    id: "checkins",
    dbName: "time-machine",
    schema: Checkin,
    getKey: (checkin) => checkin.id,
  }),
);
