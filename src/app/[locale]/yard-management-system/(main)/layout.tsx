"use client" 
import { responsive, getGap, Topbar } from "@wings-corporation/phoenix-ui";
import { Stack } from "@mui/material";
import { useRouter } from "@bprogress/next";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();

    return (
        <Stack
            sx={{
                ...responsive({
                    attribute: "gap",
                    preset: "md",
                    getter: getGap,
                }),
            }}
        >
            <Topbar />
            {children}
        </Stack>
    );
}