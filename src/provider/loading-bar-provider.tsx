"use client";

import { AppProgressProvider as ProgressProvider } from "@bprogress/next";

const LoadingBarProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProgressProvider
      height="2px"
      color="#00A699"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </ProgressProvider>
  );
};

export default LoadingBarProvider;