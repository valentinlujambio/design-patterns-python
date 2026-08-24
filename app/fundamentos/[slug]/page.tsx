import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Quiz } from "@/components/quiz";
import { highlight } from "@/lib/code";
import { FUNDAMENTOS, getFundamento } from "@/lib/content";
import type { FundamentalSection } from "@/lib/types";

export function generateStaticParams() {
  return FUNDAMENTOS.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const f = getFundamento(slug);
  if (!f) return { title: "No encontrado" };
  return { title: f.title, description: f.tagline };
}

const TONO = {
  info: { borde: "border-sky-500/40", fondo: "bg-sky-500/[0.06]", icono: "ℹ" },
  warn: { borde: "border-amber-500/40", fondo: "bg-amber-500/[0.07]", icono: "⚠" },
  tip: { borde: "border-emerald-500/40", fondo: "bg-emerald-500/[0.06]", icono: "✱" },
} as const;

/** Convierte el subconjunto de markdown que usamos (**negrita**, `código`). */
function enriquecer(texto: string, clave: string): React.ReactNode[] {
  return texto.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g).map((parte, i) => {
    const k = `${clave}-${i}`;
    if (parte.startsWith("**") && parte.endsWith("**"))
      return <strong key={k}>{parte.slice(2, -2)}</strong>;
    if (parte.startsWith("`") && parte.endsWith("`"))
      return <code key={k}>{parte.slice(1, -1)}</code>;
    if (parte.startsWith("*") && parte.endsWith("*") && parte.length > 2)
      return <em key={k}>{parte.slice(1, -1)}</em>;
    return <span key={k}>{parte}</span>;
  });
}

async function Bloque({ s, i }: { s: FundamentalSection; i: number }) {
  const codigoHtml = s.code ? await highlight(s.code.source, "python") : null;

  return (
    <section className="scroll-mt-24" id={s.heading ? `s${i}` : undefined}>
      {s.heading && (
        <h2 className="mb-3 mt-2 text-xl font-semibold tracking-tight">{s.heading}</h2>
      )}

      {s.body?.map((p, k) => (
        <p key={k} className="mb-3 text-[15px] leading-[1.75] text-ink-soft">
          {enriquecer(p, `b${i}-${k}`)}
        </p>
      ))}

      {s.list && (
        <ul className="mb-3 space-y-2">
          {s.list.map((li, k) => (
            <li key={k} className="flex gap-2.5 text-[15px] leading-relaxed text-ink-soft">
              <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
              <span>{enriquecer(li, `l${i}-${k}`)}</span>
            </li>
          ))}
        </ul>
      )}

      {s.numbered && (
        <ol className="mb-3 space-y-2.5">
          {s.numbered.map((li, k) => (
            <li key={k} className="flex gap-3 text-[15px] leading-relaxed text-ink-soft">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent-soft font-mono text-xs text-accent-ink">
                {k + 1}
              </span>
              <span className="flex-1">{enriquecer(li, `n${i}-${k}`)}</span>
            </li>
          ))}
        </ol>
      )}

      {codigoHtml && (
        <figure className="mb-4 overflow-hidden rounded-xl border border-line bg-surface">
          {s.code?.caption && (
            <figcaption className="border-b border-line bg-surface-2 px-4 py-2 text-xs text-ink-soft">
              {s.code.caption}
            </figcaption>
          )}
          <div className="shiki-block" dangerouslySetInnerHTML={{ __html: codigoHtml }} />
        </figure>
      )}

      {s.table && (
        <div className="mb-4 overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="bg-surface-2">
                {s.table.head.map((h) => (
                  <th key={h} className="border-b border-line px-4 py-2.5 text-left font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.table.rows.map((fila, k) => (
                <tr key={k} className="bg-surface">
                  {fila.map((celda, j) => (
                    <td
                      key={j}
                      className="border-b border-line px-4 py-2.5 align-top leading-relaxed text-ink-soft last:border-r-0"
                    >
                      {enriquecer(celda, `t${i}-${k}-${j}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {s.callout && (
        <aside
          className={`mb-4 rounded-xl border ${TONO[s.callout.tone].borde} ${
            TONO[s.callout.tone].fondo
          } p-4`}
        >
          <p className="mb-1 flex items-center gap-2 font-medium">
            <span aria-hidden>{TONO[s.callout.tone].icono}</span>
            {s.callout.title}
          </p>
          <p className="text-[15px] leading-relaxed text-ink-soft">
            {enriquecer(s.callout.body, `c${i}`)}
          </p>
        </aside>
      )}
    </section>
  );
}

export default async function Pagina({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const f = getFundamento(slug);
  if (!f) notFound();

  const indice = FUNDAMENTOS.findIndex((x) => x.slug === slug);
  const anterior = FUNDAMENTOS[indice - 1];
  const siguiente = FUNDAMENTOS[indice + 1];

  return (
    <div className="fam-fundamentos mx-auto max-w-3xl px-4 py-10">
      <nav className="mb-5 flex items-center gap-1.5 text-sm text-ink-faint">
        <Link href="/" className="hover:text-ink-soft">Inicio</Link>
        <span>/</span>
        <Link href="/fundamentos" className="hover:text-ink-soft">Fundamentos</Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">{f.title}</h1>
        <p className="mt-3 text-lg leading-relaxed text-ink-soft">{f.tagline}</p>
        <p className="mt-2 font-mono text-xs text-ink-faint">{f.minutes} min de lectura</p>
      </header>

      <article className="space-y-6">
        {f.sections.map((s, i) => (
          <Bloque key={i} s={s} i={i} />
        ))}
      </article>

      {f.quiz && f.quiz.length > 0 && (
        <div className="mt-10">
          <Quiz preguntas={f.quiz} />
        </div>
      )}

      {f.guruUrl && (
        <a
          href={f.guruUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-6 block rounded-xl border border-line bg-surface p-4 text-sm text-ink-soft transition hover:border-line-strong"
        >
          Leer el artículo original en Refactoring.Guru ↗
        </a>
      )}

      <nav className="mt-8 flex flex-wrap justify-between gap-3 border-t border-line pt-6">
        {anterior ? (
          <Link href={`/fundamentos/${anterior.slug}`} className="text-sm text-ink-soft hover:text-ink">
            ← {anterior.title}
          </Link>
        ) : (
          <span />
        )}
        {siguiente ? (
          <Link href={`/fundamentos/${siguiente.slug}`} className="text-sm text-ink-soft hover:text-ink">
            {siguiente.title} →
          </Link>
        ) : (
          <Link href="/patrones" className="text-sm text-ink-soft hover:text-ink">
            Ir al catálogo →
          </Link>
        )}
      </nav>
    </div>
  );
}
