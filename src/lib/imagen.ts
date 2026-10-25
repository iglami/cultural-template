/**
 * Texto alternativo de las imágenes (WCAG 1.1.1).
 *
 * `content.json` es la fuente de verdad y TypeScript infiere su tipo a partir
 * del propio archivo: si un cliente borra el campo `alt` de un registro, el
 * tipo inferido deja de tener esa propiedad y accederla rompe el build. Por eso
 * la lectura pasa por este helper, que acepta cualquier registro y nunca falla.
 *
 * Regla de uso: el `alt` propio del registro gana; si falta o está en blanco se
 * usa un respaldo visible (el título, el pie de foto, el nombre de la persona),
 * así ninguna imagen queda muda ante un lector de pantalla.
 */
export function altDe(registro: unknown, respaldo: string): string {
  const alt = (registro as { alt?: unknown } | null | undefined)?.alt;
  if (typeof alt === "string" && alt.trim()) return alt.trim();
  return respaldo;
}
