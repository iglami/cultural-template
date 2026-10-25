import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import content from "@/content/content.json";
import { buildTheme, themeStyle } from "@/lib/tema";
import { imagenPortada, langHtml, localeDe, localeOg } from "@/lib/contenido";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ejemplo.cl";

/**
 * La imagen social sale de `hero.foto.src`, no de una ruta fija: al instanciar un
 * sitio `npm run nuevo-cliente` borra las imágenes de ejemplo, y un `og:image`
 * hardcodeado dejaría la tarjeta social del cliente apuntando a un 404.
 * Sin foto de portada no se declara `og:image` — mejor ninguna que una rota.
 */
const portada = imagenPortada(content);
const ogImage = portada
  ? `${siteUrl}${portada.startsWith("/") ? "" : "/"}${portada}`
  : "";

/**
 * Tema derivado de content.brand. Se calcula una sola vez en el servidor: el
 * sitio es una exportación estática, así que el resultado queda fijado en el
 * HTML y no hay costo en tiempo de ejecución ni parpadeo de estilos.
 */
const tema = buildTheme(content.brand);

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
    ...(ogImage
      ? {
          images: [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: content.brand.tagline,
            },
          ],
        }
      : {}),
    locale: localeOg(localeDe(content)),
    type: "website",
  },
  twitter: {
    // Sin foto de portada no tiene sentido pedir la tarjeta grande.
    card: ogImage ? "summary_large_image" : "summary",
    title: content.meta.title,
    description: content.meta.description,
    ...(ogImage ? { images: [ogImage] } : {}),
  },
  robots: {
    index: true,
    follow: true,
  },
  // Los íconos los resuelve Next desde src/app/ (favicon.ico, icon.svg,
  // apple-icon.png). Ver scripts/make-icons.mjs. No hace falta declararlos a mano.
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml", sizes: "any" }],
    shortcut: ["/favicon.ico"],
  },
};

export const viewport: Viewport = {
  // El color de la barra del navegador sigue al acento de la marca.
  themeColor: tema.variables["--color-acento"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang={langHtml(content)} style={themeStyle(tema)}>
      <head>
        {/*
          Tipografías: Gambarino y General Sans son de Fontshare (Indian Type
          Foundry). Su licencia permite uso comercial gratuito pero PROHÍBE
          redistribuir los archivos, así que se sirven desde el CDN de Fontshare
          y no se commitean en el repositorio. Playfair Display, Inter y JetBrains
          Mono son la alternativa bajo SIL OFL, cargadas en segundo plano por si
          el CDN falla.
        */}
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/*
          Fontshare sirve una sola familia por request: si se combinan dos
          parámetros f[] en la misma URL, el segundo se ignora en silencio.
          Por eso Gambarino y General Sans se cargan en hojas separadas.
        */}
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=gambarino@400&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap"
        />
        {/*
          Fallbacks de las tipografías del tema (ver src/lib/tema.ts): Playfair
          Display suple a Gambarino e Inter/JetBrains Mono son presets alternativos.

          La regla no-page-custom-font existe para pages/_document.js, donde un
          <link> de fuente puede quedar fuera del documento raíz y cargar en una
          sola página. Este archivo ES el layout raíz del App Router: el <head>
          se aplica a todas las rutas, que es justo lo que la regla pide. Se
          desactiva acá y no globalmente para que siga activa si alguien agrega
          una fuente dentro de una página.
        */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
