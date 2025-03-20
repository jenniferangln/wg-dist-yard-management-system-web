import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import TanStackQueryProvider from "@/provider/query-provider";
import { WorkspaceStoreProvider } from "@/provider/store-provider";
import { ThemeProvider } from "@/provider/theme-provider";
import { PathnameProvider } from "@/provider/pathname-provider";


export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }


  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();


  return (
    <NextIntlClientProvider messages={messages}>
      <TanStackQueryProvider>
        <WorkspaceStoreProvider>
          <ThemeProvider>
            <PathnameProvider>{children}</PathnameProvider>
          </ThemeProvider>
        </WorkspaceStoreProvider>
      </TanStackQueryProvider>
    </NextIntlClientProvider>
  );
}
