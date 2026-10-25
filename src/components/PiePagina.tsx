import type { EnlaceNav, Marca, Pie } from "@/lib/contenido";
import { redesEnlaces } from "@/lib/tema";
import NavEnlaces from "./NavEnlaces";
import RedesSociales from "./RedesSociales";

/**
 * Pie de página.
 *
 * Recibe `enlaces` desde afuera en vez de leer `footer.nav`: la navegación tiene
 * una sola fuente (ver `navegacion()` en src/lib/contenido.ts). Los encabezados
 * de columna son `h2` porque el pie es una región de primer nivel, no una
 * subsección de la última sección; el CSS también acepta `h3` por compatibilidad.
 *
 * El aviso "(se abre en una pestaña nueva)" va en un `.sr-only`, no en un
 * `aria-label`: así el texto visible del enlace sigue siendo el nombre accesible
 * y el aviso se anuncia igual.
 */
export default function PiePagina({
  marca,
  pie,
  enlaces,
}: {
  marca: Marca;
  pie: Pie;
  enlaces: EnlaceNav[];
}) {
  return (
    <footer className="pie">
      <div className="pie__interior">
        <div className="pie__col">
          <h2>{marca.nombre}</h2>
          <p>{pie.descripcion}</p>
          <p>{pie.direccion}</p>
          <RedesSociales
            enlaces={redesEnlaces(marca.redesSociales)}
            organizacion={marca.nombre}
          />
        </div>
        <nav className="pie__col" aria-label="Del pie">
          <h2>Navegación</h2>
          <NavEnlaces enlaces={enlaces} variante="pie" />
        </nav>
        <div className="pie__col">
          <p className="pie__legal">{pie.legal}</p>
          {pie.creditos.url && (
            <p className="pie__creditos">
              <a href={pie.creditos.url} target="_blank" rel="noopener">
                {pie.creditos.texto}
                <span className="sr-only"> (se abre en una pestaña nueva)</span>
              </a>
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
