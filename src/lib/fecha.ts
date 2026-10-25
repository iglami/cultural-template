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

   El **locale no vive acá**: lo pasa quien llama, desde `content.meta.locale`.
   Estaba hardcodeado como `es-CL`, que es una suposición de país metida en un
   archivo del motor — en un sitio por cliente eso obligaba a editar código para
   cambiar el idioma, y cada fork divergía del template en este archivo.
   Tampoco se importa `content.json` desde acá a propósito: `scripts/prueba-
   fecha.mts` importa este módulo con ruta relativa en Node puro, donde el alias
   `@/` no resuelve.
   ============================================================ */

const FECHA_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Locale de respaldo cuando `content.meta.locale` falta, está vacío o es inválido. */
export const LOCALE_POR_DEFECTO = "es-CL";

const OPCIONES = {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
} as const;

/** Un `DateTimeFormat` por locale: construirlo es caro y el sitio usa uno solo. */
const formatos = new Map<string, Intl.DateTimeFormat>();
const yaAvisados = new Set<string>();

function formatoPara(locale: string): Intl.DateTimeFormat {
  const pedido = String(locale ?? "").trim() || LOCALE_POR_DEFECTO;

  const guardado = formatos.get(pedido);
  if (guardado) return guardado;

  let formato: Intl.DateTimeFormat;
  try {
    formato = new Intl.DateTimeFormat(pedido, OPCIONES);
  } catch {
    // `Intl.DateTimeFormat` tira RangeError con una etiqueta malformada
    // ("es_CL" con guion bajo, "español", ""). El build no debe caerse por un
    // dato editable a mano: se avisa una sola vez y se usa el respaldo.
    if (!yaAvisados.has(pedido)) {
      yaAvisados.add(pedido);
      console.warn(
        `aviso: locale «${pedido}» inválido (content.meta.locale); se usa ${LOCALE_POR_DEFECTO}.`,
      );
    }
    formato = new Intl.DateTimeFormat(LOCALE_POR_DEFECTO, OPCIONES);
  }

  formatos.set(pedido, formato);
  return formato;
}

/**
 * "2026-11-15" → "domingo, 15 de noviembre de 2026" (con `es-CL`)
 *
 * Si el valor no es una fecha ISO válida o no existe en el calendario
 * (2026-02-30), devuelve un aviso visible en vez de `Invalid Date`.
 */
export function fechaLarga(
  fecha: string,
  locale: string = LOCALE_POR_DEFECTO,
): string {
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

  return formatoPara(locale).format(calendario);
}
