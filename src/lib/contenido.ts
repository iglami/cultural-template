/**
 * Tipos y acceso a `content.json`.
 *
 * Los tipos se **derivan** del archivo de contenido en vez de escribirse a mano:
 * `typeof content.x` garantiza que no se desincronicen cuando un cliente agrega
 * o quita un campo. El precio es que un campo opcional en el JSON (por ejemplo
 * `alt`) pasa a ser obligatorio en el tipo si el archivo de ejemplo lo trae; por
 * eso las lecturas tolerantes (como `altDe`) reciben `unknown` y no estos tipos.
 */
import content from "@/content/content.json";
import { LOCALE_POR_DEFECTO } from "./fecha";

export type Marca = typeof content.brand;
export type Hero = typeof content.hero;
export type Cartelera = typeof content.cartelera;
export type Obras = typeof content.obras;
export type Equipo = typeof content.equipo;
export type Contacto = typeof content.contacto;
export type Pie = typeof content.footer;

export type EnlaceNav = (typeof content.nav)[number];
export type Evento = (typeof content.cartelera.eventos)[number];
export type Obra = (typeof content.obras.hoja)[number];
export type Miembro = (typeof content.equipo.miembros)[number];

/**
 * Locale del sitio, tolerante: si el cliente borra `meta.locale` o lo deja
 * vacío, se usa `LOCALE_POR_DEFECTO` en vez de romper el build.
 *
 * Es dato del cliente, no del motor: estaba hardcodeado en `fecha.ts` y en el
 * `openGraph` de `layout.tsx`, así que un sitio por cliente obligaba a editar
 * código y cada fork divergía de la plantilla en dos archivos del motor.
 */
export function localeDe(contenido: unknown): string {
  const meta = (contenido as { meta?: { locale?: unknown } })?.meta;
  return typeof meta?.locale === "string" && meta.locale.trim()
    ? meta.locale.trim()
    : LOCALE_POR_DEFECTO;
}

/**
 * `es-CL` → `es_CL`: Open Graph y Twitter piden el locale con guion bajo.
 */
export function localeOg(locale: string): string {
  return locale.replace(/-/g, "_");
}

/**
 * Valor válido para el atributo `lang` de `<html>`.
 *
 * Estaba hardcodeado como `"es"`: con `meta.locale` en `en-US` o `pt-BR` el
 * documento declaraba un idioma que no era, y un lector de pantalla pronunciaba
 * el texto con fonética española. `Intl.Locale` normaliza (`es_CL` → `es-CL`) y
 * lanza con una etiqueta inventada, caso en el que se usa el respaldo en vez de
 * publicar un `lang` inválido.
 */
export function langHtml(contenido: unknown): string {
  try {
    return new Intl.Locale(localeDe(contenido)).toString();
  } catch {
    return LOCALE_POR_DEFECTO;
  }
}

/**
 * Ruta de la imagen de portada, o `""` si todavía no hay.
 *
 * El `og:image` se derivaba de una ruta escrita a mano en `layout.tsx`
 * (`/obras/hero.jpg`). Al instanciar un sitio, `npm run nuevo-cliente` borra esa
 * imagen de ejemplo: el dato tiene que venir del contenido, o la tarjeta social
 * del cliente apunta a un archivo que no existe.
 */
export function imagenPortada(contenido: unknown): string {
  const src = (contenido as { hero?: { foto?: { src?: unknown } } })?.hero?.foto?.src;
  return typeof src === "string" ? src.trim() : "";
}

/**
 * Fuente única de navegación.
 *
 * Antes existían dos listas (`nav` para la cabecera y `footer.nav` para el pie)
 * que se editaban por separado: era posible publicar una cabecera que ofrecía
 * cuatro secciones y un pie que enlazaba a tres, sin que nada lo avisara. Ahora
 * el pie recibe la misma lista que la cabecera.
 *
 * Si un `content.json` viejo todavía trae `footer.nav`, se ignora y se avisa por
 * consola durante el build, con el detalle de si coincidía o no con `nav`.
 */
export function navegacion(contenido: unknown): EnlaceNav[] {
  const raiz = contenido as { nav?: EnlaceNav[]; footer?: { nav?: EnlaceNav[] } };
  const principal = Array.isArray(raiz?.nav) ? raiz.nav : [];
  const delPie = raiz?.footer?.nav;

  if (Array.isArray(delPie)) {
    const misma = JSON.stringify(delPie) === JSON.stringify(principal);
    console.warn(
      misma
        ? "aviso: content.json todavía trae footer.nav. Ya no se usa: el pie navega con la lista única `nav`. Podés borrar el campo."
        : `aviso: content.json trae footer.nav y NO coincide con nav. Se usa la lista única \`nav\` (${principal.length} enlaces) y se descarta footer.nav (${delPie.length} enlaces). Revisá si el pie pretendía mostrar algo distinto.`,
    );
  }

  return principal;
}
