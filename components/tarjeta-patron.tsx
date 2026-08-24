import Link from "next/link";
import type { Pattern } from "@/lib/types";
import { MarcaAprendido } from "./progreso";

export function Medidor({ valor, etiqueta }: { valor: number; etiqueta: string }) {
  return (
    <span className="inline-flex items-center gap-1" title={`${etiqueta}: ${valor}/3`}>
      <span className="text-[10px] uppercase tracking-wide text-ink-faint">{etiqueta}</span>
      <span className="flex gap-0.5" aria-hidden>
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={`h-1.5 w-1.5 rounded-full ${n <= valor ? "bg-[var(--fam)]" : "bg-line-strong"}`}
          />
        ))}
      </span>
    </span>
  );
}

export function TarjetaPatron({ patron }: { patron: Pattern }) {
  const base = patron.track === "gof" ? "/patrones" : "/ia";
  return (
    <Link
      href={`${base}/${patron.slug}`}
      className={`fam-${patron.family} group flex flex-col rounded-xl border border-line bg-surface p-4 transition hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[var(--shadow)]`}
    >
      <div className="mb-1.5 flex items-start gap-2">
        <h3 className="flex-1 font-semibold tracking-tight group-hover:text-[var(--fam)]">
          {patron.name}
        </h3>
        <MarcaAprendido slug={patron.slug} />
      </div>
      <p className="mb-3 flex-1 text-sm leading-relaxed text-ink-soft">{patron.tagline}</p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Medidor valor={patron.difficulty} etiqueta="dificultad" />
        <Medidor valor={patron.popularity} etiqueta="uso" />
      </div>
    </Link>
  );
}
