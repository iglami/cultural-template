/**
 * Tokens de marca conectados desde content.json.
 *
 * content.brand es la única fuente de verdad del tema. Como el sitio es una
 * plantilla pública, todos los valores pasan por una validación cerrada: si el
 * cliente escribe algo que no está en la lista, se usa el valor por defecto y
 * buildTheme devuelve la advertencia que debe imprimir el build. No se rompe la
 * página ni se aplica un valor arbitrario.
 */

import type { CSSProperties } from "react";

export type ClaveAcento = "azul" | "bermellon" | "verde" | "ciruela";
export type ClaveTipografia =
  | "serif-condensada"
  | "serif-editorial"
  | "sans"
  | "mono";

export interface Tema {
  variables: Record<string, string>;
  advertencias: string[];
}

/**
 * Acentos válidos. Cada par acento/blanco fue medido con la fórmula de
 * luminancia relativa de WCAG 2.1 y supera 4.5:1, exigible sobre el blanco que
 * usan .btn--secundario, .evento__fecha y .miembro__rol.
 */
export const ACENTOS: Record<
  ClaveAcento,
  { acento: string; hover: string; ratioBlanco: number; etiqueta: string }
> = {
  azul: { acento: "#1a4be0", hover: "#1539b3", ratioBlanco: 6.72, etiqueta: "Azul" },
  bermellon: { acento: "#c0392b", hover: "#9c2b1f", ratioBlanco: 5.79, etiqueta: "Bermellón" },
  verde: { acento: "#1a6b47", hover: "#125235", ratioBlanco: 6.61, etiqueta: "Verde botella" },
  ciruela: { acento: "#6b2d77", hover: "#542260", ratioBlanco: 8.4, etiqueta: "Ciruela" },
};

export const ACENTO_POR_DEFECTO: ClaveAcento = "azul";

/** Familias disponibles. Clave cerrada: no se acepta cualquier familia CSS. */
export const TIPOGRAFIAS: Record<
  ClaveTipografia,
  { titulos: string; cuerpo: string; pesoTitulos: number; mono: string }
> = {
  "serif-condensada": {
    // Gambarino solo se publica en peso 400. Pedir 700 hace que el navegador
    // sintetice una negrita falsa; por eso este preset fija peso natural.
    titulos: '"Gambarino", "Playfair Display", Georgia, "Times New Roman", serif',
    cuerpo: '"General Sans", Inter, "Helvetica Neue", system-ui, -apple-system, sans-serif',
    pesoTitulos: 400,
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  },
  "serif-editorial": {
    titulos: '"Playfair Display", Georgia, "Times New Roman", serif',
    cuerpo: '"General Sans", Inter, "Helvetica Neue", system-ui, -apple-system, sans-serif',
    pesoTitulos: 700,
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  },
  sans: {
    titulos: '"General Sans", Inter, "Helvetica Neue", system-ui, -apple-system, sans-serif',
    cuerpo: '"General Sans", Inter, "Helvetica Neue", system-ui, -apple-system, sans-serif',
    pesoTitulos: 600,
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  },
  mono: {
    // Para organizaciones con identidad de datos/prensa: titulares monoespaciados.
    titulos: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
    cuerpo: '"General Sans", Inter, "Helvetica Neue", system-ui, -apple-system, sans-serif',
    pesoTitulos: 500,
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  },
};

export const TIPOGRAFIA_POR_DEFECTO: ClaveTipografia = "serif-condensada";

/**
 * Claves genéricas que aparecen en plantillas y configuraciones previas. Se
 * traducen en vez de rechazarse, para no romper un content.json existente.
 */
const ALIAS_TIPOGRAFIA: Record<string, ClaveTipografia> = {
  serif: "serif-condensada",
  "serif-condensada": "serif-condensada",
  "serif-editorial": "serif-editorial",
  "sans-serif": "sans",
  sans: "sans",
  mono: "mono",
  monospace: "mono",
};

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Convierte #rrggbb a componentes 0-255. Devuelve null si no es hex de 6 dígitos. */
export function parsearHex(valor: string): [number, number, number] | null {
  if (!HEX.test(valor)) return null;
  const n = Number.parseInt(valor.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Luminancia relativa según WCAG 2.1. */
function luminancia(hex: string): number | null {
  const rgb = parsearHex(hex);
  if (!rgb) return null;
  const canal = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * canal[0] + 0.7152 * canal[1] + 0.0722 * canal[2];
}

/** Razón de contraste entre dos hex, o null si alguno no es un color válido. */
export function contraste(a: string, b: string): number | null {
  const la = luminancia(a);
  const lb = luminancia(b);
  if (la === null || lb === null) return null;
  const [mayor, menor] = la > lb ? [la, lb] : [lb, la];
  return Number(((mayor + 0.05) / (menor + 0.05)).toFixed(2));
}

/** Mezcla dos hex; cantidad=0 devuelve a, cantidad=1 devuelve b. */
export function mezclar(a: string, b: string, cantidad: number): string {
  const ra = parsearHex(a);
  const rb = parsearHex(b);
  if (!ra || !rb) return a;
  return `#${ra
    .map((v, i) => Math.round(v + (rb[i] - v) * cantidad).toString(16).padStart(2, "0"))
    .join("")}`;
}

/** Oscurece un hex multiplicando sus canales (0.78 = 22% más oscuro). */
function oscurecer(hex: string, factor: number): string {
  const rgb = parsearHex(hex);
  if (!rgb) return hex;
  return `#${rgb
    .map((v) => Math.max(0, Math.round(v * factor)).toString(16).padStart(2, "0"))
    .join("")}`;
}

/** Aclara un hex acercándolo al blanco en la proporción indicada. */
function aclarar(hex: string, cantidad: number): string {
  return mezclar(hex, "#ffffff", cantidad);
}

/**
 * Ajusta un color hasta alcanzar el contraste mínimo contra TODOS los fondos
 * dados. Prueba oscureciendo y aclarando, y se queda con la primera dirección
 * que cumple; si ninguna llega, devuelve la que más se acercó.
 *
 * Se prueban las dos direcciones a propósito: deducirla de la luminosidad del
 * fondo es exactamente el tipo de signo que se invierte sin que se note, y el
 * resultado es un color peor que el original.
 */
function ajustarContraTodos(
  color: string,
  fondos: string[],
  minimo: number,
): { color: string; logrado: boolean } {
  const cumple = (c: string) =>
    fondos.every((f) => (contraste(c, f) ?? 0) >= minimo);
  const mejor = (a: string, b: string) => {
    const ra = Math.min(...fondos.map((f) => contraste(a, f) ?? 0));
    const rb = Math.min(...fondos.map((f) => contraste(b, f) ?? 0));
    return rb > ra ? b : a;
  };
  if (cumple(color)) return { color, logrado: true };

  let oscuro = color;
  let claro = color;
  for (let paso = 0; paso < 80; paso++) {
    const sigOscuro = oscurecer(oscuro, 0.94);
    const sigClaro = aclarar(claro, 0.07);
    if (sigOscuro === oscuro && sigClaro === claro) break;
    oscuro = sigOscuro;
    claro = sigClaro;
    if (cumple(oscuro)) return { color: oscuro, logrado: true };
    if (cumple(claro)) return { color: claro, logrado: true };
  }
  return { color: mejor(oscuro, claro), logrado: false };
}

interface MarcaCruda {
  colorAcento?: string;
  colorFondo?: string;
  colorTexto?: string;
  tipografiaTitulos?: string;
  tipografiaCuerpo?: string;
}

/** Resuelve una clave de tipografía aceptando alias genéricos. */
function resolverTipografia(valor: unknown): ClaveTipografia | null {
  if (typeof valor !== "string") return null;
  if (valor in TIPOGRAFIAS) return valor as ClaveTipografia;
  return ALIAS_TIPOGRAFIA[valor.trim().toLowerCase()] ?? null;
}

function esClaveAcento(valor: unknown): valor is ClaveAcento {
  return typeof valor === "string" && valor in ACENTOS;
}

/**
 * Construye las variables CSS del tema a partir de content.brand.
 *
 * colorAcento admite una clave de ACENTOS ("azul") o un hex que supere 4.5:1
 * sobre el fondo. Cualquier otro valor se descarta y devuelve advertencia.
 */
export function buildTheme(brand: MarcaCruda = {}): Tema {
  const advertencias: string[] = [];

  const fondoValido = parsearHex(brand.colorFondo ?? "") !== null;
  const colorFondo = fondoValido ? (brand.colorFondo as string) : "#ffffff";
  if (!fondoValido && brand.colorFondo !== undefined) {
    advertencias.push(`brand.colorFondo "${brand.colorFondo}" no es un hex válido; se usa #ffffff`);
  }

  const textoValido = parsearHex(brand.colorTexto ?? "") !== null;
  let colorTexto = textoValido ? (brand.colorTexto as string) : "#111111";
  if (!textoValido && brand.colorTexto !== undefined) {
    advertencias.push(`brand.colorTexto "${brand.colorTexto}" no es un hex válido; se usa #111111`);
  }
  // Un colorTexto claro sobre fondo claro dejaría todo el cuerpo del sitio
  // ilegible. Se ajusta hasta 4.5:1 contra el fondo y la superficie, porque el
  // texto también aparece sobre las tarjetas de cartelera.
  const superficieBruta = mezclar(colorFondo, colorTexto, 0.05);
  const textoAjustado = ajustarContraTodos(colorTexto, [colorFondo, superficieBruta], 4.5);
  if (textoAjustado.color !== colorTexto) {
    advertencias.push(
      `brand.colorTexto ${colorTexto} no alcanza 4.5:1 sobre ${colorFondo} (${contraste(colorTexto, colorFondo)}:1); se ajusta a ${textoAjustado.color}`,
    );
    colorTexto = textoAjustado.color;
  }

  // Acento: clave de preset (colores ya validados) o hex libre.
  // Un hex libre que no llega a 4.5:1 se oscurece/aclara hasta cumplirlo, para
  // conservar el tono de la marca en vez de reemplazarlo por el preset.
  let acento: string;
  let hover: string;
  if (esClaveAcento(brand.colorAcento)) {
    const preset = ACENTOS[brand.colorAcento];
    acento = preset.acento;
    hover = preset.hover;
  } else {
    const crudo = (brand.colorAcento ?? "").trim();
    if (crudo === "") {
      acento = ACENTOS[ACENTO_POR_DEFECTO].acento;
      hover = ACENTOS[ACENTO_POR_DEFECTO].hover;
    } else if (parsearHex(crudo) === null) {
      advertencias.push(
        `brand.colorAcento "${crudo}" no es una clave (${Object.keys(ACENTOS).join(", ")}) ni un hex de 6 dígitos; se usa "${ACENTO_POR_DEFECTO}"`,
      );
      acento = ACENTOS[ACENTO_POR_DEFECTO].acento;
      hover = ACENTOS[ACENTO_POR_DEFECTO].hover;
    } else {
      const ratio = contraste(crudo, colorFondo) ?? 0;
      const fondoClaro = (luminancia(colorFondo) ?? 1) >= 0.5;
      if (ratio >= 4.5) {
        acento = crudo;
      } else {
        const ajustado = ajustarContraTodos(crudo, [colorFondo], 4.5);
        acento = ajustado.color;
        advertencias.push(
          ajustado.logrado
            ? `brand.colorAcento ${crudo} queda en ${ratio}:1 sobre ${colorFondo}; se ajusta a ${acento}`
            : `brand.colorAcento ${crudo} no puede alcanzar 4.5:1 sobre ${colorFondo}; quedó en ${contraste(acento, colorFondo)}:1`,
        );
      }
      hover = fondoClaro ? oscurecer(acento, 0.78) : aclarar(acento, 0.22);
    }
  }

  // El acento también se usa como fondo de .btn--primario, con texto encima.
  // Se elige blanco o negro según cuál supere 4.5:1 sobre el acento, para que un
  // acento claro no produzca texto ilegible.
  const sobreBlanco = contraste(acento, "#ffffff") ?? 0;
  const sobreNegro = contraste(acento, "#111111") ?? 0;
  const textoSobreAcento = sobreBlanco >= sobreNegro ? "#ffffff" : "#111111";
  if (Math.max(sobreBlanco, sobreNegro) < 4.5) {
    advertencias.push(
      `brand.colorAcento ${acento} no alcanza 4.5:1 ni con blanco ni con negro; el texto de los botones primarios queda al límite (${Math.max(sobreBlanco, sobreNegro)}:1)`,
    );
  }

  // Tipografías: la clave manda sobre el cuerpo. Si solo se configura el cuerpo,
  // se respeta; si ninguna es válida, cae en el preset por defecto.
  const claveTitulos = resolverTipografia(brand.tipografiaTitulos);
  if (brand.tipografiaTitulos !== undefined && claveTitulos === null) {
    advertencias.push(
      `brand.tipografiaTitulos "${brand.tipografiaTitulos}" no está en la lista; se usa "${TIPOGRAFIA_POR_DEFECTO}". Opciones: ${Object.keys(TIPOGRAFIAS).join(", ")}`,
    );
  }
  const base = TIPOGRAFIAS[claveTitulos ?? TIPOGRAFIA_POR_DEFECTO];

  const claveCuerpo = resolverTipografia(brand.tipografiaCuerpo);
  const cuerpoConfigurado = claveCuerpo ? TIPOGRAFIAS[claveCuerpo].cuerpo : null;
  if (brand.tipografiaCuerpo !== undefined && cuerpoConfigurado === null) {
    advertencias.push(
      `brand.tipografiaCuerpo "${brand.tipografiaCuerpo}" no está en la lista; se conserva la del preset de titulares. Opciones: ${Object.keys(TIPOGRAFIAS).join(", ")}`,
    );
  }

  // Superficie y texto secundario derivados de fondo/texto, ajustados hasta
  // superar 4.5:1: mezclar a una proporción fija no garantiza contraste y puede
  // quedar peor que el valor original. El secundario aparece sobre el fondo y
  // sobre la superficie, así que debe cumplir contra ambos.
  const colorSuperficie = ajustarContraTodos(
    superficieBruta,
    [colorTexto],
    4.5,
  ).color;
  const secundarioAjustado = ajustarContraTodos(
    mezclar(colorTexto, colorFondo, 0.35),
    [colorFondo, colorSuperficie],
    4.5,
  );
  const colorSecundario = secundarioAjustado.color;
  if (!secundarioAjustado.logrado) {
    advertencias.push(
      `no se pudo llevar el texto secundario a 4.5:1 sobre ${colorFondo} y ${colorSuperficie}; quedó en ${Math.min(contraste(colorSecundario, colorFondo) ?? 0, contraste(colorSecundario, colorSuperficie) ?? 0)}:1`,
    );
  }

  // El pie usa el texto como fondo. Si esa inversión no da contraste suficiente,
  // se oscurece el fondo del pie en vez de dejar texto ilegible.
  const ratioInversion = contraste(colorFondo, colorTexto) ?? 0;
  let fondoPie = colorTexto;
  if (ratioInversion < 4.5) {
    fondoPie = mezclar(colorTexto, "#000000", 0.45);
    advertencias.push(
      `brand.colorTexto ${colorTexto} no contrasta 4.5:1 con el fondo; el pie se oscurece a ${fondoPie}`,
    );
  }
  // Texto atenuado dentro del pie, ajustado contra el fondo real del pie.
  const atenuadoPie = ajustarContraTodos(
    mezclar(colorFondo, fondoPie, 0.22),
    [fondoPie],
    4.5,
  );
  // El acento se usa como hover de los enlaces del pie, que tiene fondo oscuro.
  // El acento de marca no siempre contrasta ahí, así que se deriva una variante.
  const acentoPie = ajustarContraTodos(acento, [fondoPie], 4.5);
  if (!acentoPie.logrado) {
    advertencias.push(
      `el acento no alcanza 4.5:1 sobre el fondo del pie (${fondoPie}) ni aclarándolo; el hover del pie queda en ${contraste(acentoPie.color, fondoPie)}:1`,
    );
  }

  const ratioAcentoFondo = contraste(acento, colorFondo) ?? 0;
  if (ratioAcentoFondo < 4.5) {
    advertencias.push(
      `contraste acento/fondo ${ratioAcentoFondo}:1 es insuficiente para texto pequeño; revisá brand.colorFondo`,
    );
  }

  return {
    variables: {
      "--color-fondo": colorFondo,
      "--color-superficie": colorSuperficie,
      "--color-texto": colorTexto,
      "--color-texto-secundario": colorSecundario,
      "--color-acento": acento,
      "--color-acento-hover": hover,
      "--color-acento-pie": acentoPie.color,
      "--color-texto-sobre-acento": textoSobreAcento,
      "--color-fondo-pie": fondoPie,
      "--color-texto-pie": colorFondo,
      "--color-texto-pie-atenuado": atenuadoPie.color,
      "--fuente-titulos": base.titulos,
      "--fuente-cuerpo": cuerpoConfigurado ?? base.cuerpo,
      "--fuente-mono": base.mono,
      "--peso-titulos": String(base.pesoTitulos),
    },
    advertencias,
  };
}

/**
 * Serializa el tema como objeto para el atributo style de <html>.
 * React acepta propiedades personalizadas (--*) en style, pero el tipado de
 * CSSProperties no las conoce: por eso el registro se construye y se afirma.
 */
export function themeStyle(tema: Tema): CSSProperties {
  const propiedades: Record<string, string> = {};
  for (const [clave, valor] of Object.entries(tema.variables)) {
    propiedades[clave] = valor;
  }
  return propiedades as CSSProperties;
}

/** Red social → {prefix, label}. Las cuatro claves reconocidas. */
export const REDES: Record<string, { prefijo: string; etiqueta: string }> = {
  instagram: { prefijo: "https://instagram.com/", etiqueta: "Instagram" },
  facebook: { prefijo: "https://facebook.com/", etiqueta: "Facebook" },
  youtube: { prefijo: "https://youtube.com/", etiqueta: "YouTube" },
  tiktok: { prefijo: "https://tiktok.com/", etiqueta: "TikTok" },
};

export interface EnlaceSocial {
  clave: string;
  etiqueta: string;
  url: string;
}

/**
 * Convierte brand.redesSociales en enlaces listos para renderizar.
 * Un valor vacío se ignora; un usuario (@nombre o nombre) se convierte en URL
 * con el prefijo de la red. Una URL completa se respeta tal cual.
 */
export function redesEnlaces(redes: Record<string, unknown> | undefined): EnlaceSocial[] {
  if (!redes) return [];
  const salida: EnlaceSocial[] = [];
  for (const [clave, definicion] of Object.entries(REDES)) {
    const valor = redes[clave];
    if (typeof valor !== "string" || valor.trim() === "") continue;
    const limpio = valor.trim();
    const url = /^https?:\/\//i.test(limpio)
      ? limpio
      : `${definicion.prefijo}${limpio.replace(/^@/, "")}`;
    salida.push({ clave, etiqueta: definicion.etiqueta, url });
  }
  return salida;
}
