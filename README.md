# WebMaster — Plantilla para Organizaciones Culturales

Plantilla web reutilizable para teatros, compañías de danza, productoras culturales, galerías y organizaciones creativas.

## Características

- **Next.js 16** con exportación estática (compatible con GitHub Pages, Netlify, Vercel)
- **TypeScript** completo
- **CSS personalizado** con variables configurables por cliente
- **SEO optimizado** con Open Graph y Twitter Cards
- **Responsive** para móvil, tablet y escritorio
- **Accesible** con navegación por teclado y soporte para prefers-reduced-motion
- **Compatible con editores visuales** como Revyme para edición sin código

## Requisitos

- Node.js 20 o superior
- npm (el repositorio versiona `package-lock.json`; usá `npm ci` para instalar exactamente lo mismo)
- Para regenerar íconos o imágenes de ejemplo: **ImageMagick 7** (`magick`) en el PATH

## Estructura del Proyecto

```
cultural-template/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Metadatos, SEO, íconos y carga de tipografías
│   │   ├── page.tsx         # Composición de la página (sin marcado propio)
│   │   ├── globals.css      # Sistema de diseño con variables CSS
│   │   ├── favicon.ico      # 16/32/48 px — salida de scripts/make-icons.mjs
│   │   ├── icon.svg         # Ícono vectorial
│   │   └── apple-icon.png   # 180×180 px
│   ├── components/          # Un componente por sección
│   │   ├── Cabecera.tsx         # banner + nav "Principal"
│   │   ├── Portada.tsx          # hero (LCP)
│   │   ├── CarteleraSeccion.tsx # funciones y entradas
│   │   ├── ObrasSeccion.tsx     # mosaico de obras
│   │   ├── EquipoSeccion.tsx    # integrantes
│   │   ├── ContactoSeccion.tsx  # datos de contacto
│   │   ├── PiePagina.tsx        # contentinfo + nav "Del pie"
│   │   ├── NavEnlaces.tsx       # mismos enlaces, dos presentaciones
│   │   └── RedesSociales.tsx    # íconos sociales
│   ├── lib/
│   │   ├── contenido.ts     # Tipos derivados de content.json + navegación única
│   │   ├── tema.ts          # Presets de color/tipografía y derivación del tema
│   │   ├── fecha.ts         # Formato de fechas determinista (sin zona horaria)
│   │   └── imagen.ts        # altDe(): texto alternativo con respaldo
│   └── content/
│       └── content.json     # Contenido editable (textos, imágenes, datos)
├── public/
│   └── obras/               # Imágenes de obras, eventos y equipo
│       └── CREDITS.json     # Licencia y origen de cada imagen de ejemplo
├── assets/
│   └── marca-plantilla.svg  # Fuente editable de los íconos
├── scripts/
│   ├── fetch-sample-images.mjs  # Descarga imágenes CC0 de The Met
│   ├── make-icons.mjs           # Genera los íconos desde assets/
│   ├── check-theme.mts          # Valida contraste de la marca en el build
│   ├── prueba-fecha.mts         # Prueba de fechas en 8 zonas horarias
│   ├── optimize-images.mjs      # Optimiza imágenes propias desde assets/
│   └── nuevo-cliente.mjs        # Vacía el contenido de ejemplo al instanciar un sitio
├── LICENSE                  # MIT + notas sobre tipografías e imágenes de terceros
├── package.json
├── next.config.ts
└── tsconfig.json
```

> Las tipografías **no** viven en el repositorio: se sirven desde el CDN de
> Fontshare (ver *Tipografías y licencias*). El repo no contiene archivos `.woff2`.
>
> `src/app/tema.module.css` tampoco está versionado: lo genera `check-theme.mts`
> en cada build como copia revisable del tema derivado, y su contenido cambia con
> la marca de cada cliente (ver *.gitignore*).

**Regla de oro:** `page.tsx` no escribe marcado, compone componentes. Si necesitás
cambiar cómo se ve una sección, editá su componente; si necesitás cambiar qué dice,
editá `content.json`. Los tipos de `src/lib/contenido.ts` se derivan del propio
`content.json`, así que agregar un campo no exige tocar TypeScript.

## Puesta en marcha

```bash
npm ci                 # instala las dependencias del lockfile
npm run fetch-images   # (opcional) baja imágenes de ejemplo con licencia CC0
npm run make-icons     # (opcional) regenera los íconos desde assets/
npm run dev            # servidor de desarrollo
```

`npm run dev` levanta el sitio en `http://localhost:3000`. Si ese puerto está ocupado
por otro trabajo, elegí uno libre y pasalo explícitamente:

```bash
npx next dev -p 3210 -H 0.0.0.0   # también accesible desde otros dispositivos
```

## Un repo por cliente

Este repositorio es una **plantilla** (GitHub → *Use this template*), no un
proyecto con ramas por cliente. Cada organización tiene su propio repo —en general
privado— con su `content.json`, sus imágenes y su dominio. Así el material de un
cliente nunca comparte historia con el de otro, y la plantilla sigue siendo pública
y reutilizable.

### Instanciar un sitio nuevo

1. En GitHub: **Use this template** → *Create a new repository*. Elegí privado y
   **no** marques *include all branches*: querés el código, no la historia de la
   plantilla.
2. Cloná e instalá:

   ```bash
   git clone git@github.com:tu-org/sitio-cliente.git && cd sitio-cliente
   npm ci
   ```

3. Vaciá el contenido de ejemplo:

   ```bash
   npm run nuevo-cliente -- --nombre "Compañía de Teatro X" --locale es-AR
   ```

   Sin `--force` solo imprime el plan (dry-run), sin escribir nada. Con `--force`
   borra las imágenes de The Met, deja `CREDITS.json` vacío, reescribe
   `content.json` con placeholders `[entre corchetes]` y crea `.env.local`.
   **No commitea nada**: revisá con `git diff`.

4. Completá `content.json`, poné el logo del cliente en `assets/` y corré
   `npm run make-icons`; después las fotos con `npm run optimize-images`.

El script se niega a correr si `origin` apunta a `cultural-template`: la plantilla
necesita conservar su contenido de ejemplo para demostrar cómo se ve el sitio.
`--forzar` salta esa guarda (y la de árbol sucio).

Los íconos de marca (`favicon.ico`, `icon.svg`, `apple-icon.png`) **no** se borran,
para no dejar el sitio sin favicon: el script los lista como pendiente explícito.

### Traer mejoras de la plantilla a un sitio entregado

El motor (`src/lib/`, `src/components/`, `src/app/`) se trata como **solo lectura**
en los repos de clientes: lo que cambia, cambia acá y baja.

```bash
git remote add template https://github.com/iglami/cultural-template.git
git fetch template
git merge template/main
```

Los conflictos se concentran en `content.json`, que es justo el archivo que cada
cliente edita: resolvelos conservando el contenido del cliente. Por eso la
plantilla no versiona artefactos que cambian con la marca, como `tema.module.css`.

### Locale

`content.meta.locale` (BCP 47: `es-CL`, `es-AR`, `es-MX`, `en-US`…) define el
idioma de las fechas de la cartelera y el `og:locale`. El motor no hardcodea
ningún país: si el valor falta o es inválido, `fecha.ts` avisa durante el build y
usa `LOCALE_POR_DEFECTO` (`es-CL`) en vez de caerse.
`node scripts/prueba-fecha.mts` comprueba que el locale venga del dato y no de la
máquina que compila.

## Personalización por Cliente

### 1. Configurar marca y colores

Edita `src/content/content.json`. **Este archivo es la única fuente de verdad del
tema**: el build deriva de él todas las variables CSS (colores, tipografías, peso
de los titulares) y las inyecta en `<html>`, así que no hace falta tocar
`globals.css` para cambiar la marca de un cliente.

```json
{
  "brand": {
    "nombre": "Nombre de la Organización",
    "tagline": "Frase que define la propuesta artística",
    "colorAcento": "azul",
    "colorFondo": "#ffffff",
    "colorTexto": "#111111",
    "tipografiaTitulos": "serif-condensada",
    "tipografiaCuerpo": "sans",
    "redesSociales": {
      "instagram": "@nombre.organizacion",
      "facebook": "",
      "youtube": "https://youtube.com/@canal",
      "tiktok": ""
    }
  }
}
```

**`colorAcento`** acepta una clave de preset o un hex de 6 dígitos:

| Clave | Color | Contraste sobre blanco |
|---|---|---|
| `azul` (por defecto) | `#1a4be0` | 6.72:1 |
| `bermellon` | `#c0392b` | 5.79:1 |
| `verde` | `#1a6b47` | 6.61:1 |
| `ciruela` | `#6b2d77` | 8.40:1 |

Un hex libre se acepta si supera 4.5:1 sobre `colorFondo`; si se queda corto, **se
ajusta hasta cumplirlo** conservando el tono (un `#ffd400` se vuelve `#897200`, no
se descarta). Un valor que no es ni clave ni hex válido cae al preset por defecto.
En todos los casos el build imprime qué hizo y por qué.

**`tipografiaTitulos` / `tipografiaCuerpo`** aceptan estas claves:

| Clave | Titulares | Peso |
|---|---|---|
| `serif-condensada` (por defecto) | Gambarino → Playfair → Georgia | 400 |
| `serif-editorial` | Playfair Display → Georgia | 700 |
| `sans` | General Sans → Inter → system-ui | 600 |
| `mono` | JetBrains Mono → ui-monospace | 500 |

Las claves genéricas `serif`, `sans-serif` y `monospace` de configuraciones
anteriores siguen funcionando: se traducen a su preset equivalente.

El peso del titular lo fija el preset, no el CSS: Gambarino solo existe en 400 y
pedirle 700 hace que el navegador fabrique una negrita falsa.

**`redesSociales`** admite `instagram`, `facebook`, `youtube` y `tiktok`. Un campo
vacío no se renderiza (no deja ícono huérfano ni `<ul>` vacío). Se acepta el
usuario (`@nombre` o `nombre`) o la URL completa; el ícono es SVG inline con
`currentColor` y el enlace lleva `aria-label="<Red> de <organización>"` y
`rel="noopener noreferrer"`.

Colores derivados que el tema calcula solo, todos validados a 4.5:1: superficie de
las tarjetas, texto secundario, texto sobre el acento (blanco o negro según
convenga), fondo y textos del pie, y una variante del acento para el hover dentro
del pie — el acento de marca no siempre contrasta sobre un fondo oscuro.

Para ver el tema resultante sin abrir el navegador:

```bash
npm run check-theme
```

Imprime cada variable, las advertencias y los valores disponibles, y escribe una
copia en `src/app/tema.module.css` para que el tema calculado quede revisable en
el diff. Corre automáticamente antes de `npm run build`. Las reglas están
cubiertas por `scripts/prueba-tema.mts` (19 combinaciones de marca, incluidos
valores inválidos y marcas oscuras):

```bash
node scripts/prueba-tema.mts
```

### 2. Actualizar contenido

Todos los textos, imágenes y datos están en `content.json`:

- `hero`: Título, subtitulo e imagen principal
- `nav`: **única** lista de navegación. La usan la cabecera y el pie; no existe una
  segunda lista para el pie. Si un `content.json` viejo todavía trae `footer.nav`,
  se ignora y el build lo avisa por consola (y dice si coincidía con `nav`).
- `cartelera`: Eventos próximos con fechas, lugares y precios
  - `fecha` se escribe como **día calendario** en formato `AAAA-MM-DD`
    (`"2026-11-15"`), y `hora` como texto en 24 h (`"20:00"`). No se convierten
    entre zonas horarias: lo que pone la organización es lo que ve el público.
    El formateo vive en `src/lib/fecha.ts` y es determinista — el HTML exportado
    no cambia según la máquina que compiló. Se comprueba con
    `node scripts/prueba-fecha.mts`.
- `obras`: Galería de obras con imágenes y descripciones
- `equipo`: Miembros del equipo con fotos y biografías
- `contacto`: Información de contacto completa
- `footer`: Créditos y datos legales

Cada imagen acepta un campo opcional **`alt`** con la descripción para lectores de
pantalla (`hero.foto`, `cartelera.eventos[].imagen`, `obras.hoja[]`,
`equipo.miembros[].foto`). Si lo omitís, la página usa un respaldo visible: el título
del evento, el pie de foto o "Retrato de {nombre}, {rol}". Conviene escribirlo igual —
el respaldo solo garantiza que nada quede mudo.

### 3. Añadir tus propias imágenes

Colocá los originales en `assets/` y ejecutá `npm run optimize-images`: redimensiona
(al máximo 1600 px de ancho) y escribe en `public/obras/` conservando **el formato real**
del archivo (PNG sigue PNG y conserva su transparencia; JPEG y WebP igual). Los SVG y
otros formatos se ignoran con aviso: copialos a `public/obras/` a mano. Si un archivo
miente en su extensión (por ejemplo bytes JPEG en un `.png`), se escribe con la
extensión verdadera y el script lo anuncia, así no queda un PNG roto en el navegador.
Después actualizá las rutas en `content.json`:

```json
{
  "hero": {
    "foto": {
      "src": "/obras/mi-imagen.jpg",
      "alt": "Interior del teatro con el telón abierto antes de la función",
      "w": 1280,
      "h": 800
    }
  }
}
```

Un `alt` que describe lo que se ve evita preguntas sin respuesta a quien usa lector
de pantalla, y `w`/`h` coincidiendo con el archivo real previenen saltos de layout
durante la carga.

Mientras definís las fotos propias, `npm run fetch-images` baja obras de dominio
público y deja su trazabilidad en `public/obras/CREDITS.json`. Reemplazalo antes de
publicar el sitio definitivo.

## Accesibilidad

La página está armada con landmarks nativos, sin roles ARIA redundantes:

| Elemento | Landmark | Nombre accesible |
| --- | --- | --- |
| `<header class="cabecera">` | `banner` | — |
| `<nav class="cabecera__nav">` | `navigation` | `Principal` |
| `<main id="contenido" tabindex="-1">` | `main` | — |
| `<footer class="pie">` | `contentinfo` | — |
| `<nav class="pie__col">` | `navigation` | `Del pie` |

Decisiones que conviene no romper al editar:

- **Enlace de salto.** `<a class="salto">` es el primer elemento enfocable y apunta a
  `#contenido`. `<main>` lleva `tabIndex={-1}` a propósito: sin eso el enlace cambia el
  hash pero **no mueve el foco**, y el lector de pantalla sigue leyendo desde arriba.
  El `outline` de `main:focus` está suprimido porque dibujaba un recuadro alrededor de
  toda la página (1265×3160 px medidos).
- **`scroll-padding-top`.** La cabecera es sticky, así que `html` reserva
  `calc(var(--alto-cabecera) + 16px)` para que al seguir un anclaje el título de la
  sección no quede debajo. `--alto-cabecera` está **medido** (71 px por encima de
  768 px de ancho, 105 px por debajo, donde la navegación se apila). Si cambiás el
  padding o la tipografía de `.cabecera__interior`, volvé a medirlo: sin este valor,
  en móvil el título quedaba tapado 45 px.
- **Texto alternativo.** Cada imagen acepta un campo `alt` opcional en `content.json`.
  Si falta o está vacío, `altDe()` (`src/lib/imagen.ts`) usa un respaldo visible: el
  título del evento, el pie de foto de la obra o `Retrato de {nombre}, {rol}`. Así
  ninguna imagen queda muda aunque el cliente olvide el campo, y el build no se rompe
  si lo borra (TypeScript infiere el tipo de `content.json`, así que un campo ausente
  dejaría de existir en el tipo).
- **Enlaces que abren pestaña nueva.** Llevan `<span class="sr-only"> (se abre en una
  pestaña nueva)</span>`. `.sr-only` oculta con `clip`, nunca con `display: none` ni
  `visibility: hidden`, porque esas dos también lo ocultan del lector de pantalla.
- **Encabezados del pie.** Son `h2`: el pie es una región de primer nivel, no una
  subsección de la última sección. El CSS también acepta `h3` por compatibilidad.

Para re-auditar: `npm i -D axe-core` (o inyectalo por HTTP en una página servida) y
corré `axe.run(document)` en la consola. Sobre el export estático la auditoría da
**0 violaciones y 0 casos incompletos**.

## Tipografías y licencias

El diseño usa **Gambarino** (titulares) y **General Sans** (cuerpo), ambas de
[Fontshare](https://www.fontshare.com) / Indian Type Foundry. Son gratuitas incluso
para uso comercial, pero **su licencia prohíbe redistribuir los archivos**: por eso
el repo no contiene `.woff2` y el sitio las pide al CDN desde `src/app/layout.tsx`.

Fontshare sirve **una sola familia por request**: si combinás dos parámetros `f[]`
en la misma URL, el segundo se ignora en silencio. De ahí que el layout tenga dos
`<link rel="stylesheet">` separados.

Como respaldo se cargan **Playfair Display** e **Inter** (SIL Open Font License, vía
Google Fonts) y los stacks rematan en Georgia y la sans del sistema, para que el
sitio siga viéndose bien sin depender de un tercero.

Gambarino solo existe en peso 400: si se le asigna 700, el navegador fabrica una
negrita falsa que se ve pesada en cuerpos grandes.

Cambiar `tipografiaTitulos` o `tipografiaCuerpo` en `content.json` todavía no
modifica el CSS: conectar esos tokens de marca está pendiente.

Si necesitás evitar CDNs de terceros (política institucional o sitio sin conexión),
reemplazá Gambarino y General Sans por equivalentes bajo OFL y servilos con
`next/font/local`; así el sitio queda autocontenido y esos archivos sí pueden
versionarse.

## Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Abrir http://localhost:3000
```

## Controles de calidad

Tres puertas independientes. Ninguna cubre lo que cubren las otras:

```bash
npm run lint        # ESLint 9 (flat config) — estilo, React, TypeScript, 6 reglas de a11y
npx tsc --noEmit    # tipos
npm run build       # corre check-theme (contraste de la marca) y genera out/
node scripts/prueba-fecha.mts   # fechas idénticas en 8 zonas horarias
```

**Sobre el lint.** `eslint.config.mjs` usa la configuración flat que documenta
Next 16 (`eslint-config-next/core-web-vitals` + `/typescript`). El script lleva
`--max-warnings=0`: sin esa bandera ESLint termina en 0 aunque encuentre
problemas, porque `eslint-config-next` reporta casi todo como *warning* — la
puerta dejaba pasar código sucio. Comprobado con una sonda a propósito: una
variable sin usar y un `<img>` sin `alt` hacen que `npm run lint` falle con
exit 1.

Límites que conviene conocer:

- `@next/next/no-img-element` está desactivada a propósito. La plantilla exporta
  estáticamente con `images.unoptimized: true`, así que `next/image` no optimiza
  nada: solo agrega JS y un wrapper. `<img>` con `width`/`height` explícitos es
  lo correcto acá.
- `eslint-config-next` activa **85 reglas**, de las cuales solo **6** son de
  accesibilidad (`alt-text`, `aria-props`, `aria-proptypes`,
  `aria-unsupported-elements`, `role-has-required-aria-props`,
  `role-supports-aria-props`). **No** incluye las de interacción por teclado
  (`click-events-have-key-events`, `no-static-element-interactions`): un
  `<div onClick>` pasa el lint. Si agregás interactividad, revisá el teclado a
  mano o sumá `jsx-a11y/recommended`.
- La accesibilidad real se verifica con **axe-core** sobre el export (ver
  *Accesibilidad*), no con el lint.

## Construcción y Despliegue

```bash
# Construir para producción
npm run build

# Los archivos estáticos se generan en la carpeta out/
```

### GitHub Pages

1. Push a GitHub
2. Settings → Pages → Deploy from branch: main, folder: /root
3. URL: `https://TU_USUARIO.github.io/cultural-template/`

> ⚠️ Este paso está bajo revisión: el proyecto exporta a `out/` y el sitio se sirve
> bajo un basePath cuando no está en la raíz del dominio. La guía correcta se
> definirá en la etapa de publicación.

### Netlify / Vercel

Arrastra la carpeta `out/` a Netlify o conecta el repositorio en Vercel.

## Edición Visual con Revyme

1. Clona el repositorio en tu PC
2. Abre Revyme (http://localhost:3333)
3. Importa el proyecto desde GitHub
4. Edita contenido visualmente
5. Exporta y haz push de vuelta a GitHub

## Licencia

MIT — ver [`LICENSE`](./LICENSE). Uso libre para proyectos comerciales y
personales, incluidos los sitios que deriven de esta plantilla.

La licencia MIT cubre el **código**; no cubre:

- **Las tipografías**, que se rigen por sus propias EULA y no se redistribuyen
  (ver *Tipografías y licencias*).
- **Las imágenes de ejemplo** de The Met (CC0, origen en `public/obras/CREDITS.json`),
  que `npm run nuevo-cliente` borra al instanciar un sitio.
- **El contenido de cada cliente**: los textos, marcas y fotos que una
  organización cargue en su repo derivado son de esa organización.

## Créditos

- Tipografías: [Gambarino](https://www.fontshare.com/fonts/gambarino) y [General Sans](https://www.fontshare.com/fonts/general-sans), Fontshare / Indian Type Foundry
- Alternativas: [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) e [Inter](https://fonts.google.com/specimen/Inter), SIL Open Font License
- Imágenes de ejemplo: dominio público (CC0), [The Met — Open Access](https://metmuseum.org/openaccess). El detalle de cada obra está en `public/obras/CREDITS.json`
- Íconos: diseño propio de la plantilla (`assets/marca-plantilla.svg`)
