import type { Metadata } from "next";
import LoadingBarProvider from "@/provider/loading-bar-provider";


export const metadata: Metadata = {
  title: "Yard Management",
  description: "Yard Management Apps",
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <LoadingBarProvider>{children}</LoadingBarProvider>
      </body>
    </html>
  );
}
