import content from "@/content/content.json";
import RedesSociales from "@/components/RedesSociales";
import { redesEnlaces } from "@/lib/tema";

/* ============================================================
   Página principal — WebMaster para organizaciones culturales
   Compatible con editores visuales (Revyme, etc.)
   ============================================================ */

export default function HomePage() {
  const { brand, hero, nav, cartelera, obras, equipo, contacto, footer } = content;

  return (
    <div className="pagina">
      
      {/* ===== HEADER / NAVEGACIÓN ===== */}
      <header className="cabecera">
        <div className="cabecera__interior">
          <span className="cabecera__marca">{brand.nombre}</span>
          <nav className="cabecera__nav">
            {nav.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* ===== HERO ===== */}
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
                alt={hero.foto.alt}
                width={hero.foto.w}
                height={hero.foto.h}
                loading="eager"
              />
            )}
          </div>
        </div>
      </section>

      {/* ===== CARTELERA ===== */}
      <section id="cartelera" className="seccion cartelera">
        <h2 className="seccion__titulo">{cartelera.titulo}</h2>
        <div className="cartelera__lista">
          {cartelera.eventos.map((evento, i) => (
            <article key={i} className="evento">
              <div className="evento__media">
                {evento.imagen && (
                  <img src={evento.imagen} alt={evento.titulo} />
                )}
              </div>
              <div className="evento__info">
                <h3 className="evento__titulo">{evento.titulo}</h3>
                <p className="evento__fecha">
                  {new Date(evento.fecha).toLocaleDateString("es-CL", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  · {evento.hora}
                </p>
                <p className="evento__lugar">{evento.lugar}</p>
                <p className="evento__descripcion">{evento.descripcion}</p>
                <div className="evento__acciones">
                  {evento.precio && <span className="evento__precio">{evento.precio}</span>}
                  {evento.entradas && (
                    <a href={evento.entradas} className="btn btn--secundario" target="_blank" rel="noopener">
                      Comprar entradas
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ===== OBRAS / GALERÍA ===== */}
      <section id="obras" className="seccion obras">
        <h2 className="seccion__titulo">{obras.titulo}</h2>
        <p className="seccion__intro">{obras.descripcion}</p>
        <div className="obras__grid">
          {obras.hoja.map((obra, i) => (
            <figure key={i} className="obra">
              <img src={obra.src} alt={obra.cap} loading="lazy" />
              <figcaption className="obra__pie">
                <span className="obra__titulo">{obra.cap}</span>
                {obra.tipo && <span className="obra__tipo">{obra.tipo}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ===== EQUIPO ===== */}
      <section id="equipo" className="seccion equipo">
        <h2 className="seccion__titulo">{equipo.titulo}</h2>
        <p className="seccion__intro">{equipo.descripcion}</p>
        <div className="equipo__grid">
          {equipo.miembros.map((persona, i) => (
            <article key={i} className="miembro">
              {persona.foto && (
                <img src={persona.foto} alt={persona.nombre} className="miembro__foto" />
              )}
              <h3 className="miembro__nombre">{persona.nombre}</h3>
              <p className="miembro__rol">{persona.rol}</p>
              {persona.bio && <p className="miembro__bio">{persona.bio}</p>}
            </article>
          ))}
        </div>
      </section>

      {/* ===== CONTACTO ===== */}
      <section id="contacto" className="seccion contacto">
        <h2 className="seccion__titulo">{contacto.frase}</h2>
        <div className="contacto__datos">
          {contacto.correo && (
            <a href={`mailto:${contacto.correo}`} className="contacto__item">
              {contacto.correo}
            </a>
          )}
          {contacto.telefono && (
            <a href={`tel:${contacto.telefono.replace(/\s/g, "")}`} className="contacto__item">
              {contacto.telefono}
            </a>
          )}
          {contacto.direccion && <p className="contacto__item">{contacto.direccion}</p>}
          {contacto.horario && <p className="contacto__item">{contacto.horario}</p>}
          {contacto.nota && <p className="contacto__nota">{contacto.nota}</p>}
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="pie">
        <div className="pie__interior">
          <div className="pie__col">
            <h3>{brand.nombre}</h3>
            <p>{footer.descripcion}</p>
            <p>{footer.direccion}</p>
            <RedesSociales
              enlaces={redesEnlaces(brand.redesSociales)}
              organizacion={brand.nombre}
            />
          </div>
          <div className="pie__col">
            <h3>Navegación</h3>
            <ul>
              {footer.nav.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="pie__col">
            <p className="pie__legal">{footer.legal}</p>
            {footer.creditos.url && (
              <p className="pie__creditos">
                <a href={footer.creditos.url} target="_blank" rel="noopener">
                  {footer.creditos.texto}
                </a>
              </p>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
