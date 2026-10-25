/* ============================================================
   Fechas de la cartelera — render determinista

   `output: "export"` congela el HTML en tiempo de build. Si la fecha se
   formatea con la zona horaria del host, el mismo `content.json` publica
   días distintos según dónde se compile (en UTC daba 15, en Chile 14).

   Las fechas del JSON son **calendario**, no instantes: "2026-11-15" es el
   15 de noviembre en la sala, no la medianoche de un meridiano. Por eso se
   construye con Date.UTC y se formatea con timeZone: "UTC": el par calendario
   → nombre del día queda fijo y no depende de la máquina.

   Devuelve siempre una cadena, nunca un Date: el resultado no puede cambiar
   entre el render del servidor y el del navegador.
   ============================================================ */

const FECHA_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Locale del sitio. `es-CL` por defecto: es una suposición de país que la
 *  plantilla debería poder configurar; por ahora coincide con el resto del
 *  contenido de ejemplo. */
const LOCALE = "es-CL";

const FORMATO = new Intl.DateTimeFormat(LOCALE, {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * "2026-11-15" → "domingo, 15 de noviembre de 2026"
 *
 * Si el valor no es una fecha ISO válida o no existe en el calendario
 * (2026-02-30), devuelve un aviso visible en vez de `Invalid Date`.
 */
export function fechaLarga(fecha: string): string {
  const partes = FECHA_ISO.exec(String(fecha ?? "").trim());
  if (!partes) return `⚠️ Fecha inválida: «${fecha}» (usa AAAA-MM-DD)`;

  const anio = Number(partes[1]);
  const mes = Number(partes[2]);
  const dia = Number(partes[3]);
  const calendario = new Date(Date.UTC(anio, mes - 1, dia));

  const inexistente =
    calendario.getUTCFullYear() !== anio ||
    calendario.getUTCMonth() !== mes - 1 ||
    calendario.getUTCDate() !== dia;
  if (inexistente) return `⚠️ Fecha inexistente: «${fecha}»`;

  return FORMATO.format(calendario);
}
