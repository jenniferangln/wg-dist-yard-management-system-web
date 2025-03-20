"use client";

import { type ReactNode, createContext, useContext, useRef } from "react";

import { type WorkspaceStore, createWorkspaceStore } from "@/stores/store";
import { useStore } from "zustand";

export type WorkspaceStoreApi = ReturnType<typeof createWorkspaceStore>;

export const WorkspaceStoreContext = createContext<
  WorkspaceStoreApi | undefined
>(undefined);

export interface WorkspaceStoreProviderProps {
  children: ReactNode;
}

export const WorkspaceStoreProvider = ({
  children,
}: WorkspaceStoreProviderProps) => {
  const storeRef = useRef<WorkspaceStoreApi | null>(null);
  if (!storeRef.current) {
    storeRef.current = createWorkspaceStore() as WorkspaceStoreApi;
  }

  return (
    <WorkspaceStoreContext.Provider value={storeRef.current}>
      {children}
    </WorkspaceStoreContext.Provider>
  );
};

export const useWorkspaceStore = <T,>(
  selector: (store: WorkspaceStore) => T
): T => {
  const context = useContext(WorkspaceStoreContext);

  if (!context) {
    throw new Error(
      `useWorkspaceStore must be used within WorkspaceStoreProvider`
    );
  }

  return useStore(context, selector);
};