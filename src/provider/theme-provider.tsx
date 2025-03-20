"use client";

import React, { useEffect } from "react";

import { BrandThemeProvider } from "@wings-corporation/phoenix-ui";
import "@wings-corporation/phoenix-ui/style.css";
import { useProgress } from "@bprogress/next";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { start } = useProgress();

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      start();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return <BrandThemeProvider licenseKey={""}>{children}</BrandThemeProvider>;
};