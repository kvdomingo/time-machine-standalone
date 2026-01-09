import { Alert, Snackbar } from "@mui/material";
import { useEffect, useState } from "react";
import { useStore } from "@/store.ts";

export function GlobalNotification() {
  const { globalNotification: notificationState, updateGlobalNotification } =
    useStore();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(notificationState.visible);
  }, [notificationState]);

  function handleClose() {
    setOpen(false);
    setTimeout(
      () =>
        updateGlobalNotification({
          message: "",
          type: "error",
          visible: false,
        }),
      300,
    );
  }

  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
    >
      <Alert
        onClose={handleClose}
        severity={notificationState.type}
        sx={{ width: "100%" }}
      >
        {notificationState.message}
      </Alert>
    </Snackbar>
  );
}
