import { BarraDeProgreso } from "@/components/progreso";
import { TarjetaPatron } from "@/components/tarjeta-patron";
import { FAMILIES_BY_TRACK, patternsByFamily, patternsByTrack } from "@/lib/content";
import { FAMILY_BLURB, FAMILY_LABEL, type Track } from "@/lib/types";

export function PaginaCatalogo({
  track,
  titulo,
  bajada,
  nota,
}: {
  track: Track;
  titulo: string;
  bajada: string;
  nota?: React.ReactNode;
}) {
  const todos = patternsByTrack(track);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8 max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight">{titulo}</h1>
        <p className="mt-3 text-lg leading-relaxed text-ink-soft">{bajada}</p>
        {nota && (
          <div className="mt-4 rounded-xl border border-line bg-surface p-4 text-sm leading-relaxed text-ink-soft">
            {nota}
          </div>
        )}
      </header>

      <div className="mb-10 max-w-md">
        <BarraDeProgreso slugs={todos.map((p) => p.slug)} etiqueta="Progreso en esta sección" />
      </div>

      <div className="space-y-12">
        {FAMILIES_BY_TRACK[track].map((family) => {
          const patrones = patternsByFamily(family);
          return (
            <section key={family} id={family} className={`fam-${family} scroll-mt-20`}>
              <div className="mb-4 border-l-2 border-[var(--fam)] pl-4">
                <h2 className="text-2xl font-semibold tracking-tight">
                  {FAMILY_LABEL[family]}
                  <span className="ml-2 font-mono text-sm font-normal text-ink-faint">
                    {patrones.length}
                  </span>
                </h2>
                <p className="mt-1 max-w-2xl text-ink-soft">{FAMILY_BLURB[family]}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {patrones.map((p) => (
                  <TarjetaPatron key={p.slug} patron={p} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
