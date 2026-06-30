import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { MuiProvider } from "@/components/providers/MuiProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { themeInitScript } from "@/lib/theme/apply";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["500"],
});

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${hankenGrotesk.variable} ${jetbrainsMono.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-background text-on-background text-body-lg overflow-hidden flex h-screen transition-colors duration-200">
        <MuiProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </MuiProvider>
      </body>
    </html>
  );
}
