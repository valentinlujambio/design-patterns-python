"use client";

import { useProgreso } from "@/lib/progreso";

export function BotonAprendido({ slug }: { slug: string }) {
  const { aprendidos, listo, alternar } = useProgreso();
  const marcado = aprendidos.has(slug);

  return (
    <button
      onClick={() => alternar(slug)}
      aria-pressed={marcado}
      className={`flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
        marcado
          ? "border-emerald-500/60 bg-emerald-500/10 text-ink"
          : "border-line bg-surface-2 text-ink-soft hover:border-line-strong hover:text-ink"
      }`}
    >
      <span aria-hidden className="text-[13px]">
        {marcado ? "✓" : "○"}
      </span>
      {listo && marcado ? "Estudiado" : "Marcar como estudiado"}
    </button>
  );
}

export function BarraDeProgreso({
  slugs,
  etiqueta,
  compacto = false,
}: {
  slugs: string[];
  etiqueta?: string;
  compacto?: boolean;
}) {
  const { aprendidos, listo } = useProgreso();
  const hechos = slugs.filter((s) => aprendidos.has(s)).length;
  const pct = slugs.length ? Math.round((hechos / slugs.length) * 100) : 0;

  return (
    <div className={compacto ? "" : "rounded-xl border border-line bg-surface p-4"}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
        <span className={compacto ? "text-xs text-ink-soft" : "font-medium"}>
          {etiqueta ?? "Tu progreso"}
        </span>
        <span className="font-mono text-xs text-ink-faint">
          {listo ? `${hechos}/${slugs.length}` : `—/${slugs.length}`}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-accent transition-all duration-500"
          style={{ width: listo ? `${pct}%` : "0%" }}
        />
      </div>
    </div>
  );
}

export function MarcaAprendido({ slug }: { slug: string }) {
  const { aprendidos, listo } = useProgreso();
  if (!listo || !aprendidos.has(slug)) return null;
  return (
    <span
      title="Marcado como estudiado"
      className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-[11px] text-emerald-600 dark:text-emerald-400"
    >
      ✓
    </span>
  );
}

export function ReiniciarProgreso() {
  const { aprendidos, listo, reiniciar } = useProgreso();
  if (!listo || aprendidos.size === 0) return null;
  return (
    <button
      onClick={() => {
        if (confirm("¿Borrar el progreso guardado en este navegador?")) reiniciar();
      }}
      className="text-xs text-ink-faint underline decoration-dotted underline-offset-2 hover:text-ink-soft"
    >
      Borrar progreso ({aprendidos.size})
    </button>
  );
}
