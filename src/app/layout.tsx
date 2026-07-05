import type { Metadata } from "next";

import { connection } from "next/server";

import { headers } from "next/headers";

import { MuiProvider } from "@/components/providers/MuiProvider";

import { ThemeProvider } from "@/components/theme/ThemeProvider";

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



  return (

    <html

      lang="es"

      className="h-full"

      suppressHydrationWarning

    >

      <head>

        {/* Bloqueante, sin inline nonce — evita hydration mismatch; CSP: script-src 'self' */}

        <script src="/theme-init.js" />

      </head>

      <body className="bg-background text-on-background text-body-lg overflow-hidden flex h-screen transition-colors duration-200">

        <MuiProvider nonce={nonce}>

          <ThemeProvider>{children}</ThemeProvider>

        </MuiProvider>

      </body>

    </html>

  );

}


