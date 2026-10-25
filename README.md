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
│   │   ├── page.tsx         # Página principal
│   │   ├── globals.css      # Sistema de diseño con variables CSS
│   │   ├── favicon.ico      # 16/32/48 px — salida de scripts/make-icons.mjs
│   │   ├── icon.svg         # Ícono vectorial
│   │   └── apple-icon.png   # 180×180 px
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
│   └── optimize-images.mjs      # Optimiza imágenes propias desde assets/
├── package.json
├── next.config.ts
└── tsconfig.json
```

> Las tipografías **no** viven en el repositorio: se sirven desde el CDN de
> Fontshare (ver *Tipografías y licencias*). El repo no contiene archivos `.woff2`.

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
- `footer`: Navegación, créditos y datos legales

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

MIT — Uso libre para proyectos comerciales y personales. La licencia MIT cubre el
código; **no** cubre las tipografías, que se rigen por sus propias EULA (ver
*Tipografías y licencias*).

## Créditos

- Tipografías: [Gambarino](https://www.fontshare.com/fonts/gambarino) y [General Sans](https://www.fontshare.com/fonts/general-sans), Fontshare / Indian Type Foundry
- Alternativas: [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) e [Inter](https://fonts.google.com/specimen/Inter), SIL Open Font License
- Imágenes de ejemplo: dominio público (CC0), [The Met — Open Access](https://metmuseum.org/openaccess). El detalle de cada obra está en `public/obras/CREDITS.json`
- Íconos: diseño propio de la plantilla (`assets/marca-plantilla.svg`)
