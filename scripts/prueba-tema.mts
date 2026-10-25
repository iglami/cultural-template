/**
 * Prueba de las reglas de marca de src/lib/tema.ts.
 *
 * Cubre los presets, los alias antiguos, valores inválidos que no deben romper
 * nada, y marcas oscuras donde la inversión del pie cambia de dirección.
 *
 * Corre con Node 22.18 o superior (type stripping nativo):
 *   node scripts/prueba-tema.mts
 *
 * Sale con código 1 si algún par de color queda bajo su umbral, así que sirve
 * como puerta en CI sin depender de un framework de tests.
 */

import { ACENTOS, TIPOGRAFIAS, buildTheme, contraste } from "../src/lib/tema.ts";

/** Par [etiqueta, color, fondo, mínimo exigido]. */
interface Chequeo {
  etiqueta: string;
  a: (v: Record<string, string>) => string;
  b: (v: Record<string, string>) => string;
  minimo: number;
}

const CHEQUEOS: Chequeo[] = [
  // El texto principal debe leerse sobre el fondo y sobre la superficie de las tarjetas.
  { etiqueta: "texto/fondo", a: v => v["--color-texto"], b: v => v["--color-fondo"], minimo: 4.5 },
  { etiqueta: "texto/superficie", a: v => v["--color-texto"], b: v => v["--color-superficie"], minimo: 4.5 },
  { etiqueta: "secundario/fondo", a: v => v["--color-texto-secundario"], b: v => v["--color-fondo"], minimo: 4.5 },
  { etiqueta: "secundario/superficie", a: v => v["--color-texto-secundario"], b: v => v["--color-superficie"], minimo: 4.5 },
  // El acento se usa como texto (.evento__fecha, .miembro__rol, .btn--secundario)…
  { etiqueta: "acento/fondo", a: v => v["--color-acento"], b: v => v["--color-fondo"], minimo: 4.5 },
  // …y como fondo del botón primario, con texto encima.
  { etiqueta: "texto-boton/acento", a: v => v["--color-texto-sobre-acento"], b: v => v["--color-acento"], minimo: 4.5 },
  { etiqueta: "texto-pie/fondo-pie", a: v => v["--color-texto-pie"], b: v => v["--color-fondo-pie"], minimo: 4.5 },
  { etiqueta: "atenuado-pie/fondo-pie", a: v => v["--color-texto-pie-atenuado"], b: v => v["--color-fondo-pie"], minimo: 4.5 },
  { etiqueta: "acento-pie/fondo-pie", a: v => v["--color-acento-pie"], b: v => v["--color-fondo-pie"], minimo: 4.5 },
];

/** Los presets de acento prometen cumplir sobre el fondo por defecto. */
const CASOS: [string, Record<string, string>][] = [
  ["por defecto", {}],
  ...Object.keys(ACENTOS).map((k): [string, Record<string, string>] => [`acento ${k}`, { colorAcento: k }]),
  ...Object.keys(TIPOGRAFIAS).map((k): [string, Record<string, string>] => [`tipografía ${k}`, { tipografiaTitulos: k }]),
  ["hex libre válido", { colorAcento: "#8a6d1f" }],
  ["hex libre muy claro (se ajusta, no se descarta)", { colorAcento: "#ffd400" }],
  ["hex inválido (cae al preset)", { colorAcento: "rojo" }],
  ["hex corto (cae al preset)", { colorAcento: "#abc" }],
  ["acento vacío", { colorAcento: "" }],
  ["tipografía inexistente", { tipografiaTitulos: "Comic Sans" }],
  ["alias antiguos", { tipografiaTitulos: "serif", tipografiaCuerpo: "sans-serif" }],
  ["marca oscura", { colorFondo: "#12100e", colorTexto: "#f4efe6", colorAcento: "#e0a458" }],
  ["marca oscura con acento claro", { colorFondo: "#12100e", colorTexto: "#f4efe6", colorAcento: "#7ec8e3" }],
  ["amarillo sobre marca oscura", { colorFondo: "#12100e", colorTexto: "#f4efe6", colorAcento: "#ffd400" }],
  ["fondo inválido", { colorFondo: "blanco" }],
  ["texto claro sobre fondo claro", { colorTexto: "#9a9a9a" }],
  ["fondo y texto casi iguales", { colorFondo: "#dddddd", colorTexto: "#cccccc" }],
  ["gris sobre gris", { colorFondo: "#808080", colorTexto: "#707070", colorAcento: "#808080" }],
  ["todo inválido", { colorAcento: "x", colorFondo: "y", colorTexto: "z", tipografiaTitulos: "w" }],
];

let fallos = 0;
let avisosEsperados = 0;

for (const [nombre, brand] of CASOS) {
  const tema = buildTheme(brand);
  const v = tema.variables;
  const malos = CHEQUEOS.filter(c => {
    const r = contraste(c.a(v), c.b(v)) ?? 0;
    return r < c.minimo;
  });
  fallos += malos.length;

  const cab = `${malos.length === 0 ? "✓" : "✗"} ${nombre}`;
  console.log(
    `${cab.padEnd(52)} acento=${v["--color-acento"]} sobre-acento=${v["--color-texto-sobre-acento"]} peso=${v["--peso-titulos"]}`,
  );
  for (const c of malos) {
    console.log(
      `    FALLO ${c.etiqueta}: ${contraste(c.a(v), c.b(v))}:1 (mínimo ${c.minimo})  [${c.a(v)} sobre ${c.b(v)}]`,
    );
  }
  if (tema.advertencias.length) {
    avisosEsperados += tema.advertencias.length;
    for (const a of tema.advertencias) console.log(`    aviso: ${a}`);
  }
}

// Las redes: un campo vacío no debe generar enlace, y @usuario debe expandirse.
const { redesEnlaces } = await import("../src/lib/tema.ts");
const redes = redesEnlaces({
  instagram: "@nombre.organizacion",
  facebook: "",
  youtube: "https://youtube.com/@canal",
  tiktok: "usuario",
  pinterest: "no-existe-esta-red",
});
const redesOk =
  redes.length === 3 &&
  redes[0].url === "https://instagram.com/nombre.organizacion" &&
  redes[1].url === "https://youtube.com/@canal" &&
  redes[2].url === "https://tiktok.com/usuario";
if (!redesOk) fallos++;
console.log(`\n${redesOk ? "✓" : "✗"} redes: ${redes.length} enlaces (esperados 3: vacíos y claves desconocidas se ignoran)`);
for (const r of redes) console.log(`    ${r.etiqueta} → ${r.url}`);

console.log(`\n=== ${CASOS.length} combinaciones de marca · ${avisosEsperados} avisos · ${fallos} fallos ===`);
if (fallos > 0) {
  console.error(`\n✗ ${fallos} pares de contraste por debajo del umbral`);
  process.exit(1);
}
console.log("\n✓ Todos los pares de color cumplen su umbral de contraste.");
