import type { EnlaceNav, Marca } from "@/lib/contenido";
import NavEnlaces from "./NavEnlaces";

/**
 * Cabecera sticky con la marca y la navegación principal.
 *
 * El `aria-label="Principal"` no es decorativo: hay dos <nav> en la página (este
 * y el del pie). Sin nombre, un lector de pantalla anuncia dos regiones
 * "navegación" indistinguibles.
 */
export default function Cabecera({
  marca,
  enlaces,
}: {
  marca: Marca;
  enlaces: EnlaceNav[];
}) {
  return (
    <header className="cabecera">
      <div className="cabecera__interior">
        <span className="cabecera__marca">{marca.nombre}</span>
        <nav className="cabecera__nav" aria-label="Principal">
          <NavEnlaces enlaces={enlaces} variante="cabecera" />
        </nav>
      </div>
    </header>
  );
}
