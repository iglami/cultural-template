/**
 * Página principal: solo compone las secciones.
 *
 * El contenido vive en `src/content/content.json` y cada sección es un
 * componente propio en `src/components/`. Este archivo no decide marcado ni
 * estilos; su trabajo es pasar los datos y sostener dos estructuras de página
 * que no pertenecen a ninguna sección: el enlace de salto y el landmark
 * principal.
 *
 * `<main id="contenido" tabIndex={-1}>` es el destino del enlace de salto. El
 * `tabIndex={-1}` es necesario: sin él el navegador cambia el scroll pero no
 * mueve el foco, y un lector de pantalla seguiría leyendo desde el principio.
 * El outline de foco de `main` está suprimido en el CSS (dibujaba un recuadro
 * alrededor de la página entera); el indicador visible lo aporta el propio
 * enlace de salto.
 */
import content from "@/content/content.json";
import { navegacion, localeDe } from "@/lib/contenido";
import Cabecera from "@/components/Cabecera";
import Portada from "@/components/Portada";
import CarteleraSeccion from "@/components/CarteleraSeccion";
import ObrasSeccion from "@/components/ObrasSeccion";
import EquipoSeccion from "@/components/EquipoSeccion";
import ContactoSeccion from "@/components/ContactoSeccion";
import PiePagina from "@/components/PiePagina";

const enlaces = navegacion(content);

export default function Pagina() {
  return (
    <div className="pagina">
      <a className="salto" href="#contenido">
        Saltar al contenido
      </a>

      <Cabecera marca={content.brand} enlaces={enlaces} />

      <main id="contenido" tabIndex={-1}>
        <Portada hero={content.hero} />
        <CarteleraSeccion cartelera={content.cartelera} locale={localeDe(content)} />
        <ObrasSeccion obras={content.obras} />
        <EquipoSeccion equipo={content.equipo} />
        <ContactoSeccion contacto={content.contacto} />
      </main>

      <PiePagina marca={content.brand} pie={content.footer} enlaces={enlaces} />
    </div>
  );
}
