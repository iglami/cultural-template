/**
 * Script de optimización de imágenes
 * 
 * Uso: node scripts/optimize-images.mjs
 * 
 * Optimiza todas las imágenes en public/obras/ usando Sharp:
 * - Redimensiona a un máximo de 1600px de ancho
 * - Calidad 80% para JPEG
 * - Formato progresivo
 * - Mantiene las originales en assets/ si existen
 */

import sharp from "sharp";
import fs from "fs";
import path from "path";

const INPUT_DIR = path.join(process.cwd(), "assets");
const OUTPUT_DIR = path.join(process.cwd(), "public", "obras");
const MAX_WIDTH = 1600;
const QUALITY = 80;

async function optimizeImages() {
  if (!fs.existsSync(INPUT_DIR)) {
    console.log("No se encontró el directorio assets/");
    console.log("Coloca las imágenes originales en assets/ y ejecuta este script.");
    return;
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const files = fs.readdirSync(INPUT_DIR).filter((f) =>
    /\.(jpg|jpeg|png|webp)$/i.test(f)
  );

  if (files.length === 0) {
    console.log("No se encontraron imágenes en assets/");
    return;
  }

  console.log(`Optimizando ${files.length} imágenes...`);

  for (const file of files) {
    const inputPath = path.join(INPUT_DIR, file);
    const outputPath = path.join(OUTPUT_DIR, file);

    try {
      await sharp(inputPath)
        .resize(MAX_WIDTH, null, {
          withoutEnlargement: true,
          fit: "inside",
        })
        .jpeg({
          quality: QUALITY,
          progressive: true,
          mozjpeg: true,
        })
        .toFile(outputPath);

      const originalSize = fs.statSync(inputPath).size;
      const optimizedSize = fs.statSync(outputPath).size;
      const reduction = ((1 - optimizedSize / originalSize) * 100).toFixed(1);

      console.log(`✓ ${file}: ${(originalSize / 1024).toFixed(0)}KB → ${(optimizedSize / 1024).toFixed(0)}KB (${reduction}% reducción)`);
    } catch (error) {
      console.error(`✗ Error optimizando ${file}:`, error.message);
    }
  }

  console.log("\nOptimización completada.");
}

optimizeImages();
