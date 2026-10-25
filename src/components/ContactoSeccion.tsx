import type { Contacto } from "@/lib/contenido";

/**
 * Contacto. Todo campo es opcional y cada uno se renderiza solo si viene:
 * una compañía puede publicar únicamente el correo.
 *
 * El `tel:` se normaliza quitando espacios porque los separadores de miles
 * chilenos ("+56 2 2345 6789") rompen el enlace en varios clientes de teléfono.
 * El texto visible conserva los espacios, que son los que lee una persona.
 */
export default function ContactoSeccion({ contacto }: { contacto: Contacto }) {
  return (
    <section id="contacto" className="seccion contacto">
      <h2 className="seccion__titulo">{contacto.frase}</h2>
      <div className="contacto__datos">
        {contacto.correo && (
          <a href={`mailto:${contacto.correo}`} className="contacto__item">
            {contacto.correo}
          </a>
        )}
        {contacto.telefono && (
          <a
            href={`tel:${contacto.telefono.replace(/\s/g, "")}`}
            className="contacto__item"
          >
            {contacto.telefono}
          </a>
        )}
        {contacto.direccion && <p className="contacto__item">{contacto.direccion}</p>}
        {contacto.horario && <p className="contacto__item">{contacto.horario}</p>}
        {contacto.nota && <p className="contacto__nota">{contacto.nota}</p>}
      </div>
    </section>
  );
}
