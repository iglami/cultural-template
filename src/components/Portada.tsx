import type { Hero } from "@/lib/contenido";
import { altDe } from "@/lib/imagen";

/**
 * Portada. El titular llega como arreglo de líneas porque el diseño las corta a
 * propósito ("Creamos" / "escenas"): cada línea es un <span> dentro del <h1>,
 * así que el encabezado sigue siendo uno solo para el lector de pantalla.
 *
 * La imagen del hero es la única con `loading="eager"`: es el LCP de la página.
 */
export default function Portada({ hero }: { hero: Hero }) {
  return (
    <section className="hero">
      <div className="hero__interior">
        <div className="hero__texto">
          <h1 className="hero__titulo">
            {hero.titulo.map((linea, i) => (
              <span key={i} className="hero__linea">
                {linea}
              </span>
            ))}
          </h1>
          <p className="hero__subtitulo">{hero.subtitulo}</p>
          <a href="#cartelera" className="btn btn--primario">
            {hero.accion}
          </a>
        </div>
        <div className="hero__media">
          {hero.foto.src && (
            <img
              src={hero.foto.src}
              alt={altDe(hero.foto, hero.titulo.join(" "))}
              width={hero.foto.w}
              height={hero.foto.h}
              loading="eager"
            />
          )}
        </div>
      </div>
    </section>
  );
}
