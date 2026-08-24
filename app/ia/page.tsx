import type { Metadata } from "next";
import { PaginaCatalogo } from "@/components/pagina-catalogo";

export const metadata: Metadata = {
  title: "Patrones de IA, LLM, ML y visión",
  description:
    "25 patrones para construir aplicaciones con modelos de lenguaje, agentes, aprendizaje automático y visión por computadora, con ejemplos Python ejecutables sin dependencias.",
};

export default function Pagina() {
  return (
    <PaginaCatalogo
      track="ia"
      titulo="Patrones de IA"
      bajada="Estructuras que se repiten al construir con modelos de lenguaje, entrenar modelos y procesar imágenes. Cada una es, por debajo, un patrón clásico —pero con problemas que el libro de 1994 no podía anticipar."
      nota={
        <>
          Todos los ejemplos corren con <code className="font-mono text-[13px]">python3</code>{" "}
          sin instalar nada y sin API key: usan un modelo simulado determinista cuya interfaz
          imita la de los SDK reales. Podés ejecutarlos, romperlos y ver qué cambia.
        </>
      }
    />
  );
}
