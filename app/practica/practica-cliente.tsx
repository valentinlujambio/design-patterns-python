"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { PreguntaGlobal } from "@/lib/content";

function mezclar<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function PracticaCliente({ preguntas, cantidad = 10 }: { preguntas: PreguntaGlobal[]; cantidad?: number }) {
  const [tanda, setTanda] = useState<PreguntaGlobal[]>([]);
  const [indice, setIndice] = useState(0);
  const [elegida, setElegida] = useState<number | null>(null);
  const [aciertos, setAciertos] = useState(0);

  const nuevaTanda = useCallback(() => {
    setTanda(mezclar(preguntas).slice(0, cantidad));
    setIndice(0);
    setElegida(null);
    setAciertos(0);
  }, [preguntas, cantidad]);

  // La mezcla ocurre en el cliente para no romper la hidratación.
  useEffect(() => nuevaTanda(), [nuevaTanda]);

  if (tanda.length === 0) {
    return <div className="rounded-xl border border-line bg-surface p-8 text-center text-ink-faint">Preparando preguntas…</div>;
  }

  const terminado = indice >= tanda.length;

  if (terminado) {
    const pct = Math.round((aciertos / tanda.length) * 100);
    return (
      <div className="rounded-xl border border-line bg-surface p-8 text-center">
        <p className="text-5xl font-bold tabular-nums">{pct}%</p>
        <p className="mt-2 text-ink-soft">
          {aciertos} de {tanda.length} correctas
        </p>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
          {pct >= 90
            ? "Dominás el catálogo. Probá los ejercicios de los patrones que menos usaste."
            : pct >= 70
              ? "Buena base. Volvé sobre los patrones donde dudaste: la sección «Relaciones» suele desempatar."
              : "Todavía hay tela. Repasá los fundamentos y volvé a la ruta de estudio semana por semana."}
        </p>
        <button
          onClick={nuevaTanda}
          className="mt-6 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          Otra tanda de {cantidad}
        </button>
      </div>
    );
  }

  const p = tanda[indice];
  const respondida = elegida !== null;

  return (
    <div className="rounded-xl border border-line bg-surface p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${(indice / tanda.length) * 100}%` }}
          />
        </div>
        <span className="font-mono text-xs text-ink-faint">
          {indice + 1}/{tanda.length}
        </span>
      </div>

      <p className="mb-1 text-xs uppercase tracking-wide text-ink-faint">{p.origen}</p>
      <p className="mb-4 text-lg font-medium leading-snug">{p.q}</p>

      <div className="space-y-2">
        {p.options.map((op, j) => {
          const esCorrecta = j === p.answer;
          let estilo = "border-line bg-surface-2 hover:border-line-strong hover:bg-surface";
          if (respondida && esCorrecta) estilo = "border-emerald-500/60 bg-emerald-500/10";
          else if (respondida && j === elegida) estilo = "border-rose-500/60 bg-rose-500/10";
          else if (respondida) estilo = "border-line bg-surface-2 opacity-60";

          return (
            <button
              key={j}
              disabled={respondida}
              onClick={() => {
                setElegida(j);
                if (esCorrecta) setAciertos((a) => a + 1);
              }}
              className={`flex w-full items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-left text-sm transition ${estilo}`}
            >
              <span className="mt-0.5 font-mono text-[11px] text-ink-faint">
                {String.fromCharCode(97 + j)}
              </span>
              <span className="flex-1">{op}</span>
            </button>
          );
        })}
      </div>

      {respondida && (
        <>
          <p className="mt-4 rounded-lg border border-line bg-surface-2 px-3.5 py-2.5 text-sm leading-relaxed text-ink-soft">
            {p.why}
          </p>
          <div className="mt-4 flex items-center justify-between gap-3">
            <Link href={p.href} className="text-sm text-ink-faint underline decoration-dotted underline-offset-2 hover:text-ink-soft">
              Ver {p.origen}
            </Link>
            <button
              onClick={() => {
                setIndice((i) => i + 1);
                setElegida(null);
              }}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              {indice + 1 === tanda.length ? "Ver resultado" : "Siguiente"} →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
