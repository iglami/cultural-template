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

## Estructura del Proyecto

```
webmaster-template/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Configuración de metadatos y SEO
│   │   ├── page.tsx         # Página principal
│   │   └── globals.css      # Sistema de diseño con variables CSS
│   └── content/
│       └── content.json     # Contenido editable (textos, imágenes, datos)
├── public/
│   ├── obras/               # Imágenes de obras, eventos y equipo
│   └── fonts/               # Fuentes locales (WOFF2)
├── package.json
├── next.config.ts
└── tsconfig.json
```

## Personalización por Cliente

### 1. Configurar marca y colores

Edita `src/content/content.json`:

```json
{
  "brand": {
    "nombre": "Nombre de la Organización",
    "tagline": "Frase que define la propuesta artística",
    "colorAcento": "#1a4be0",
    "colorFondo": "#ffffff",
    "colorTexto": "#111111"
  }
}
```

### 2. Actualizar contenido

Todos los textos, imágenes y datos están en `content.json`:

- `hero`: Título, subtitulo e imagen principal
- `cartelera`: Eventos próximos con fechas, lugares y precios
- `obras`: Galería de obras con imágenes y descripciones
- `equipo`: Miembros del equipo con fotos y biografías
- `contacto`: Información de contacto completa
- `footer`: Navegación, créditos y datos legales

### 3. Añadir imágenes

Coloca las imágenes en `public/obras/` y actualiza las rutas en `content.json`:

```json
{
  "hero": {
    "foto": {
      "src": "/obras/mi-imagen.jpg",
      "alt": "Descripción de la imagen"
    }
  }
}
```

### 4. Optimizar imágenes

```bash
npm run optimize-images
```

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
3. URL: `https://TU_USUARIO.github.io/webmaster-template/`

### Netlify / Vercel

Arrastra la carpeta `out/` a Netlify o conecta el repositorio en Vercel.

## Edición Visual con Revyme

1. Clona el repositorio en tu PC
2. Abre Revyme (http://localhost:3333)
3. Importa el proyecto desde GitHub
4. Edita contenido visualmente
5. Exporta y haz push de vuelta a GitHub

## Licencia

MIT — Uso libre para proyectos comerciales y personales.

## Créditos

- Tipografías: [Gambarino](https://www.gambarino.com/) y [General Sans](https://www.generalsans.com/)
- Imágenes de ejemplo: dominio público (CC0), Metropolitan Museum of Art
