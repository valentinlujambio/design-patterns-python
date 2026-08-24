import Link from "next/link";
import { notFound } from "next/navigation";
import { BloqueCodigo } from "@/components/bloque-codigo";
import { BotonAprendido } from "@/components/progreso";
import { Medidor } from "@/components/tarjeta-patron";
import { Quiz } from "@/components/quiz";
import { PATTERNS, getPattern } from "@/lib/content";
import { FAMILY_LABEL, type Pattern } from "@/lib/types";

function hrefDe(p: Pattern): string {
  return `${p.track === "gof" ? "/patrones" : "/ia"}/${p.slug}`;
}

function Seccion({
  id,
  titulo,
  children,
}: {
  id: string;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-3 text-xl font-semibold tracking-tight">{titulo}</h2>
      {children}
    </section>
  );
}

const INDICE = [
  ["problema", "El problema"],
  ["solucion", "La solución"],
  ["estructura", "Estructura"],
  ["aplicabilidad", "Cuándo usarlo"],
  ["implementacion", "Cómo implementarlo"],
  ["balance", "Pros y contras"],
  ["python", "El toque Python"],
  ["codigo", "Código"],
  ["relaciones", "Relaciones"],
  ["practica", "Práctica"],
] as const;

export function PaginaPatron({ slug }: { slug: string }) {
  const patron = getPattern(slug);
  if (!patron) notFound();

  const hermanos = PATTERNS.filter(
    (p) => p.track === patron.track && p.family === patron.family,
  );
  const i = hermanos.findIndex((p) => p.slug === patron.slug);
  const anterior = hermanos[i - 1];
  const siguiente = hermanos[i + 1];
  const relacionados = patron.related.map(getPattern).filter((p): p is Pattern => !!p);

  return (
    <div className={`fam-${patron.family} mx-auto max-w-6xl px-4 py-8`}>
      <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-ink-faint">
        <Link href="/" className="hover:text-ink-soft">Inicio</Link>
        <span>/</span>
        <Link href={patron.track === "gof" ? "/patrones" : "/ia"} className="hover:text-ink-soft">
          {patron.track === "gof" ? "Patrones GoF" : "Patrones de IA"}
        </Link>
        <span>/</span>
        <span className="text-ink-soft">{patron.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_248px]">
        <article className="min-w-0 space-y-10">
          <header>
            <div className="mb-2.5 flex flex-wrap items-center gap-2">
              <span
                className="rounded-md px-2 py-0.5 text-xs font-medium"
                style={{ background: "var(--fam-soft)", color: "var(--fam)" }}
              >
                {FAMILY_LABEL[patron.family]}
              </span>
              {patron.aka?.map((a) => (
                <span key={a} className="text-xs text-ink-faint">
                  · {a}
                </span>
              ))}
            </div>
            <h1 className="text-4xl font-bold tracking-tight">{patron.name}</h1>
            <p className="mt-3 text-lg leading-relaxed text-ink-soft">{patron.tagline}</p>
            <p className="mt-4 border-l-2 border-[var(--fam)] pl-4 text-[15px] leading-relaxed">
              <strong className="font-semibold">Propósito.</strong> {patron.intent}
            </p>
          </header>

          <Seccion id="problema" titulo="El problema">
            <div className="prose-app text-[15px] text-ink-soft">
              {patron.problem.map((p, k) => (
                <p key={k}>{p}</p>
              ))}
            </div>
          </Seccion>

          <Seccion id="solucion" titulo="La solución">
            <div className="prose-app text-[15px] text-ink-soft">
              {patron.solution.map((p, k) => (
                <p key={k}>{p}</p>
              ))}
            </div>
            {patron.analogy && (
              <aside className="mt-4 rounded-xl border border-line bg-surface p-4">
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[var(--fam)]">
                  Analogía · {patron.analogy.title}
                </p>
                {patron.analogy.body.map((p, k) => (
                  <p key={k} className="text-[15px] leading-relaxed text-ink-soft">
                    {p}
                  </p>
                ))}
              </aside>
            )}
          </Seccion>

          {patron.diagram && (
            <Seccion id="estructura" titulo="Estructura">
              <div className="overflow-x-auto rounded-xl border border-line bg-surface p-4">
                <pre className="font-mono text-[12.5px] leading-[1.45] text-ink-soft">
                  {patron.diagram}
                </pre>
              </div>
            </Seccion>
          )}

          <Seccion id="aplicabilidad" titulo="Cuándo usarlo">
            <ul className="space-y-3">
              {patron.applicability.map((a, k) => (
                <li key={k} className="rounded-xl border border-line bg-surface p-4">
                  <p className="mb-1 font-medium">{a.when}</p>
                  <p className="text-sm leading-relaxed text-ink-soft">{a.detail}</p>
                </li>
              ))}
            </ul>
          </Seccion>

          <Seccion id="implementacion" titulo="Cómo implementarlo">
            <ol className="space-y-2.5">
              {patron.steps.map((s, k) => (
                <li key={k} className="flex gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--fam-soft)] font-mono text-xs text-[var(--fam)]">
                    {k + 1}
                  </span>
                  <span className="flex-1 text-[15px] leading-relaxed text-ink-soft">{s}</span>
                </li>
              ))}
            </ol>
          </Seccion>

          <Seccion id="balance" titulo="Pros y contras">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.04] p-4">
                <p className="mb-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  A favor
                </p>
                <ul className="space-y-1.5 text-sm leading-relaxed text-ink-soft">
                  {patron.pros.map((p, k) => (
                    <li key={k} className="flex gap-2">
                      <span aria-hidden className="text-emerald-600 dark:text-emerald-400">+</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/[0.04] p-4">
                <p className="mb-2 text-sm font-medium text-rose-700 dark:text-rose-400">
                  En contra
                </p>
                <ul className="space-y-1.5 text-sm leading-relaxed text-ink-soft">
                  {patron.cons.map((c, k) => (
                    <li key={k} className="flex gap-2">
                      <span aria-hidden className="text-rose-600 dark:text-rose-400">−</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Seccion>

          <Seccion id="python" titulo="El toque Python">
            <div className="space-y-3">
              {patron.pythonNotes.map((n, k) => (
                <div key={k} className="rounded-xl border border-line bg-surface p-4">
                  <p className="mb-1 font-medium">{n.title}</p>
                  <p className="text-sm leading-relaxed text-ink-soft">{n.body}</p>
                </div>
              ))}
            </div>
          </Seccion>

          <Seccion id="codigo" titulo="Código">
            <div className="space-y-5">
              {patron.samples.map((s) => (
                <BloqueCodigo
                  key={s.path}
                  path={s.path}
                  titulo={s.title}
                  descripcion={s.description}
                  credito={s.credit}
                  outputPath={s.outputPath}
                />
              ))}
            </div>
          </Seccion>

          <Seccion id="relaciones" titulo="Relaciones con otros patrones">
            <ul className="mb-4 space-y-2">
              {patron.relations.map((r, k) => (
                <li key={k} className="flex gap-2 text-[15px] leading-relaxed text-ink-soft">
                  <span aria-hidden className="text-[var(--fam)]">→</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              {relacionados.map((r) => (
                <Link
                  key={r.slug}
                  href={hrefDe(r)}
                  className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm transition hover:border-line-strong"
                >
                  {r.name}
                </Link>
              ))}
            </div>
          </Seccion>

          <Seccion id="practica" titulo="Práctica">
            <div className="space-y-5">
              <Quiz preguntas={patron.quiz} />
              <div className="rounded-xl border border-line bg-surface p-5">
                <h3 className="mb-3 font-semibold tracking-tight">Ejercicios</h3>
                <ol className="space-y-2.5">
                  {patron.exercises.map((e, k) => (
                    <li key={k} className="flex gap-3 text-[15px] leading-relaxed text-ink-soft">
                      <span className="font-mono text-xs text-ink-faint">{k + 1}.</span>
                      <span>{e}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Seccion>

          <nav className="flex flex-wrap justify-between gap-3 border-t border-line pt-6">
            {anterior ? (
              <Link href={hrefDe(anterior)} className="text-sm text-ink-soft hover:text-ink">
                ← {anterior.name}
              </Link>
            ) : (
              <span />
            )}
            {siguiente && (
              <Link href={hrefDe(siguiente)} className="text-sm text-ink-soft hover:text-ink">
                {siguiente.name} →
              </Link>
            )}
          </nav>
        </article>

        <aside className="no-print hidden lg:block">
          <div className="sticky top-20 space-y-4">
            <BotonAprendido slug={patron.slug} />
            <div className="rounded-xl border border-line bg-surface p-4">
              <div className="mb-3 space-y-1.5">
                <Medidor valor={patron.difficulty} etiqueta="dificultad" />
                <br />
                <Medidor valor={patron.popularity} etiqueta="uso" />
              </div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-faint">
                En esta página
              </p>
              <ul className="space-y-1 text-sm">
                {INDICE.filter(([id]) => id !== "estructura" || patron.diagram).map(
                  ([id, texto]) => (
                    <li key={id}>
                      <a href={`#${id}`} className="text-ink-soft hover:text-[var(--fam)]">
                        {texto}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>
            {patron.guruUrl && (
              <a
                href={patron.guruUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="block rounded-xl border border-line bg-surface p-4 text-sm text-ink-soft transition hover:border-line-strong"
              >
                Leer este patrón en Refactoring.Guru ↗
              </a>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
