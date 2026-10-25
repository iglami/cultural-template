/**
 * nuevo-cliente — instancia un sitio para un cliente desde la plantilla.
 *
 * Uso:
 *   npm run nuevo-cliente -- --nombre "Compañía de Teatro X"
 *   npm run nuevo-cliente -- --nombre "X" --locale es-AR --force
 *
 * Por defecto NO escribe nada: imprime el plan (dry-run). Con `--force` aplica.
 *
 * Qué hace:
 *   1. Borra las imágenes de ejemplo de public/obras/ (The Met, CC0) y deja
 *      CREDITS.json como plantilla vacía para las imágenes del cliente.
 *   2. Resetea src/content/content.json: misma estructura, textos como
 *      placeholders `[...]`, rutas de imagen vacías (los componentes ya las
 *      omiten), marca y locale del cliente estampados.
 *   3. Crea .env.local con las variables de dominio comentadas, si no existe.
 *
 * Qué NO hace (a propósito):
 *   - No toca los íconos de marca (src/app/{favicon.ico,icon.svg,apple-icon.png})
 *     ni assets/marca-plantilla.svg: borrarlos dejaría el sitio sin favicon.
 *     Los lista como pendiente para que `npm run make-icons` los regenere con
 *     el logo del cliente.
 *   - No commitea nada.
 *
 * Los placeholders usan `[corchetes]` a propósito: es una marca detectable a
 * máquina, pensada para que una puerta de build pueda negarse a publicar un
 * sitio que todavía los tenga.
 */
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENIDO = join(RAIZ, "src/content/content.json");
const OBRAS = join(RAIZ, "public/obras");
const CREDITS = join(OBRAS, "CREDITS.json");
const ENV_LOCAL = join(RAIZ, ".env.local");

const EXTENSIONES_IMAGEN = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"];

/* ── argumentos ─────────────────────────────────────────────── */

function argumentos(argv) {
  const opts = { nombre: "", locale: "", force: false, forzar: false, ayuda: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--nombre") opts.nombre = String(argv[++i] ?? "").trim();
    else if (a === "--locale") opts.locale = String(argv[++i] ?? "").trim();
    else if (a === "--force") opts.force = true;
    else if (a === "--forzar") opts.forzar = true;
    else if (a === "--help" || a === "--ayuda") opts.ayuda = true;
    else {
      console.error(`✗ argumento desconocido: ${a}`);
      process.exit(2);
    }
  }
  return opts;
}

const opts = argumentos(process.argv.slice(2));

if (opts.ayuda) {
  console.log(
    [
      "Uso: npm run nuevo-cliente -- --nombre \"Nombre del cliente\" [--locale es-CL] [--force]",
      "",
      "  --nombre   Obligatorio. Nombre de la organización; se estampa en brand.nombre,",
      "             meta.title y footer.legal.",
      "  --locale   Opcional. BCP 47 (es-CL, es-AR, es-MX, en-US...). Por defecto deja",
      "             el que trae content.json.",
      "  --force    Aplica los cambios. Sin esta bandera solo imprime el plan.",
      "  --forzar   Salta las guardas (estar en la plantilla, o content.json sucio).",
      "",
      "No commitea nada: revisá con git diff y commiteá vos.",
    ].join("\n"),
  );
  process.exit(0);
}

/* ── guardas ────────────────────────────────────────────────── */

function git(...args) {
  const r = spawnSync("git", args, { cwd: RAIZ, encoding: "utf8" });
  return { ok: r.status === 0, salida: (r.stdout || "").trim() };
}

const origen = git("remote", "get-url", "origin").salida;
const enLaPlantilla = /cultural-template(\.git)?\/?$/i.test(origen);

if (enLaPlantilla && !opts.forzar) {
  console.error(
    [
      "✗ Estás en la PLANTILLA (origin = cultural-template).",
      "  Este script borra el contenido de ejemplo que la plantilla necesita para",
      "  demostrar cómo se ve el sitio.",
      "",
      "  Creá primero el repo del cliente con GitHub → «Use this template», clonalo",
      "  y correlo ahí. Si de verdad querés resetear la plantilla, agregá --forzar.",
    ].join("\n"),
  );
  process.exit(1);
}

if (!opts.nombre) {
  console.error(
    '✗ falta --nombre.\n  Ejemplo: npm run nuevo-cliente -- --nombre "Compañía de Teatro X"',
  );
  process.exit(2);
}

const sucio = git("status", "--porcelain", "src/content/content.json", "public/obras").salida;
if (sucio && !opts.forzar) {
  console.error(
    [
      "✗ Hay cambios sin commitear en lo que este script sobrescribe:",
      ...sucio.split("\n").map((l) => `    ${l}`),
      "",
      "  Commiteá o descartá primero (perderías ese trabajo), o agregá --forzar.",
    ].join("\n"),
  );
  process.exit(1);
}

/* ── placeholders ───────────────────────────────────────────── */

/**
 * Placeholder por ruta. Las rutas de arrays usan `[]` para el elemento, así la
 * tabla sigue sirviendo aunque el cliente tenga 1 o 20 obras.
 */
const PLACEHOLDERS = {
  "meta.title": `[Título SEO — ${opts.nombre || "Nombre"}: propuesta en ~60 caracteres]`,
  "meta.description": "[Descripción SEO en ~155 caracteres]",
  "meta.keywords": "[palabra 1, palabra 2, palabra 3]",
  "brand.tagline": "[Frase que define la propuesta artística]",
  "hero.titulo[]": "[Línea 1]",
  "hero.subtitulo": "[Bajada de la portada]",
  "hero.accion": "[Texto del botón]",
  "cartelera.titulo": "[Título de la sección de cartelera]",
  "cartelera.eventos[].titulo": "[Nombre de la obra o función]",
  "cartelera.eventos[].fecha": "[AAAA-MM-DD]",
  "cartelera.eventos[].hora": "[HH:MM]",
  "cartelera.eventos[].lugar": "[Sala y ciudad]",
  "cartelera.eventos[].descripcion": "[Descripción breve de la obra y su elenco]",
  "cartelera.eventos[].precio": "[Precio, o Gratis]",
  "obras.titulo": "[Título de la sección de obras]",
  "obras.descripcion": "[Descripción de la sección de obras]",
  "obras.hoja[].cap": "[Título de la obra, año]",
  "obras.hoja[].tipo": "[Teatro / Danza / Música]",
  "obras.hoja[].director": "[Nombre de quien dirige]",
  "obras.hoja[].elenco": "[Elenco]",
  "equipo.titulo": "[Título de la sección de equipo]",
  "equipo.descripcion": "[Descripción de la sección de equipo]",
  "equipo.miembros[].nombre": "[Nombre y apellido]",
  "equipo.miembros[].rol": "[Rol en la compañía]",
  "equipo.miembros[].bio": "[Biografía breve]",
  "contacto.frase": "[Frase de contacto]",
  "contacto.correo": "[correo@dominio]",
  "contacto.telefono": "[+56 9 XXXX XXXX]",
  "contacto.direccion": "[Dirección, ciudad]",
  "contacto.horario": "[Horario de atención]",
  "contacto.nota": "[Nota opcional]",
  "footer.descripcion": "[Descripción de la organización para el pie]",
  "footer.direccion": "[Dirección]",
  "footer.creditos.texto": "[Crédito de las imágenes]",
};

/** Placeholders que dependen de la posición dentro del array. */
const INDEXADOS = {
  "hero.titulo[]": (i) => `[Línea ${i + 1}]`,
};

/** Claves cuya ruta termina acá y que son imagen o URL: van vacías, no con placeholder. */
const VACIAS = new Set(["src", "imagen", "foto", "entradas", "url"]);

/** Estas se conservan: son estructura o tema, no contenido del cliente. */
function conservar(ruta, clave, valor) {
  if (ruta === "nav" || ruta.startsWith("nav[]")) return true; // anclas internas
  if (clave === "href") return true;
  if (clave === "locale") return true;
  if (clave.startsWith("color") || clave.startsWith("tipografia")) return true;
  if (typeof valor === "number" || typeof valor === "boolean") return true;
  if (typeof valor === "string" && /^#[0-9a-fA-F]{3,8}$/.test(valor)) return true;
  // aspect-ratio ("4/3", "16 / 9"): es una pista de maquetación y un placeholder
  // con corchetes sería un valor CSS inválido.
  if (typeof valor === "string" && /^\d+(\.\d+)?\s*\/\s*\d+(\.\d+)?$/.test(valor.trim())) return true;
  return false;
}

function vaciar(valor, ruta, clave, indice = null) {
  if (conservar(ruta, clave, valor)) return valor;

  if (Array.isArray(valor)) {
    // Arrays de objetos (eventos, obras, miembros): queda UN elemento de molde.
    // Arrays de strings (hero.titulo): se conservan las líneas.
    const items = valor.length && typeof valor[0] === "object" ? valor.slice(0, 1) : valor;
    return items.map((v, i) => vaciar(v, `${ruta}[]`, `${clave}[]`, i));
  }

  if (valor && typeof valor === "object") {
    const out = {};
    for (const [k, v] of Object.entries(valor)) out[k] = vaciar(v, ruta ? `${ruta}.${k}` : k, k);
    return out;
  }

  if (typeof valor === "string") {
    if (VACIAS.has(clave)) return "";
    if (clave === "alt") return ""; // altDe() usa el respaldo visible
    const normal = ruta.replace(/\[\d+\]/g, "[]");
    if (indice !== null && INDEXADOS[normal]) return INDEXADOS[normal](indice);
    return PLACEHOLDERS[normal] ?? `[${clave}]`;
  }

  return valor;
}

/* ── plan ───────────────────────────────────────────────────── */

if (!existsSync(CONTENIDO)) {
  console.error(`✗ no encuentro ${relative(RAIZ, CONTENIDO)}`);
  process.exit(1);
}

const original = JSON.parse(readFileSync(CONTENIDO, "utf8"));
const anio = new Date().getFullYear();
const localeActual = typeof original?.meta?.locale === "string" ? original.meta.locale : "es-CL";
const localeFinal = opts.locale || localeActual;

const nuevo = vaciar(original, "", "");
// Estampar lo que sí sabemos del cliente.
nuevo.brand.nombre = opts.nombre;
nuevo.meta.title = `[Título SEO — ${opts.nombre}: propuesta en ~60 caracteres]`;
nuevo.meta.locale = localeFinal;
nuevo.footer.legal = `© ${anio} ${opts.nombre}. [Texto legal]`;
for (const red of Object.keys(nuevo.brand.redesSociales ?? {})) nuevo.brand.redesSociales[red] = "";

const imagenes = existsSync(OBRAS)
  ? readdirSync(OBRAS).filter((f) => EXTENSIONES_IMAGEN.some((e) => f.toLowerCase().endsWith(e)))
  : [];

const pendientesIconos = [
  "src/app/favicon.ico",
  "src/app/icon.svg",
  "src/app/apple-icon.png",
  "assets/marca-plantilla.svg",
].filter((p) => existsSync(join(RAIZ, p)));

console.log(`\n── nuevo-cliente: ${opts.nombre} ${opts.force ? "" : "(DRY-RUN, no escribe nada)"}──\n`);
console.log(`  origen git          : ${origen || "(sin remote)"}`);
console.log(`  locale              : ${localeActual} → ${localeFinal}`);
console.log(`  imágenes a borrar   : ${imagenes.length} en public/obras/`);
for (const f of imagenes) console.log(`      • ${f}`);
console.log(`  CREDITS.json        : se reescribe como plantilla vacía`);
console.log(`  content.json        : ${Object.keys(nuevo).length} secciones reseteadas a placeholders [..]`);
console.log(`  .env.local          : ${existsSync(ENV_LOCAL) ? "ya existe, no se toca" : "se crea con el dominio comentado"}`);
console.log(`\n  Quedan con la marca de la PLANTILLA (reemplazar con el logo del cliente):`);
for (const p of pendientesIconos) console.log(`      • ${p}`);

if (!opts.force) {
  console.log("\n  Nada de esto se aplicó. Revisá el plan y agregá --force para ejecutar.");
  console.log("  Vista previa de content.json reseteado:\n");
  console.log(JSON.stringify(nuevo, null, 2).split("\n").map((l) => `    ${l}`).join("\n"));
  process.exit(0);
}

/* ── aplicar ────────────────────────────────────────────────── */

mkdirSync(OBRAS, { recursive: true });
for (const f of imagenes) rmSync(join(OBRAS, f));

writeFileSync(
  CREDITS,
  JSON.stringify(
    {
      fuente: "[Completar: origen de las imágenes del cliente]",
      nota: "Cada imagen publicada necesita licencia verificable. La plantilla traía aquí las imágenes CC0 de The Met; npm run nuevo-cliente las borró.",
      generadasPor: "scripts/nuevo-cliente.mjs",
      obras: [],
    },
    null,
    2,
  ) + "\n",
);

writeFileSync(CONTENIDO, JSON.stringify(nuevo, null, 2) + "\n");

if (!existsSync(ENV_LOCAL)) {
  // Comentado a propósito: layout.tsx hace `new URL(siteUrl)` y un placeholder
  // con corchetes lanza TypeError ("Invalid URL"), lo que rompería el build.
  writeFileSync(
    ENV_LOCAL,
    [
      "# Dominio real del sitio. Descomentá cuando lo tengas (afecta canonical,",
      "# og:url y metadataBase). OJO: layout.tsx hace new URL(siteUrl), así que un",
      "# valor inválido rompe el build.",
      "# NEXT_PUBLIC_SITE_URL=https://dominio-del-cliente.cl",
      "",
      "# Solo si el sitio NO vive en la raíz (GitHub Pages de proyecto, por ejemplo).",
      "# NEXT_PUBLIC_BASE_PATH=/nombre-del-repo",
      "",
    ].join("\n"),
  );
}

const marcas = JSON.stringify(nuevo).match(/\[[^\]]*\]/g) ?? [];
console.log(`\n✓ Listo.`);
console.log(`  • borradas ${imagenes.length} imágenes de ejemplo`);
console.log(`  • content.json reseteado (${marcas.length} placeholders por completar)`);
console.log(`  • CREDITS.json vaciado`);
if (!existsSync(ENV_LOCAL)) console.log(`  • creado .env.local`);
console.log(
  [
    "",
    "Próximos pasos:",
    "  1. Completá src/content/content.json (buscá los [corchetes]).",
    "  2. Logo del cliente → assets/, después: npm run make-icons",
    "  3. Fotos originales → assets/, después: npm run optimize-images",
    "     (conserva PNG con alfa y WebP; los SVG hay que copiarlos a mano)",
    "  4. Descomentá NEXT_PUBLIC_SITE_URL en .env.local cuando tengas el dominio.",
    "  5. npm run build  → revisá que no queden placeholders visibles.",
    "",
    "Nada fue commiteado: revisá con git diff y commiteá vos.",
  ].join("\n"),
);
