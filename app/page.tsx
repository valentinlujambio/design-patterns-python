import Link from "next/link";
import { BarraDeProgreso } from "@/components/progreso";
import { TarjetaPatron } from "@/components/tarjeta-patron";
import {
  FUNDAMENTOS,
  PATTERNS,
  RUTA,
  STATS,
  getPattern,
  patternsByFamily,
} from "@/lib/content";
import { FAMILY_BLURB, FAMILY_LABEL, type Family } from "@/lib/types";

const DESTACADOS = ["strategy", "observer", "decorator", "rag", "guardarrailes", "tuberia-de-datos"];

function Familia({ family }: { family: Family }) {
  const patrones = patternsByFamily(family);
  const base = patrones[0].track === "gof" ? "/patrones" : "/ia";
  return (
    <div className={`fam-${family} rounded-xl border border-line bg-surface p-5`}>
      <div className="mb-1 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-sm bg-[var(--fam)]" />
        <h3 className="font-semibold tracking-tight">{FAMILY_LABEL[family]}</h3>
        <span className="ml-auto font-mono text-xs text-ink-faint">{patrones.length}</span>
      </div>
      <p className="mb-3 text-sm leading-relaxed text-ink-soft">{FAMILY_BLURB[family]}</p>
      <ul className="flex flex-wrap gap-1.5">
        {patrones.map((p) => (
          <li key={p.slug}>
            <Link
              href={`${base}/${p.slug}`}
              className="inline-block rounded-md border border-line bg-surface-2 px-2 py-1 text-xs text-ink-soft transition hover:border-[var(--fam)] hover:text-ink"
            >
              {p.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Home() {
  const todos = PATTERNS.map((p) => p.slug);

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Portada */}
      <section className="py-14 sm:py-20">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-ink-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {STATS.patrones} patrones · {STATS.ejemplos} ejemplos ejecutables · en español
        </p>
        <h1 className="max-w-3xl text-balance text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
          Patrones de diseño en Python,
          <span className="text-accent"> de los clásicos a la IA</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
          Los {STATS.gof} patrones del catálogo GoF explicados con su problema, sus costos y
          dos implementaciones: la conceptual y la que escribirías de verdad en Python. Más{" "}
          {STATS.ia} patrones para trabajar con modelos de lenguaje, agentes, aprendizaje
          automático y visión por computadora.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/fundamentos/que-es-un-patron"
            className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            Empezar por los fundamentos
          </Link>
          <Link
            href="/ruta"
            className="rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-medium transition hover:border-line-strong"
          >
            Ver la ruta de 8 semanas
          </Link>
          <Link
            href="/ia"
            className="rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-medium transition hover:border-line-strong"
          >
            Ir directo a los patrones de IA
          </Link>
        </div>
      </section>

      {/* Progreso */}
      <section className="mb-14 grid gap-4 sm:grid-cols-[2fr_1fr]">
        <BarraDeProgreso slugs={todos} etiqueta="Tu progreso en el catálogo completo" />
        <div className="grid grid-cols-3 gap-3 rounded-xl border border-line bg-surface p-4 text-center">
          {[
            { n: STATS.fundamentos, t: "fundamentos" },
            { n: STATS.preguntas, t: "preguntas" },
            { n: STATS.ejemplos, t: "ejemplos" },
          ].map((d) => (
            <div key={d.t}>
              <p className="text-xl font-semibold tabular-nums">{d.n}</p>
              <p className="text-[11px] uppercase tracking-wide text-ink-faint">{d.t}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cómo estudiar */}
      <section className="mb-14">
        <h2 className="mb-1 text-2xl font-semibold tracking-tight">Cómo está armado</h2>
        <p className="mb-5 max-w-2xl text-ink-soft">
          Cada patrón sigue la misma estructura, para que puedas compararlos entre sí.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              t: "Problema antes que solución",
              d: "Primero el dolor concreto que resuelve. Si nunca sentiste ese dolor, probablemente no necesites el patrón.",
            },
            {
              t: "Dos implementaciones",
              d: "El ejemplo conceptual con los roles clásicos, y la versión en Python idiomático con Protocol, dataclasses y funciones.",
            },
            {
              t: "Costos explícitos",
              d: "Contras, cuándo NO usarlo y con qué patrón se confunde. Elegir bien es conocer el precio.",
            },
          ].map((c) => (
            <div key={c.t} className="rounded-xl border border-line bg-surface p-5">
              <h3 className="mb-1.5 font-semibold tracking-tight">{c.t}</h3>
              <p className="text-sm leading-relaxed text-ink-soft">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Familias */}
      <section className="mb-14">
        <div className="mb-5 flex items-baseline justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">El catálogo</h2>
            <p className="text-ink-soft">Seis familias, dos tradiciones.</p>
          </div>
        </div>
        <div className="mb-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-faint">
            Clásicos (Gang of Four)
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <Familia family="creacional" />
            <Familia family="estructural" />
            <Familia family="comportamiento" />
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-faint">
            Inteligencia artificial
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <Familia family="llm" />
            <Familia family="ml" />
            <Familia family="cv" />
          </div>
        </div>
      </section>

      {/* Destacados */}
      <section className="mb-14">
        <h2 className="mb-5 text-2xl font-semibold tracking-tight">Para empezar hoy</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DESTACADOS.map((slug) => {
            const p = getPattern(slug);
            return p ? <TarjetaPatron key={slug} patron={p} /> : null;
          })}
        </div>
      </section>

      {/* Fundamentos */}
      <section className="mb-16">
        <h2 className="mb-1 text-2xl font-semibold tracking-tight">Fundamentos</h2>
        <p className="mb-5 text-ink-soft">
          Lo que conviene entender antes de abrir el catálogo, y las críticas que hay que tener
          presentes al usarlo.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FUNDAMENTOS.map((f) => (
            <Link
              key={f.slug}
              href={`/fundamentos/${f.slug}`}
              className="fam-fundamentos rounded-xl border border-line bg-surface p-4 transition hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[var(--shadow)]"
            >
              <div className="mb-1 flex items-baseline gap-2">
                <h3 className="font-medium tracking-tight">{f.title}</h3>
                <span className="ml-auto shrink-0 font-mono text-[11px] text-ink-faint">
                  {f.minutes} min
                </span>
              </div>
              <p className="text-sm leading-relaxed text-ink-soft">{f.tagline}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Ruta */}
      <section className="mb-20 rounded-xl border border-line bg-surface p-6">
        <h2 className="mb-1 text-2xl font-semibold tracking-tight">Ruta de estudio</h2>
        <p className="mb-5 text-ink-soft">
          Ocho semanas, de lo más frecuente a lo más específico.
        </p>
        <ol className="grid gap-2 sm:grid-cols-2">
          {RUTA.map((s) => (
            <li key={s.semana} className="flex items-baseline gap-3 rounded-lg bg-surface-2 px-3 py-2">
              <span className="font-mono text-xs text-ink-faint">S{s.semana}</span>
              <span className="flex-1 text-sm">{s.titulo}</span>
              <span className="font-mono text-[11px] text-ink-faint">{s.slugs.length}</span>
            </li>
          ))}
        </ol>
        <Link
          href="/ruta"
          className="mt-5 inline-block rounded-lg border border-line px-3 py-2 text-sm font-medium transition hover:border-line-strong"
        >
          Ver la ruta completa →
        </Link>
      </section>
    </div>
  );
}
