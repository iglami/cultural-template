/**
 * Genera los íconos de la aplicación desde assets/marca-plantilla.svg.
 *
 * Uso: npm run make-icons
 *
 * Requisitos: ImageMagick 7 (`magick`) en PATH.
 *
 * Escribe en src/app/, la carpeta de convenciones de metadatos de Next:
 *   - favicon.ico    → 16/32/48 px, multipropósito
 *   - icon.svg       → vector nítido para navegadores modernos
 *   - apple-icon.png → 180×180 px para la pantalla de inicio de iOS
 *
 * Next agrega solo los <link> correspondientes; por eso layout.tsx no debe
 * declarar favicon ni apple-touch-icon a mano. Para cambiar la marca, edite el
 * SVG de origen y vuelva a ejecutar este script.
 */

import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, readFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
const ORIGEN = join(RAIZ, "assets", "marca-plantilla.svg");
const DESTINO = join(RAIZ, "src", "app");

if (!readFileSync(ORIGEN, "utf8").includes("<svg")) {
  throw new Error(`no se encontró SVG válido en ${ORIGEN}`);
}
mkdirSync(DESTINO, { recursive: true });

/** Rasteriza el SVG a un tamaño concreto, sin fondo propio (el SVG ya lo tiene). */
function png(tamano) {
  const ruta = join(DESTINO, `_raster-${tamano}.png`);
  execFileSync("magick", ["-background", "none", "-density", "512", ORIGEN, "-resize", `${tamano}x${tamano}`, ruta]);
  return ruta;
}

const p16 = png(16);
const p32 = png(32);
const p48 = png(48);
execFileSync("magick", [p16, p32, p48, join(DESTINO, "favicon.ico")]);

const apple = png(180);
execFileSync("magick", [apple, "-strip", join(DESTINO, "apple-icon.png")]);

copyFileSync(ORIGEN, join(DESTINO, "icon.svg"));

for (const temporal of [p16, p32, p48, apple]) {
  unlinkSync(temporal);
}

const resumen = [
  ["favicon.ico", 3],
  ["icon.svg", null],
  ["apple-icon.png", 180],
];
for (const [nombre, px] of resumen) {
  const bytes = readFileSync(join(DESTINO, nombre)).byteLength;
  console.log(`✓ src/app/${nombre}  ${Math.round(bytes / 1024)} KB${px ? ` (${px}px)` : ""}`);
}
