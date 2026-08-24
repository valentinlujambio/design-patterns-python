"use client";

import { useState } from "react";

export function BotonCopiar({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1600);
    } catch {
      /* el navegador puede bloquear el portapapeles */
    }
  }

  return (
    <button
      onClick={copiar}
      className="shrink-0 rounded-md border border-line px-2 py-1 text-[11px] text-ink-soft transition hover:bg-surface hover:text-ink"
    >
      {copiado ? "¡copiado!" : "copiar"}
    </button>
  );
}
