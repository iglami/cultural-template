import type { Metadata } from "next";
import type { ReactNode } from "react";
import content from "@/content/content.json";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ejemplo.cl";
const ogImage = `${siteUrl}/obras/hero.jpg`;

export const metadata: Metadata = {
  title: content.meta.title,
  description: content.meta.description,
  keywords: content.meta.keywords,
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: content.meta.title,
    description: content.meta.description,
    url: siteUrl,
    siteName: content.brand.nombre,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: content.brand.tagline,
      },
    ],
    locale: "es_CL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: content.meta.title,
    description: content.meta.description,
    images: [ogImage],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
