import type { Obras } from "@/lib/contenido";
import { altDe } from "@/lib/imagen";

/**
 * Mosaico de obras con recortes desiguales (`obras__grid`, grid de 4 columnas con
 * `grid-row: span N` según `ratio`). Por eso cada imagen lleva `width`/`height` en
 * el contenido y no en el componente: la proporción decide el alto de la celda.
 *
 * `lazy` y `decoding="async"`: ninguna de estas imágenes es LCP.
 */
export default function ObrasSeccion({ obras }: { obras: Obras }) {
  return (
    <section id="obras" className="seccion obras">
      <h2 className="seccion__titulo">{obras.titulo}</h2>
      <p className="seccion__intro">{obras.descripcion}</p>
      <div className="obras__grid">
        {obras.hoja.map((obra, i) => (
          <figure key={i} className="obra">
            {obra.src && (
              <img
                src={obra.src}
                alt={altDe(obra, obra.cap)}
                loading="lazy"
                decoding="async"
              />
            )}
            <figcaption className="obra__pie">
              <span className="obra__titulo">{obra.cap}</span>
              {obra.tipo && <span className="obra__tipo">{obra.tipo}</span>}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
