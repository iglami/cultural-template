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
  const { fechaLarga } = await import("../src/lib/fecha.ts");
  const content = JSON.parse(
    readFileSync("src/content/content.json", "utf8"),
  ) as { cartelera: { eventos: { fecha: string }[] } };
  for (const evento of content.cartelera.eventos) {
    process.stdout.write(`${evento.fecha} → ${fechaLarga(evento.fecha)}\n`);
  }
  // Unitario del borde: fecha inexistente, y formato que no es ISO.
  process.stdout.write(`${fechaLarga("2026-02-30")}\n`);
  process.stdout.write(`${fechaLarga("15/11/2026")}\n`);
  process.exit(0);
}

const propio = fileURLToPath(import.meta.url);
const salidas = new Map<string, string>();
let fallos = 0;

for (const zona of ZONAS) {
  const r = spawnSync(
    process.execPath,
    ["--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", propio, "--hijo"],
    { encoding: "utf8", env: { ...process.env, TZ: zona }, cwd: "." },
  );
  if (r.status !== 0) {
    console.log(`FALLO ${zona} salió con código ${r.status}: ${r.stderr}`);
    fallos++;
    continue;
  }
  salidas.set(zona, r.stdout);
}

const [primera, ...restantes] = [...salidas.values()];
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
for (const evento of content.cartelera.eventos) {
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

if (fallos) {
  console.log(`\n✗ ${fallos} fallo(s) en prueba-fecha`);
  process.exit(1);
}
console.log(`\n✓ fecha idéntica en ${salidas.size} zonas horarias, sin Invalid Date`);
