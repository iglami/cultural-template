/**
 * Validación del tema antes de construir.
 *
 * Lee content.brand, construye el tema con las mismas reglas que usa el sitio y
 * escribe src/app/tema.module.css con una copia de las variables. Ese módulo no
 * se importa: existe para que el tema calculado quede revisable en el diff.
 *
 * Requiere Node 22.18 o superior, que ejecuta TypeScript de forma nativa
 * (type stripping), así que el script importa src/lib/tema.ts directamente en
 * vez de duplicar la lógica o de compilar antes.
 *
 * Se ejecuta como parte de `npm run build` (ver package.json).
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { ACENTOS, TIPOGRAFIAS, buildTheme } from "../src/lib/tema.ts";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const content = JSON.parse(
  readFileSync(join(raiz, "src/content/content.json"), "utf8"),
);

const tema = buildTheme(content.brand ?? {});

console.log("── Tema derivado de content.brand ──");
for (const [clave, valor] of Object.entries(tema.variables)) {
  console.log(`  ${clave}: ${valor}`);
}

if (tema.advertencias.length > 0) {
  console.warn("\n⚠ Advertencias de marca (se aplicaron valores por defecto):");
  for (const aviso of tema.advertencias) console.warn(`  • ${aviso}`);
} else {
  console.log("\n✓ Sin advertencias: todos los pares de color superan 4.5:1.");
}

console.log(
  `\nAcentos disponibles: ${Object.keys(ACENTOS).join(", ")}` +
    `\nTipografías disponibles: ${Object.keys(TIPOGRAFIAS).join(", ")}`,
);

// Copia revisable del tema calculado.
const css =
  "/* GENERADO por scripts/check-theme.mjs — no editar a mano.\n" +
  "   Refleja el tema que el build deriva de content.brand. */\n" +
  ":root {\n" +
  Object.entries(tema.variables)
    .map(([clave, valor]) => `  ${clave}: ${valor};`)
    .join("\n") +
  "\n}\n";
const destino = join(raiz, "src/app/tema.module.css");
writeFileSync(destino, css);
console.log(`\nEscrito: ${relative(raiz, destino)}`);
