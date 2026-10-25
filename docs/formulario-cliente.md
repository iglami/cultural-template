# Formulario de contenido — Sitio web

Completá este formulario con la información real de tu organización. Los nombres
entre paréntesis son los campos del sitio: **no los borres**, solo escribí al lado
o debajo de cada uno. Donde no tengas dato, escribí `no tengo` (no lo dejes en
blanco: así sabemos que falta y no que se pasó por alto).

Al final hay una sección sobre fotos y archivos. Léela antes de enviar: ahí se
dice qué formato necesitamos.

---

## 1. Identidad

- Nombre de la organización (`brand.nombre`):
- Frase que los define, en una línea (`brand.tagline`):
- Nombre legal / razón social, si difiere:
- ¿Cuándo se fundaron? (para "trayectoria", opcional):
- Título de la pestaña del navegador (`meta.title`):
  - Sugerencia: "Nombre: Arte y Cultura" — 50 a 60 caracteres.
- Descripción para Google (`meta.description`):
  - 150 a 160 caracteres. Es el texto que se lee en el buscador.
- Palabras clave, separadas por coma (`meta.keywords`):
  - Ejemplo: teatro, danza, artes escénicas, cartelera, Santiago

## 2. Marca visual

- Paleta de colores corporativos (códigos HEX, ej. `#1a4be0`):
  - Color principal:
  - Colores secundarios:
  - Fondo: ¿claro u oscuro?
- Tipografía de la marca (nombre exacto):
  - ¿Tienen la licencia de esa fuente? (ver nota de archivos, punto 12)
- Logo:
  - Adjuntar en **SVG** (ideal) o PNG transparente de alta resolución.
  - **Importante:** hoy el sitio muestra el nombre en tipografía grande y **no
    tiene un espacio para logo**. Si lo necesitás, avisá y lo agregamos como
    trabajo aparte.

## 3. Redes sociales

Formato: `@usuario` o la URL completa. Dejar vacío = no se muestra.

- Instagram (`redesSociales.instagram`):
- Facebook (`redesSociales.facebook`):
- YouTube (`redesSociales.youtube`):
- TikTok (`redesSociales.tiktok`):
- WhatsApp de contacto (opcional, si querés que aparezca):

## 4. Portada (lo primero que se ve)

- Título en dos líneas (`hero.titulo`):
  - Línea 1:
  - Línea 2:
- Bajada / subtítulo (`hero.subtitulo`) — una oración:
- Texto del botón (`hero.accion`) — ej. "Ver cartelera":
- Foto de portada:
  - Archivo:
  - **¿Qué muestra la foto?** (2 a 3 líneas) — este texto es obligatorio: lo
    usamos para que lectores de pantalla describan la imagen y para el título
    emergente.
  - Crédito de la foto (autor / institución):

## 5. Cartelera — próximas funciones

Copiar este bloque por cada función. **La fecha en formato AAAA-MM-DD y la hora
en formato 24 h.**

### Función 1
- Título de la obra (`titulo`):
- Fecha (`fecha`) — AAAA-MM-DD:
- Hora (`hora`) — 24 h:
- Lugar, sala y ciudad (`lugar`):
- Descripción, 2 a 4 líneas (`descripcion`):
- Foto de la obra (archivo):
- Qué se ve en esa foto, en 2 líneas (para accesibilidad):
- Precio / rango (`precio`) — ej. "$15.000" o "Gratis, aporte voluntario":
- Link de venta de entradas (`entradas`) — URL:

### Función 2
- (copiar el bloque)

### Función 3
- (copiar el bloque)

## 6. Repertorio — obras que han montado

Por cada obra, un bloque. Recomendamos entre 4 y 8.

### Obra 1
- Pie de foto, con año (`cap`) — ej. "Yungay, 2023":
- Disciplina (`tipo`) — Teatro / Danza / Música / Circo / Títeres / Multimedia:
- Dirección (`director`):
- Elenco, separado por coma (`elenco`):
- Foto:
- Qué se ve en la foto (para accesibilidad):
- Enlace a ficha, crítico o video (opcional):

## 7. Equipo

Por cada persona, un bloque. Se muestran en grilla.

### Persona 1
- Nombre (`persona.nombre`):
- Rol (`persona.rol`) — ej. "Director artístico":
- Biografía, 2 a 3 líneas (`persona.bio`):
- Foto: cuadrada, rostro visible, buena luz:
- ¿Autoriza la publicación de su imagen en el sitio? (Sí / No / Pendiente)
- Red o sitio personal del integrante (opcional):

## 8. Contacto

- Frase de invitación (`contacto.frase`) — ej. "¿Quieres trabajar con nosotros?":
- Correo visible (`contacto.correo`):
- Teléfono (`contacto.telefono`) — con código de país:
- Dirección física (`contacto.direccion`) — completa, para el mapa y el pie:
- Horario de atención (`contacto.horario`):
- Nota de contacto (`contacto.nota`) — ej. "Respondemos en 24 horas hábiles":
- ¿Querés formulario de envío o alcanza con correo/teléfono?

## 9. Pie de página

- Descripción corta de la organización (`footer.descripcion`):
- Dirección abreviada (`footer.direccion`):
- Texto legal (`footer.legal`) — ej. "© 2026 Nombre. Todos los derechos reservados.":
- Créditos de imágenes y fuentes (`footer.creditos.texto`):
  - Si usamos fotos de archivo o dominio público, ahí va el reconocimiento.
- Enlace de los créditos (`footer.creditos.url`):

## 10. Navegación

- Secciones del menú, en orden (`nav`) — hoy: Cartelera · Obras · Equipo · Contacto:
- ¿Agregar o quitar alguna? (ej. "Postulaciones", "Prensa", "Historia"):
- ¿Necesitás páginas independientes, o todo en una sola página?

## 11. Publicación (esto desbloquea el despliegue)

- Dominio final (`https://...`):
- ¿Dónde se publica? (GitHub Pages / Netlify / Vercel / hosting propio / no sé aún)
- ¿El sitio vive en la raíz del dominio o en una subcarpeta?
  - Ej. `https://teatrox.cl/` vs `https://teatrox.cl/sitio/` — cambia la configuración.
- ¿Quién actualiza la cartelera después? (nombre y correo de contacto)
- Idiomas: solo español, o también inglés/portugués?

## 12. Archivos que sí / que no ayudan

**Sí, mandá:**

1. **Fotos en original**, nunca redimensionadas ni capturas de pantalla.
   Portada: 1600×1000 px o más. Obras: 1200×900 (4:3). Equipo: 800×800 cuadradas.
   Formato JPG o PNG. Si son muchas, comprimidlas en ZIP o pasá un enlace
   (Drive / Dropbox / WeTransfer).
2. **Logo en SVG** si existe.
3. **Paleta con códigos HEX** o el PDF de identidad.
4. Textos de prensa: sinopsis de cada obra, biografías, fichas artísticas,
   notas de crítico (documento aparte, no pegado acá).

**No, todavía no:**

5. **Video.** El sitio no tiene reproductor ni incrustaciones. Se puede ver tu
   canal de YouTube desde el pie (punto 3), pero un trailer embebido es un
   trabajo nuevo: decidilo después de la primera entrega.
6. **Audio / podcasts.** Mismo caso: no hay dónde ponerlos.
7. **Tipografías de marca con archivos `.woff2`.** Muchas fuentes comerciales no
   se pueden redistribuir en un sitio público; nosotros las servimos por CDN con
   permiso. Si tu fuente es licenciada, decinos cuál es y con qué licencia.
8. **Fotos de personas sin autorización.** Todo retrato de equipo, elenco o
   público necesita permiso de uso. Marcá "Pendiente" y no publicamos esa foto.

## 13. Derechos y permisos (responder sí o no)

- Las fotos enviadas son propias o tienen licencia de uso: (Sí / No / Parcial)
- Los retratos cuentan con autorización de la persona fotografiada: (Sí / No / Pendiente)
- Hay material con crédito obligatorio (museos, bibliotecas, CC): (Sí / No)
  - Detallar cuáles:
- ¿Hay textos de terceros (sinopsis de autor, críticas) que citar?:

## 14. Referencias

- 2 o 3 sitios que te gustan de otras compañías (URL):
  - Qué te gusta de cada uno, en una línea:
- 1 sitio que **no** te gusta, y por qué:

## 15. Plazos

- Fecha objetivo de publicación:
- ¿Hay un evento o temporada que marque ese plazo?:
- Quién aprueba los textos y las fotos finales (nombre + correo):
