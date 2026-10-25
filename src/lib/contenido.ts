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
