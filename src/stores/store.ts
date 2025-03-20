import { SnackbarCloseReason } from "@mui/material";
import { EmojiPreset } from "@wings-corporation/phoenix-ui";
import { SyntheticEvent } from "react";
import { createStore } from "zustand/vanilla";

type TriggerSnackbarParam = {
  message: string;
  variant?: "neutral" | "negative";
  emoji?: EmojiPreset;
  autoHideDuration?: number;
};

export type WorkspaceState = {
  // TODO: add state for sidenav
  // sidenav: SidenavState
};

export type WorkspaceActions = {};

export type WorkspaceStore = WorkspaceState & WorkspaceActions;

export const defaultInitState: WorkspaceState = {};

export const createWorkspaceStore = (
  initState: WorkspaceState = defaultInitState
) => {
  return createStore<WorkspaceStore>()((set) => ({
    ...initState,
  }));
};