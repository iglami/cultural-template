import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/**
 * Configuración flat de ESLint 9 (la forma que documenta Next 16:
 * node_modules/next/dist/docs/01-app/03-api-reference/05-config/03-eslint.md).
 *
 * Sin este archivo `npm run lint` fallaba con "ESLint couldn't find an
 * eslint.config.(js|mjs|cjs) file" y exit 2: ESLint 9 ya no lee `.eslintrc.*`,
 * así que el repo traía el comando roto desde el scaffold.
 *
 * `core-web-vitals` sube a error las reglas que afectan métricas de rendimiento;
 * `typescript` agrega las de typescript-eslint. Los ignores son los que
 * eslint-config-next usa por defecto: la salida del build no se lintea.
 */
export default defineConfig([
  ...nextVitals,
  ...nextTypescript,

  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),

  {
    rules: {
      // La plantilla exporta estáticamente con `images.unoptimized: true`, así que
      // next/image no optimiza nada: aporta una capa de JS y un wrapper por el
      // mismo resultado. `<img>` con width/height explícitos es lo correcto acá.
      // Se documenta en README → "Construcción y Despliegue".
      "@next/next/no-img-element": "off",
    },
  },
]);
