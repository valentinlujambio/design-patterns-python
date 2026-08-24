"use client";

import { useState } from "react";
import type { QuizItem } from "@/lib/types";

export function Quiz({ preguntas, titulo = "Ponete a prueba" }: { preguntas: QuizItem[]; titulo?: string }) {
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});

  if (preguntas.length === 0) return null;
  const respondidas = Object.keys(respuestas).length;
  const correctas = preguntas.filter((p, i) => respuestas[i] === p.answer).length;

  return (
    <section className="rounded-xl border border-line bg-surface p-5">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">{titulo}</h2>
        {respondidas > 0 && (
          <span className="text-sm text-ink-soft">
            {correctas}/{preguntas.length} correctas
          </span>
        )}
      </div>

      <ol className="space-y-6">
        {preguntas.map((p, i) => {
          const elegida = respuestas[i];
          const respondida = elegida !== undefined;
          return (
            <li key={i}>
              <p className="mb-2.5 font-medium">
                <span className="mr-1.5 text-ink-faint">{i + 1}.</span>
                {p.q}
              </p>
              <div className="space-y-1.5">
                {p.options.map((op, j) => {
                  const esCorrecta = j === p.answer;
                  const esElegida = elegida === j;
                  let estilo =
                    "border-line bg-surface-2 hover:border-line-strong hover:bg-surface";
                  if (respondida && esCorrecta)
                    estilo = "border-emerald-500/60 bg-emerald-500/10 text-ink";
                  else if (respondida && esElegida)
                    estilo = "border-rose-500/60 bg-rose-500/10 text-ink";
                  else if (respondida) estilo = "border-line bg-surface-2 opacity-60";

                  return (
                    <button
                      key={j}
                      disabled={respondida}
                      onClick={() => setRespuestas((r) => ({ ...r, [i]: j }))}
                      className={`flex w-full items-start gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition ${estilo}`}
                    >
                      <span className="mt-0.5 font-mono text-[11px] text-ink-faint">
                        {String.fromCharCode(97 + j)}
                      </span>
                      <span className="flex-1">{op}</span>
                      {respondida && esCorrecta && <span aria-hidden>✓</span>}
                      {respondida && esElegida && !esCorrecta && <span aria-hidden>✗</span>}
                    </button>
                  );
                })}
              </div>
              {respondida && (
                <p className="mt-2.5 rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink-soft">
                  {p.why}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {respondidas === preguntas.length && (
        <button
          onClick={() => setRespuestas({})}
          className="mt-5 rounded-lg border border-line px-3 py-1.5 text-sm text-ink-soft transition hover:bg-surface-2 hover:text-ink"
        >
          Reiniciar
        </button>
      )}
    </section>
  );
}
