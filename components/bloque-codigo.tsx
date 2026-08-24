import { highlight, readRepoFile, countLines } from "@/lib/code";
import { BotonCopiar } from "./boton-copiar";
import { CodigoPlegable } from "./codigo-plegable";

interface Props {
  path: string;
  titulo?: string;
  descripcion?: string;
  credito?: string;
  /** Ruta a la salida esperada del programa, si existe. */
  outputPath?: string;
  lang?: string;
}

const GITHUB = "https://github.com/valentinlujambio/design-patterns-python/blob/main/";

export async function BloqueCodigo({
  path,
  titulo,
  descripcion,
  credito,
  outputPath,
  lang = "python",
}: Props) {
  const codigo = readRepoFile(path);
  if (codigo === null) {
    return (
      <div className="rounded-xl border border-line bg-surface-2 p-4 text-sm text-ink-faint">
        No se encontró <code>{path}</code>.
      </div>
    );
  }
  const html = await highlight(codigo, lang);
  const salidaCruda = outputPath ? readRepoFile(outputPath) : null;
  const salida = salidaCruda ? await highlight(salidaCruda.trimEnd(), "text") : null;

  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-surface">
      <figcaption className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line bg-surface-2 px-4 py-2.5">
        <div className="min-w-0 flex-1">
          {titulo && <p className="text-sm font-medium">{titulo}</p>}
          {descripcion && <p className="text-xs text-ink-soft">{descripcion}</p>}
        </div>
        <span className="font-mono text-[11px] text-ink-faint">
          {path} · {countLines(codigo)} líneas
        </span>
        <BotonCopiar texto={codigo} />
      </figcaption>

      <CodigoPlegable html={html} lineas={countLines(codigo)} />

      {salida && (
        <details className="border-t border-line">
          <summary className="cursor-pointer bg-surface-2 px-4 py-2 text-xs font-medium text-ink-soft hover:text-ink">
            Ver la salida del programa
          </summary>
          <div className="shiki-block border-t border-line" dangerouslySetInnerHTML={{ __html: salida }} />
        </details>
      )}

      <div className="flex flex-wrap items-center gap-x-3 border-t border-line bg-surface-2 px-4 py-2 text-[11px] text-ink-faint">
        <a
          href={GITHUB + path}
          target="_blank"
          rel="noreferrer noopener"
          className="underline decoration-dotted underline-offset-2 hover:text-ink-soft"
        >
          Ver en GitHub
        </a>
        <code className="font-mono">python3 {path}</code>
        {credito && <span className="ml-auto">Código: {credito}</span>}
      </div>
    </figure>
  );
}
