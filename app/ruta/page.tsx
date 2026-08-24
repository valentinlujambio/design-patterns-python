import type { Metadata } from "next";
import Link from "next/link";
import { BarraDeProgreso, ReiniciarProgreso, MarcaAprendido } from "@/components/progreso";
import { PATTERNS, RUTA, getPattern } from "@/lib/content";
import { FAMILY_LABEL } from "@/lib/types";

export const metadata: Metadata = {
  title: "Ruta de estudio",
  description:
    "Ocho semanas para recorrer los 47 patrones, de los más frecuentes a los más específicos, con seguimiento de progreso.",
};

export default function Pagina() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Ruta de estudio</h1>
        <p className="mt-3 text-lg leading-relaxed text-ink-soft">
          Ocho semanas, de tres a ocho patrones por semana. El orden no es el del libro: va de lo
          que más vas a usar a lo más específico, dejando para el final los que necesitan
          contexto previo.
        </p>
      </header>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-[240px] flex-1">
          <BarraDeProgreso slugs={PATTERNS.map((p) => p.slug)} etiqueta="Catálogo completo" />
        </div>
        <ReiniciarProgreso />
      </div>

      <div className="space-y-6">
        {RUTA.map((semana) => (
          <section key={semana.semana} className="rounded-xl border border-line bg-surface p-5">
            <div className="mb-1 flex items-baseline gap-3">
              <span className="rounded-md bg-accent-soft px-2 py-0.5 font-mono text-xs text-accent-ink">
                semana {semana.semana}
              </span>
              <h2 className="font-semibold tracking-tight">{semana.titulo}</h2>
            </div>
            <p className="mb-3 text-sm leading-relaxed text-ink-soft">{semana.nota}</p>

            <div className="mb-3">
              <BarraDeProgreso slugs={semana.slugs} etiqueta="Progreso de la semana" compacto />
            </div>

            <ul className="grid gap-1.5 sm:grid-cols-2">
              {semana.slugs.map((slug) => {
                const p = getPattern(slug);
                if (!p) return null;
                const href = `${p.track === "gof" ? "/patrones" : "/ia"}/${p.slug}`;
                return (
                  <li key={slug}>
                    <Link
                      href={href}
                      className={`fam-${p.family} flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm transition hover:border-[var(--fam)]`}
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--fam)]" />
                      <span className="flex-1 truncate">{p.name}</span>
                      <span className="hidden shrink-0 text-[10px] uppercase tracking-wide text-ink-faint sm:inline">
                        {FAMILY_LABEL[p.family]}
                      </span>
                      <MarcaAprendido slug={slug} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-line bg-surface p-5">
        <h2 className="mb-2 font-semibold tracking-tight">Cómo aprovecharla</h2>
        <p className="text-[15px] leading-relaxed text-ink-soft">
          Leé el problema y frená antes de la solución: pensá cómo lo resolverías vos. Después
          escribí el ejemplo a mano —sin copiar y pegar— y hacé el quiz. El método completo está
          en{" "}
          <Link href="/fundamentos/como-estudiarlos" className="text-accent-ink underline decoration-dotted underline-offset-2">
            cómo estudiar este catálogo
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
