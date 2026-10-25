import type { EnlaceNav } from "@/lib/contenido";

/**
 * Los mismos enlaces de navegación en las dos presentaciones que usa el sitio:
 * sueltos dentro del <nav> de la cabecera, o como lista en el pie.
 *
 * Un solo componente para las dos, porque la fuente de datos es una sola
 * (ver `navegacion()` en src/lib/contenido.ts). Si mañana cambia el orden o se
 * agrega una sección, cabecera y pie se mueven juntos.
 */
export default function NavEnlaces({
  enlaces,
  variante,
}: {
  enlaces: EnlaceNav[];
  variante: "cabecera" | "pie";
}) {
  if (variante === "pie") {
    return (
      <ul>
        {enlaces.map((item) => (
          <li key={item.href}>
            <a href={item.href}>{item.label}</a>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <>
      {enlaces.map((item) => (
        <a key={item.href} href={item.href}>
          {item.label}
        </a>
      ))}
    </>
  );
}
