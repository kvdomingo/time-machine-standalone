import type { Moment } from "moment";

export type viewOptionValue = "day" | "week" | "month" | "custom";

export interface ViewOption {
  label: string;
  value: viewOptionValue;
  start: Moment;
  end: Moment;
}
