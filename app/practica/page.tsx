import type { Metadata } from "next";
import { allQuizItems, STATS } from "@/lib/content";
import { PracticaCliente } from "./practica-cliente";

export const metadata: Metadata = {
  title: "Práctica",
  description:
    "Poné a prueba lo que estudiaste con preguntas al azar sobre los 47 patrones y los fundamentos.",
};

export default function Pagina() {
  const preguntas = allQuizItems();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Práctica</h1>
        <p className="mt-3 text-lg leading-relaxed text-ink-soft">
          Diez preguntas al azar entre las {STATS.preguntas} del catálogo. Cada respuesta
          explica por qué, así que equivocarse también sirve.
        </p>
      </header>
      <PracticaCliente preguntas={preguntas} />
    </div>
  );
}
