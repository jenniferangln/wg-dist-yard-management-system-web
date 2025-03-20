"use client";

import React, { useEffect } from "react";

import { useSidebar } from "@wings-corporation/phoenix-ui";
import { usePathname } from "next/navigation";

export const PathnameProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  const { setSidebarState } = useSidebar();

  useEffect(() => {
    setSidebarState({ currentUrl: pathname });
  }, [pathname]);

  return <>{children}</>;
};