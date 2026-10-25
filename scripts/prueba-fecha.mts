/* ============================================================
   Prueba de CT-05 — la fecha de la cartelera no depende del host

   `output: "export"` congela el HTML en tiempo de build, así que una fecha
   que se formatea con la zona del servidor queda publicada con el día que
   tocaba en la máquina que compiló. Este script relanza la propia función
   dentro de varios TZ y compara las cadenas resultantes: tienen que ser
   idénticas, y coincidir con el día calendario escrito en content.json.

   Uso:  node scripts/prueba-fecha.mts
   ============================================================ */

import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ZONAS = [
  "America/Santiago",
  "America/Bogota",
  "America/Mexico_City",
  "America/New_York",
  "UTC",
  "Europe/Madrid",
  "Asia/Tokyo",
  "Pacific/Auckland",
];

if (process.argv[2] === "--hijo") {
  // Ramo del hijo: ya arrancó con TZ en el entorno, solo imprime la cadena.
  // argv[3] fuerza un locale distinto del de content.json (lo usa la prueba de
  // que el parámetro realmente se aplica y no se cuela el del host).
  const { fechaLarga, LOCALE_POR_DEFECTO } = await import("../src/lib/fecha.ts");
  const content = JSON.parse(
    readFileSync("src/content/content.json", "utf8"),
  ) as { meta?: { locale?: string }; cartelera: { eventos: { fecha: string }[] } };
  const locale =
    process.argv[3] || content.meta?.locale || LOCALE_POR_DEFECTO;
  for (const evento of content.cartelera.eventos) {
    process.stdout.write(`${evento.fecha} → ${fechaLarga(evento.fecha, locale)}\n`);
  }
  // Unitario del borde: fecha inexistente, y formato que no es ISO.
  process.stdout.write(`${fechaLarga("2026-02-30", locale)}\n`);
  process.stdout.write(`${fechaLarga("15/11/2026", locale)}\n`);
  // Fecha fija de referencia: no depende de lo que traiga content.json, así la
  // comprobación de locale sigue siendo válida en un sitio recién instanciado
  // (donde las fechas todavía son placeholders `[AAAA-MM-DD]`).
  process.stdout.write(`REF → ${fechaLarga("2026-11-15", locale)}\n`);
  process.exit(0);
}

const propio = fileURLToPath(import.meta.url);
const salidas = new Map<string, string>();
let fallos = 0;

for (const zona of ZONAS) {
  const r = spawnSync(
    process.execPath,
    ["--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", propio, "--hijo"],
    {
      encoding: "utf8",
      // LC_ALL/LANG en inglés a propósito: si `fechaLarga` dejara de recibir el
      // locale de content.json, `Intl` caería al del host y la comprobación de
      // meses en español de más abajo fallaría. Sin esto, la prueba pasaría en
      // verde aunque el locale se estuviera filtrando del entorno.
      env: { ...process.env, TZ: zona, LC_ALL: "en_US.UTF-8", LANG: "en_US.UTF-8" },
      cwd: ".",
    },
  );
  if (r.status !== 0) {
    console.log(`FALLO ${zona} salió con código ${r.status}: ${r.stderr}`);
    fallos++;
    continue;
  }
  salidas.set(zona, r.stdout);
}

const [primera] = [...salidas.values()];
if (!primera) {
  console.log("FALLO: ninguna zona produjo salida");
  process.exit(1);
}
for (const [zona, salida] of salidas) {
  if (salida !== primera) {
    console.log(`FALLO ${zona} difiere de ${[...salidas.keys()][0]}`);
    console.log(`  ${zona}: ${salida.trim().split("\n").join(" | ")}`);
    console.log(`  base  : ${primera.trim().split("\n").join(" | ")}`);
    fallos++;
  }
}

// El día calendario del JSON tiene que aparecer en el texto renderizado.
const content = JSON.parse(
  readFileSync("src/content/content.json", "utf8"),
) as { cartelera: { eventos: { fecha: string; titulo: string }[] } };
let omitidas = 0;
for (const evento of content.cartelera.eventos) {
  // Un sitio recién instanciado con `npm run nuevo-cliente` trae placeholders
  // `[AAAA-MM-DD]`: no hay calendario que comprobar, y no es un fallo de la
  // función. Se avisa en vez de poner la puerta en rojo por contenido ausente.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(evento.fecha ?? "").trim())) {
    omitidas++;
    continue;
  }
  const [, mes, dia] = evento.fecha.split("-").map(Number);
  const linea = primera.split("\n").find((l) => l.startsWith(`${evento.fecha} →`));
  if (!linea) {
    console.log(`FALLO: no se renderizó ${evento.fecha}`);
    fallos++;
    continue;
  }
  const texto = linea.split("→")[1];
  const numeroVisible = new RegExp(`(^|\\D)${dia}(\\D|$)`).test(texto);
  const MESES = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  const mesVisible = texto.includes(MESES[mes - 1]);
  if (!numeroVisible || !mesVisible) {
    console.log(`FALLO: ${evento.fecha} se lee «${texto}» y no coincide con el calendario`);
    fallos++;
  } else {
    console.log(`  ok  ${evento.fecha} →${texto}`);
  }
}
if (omitidas) {
  console.log(
    `  aviso  ${omitidas} fecha(s) de content.json no son AAAA-MM-DD ` +
      `(¿sitio recién instanciado?): se omitió su comprobación de calendario`,
  );
}

// Los bordes no pueden producir Invalid Date.
for (const mala of ["2026-02-30", "15/11/2026"]) {
  const linea = primera.split("\n").find((l) => l.includes(mala));
  const texto = linea ?? "";
  if (/invalid date/i.test(texto)) {
    console.log(`FALLO: «${mala}» se renderizó como Invalid Date`);
    fallos++;
  } else if (/⚠/.test(texto)) {
    console.log(`  ok  «${mala}» avisa en vez de Invalid Date`);
  } else {
    console.log(`FALLO: «${mala}» no produjo aviso: ${texto}`);
    fallos++;
  }
}

/* ── el locale tiene que venir del dato, no del host ──────────
   CT-12 sacó el locale hardcodeado del motor. Esta comprobación lo sostiene:
   el mismo content.json renderizado con otro locale tiene que dar OTRA cadena.
   Si alguien volviera a fijar el locale adentro de fecha.ts, las dos corridas
   saldrían iguales y esto se pondría rojo. */
function correrCon(locale: string): string {
  const r = spawnSync(
    process.execPath,
    ["--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", propio, "--hijo", locale],
    {
      encoding: "utf8",
      env: { ...process.env, TZ: "UTC", LC_ALL: "en_US.UTF-8", LANG: "en_US.UTF-8" },
      cwd: ".",
    },
  );
  if (r.status !== 0) {
    console.log(`FALLO corrida con locale «${locale}»: ${r.stderr}`);
    fallos++;
    return "";
  }
  // Se compara la línea REF (fecha fija), no las de content.json: en un sitio
  // recién instanciado las fechas son placeholders y el aviso «⚠️ Fecha
  // inválida» saldría idéntico en cualquier idioma, fingiendo que el locale no
  // se aplica.
  const linea = r.stdout.split("\n").find((l: string) => l.startsWith("REF →"));
  return (linea ?? "").replace("REF →", "").trim();
}

const refEs = correrCon("es-CL");
const refEn = correrCon("en-US");
if (refEs && refEn) {
  if (refEs === refEn) {
    console.log(
      "FALLO: es-CL y en-US producen la misma cadena — el locale se está ignorando",
    );
    fallos++;
  } else if (!/november|sunday|monday|tuesday|wednesday|thursday|friday|saturday/i.test(refEn)) {
    console.log(`FALLO: con en-US no salió texto en inglés: «${refEn}»`);
    fallos++;
  } else if (!/noviembre|domingo|lunes|martes|miércoles|jueves|viernes|sábado/i.test(refEs)) {
    console.log(`FALLO: con es-CL no salió texto en español: «${refEs}»`);
    fallos++;
  } else {
    console.log(`  ok  el locale manda, no el host: es-CL «${refEs}» / en-US «${refEn}»`);
  }
}

if (fallos) {
  console.log(`\n✗ ${fallos} fallo(s) en prueba-fecha`);
  process.exit(1);
}
console.log(`\n✓ fecha idéntica en ${salidas.size} zonas horarias, sin Invalid Date`);
