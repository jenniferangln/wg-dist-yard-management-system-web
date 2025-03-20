"use client";
import { useRouter } from "@bprogress/next";
import { Box, Stack, useMediaQuery } from "@mui/material";
import {
  breakpoint,
  getGap,
  Sidebar,
  SidebarTrigger,
  useBrandTheme,
  useSidebar,
} from "@wings-corporation/phoenix-ui";

export default function YardManagementLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const onNavigateSidebar = (url: string) => {
    router.push(url);
  };
  const brandTheme = useBrandTheme();
  const { sidebarState } = useSidebar();
  const isDesktop = useMediaQuery(breakpoint.desktop);


  return (
    <Stack direction="row" sx={{ overflow: "hidden", height: "100svh" }}>
      <Sidebar onNavigateSidebar={onNavigateSidebar} />
      <Box
        sx={{
          overflowX: "hidden",
          flexGrow: 1,
        }}
      >
        <Stack
          direction="row"
          sx={{
            paddingX: "80px",
            width: "100%",
            boxSizing: "border-box",
            padding: "24px 16px 16px 16px",
            [breakpoint.tablet]: {
              padding: "32px 24px 24px 24px",
            },
            [breakpoint.desktop]: {
              gap: getGap("md", brandTheme).desktop,
              padding: "32px 80px 40px 80px",
            },
          }}
        >
          {!(sidebarState.open && !sidebarState.floating) && isDesktop && (
            <SidebarTrigger />
          )}
          <Stack gap={2} sx={{ width: "100%", flexShrink: 0 }}>
            {children}
          </Stack>
        </Stack>
      </Box>
      <Stack
        id="floating-action-bar"
        sx={{
          position: "fixed",
          bottom: "12px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          width: "100%",
        }}
      />
    </Stack>
  );
}