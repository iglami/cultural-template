/**
 * Descarga imágenes de ejemplo desde The Met Open Access (dominio público, CC0).
 *
 * Uso: npm run fetch-images
 *
 * Requisitos: ImageMagick 7 en PATH (comando `magick`) para recortar y optimizar.
 *
 * Cada entrada de MANIFIESTO declara el objectID de The Met, el destino y el
 * encuadre. La corrida sobrescribe public/obras/ y escribe CREDITS.json con los
 * datos de licencia de cada obra, leídos de la API en el momento de la descarga.
 * Para usar otras obras, cambie los objectID o agregue entradas nuevas.
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const API = "https://collectionapi.metmuseum.org/public/collection/v1";
const SALIDA = join(process.cwd(), "public", "obras");
const TMP_DIR = join(tmpdir(), "met-plantilla");

/** @typedef {{destino: string, objectID: number, ancho: number, alto: number, gravedad: string, pesoMaxKB: number}} Entrada */

/** @type {Entrada[]} */
const MANIFIESTO = [
  // Banner del hero: 16:10, coincide con .hero__media img { aspect-ratio: 16/10 }.
  // Es el elemento LCP. En desktop el contenedor mide ~576px de ancho; 1280 cubre
  // dos densidades de píxel sin inflar el peso, y permite calidad alta.
  { destino: "hero.jpg", objectID: 788240, ancho: 1280, alto: 800, gravedad: "Center", pesoMaxKB: 240 },
  // Obra de cartelera y galería: 4:3, coincide con .evento__media y .obra img.
  { destino: "obra1.jpg", objectID: 547953, ancho: 800, alto: 600, gravedad: "Center", pesoMaxKB: 140 },
  // Retrato del equipo: recorte circular con .miembro__foto { border-radius: 50% }.
  { destino: "artista1.jpg", objectID: 374052, ancho: 600, alto: 600, gravedad: "North", pesoMaxKB: 120 },
];

const MAX_BYTES_ENTRADA = 25 * 1024 * 1024;
/** Escalera de calidad JPEG: se usa la primera que entra en el presupuesto de peso. */
const CALIDADES = [82, 78, 72, 66, 60];

/** Descarga un objeto JSON de la API. */
async function api(ruta) {
  const respuesta = await fetch(`${API}${ruta}`);
  if (!respuesta.ok) throw new Error(`${ruta} → HTTP ${respuesta.status}`);
  return respuesta.json();
}

/** Descarga una imagen con tope de peso, valida que sea JPEG y devuelve bytes. */
async function descargar(url) {
  const respuesta = await fetch(url);
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status} en ${url}`);
  const declarado = Number(respuesta.headers.get("content-length") ?? 0);
  if (declarado > MAX_BYTES_ENTRADA) {
    throw new Error(`origen demasiado pesado: ${(declarado / 1024 / 1024).toFixed(1)} MB`);
  }
  const tipo = respuesta.headers.get("content-type") ?? "";
  if (!tipo.startsWith("image/")) throw new Error(`content-type inesperado: ${tipo}`);
  const bytes = new Uint8Array(await respuesta.arrayBuffer());
  if (bytes.byteLength > MAX_BYTES_ENTRADA) {
    throw new Error(`descarga fuera de límite: ${(bytes.byteLength / 1024 / 1024).toFixed(1)} MB`);
  }
  const cabecera = bytes.slice(0, 3);
  const esJpeg = cabecera[0] === 0xff && cabecera[1] === 0xd8 && cabecera[2] === 0xff;
  if (!esJpeg) throw new Error("la imagen no es JPEG");
  return Buffer.from(bytes);
}

/** Recorta por gravedad, reescala y elige la calidad que entra en el presupuesto. */
function procesar(entradaBytes, destino, ancho, alto, gravedad, pesoMaxKB) {
  const temporal = join(TMP_DIR, `met-${Date.now()}`);
  writeFileSync(temporal, Buffer.from(entradaBytes));
  const destinoAbsoluto = join(SALIDA, destino);
  let elegida = CALIDADES[CALIDADES.length - 1];
  try {
    for (const calidad of CALIDADES) {
      execFileSync(
        "magick",
        [
          temporal,
          "-auto-orient",
          "-gravity",
          gravedad,
          "-resize",
          `${ancho}x${alto}^`,
          "-extent",
          `${ancho}x${alto}`,
          "-strip",
          "-interlace",
          "Plane",
          "-quality",
          String(calidad),
          `JPEG:${destinoAbsoluto}`,
        ],
        { stdio: ["ignore", "pipe", "pipe"], maxBuffer: 16 * 1024 * 1024 },
      );
      const peso = readFileSync(destinoAbsoluto).byteLength;
      elegida = calidad;
      if (peso <= pesoMaxKB * 1024) break;
    }
  } finally {
    unlinkSync(temporal);
  }
  return { ruta: destinoAbsoluto, calidad: elegida };
}

async function principal() {
  mkdirSync(SALIDA, { recursive: true });
  mkdirSync(TMP_DIR, { recursive: true });
  const creditos = [];

  for (const entrada of MANIFIESTO) {
    const obra = await api(`/objects/${entrada.objectID}`);
    if (obra.isPublicDomain !== true) {
      throw new Error(`objectID ${entrada.objectID} no es de dominio público; no se descarga`);
    }
    const urlImagen = obra.primaryImage || obra.primaryImageSmall;
    if (!urlImagen) throw new Error(`objectID ${entrada.objectID} no tiene imagen`);

    const bytes = await descargar(urlImagen);
    const { ruta, calidad } = procesar(
      bytes,
      entrada.destino,
      entrada.ancho,
      entrada.alto,
      entrada.gravedad,
      entrada.pesoMaxKB,
    );
    const peso = readFileSync(ruta).byteLength;
    const pesoKB = Math.round(peso / 1024);

    const cruce = {
      destino: entrada.destino,
      objectID: entrada.objectID,
      titulo: obra.title ?? null,
      artista: obra.artistDisplayName || null,
      nacionalidadArtista: obra.artistNationality || null,
      fechaObra: obra.objectDate || null,
      tecnica: obra.medium || null,
      departamento: obra.department || null,
      licencia: "CC0 1.0 Universal — dominio público (The Metropolitan Museum of Art Open Access)",
      coleccion: obra.repository || "The Metropolitan Museum of Art",
      paginaObra: obra.objectURL || null,
      imagenOriginal: urlImagen,
      procesada: `${entrada.ancho}x${entrada.alto}px, recorte ${entrada.gravedad}, JPEG calidad ${calidad}`,
      pesoFinalKB: pesoKB,
      presupuestoKB: entrada.pesoMaxKB,
    };
    creditos.push(cruce);
    const alerta = pesoKB > entrada.pesoMaxKB ? ` ⚠ supera el presupuesto de ${entrada.pesoMaxKB} KB` : "";
    console.log(`✓ ${cruce.destino}  ${entrada.ancho}x${entrada.alto}  ${pesoKB} KB  q${calidad} ← objectID ${entrada.objectID} (${cruce.titulo})${alerta}`);
  }

  writeFileSync(
    join(SALIDA, "CREDITS.json"),
    JSON.stringify(
      {
        fuente: "The Metropolitan Museum of Art — Open Access (https://metmuseum.org/openaccess)",
        nota: "Imágenes de dominio público dedicadas por CC0. Se permiten uso, modificación y redistribución sin permiso.",
        generadasPor: "scripts/fetch-sample-images.mjs",
        obras: creditos,
      },
      null,
      2,
    ) + "\n",
    "utf8",
  );

  console.log(`\npublic/obras/ actualizado y CREDITS.json escrito (${creditos.length} obras).`);
}

principal().catch((error) => {
  console.error(`✗ ${error.message}`);
  process.exitCode = 1;
});
