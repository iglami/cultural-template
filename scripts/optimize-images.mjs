/**
 * Script de optimización de imágenes
 *
 * Uso: node scripts/optimize-images.mjs
 *
 * Lee los originales de `assets/` y escribe las versiones optimizadas en
 * `public/obras/`, para que el export estático las sirva tal cual
 * (`images.unoptimized: true`: no hay pipeline de Next detrás).
 *
 * Reglas:
 * - Redimensiona a un máximo de 1600 px de ancho, sin agrandar nunca.
 * - **Conserva el formato real del archivo**, detectado por Sharp, no el que
 *   implica su extensión. Un JPEG disfrazado de `.png` se escribe como `.jpg`
 *   y se avisa, en vez de quedar con bytes de JPEG dentro de un `.png`.
 * - Un PNG conserva su alfa: no se reempaqueta como JPEG (eso pintaría de
 *   negro los logos transparentes).
 * - Calidad 80 en con pérdida, progresivo y mozjpeg para JPEG.
 * - Los originales en `assets/` no se tocan.
 *
 * Sale con código 1 si algún archivo falló, para que un CI lo note.
 */

import sharp from "sharp";
import fs from "fs";
import path from "path";

const INPUT_DIR = path.join(process.cwd(), "assets");
const OUTPUT_DIR = path.join(process.cwd(), "public", "obras");
const MAX_WIDTH = 1600;
const QUALITY = 80;

/** Lo que sabemos optimizar bien, y con qué opciones. */
const FORMATOS = {
  jpeg: { ext: "jpg", opciones: () => ({ quality: QUALITY, progressive: true, mozjpeg: true }) },
  png: { ext: "png", opciones: () => ({ compressionLevel: 9, effort: 8 }) },
  webp: { ext: "webp", opciones: () => ({ quality: QUALITY, effort: 6 }) },
};

/** Extensiones que son compatibles con cada formato real. `x.jpeg` y `x.jpg`
 *  son ambas JPEG; un `.png` con bytes de JPEG no. */
const EXTENSIONES_COMPATIBLES = {
  jpeg: ["jpg", "jpeg"],
  png: ["png"],
  webp: ["webp"],
};

const esCandidata = (nombre) => /\.(jpe?g|png|webp)$/i.test(nombre);

/** "foto.PNG" → { base: "foto", ext: "png" } */
function separar(nombre) {
  const ext = path.extname(nombre).slice(1).toLowerCase();
  return { base: nombre.slice(0, nombre.length - ext.length - 1), ext };
}

async function optimizarUna(inputPath, outputPath, formato) {
  const config = FORMATOS[formato];
  const pipeline = sharp(inputPath, { failOn: "error" }).resize({
    width: MAX_WIDTH,
    fit: "inside",
    withoutEnlargement: true,
  });
  await pipeline
    [formato === "jpeg" ? "jpeg" : formato](config.opciones())
    .toFile(outputPath);
}

async function optimizeImages() {
  if (!fs.existsSync(INPUT_DIR)) {
    console.log("No se encontró el directorio assets/");
    console.log("Coloca las imágenes originales en assets/ y ejecuta este script.");
    return 0;
  }

  const archivos = fs.readdirSync(INPUT_DIR).filter(esCandidata);
  const descartados = fs
    .readdirSync(INPUT_DIR)
    .filter((f) => fs.statSync(path.join(INPUT_DIR, f)).isFile() && !esCandidata(f));
  if (descartados.length > 0) {
    console.log(
      `Ignorados (no son jpg/png/webp; los SVG se copian a mano a public/obras/): ${descartados.join(", ")}`,
    );
  }
  if (archivos.length === 0) {
    console.log("No se encontraron imágenes en assets/");
    return 0;
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`Optimizando ${archivos.length} imágenes de assets/ → public/obras/`);

  let errores = 0;
  const renombradas = [];

  for (const archivo of archivos) {
    const inputPath = path.join(INPUT_DIR, archivo);

    let metadata;
    try {
      metadata = await sharp(inputPath, { failOn: "error" }).metadata();
    } catch (e) {
      console.error(`✗ ${archivo}: no se pudo leer (${e.message})`);
      errores++;
      continue;
    }

    const real = metadata.format;
    if (!FORMATOS[real]) {
      console.error(
        `✗ ${archivo}: formato real «${real}» no soportado. Convertilo a jpg, png o webp y volvé.`,
      );
      errores++;
      continue;
    }

    const { base, ext } = separar(archivo);
    // La extensión declarada solo se conserva si es compatible con lo que el
    // archivo ES. Si miente (JPEG con .png), se normaliza a la del formato real.
    const compatible = (EXTENSIONES_COMPATIBLES[real] ?? []).includes(ext);
    const salidaNombre = compatible ? archivo : `${base}.${FORMATOS[real].ext}`;
    const outputPath = path.join(OUTPUT_DIR, salidaNombre);

    if (salidaNombre !== archivo) {
      console.log(
        `⚠ ${archivo} tiene bytes de ${real}: se escribe como ${salidaNombre}`,
      );
      renombradas.push({ antes: archivo, despues: salidaNombre });
    }

    try {
      await optimizarUna(inputPath, outputPath, real);
    } catch (e) {
      console.error(`✗ Error optimizando ${archivo}: ${e.message}`);
      errores++;
      continue;
    }

    const antes = fs.statSync(inputPath).size;
    const despues = fs.statSync(outputPath).size;
    const ahorro = ((1 - despues / antes) * 100).toFixed(1);
    const alfa = metadata.hasAlpha ? "  (conserva alfa)" : "";
    console.log(
      `✓ ${archivo} → ${salidaNombre}: ${(antes / 1024).toFixed(0)}KB → ${(despues / 1024).toFixed(0)}KB (${ahorro}%)${alfa}`,
    );
  }

  console.log("\nOptimización completada.");

  if (renombradas.length > 0) {
    console.log(
      "\nActualizá estas rutas en src/content/content.json (y en assets/ si querés que coincida el nombre del original):",
    );
    for (const { antes, despues } of renombradas) {
      console.log(`  /obras/${antes}  →  /obras/${despues}`);
    }
  }

  if (errores > 0) {
    console.error(`\n${errores} archivo(s) no se pudieron optimizar.`);
  }
  return errores > 0 ? 1 : 0;
}

process.exitCode = await optimizeImages();
