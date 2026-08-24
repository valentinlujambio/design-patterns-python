import type { Metadata } from "next";
import Link from "next/link";
import { FUNDAMENTOS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Fundamentos",
  description:
    "Qué es un patrón de diseño, cómo se clasifican, principios de diseño, SOLID en Python, críticas y cómo estudiar el catálogo.",
};

export default function Pagina() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Fundamentos</h1>
        <p className="mt-3 text-lg leading-relaxed text-ink-soft">
          Antes del catálogo: qué es realmente un patrón, de dónde salen los que existen, qué
          principios los originan y por qué la crítica más útil es la que explica cuándo no
          usarlos.
        </p>
      </header>

      <ol className="space-y-3">
        {FUNDAMENTOS.map((f, i) => (
          <li key={f.slug}>
            <Link
              href={`/fundamentos/${f.slug}`}
              className="fam-fundamentos flex gap-4 rounded-xl border border-line bg-surface p-5 transition hover:border-line-strong hover:shadow-[var(--shadow)]"
            >
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--fam-soft)] font-mono text-xs text-[var(--fam)]">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <h2 className="font-semibold tracking-tight">{f.title}</h2>
                  <span className="ml-auto shrink-0 font-mono text-[11px] text-ink-faint">
                    {f.minutes} min
                  </span>
                </div>
                <p className="mt-1 text-[15px] leading-relaxed text-ink-soft">{f.tagline}</p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
