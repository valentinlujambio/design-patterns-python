"use client";

import { useState } from "react";

/**
 * Recorta los bloques largos: un archivo de 130 líneas hace que la página se
 * vuelva imposible de recorrer. Se despliega con un clic y no se vuelve a plegar.
 */
export function CodigoPlegable({
  html,
  lineas,
  umbral = 26,
}: {
  html: string;
  lineas: number;
  umbral?: number;
}) {
  const [abierto, setAbierto] = useState(false);
  const recortable = lineas > umbral + 6;

  if (!recortable || abierto) {
    return <div className="shiki-block" dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return (
    <div className="relative">
      <div
        className="shiki-block overflow-hidden"
        style={{ maxHeight: `${umbral * 1.34}rem` }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface to-transparent" />
      <button
        onClick={() => setAbierto(true)}
        className="absolute inset-x-0 bottom-0 flex justify-center pb-3"
      >
        <span className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-soft shadow-[var(--shadow)] transition hover:text-ink">
          Mostrar las {lineas} líneas ↓
        </span>
      </button>
    </div>
  );
}
