import Link from "next/link";

export default function NoEncontrado() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <p className="font-mono text-5xl font-bold text-accent">404</p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Esta página no existe</h1>
      <p className="mt-2 text-ink-soft">
        Puede que el patrón haya cambiado de nombre o que el enlace esté mal escrito. Probá con el
        buscador (⌘K) o volvé al catálogo.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/patrones" className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90">
          Patrones clásicos
        </Link>
        <Link href="/ia" className="rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-medium transition hover:border-line-strong">
          Patrones de IA
        </Link>
      </div>
    </div>
  );
}
