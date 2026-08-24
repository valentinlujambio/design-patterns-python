import type { Metadata } from "next";
import { PaginaCatalogo } from "@/components/pagina-catalogo";

export const metadata: Metadata = {
  title: "Patrones clásicos (GoF)",
  description:
    "Los 22 patrones de diseño del catálogo Gang of Four explicados en español, con ejemplo conceptual y versión en Python idiomático.",
};

export default function Pagina() {
  return (
    <PaginaCatalogo
      track="gof"
      titulo="Patrones clásicos"
      bajada="Los 22 patrones del catálogo Gang of Four, cada uno con su problema, sus costos, el ejemplo conceptual y la versión que escribirías de verdad en Python."
      nota={
        <>
          <strong className="font-medium text-ink">¿Por qué 22 y no 23?</strong> Como
          Refactoring.Guru, este catálogo omite <em>Interpreter</em>: es el patrón más
          específico del libro original y casi nunca aparece fuera del mundo de los
          compiladores.
        </>
      }
    />
  );
}
