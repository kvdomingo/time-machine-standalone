import { Add, Check, Close } from "@mui/icons-material";
import { Autocomplete, Button, Grid, IconButton, TextField } from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import moment from "moment";
import { useState } from "react";
import type { CheckInForm } from "@/api/types/checkIn.ts";
import { type Checkin, checkinsCollection } from "@/db-collections";
import { useTagCache } from "@/hooks/use-tag-cache";
import { DEFAULT_DATE_FORMAT, DEFAULT_TIME_FORMAT } from "@/utils/constants.ts";

enum CheckInStatus {
  OK = "",
  RequiredField = "This field is required",
  NumberOnly = "This field should be a positive number",
}

type CheckInAddEditProps =
  | {
      isEditing: false;
    }
  | {
      isEditing: true;
      stopEditing: () => void;
      editingProps: Checkin;
    };

function CheckInAddEdit(props: CheckInAddEditProps) {
  const initialCheckIn: CheckInForm = {
    duration: props.isEditing ? props.editingProps.duration : 0,
    start_time: props.isEditing
      ? props.editingProps.start_time.toISOString()
      : moment().format(DEFAULT_TIME_FORMAT),
    record_date: props.isEditing
      ? props.editingProps.record_date
      : moment().format(DEFAULT_DATE_FORMAT),
    tag: props.isEditing ? props.editingProps.tag : "",
    activities: props.isEditing ? props.editingProps.activities : "",
  };

  const initialErrors: Record<keyof CheckInForm, CheckInStatus> = {
    duration: CheckInStatus.OK,
    start_time: CheckInStatus.OK,
    record_date: CheckInStatus.OK,
    tag: CheckInStatus.OK,
    activities: CheckInStatus.OK,
  };

  const tagCache = useTagCache();

  const [endTime, setEndTime] = useState(
    props.isEditing
      ? moment(props.editingProps.start_time, DEFAULT_TIME_FORMAT)
          .add(props.editingProps.duration, "hours")
          .format(DEFAULT_TIME_FORMAT)
      : moment().format(DEFAULT_TIME_FORMAT),
  );
  const [newCheckInData, setNewCheckInData] = useState({ ...initialCheckIn });
  const [formErrors, setFormErrors] = useState<typeof initialErrors>({
    ...initialErrors,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [tagInputValue, setTagInputValue] = useState("");

  function convertMillisecondsToHours(millis: number) {
    return millis / 1000 / 60 / 60;
  }

  function handleChange(e: any, _name?: string, _value?: string | null) {
    const name = _name ?? e.target.name;
    const value = _value ?? e.target.value;
    setNewCheckInData((form) => ({
      ...form,
      [name]: value,
    }));
  }

  function handleConfirmChange(e: any, _name?: string, _value?: string | null) {
    const name = _name ?? e.target.name;
    const value = _value ?? e.target.value;
    setNewCheckInData((form) => ({
      ...form,
      [name]: name === "tag" ? value.replace(/\s+/g, "-") : value,
    }));
  }

  function handleChangeStartTime(value: string) {
    let _startTime = moment(value, DEFAULT_TIME_FORMAT);
    const _endTime = moment(endTime, DEFAULT_TIME_FORMAT);
    if (_startTime.isAfter(_endTime)) {
      _startTime = moment(_endTime);
    }
    let diff = convertMillisecondsToHours(_endTime.valueOf() - _startTime.valueOf());
    if (Number.isNaN(diff)) diff = 0;
    setNewCheckInData((form) => ({
      ...form,
      duration: diff,
      start_time: value,
    }));
  }

  function handleChangeEndTime(value: string) {
    const _startTime = moment(newCheckInData.start_time, DEFAULT_TIME_FORMAT);
    let _endTime = moment(value, DEFAULT_TIME_FORMAT);
    if (_endTime.isBefore(_startTime)) {
      _endTime = moment(_startTime);
      setEndTime(_endTime.format(DEFAULT_TIME_FORMAT));
    }
    let diff = convertMillisecondsToHours(_endTime.valueOf() - _startTime.valueOf());
    if (Number.isNaN(diff)) diff = 0;
    setNewCheckInData((form) => ({
      ...form,
      duration: diff,
    }));
    setEndTime(value);
  }

  function handleChangeRecordDate(value: string) {
    setNewCheckInData((form) => ({
      ...form,
      record_date: value,
    }));
  }

  function handleChangeDuration(value: number) {
    const _startTime = moment(newCheckInData.start_time, DEFAULT_TIME_FORMAT);
    const _endTime = moment(_startTime).add(value, "hours");
    if (_endTime.format(DEFAULT_TIME_FORMAT) !== endTime)
      setEndTime(_endTime.format(DEFAULT_TIME_FORMAT));
    setNewCheckInData((form) => ({
      ...form,
      duration: value,
    }));
  }

  function validateForm() {
    const errors = { ...formErrors };

    for (const key of Object.keys(errors) as (keyof CheckInForm)[]) {
      if (key === "duration") {
        errors.duration =
          !Number.isNaN(Number.parseFloat(String(newCheckInData.duration))) &&
          Number.parseFloat(String(newCheckInData.duration)) > 0
            ? CheckInStatus.OK
            : CheckInStatus.NumberOnly;
      } else if (key === "tag") {
        errors.tag =
          newCheckInData.tag.length > 0
            ? CheckInStatus.OK
            : CheckInStatus.RequiredField;
      } else {
        errors[key] =
          newCheckInData[key].length > 0
            ? CheckInStatus.OK
            : CheckInStatus.RequiredField;
      }
    }

    setFormErrors(errors);
    return errors;
  }

  function handleSubmit(e: any) {
    props.isEditing ? handleEditCheckIn(e) : handleCreateCheckIn(e);
  }

  async function handleCreateCheckIn(e: any) {
    e.preventDefault();
    const errors = validateForm();
    if (Object.values(errors).some(Boolean)) return;

    const now = new Date();
    const tx = checkinsCollection.insert({
      ...newCheckInData,
      start_time: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours(),
        parseInt(newCheckInData.start_time.split(":")[0], 10),
        parseInt(newCheckInData.start_time.split(":")[1], 10),
      ).toISOString(),
    });
    await tx.isPersisted.promise;

    setIsCreating(false);
    setNewCheckInData({ ...initialCheckIn });
  }

  async function handleEditCheckIn(e: any) {
    e.preventDefault();

    if (props.isEditing) {
      const errors = validateForm();
      if (Object.values(errors).some(Boolean)) return;

      const now = new Date();
      const tx = checkinsCollection.update(props.editingProps.id, (draft) => {
        draft.duration = newCheckInData.duration;
        draft.start_time = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          now.getHours(),
          parseInt(newCheckInData.start_time.split(":")[0], 10),
          parseInt(newCheckInData.start_time.split(":")[1], 10),
        ).toISOString();
        draft.record_date = newCheckInData.record_date;
        draft.tag = newCheckInData.tag;
        draft.activities = newCheckInData.activities;
      });
      await tx.isPersisted.promise;

      props.stopEditing();
    }
  }

  return isCreating || props.isEditing ? (
    <form onSubmit={handleSubmit} className="flex w-full flex-row gap-1">
      <div className="flex-none">
        <DatePicker
          onChange={(val) =>
            handleChangeRecordDate(
              val?.format(DEFAULT_DATE_FORMAT) ?? moment().format(DEFAULT_DATE_FORMAT),
            )
          }
          value={moment(newCheckInData.record_date, DEFAULT_DATE_FORMAT)}
          label="Record date"
        />
      </div>

      <div className="w-full">
        <Autocomplete
          freeSolo
          fullWidth
          renderInput={(params) => (
            <TextField
              {...params}
              autoFocus
              label="Tag"
              name="tag"
              error={!!formErrors.tag}
              helperText={formErrors.tag}
              InputProps={{
                ...params.InputProps,
                startAdornment: "#",
              }}
            />
          )}
          options={tagCache}
          getOptionLabel={(option) => option}
          inputValue={tagInputValue}
          onInputChange={(_, val) => setTagInputValue(val)}
          value={newCheckInData.tag}
          onChange={(e, val) => handleConfirmChange(e, "tag", val)}
          onBlur={(e) => handleConfirmChange(e, "tag")}
          disableClearable
        />
      </div>

      <div className="w-full">
        <TextField
          label="Activities"
          variant="outlined"
          name="activities"
          value={newCheckInData.activities}
          onChange={handleChange}
          fullWidth
          error={!!formErrors.activities}
          helperText={formErrors.activities}
        />
      </div>

      <div className="w-full">
        <TimePicker
          onChange={(val) =>
            handleChangeStartTime(val?.format(DEFAULT_TIME_FORMAT) ?? "00:00")
          }
          value={moment(newCheckInData.start_time, DEFAULT_TIME_FORMAT)}
          label="Start time"
          ampm={false}
        />
      </div>

      <div className="w-full">
        <TimePicker
          onChange={(val) =>
            handleChangeEndTime(val?.format(DEFAULT_TIME_FORMAT) ?? "00:00")
          }
          value={moment(endTime, DEFAULT_TIME_FORMAT)}
          label="End time"
          ampm={false}
        />
      </div>

      <div className="w-full">
        <TextField
          label="Duration"
          variant="outlined"
          InputProps={{ endAdornment: "hrs" }}
          name="duration"
          value={newCheckInData.duration}
          inputMode="numeric"
          onChange={(e) => handleChangeDuration(Number.parseFloat(e.target.value))}
          onBlur={handleConfirmChange}
          error={!!formErrors.duration}
          helperText={formErrors.duration}
          fullWidth
        />
      </div>

      <div className="my-auto flex-none text-right">
        <IconButton
          onClick={() => {
            setNewCheckInData({ ...initialCheckIn });
            props.isEditing ? props.stopEditing() : setIsCreating(false);
          }}
        >
          <Close />
        </IconButton>
        <IconButton type="submit" onClick={handleSubmit}>
          <Check />
        </IconButton>
      </div>
    </form>
  ) : (
    <Grid container justifyContent="center">
      <Button
        variant="text"
        color="primary"
        startIcon={<Add />}
        onClick={() => setIsCreating(true)}
      >
        Check In
      </Button>
    </Grid>
  );
}

CheckInAddEdit.defaultProps = {
  isEditing: false,
};

export default CheckInAddEdit;
