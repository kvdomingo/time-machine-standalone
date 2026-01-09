import { AccessTime, ArrowDropDown } from "@mui/icons-material";
import {
  Button,
  ButtonGroup,
  ClickAwayListener,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { getRouteApi } from "@tanstack/react-router";
import moment, { type Moment } from "moment";
import pluralize from "pluralize";
import { useMemo, useRef, useState } from "react";
import type { PaginatedResponse, TextLogResponse } from "@/api/types/checkIn.ts";
import Stats from "@/components/checkin/Stats.tsx";
import type { Checkin } from "@/db-collections";
import type { ViewOption } from "@/types/dateRangeViewOption.ts";
import { DEFAULT_DATE_FORMAT } from "@/utils/constants.ts";
import CheckInList from "./CheckInList";
import TextLog from "./TextLog";

const VIEW_OPTIONS: ViewOption[] = [
  {
    label: "Today",
    value: "day",
    start: moment().startOf("day"),
    end: moment().endOf("day"),
  },
  {
    label: "This week",
    value: "week",
    start: moment().startOf("isoWeek"),
    end: moment().endOf("day"),
  },
  {
    label: "This month",
    value: "month",
    start: moment().startOf("month"),
    end: moment().endOf("day"),
  },
  {
    label: "Custom",
    value: "custom",
    start: moment().startOf("day"),
    end: moment().endOf("day"),
  },
];

interface CheckInViewProps {
  checkIns: PaginatedResponse<Checkin[]>;
  textLog: TextLogResponse;
}

const Route = getRouteApi("/");

function CheckInView({ checkIns, textLog }: CheckInViewProps) {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();

  const [selectedPeriod, setSelectedPeriod] = useState<ViewOption>(VIEW_OPTIONS[0]);
  const [openPeriodSelectMenu, setOpenPeriodSelectMenu] = useState(false);
  const [customRangeStart, setCustomRangeStart] = useState(moment().startOf("isoWeek"));
  const [customRangeEnd, setCustomRangeEnd] = useState(moment().endOf("day"));
  const periodSelectorRef = useRef<HTMLDivElement>(null);

  async function handleChangeViewPeriod(viewPeriod: ViewOption) {
    setSelectedPeriod(viewPeriod);
    setOpenPeriodSelectMenu(false);

    await navigate({
      to: "/",
      search: {
        ...search,
        start_date:
          viewPeriod.value === "custom"
            ? customRangeStart.format(DEFAULT_DATE_FORMAT)
            : viewPeriod.start.format(DEFAULT_DATE_FORMAT),
        end_date:
          viewPeriod.value === "custom"
            ? customRangeEnd.format(DEFAULT_DATE_FORMAT)
            : viewPeriod.end.format(DEFAULT_DATE_FORMAT),
        page: 1,
      },
    });
  }

  async function handleChangeStartDate(value: Moment | null) {
    if (value == null) return;

    const start = value.startOf("day");
    setCustomRangeStart(start);

    await navigate({
      to: "/",
      search: {
        ...search,
        start_date: start.format(DEFAULT_DATE_FORMAT),
        page: 1,
      },
    });
  }

  async function handleChangeEndDate(value: Moment | null) {
    if (value == null) return;

    const end = value.endOf("day");
    setCustomRangeEnd(end);

    await navigate({
      to: "/",
      search: {
        ...search,
        end_date: end.format(DEFAULT_DATE_FORMAT),
        page: 1,
      },
    });
  }

  const checkInHours = useMemo(
    () =>
      Object.values(textLog)
        .flat()
        .reduce(
          (prevCheckin, currentCheckin) => prevCheckin + currentCheckin.duration,
          0,
        ),
    [textLog],
  );

  const remainingHours = useMemo(() => 8 - checkInHours, [checkInHours]);

  return (
    <>
      <div className="my-4 grid grid-cols-3 gap-4">
        <div className="col-span-3 md:col-span-2">
          <div className="grid grid-cols-2 items-center gap-2">
            <div className="col-span-2">
              <ButtonGroup variant="text" ref={periodSelectorRef}>
                <Button
                  onClick={() => setOpenPeriodSelectMenu((open) => !open)}
                  startIcon={<AccessTime />}
                  endIcon={<ArrowDropDown />}
                >
                  View: {selectedPeriod.label}
                </Button>
              </ButtonGroup>
              <Popper
                open={openPeriodSelectMenu}
                anchorEl={periodSelectorRef.current}
                transition
                disablePortal
                className="z-10"
              >
                {({ TransitionProps }) => (
                  <Grow
                    {...TransitionProps}
                    style={{
                      transformOrigin: "left bottom",
                    }}
                  >
                    <Paper>
                      <ClickAwayListener
                        onClickAway={() => setOpenPeriodSelectMenu(false)}
                      >
                        <MenuList autoFocusItem>
                          {VIEW_OPTIONS.map((option) => (
                            <MenuItem
                              key={option.value}
                              selected={option.value === selectedPeriod.value}
                              onClick={async () => await handleChangeViewPeriod(option)}
                            >
                              {option.label}
                            </MenuItem>
                          ))}
                        </MenuList>
                      </ClickAwayListener>
                    </Paper>
                  </Grow>
                )}
              </Popper>
            </div>
            {selectedPeriod.value === "custom" && (
              <>
                <div>
                  <DatePicker
                    onChange={handleChangeStartDate}
                    value={customRangeStart}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        label: "Start date",
                      },
                    }}
                  />
                </div>
                <div>
                  <DatePicker
                    onChange={handleChangeEndDate}
                    value={customRangeEnd}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        label: "End date",
                      },
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
        <div className="col-span-3 mt-auto md:col-span-1" />
        <div className="col-span-3">
          <CheckInList data={checkIns} />
        </div>
      </div>
      <div className="my-8 grid grid-cols-2">
        <div className="col-span-2 text-ctp-text md:col-span-1">
          <div>
            <p>
              Going on{" "}
              <b>
                {checkInHours.toFixed(2)} {pluralize("hour", checkInHours)}
              </b>
            </p>
            <p>
              Remaining{" "}
              <b>
                {remainingHours.toFixed(2)} {pluralize("hour", remainingHours)}
              </b>
            </p>
          </div>
          <TextLog log={textLog} />
        </div>
        <div className="col-span-2 md:col-span-1">
          <Stats />
        </div>
      </div>
    </>
  );
}

export default CheckInView;
