import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { connection } from "next/server";
import { MuiProvider } from "@/components/providers/MuiProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import {
  buildThemeInitScript,
  getResolvedThemeFromCookie,
} from "@/lib/theme/cookie";
import { RESOLVED_THEME_COOKIE } from "@/lib/theme/types";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Kompensa",
    template: "%s | Kompensa",
  },
  description:
    "Kompensa — panel de gestión de órdenes de transmisión y certificación publicitaria",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connection();
  const nonce = (await headers()).get("x-nonce") || undefined;
  const cookieStore = await cookies();
  const initialResolved =
    getResolvedThemeFromCookie(
      cookieStore.get(RESOLVED_THEME_COOKIE)?.value,
    ) ?? "light";

  return (
    <html lang="es" className="h-full" suppressHydrationWarning>
      <head>
        <script
          suppressHydrationWarning
          {...(nonce ? { nonce } : {})}
          dangerouslySetInnerHTML={{ __html: buildThemeInitScript() }}
        />
      </head>
      <body className="bg-background text-on-background text-body-lg overflow-hidden flex h-screen transition-colors duration-200">
        <MuiProvider nonce={nonce}>
          <ThemeProvider initialResolved={initialResolved}>
            {children}
          </ThemeProvider>
        </MuiProvider>
      </body>
    </html>
  );
}
