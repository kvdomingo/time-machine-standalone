import type { AlertColor } from "@mui/material";

import { create } from "zustand";

interface GlobalNotification {
  type: AlertColor;
  visible: boolean;
  message: string;
}

export interface StoreState {
  globalNotification: GlobalNotification;
}

export interface StoreActions {
  updateGlobalNotification: (notification: StoreState["globalNotification"]) => void;
}

export const initialState: StoreState = {
  globalNotification: {
    type: "info",
    visible: false,
    message: "",
  },
};

export const useStore = create<StoreState & StoreActions>()((set) => ({
  ...initialState,
  updateGlobalNotification: (globalNotification) => set({ globalNotification }),
}));
