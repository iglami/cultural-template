import type { Equipo } from "@/lib/contenido";
import { altDe } from "@/lib/imagen";

/**
 * Equipo / artistas. El retrato es opcional (`persona.foto &&`): una compañía
 * puede publicar el elenco sin fotos y la tarjeta simplemente no muestra imagen.
 *
 * El texto alternativo de respaldo incluye nombre y rol porque, sin él, un
 * retrato sin descripción se anuncia como "imagen" seguida de un nombre suelto.
 */
export default function EquipoSeccion({ equipo }: { equipo: Equipo }) {
  return (
    <section id="equipo" className="seccion equipo">
      <h2 className="seccion__titulo">{equipo.titulo}</h2>
      <p className="seccion__intro">{equipo.descripcion}</p>
      <div className="equipo__grid">
        {equipo.miembros.map((persona, i) => (
          <article key={i} className="miembro">
            {persona.foto && (
              <img
                src={persona.foto}
                alt={altDe(persona, `Retrato de ${persona.nombre}, ${persona.rol}`)}
                className="miembro__foto"
                loading="lazy"
                decoding="async"
              />
            )}
            <h3 className="miembro__nombre">{persona.nombre}</h3>
            <p className="miembro__rol">{persona.rol}</p>
            {persona.bio && <p className="miembro__bio">{persona.bio}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}
