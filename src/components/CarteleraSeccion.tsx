import type { Cartelera } from "@/lib/contenido";
import { fechaLarga } from "@/lib/fecha";
import { altDe } from "@/lib/imagen";

/**
 * Cartelera de funciones.
 *
 * La fecha se formatea con `fechaLarga()`, que trata el `AAAA-MM-DD` de
 * content.json como calendario y no como instante: si se parseara con `new
 * Date()`, el resultado dependería de la zona horaria de la máquina que compila
 * y el export estático publicaría el día anterior en América (ver CT-05).
 *
 * El enlace de entradas lleva aria-label con el nombre de la obra porque el
 * texto visible "Comprar entradas" se repite en cada evento: sin contexto, un
 * lector de pantalla anunciaría varios enlaces idénticos.
 */
export default function CarteleraSeccion({
  cartelera,
  locale,
}: {
  cartelera: Cartelera;
  locale: string;
}) {
  return (
    <section id="cartelera" className="seccion cartelera">
      <h2 className="seccion__titulo">{cartelera.titulo}</h2>
      <div className="cartelera__lista">
        {cartelera.eventos.map((evento, i) => (
          <article key={i} className="evento">
            <div className="evento__media">
              {evento.imagen && (
                <img
                  src={evento.imagen}
                  alt={altDe(evento, evento.titulo)}
                  loading="lazy"
                  decoding="async"
                />
              )}
            </div>
            <div className="evento__info">
              <h3 className="evento__titulo">{evento.titulo}</h3>
              <p className="evento__fecha">
                {fechaLarga(evento.fecha, locale)}
                {" "}
                · {evento.hora}
              </p>
              <p className="evento__lugar">{evento.lugar}</p>
              <p className="evento__descripcion">{evento.descripcion}</p>
              <div className="evento__acciones">
                {evento.precio && <span className="evento__precio">{evento.precio}</span>}
                {evento.entradas && (
                  <a
                    href={evento.entradas}
                    className="btn btn--secundario"
                    target="_blank"
                    rel="noopener"
                    aria-label={`Comprar entradas para ${evento.titulo} (se abre en una pestaña nueva)`}
                  >
                    Comprar entradas
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
