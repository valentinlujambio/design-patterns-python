import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { buildSearchIndex } from "@/lib/content";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Patrones de diseño en Python — GoF, LLM, ML y visión",
    template: "%s · Patrones en Python",
  },
  description:
    "Aprendé los 22 patrones de diseño clásicos y 25 patrones de IA, LLM, aprendizaje automático y visión por computadora, con ejemplos ejecutables en Python.",
  keywords: [
    "patrones de diseño",
    "Python",
    "GoF",
    "LLM",
    "RAG",
    "machine learning",
    "visión por computadora",
  ],
  authors: [{ name: "Valentín Lujambio" }],
  openGraph: {
    type: "website",
    locale: "es_AR",
    title: "Patrones de diseño en Python",
    description:
      "47 patrones —clásicos y de IA— con ejemplos ejecutables, quizzes y ruta de estudio.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbfd" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0d12" },
  ],
};

/** Se ejecuta antes del primer pintado para que no parpadee el tema. */
const SCRIPT_TEMA = `(function(){try{var t=localStorage.getItem("patrones:tema");var o=t?t==="oscuro":matchMedia("(prefers-color-scheme: dark)").matches;if(o)document.documentElement.classList.add("dark")}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const indice = buildSearchIndex();

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body className="min-h-dvh antialiased">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-3 focus:py-2 focus:text-white"
        >
          Saltar al contenido
        </a>
        <SiteHeader indice={indice} />
        <main id="contenido">{children}</main>
        <footer className="no-print mt-20 border-t border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-ink-soft">
            <div className="grid gap-8 sm:grid-cols-3">
              <div>
                <p className="mb-2 font-semibold text-ink">Patrones en Python</p>
                <p className="text-[13px] leading-relaxed">
                  Material de estudio original en español, con ejemplos ejecutables sin
                  dependencias. El progreso se guarda solo en tu navegador.
                </p>
              </div>
              <div>
                <p className="mb-2 font-medium text-ink">Secciones</p>
                <ul className="space-y-1 text-[13px]">
                  <li><Link href="/fundamentos" className="hover:text-ink">Fundamentos</Link></li>
                  <li><Link href="/patrones" className="hover:text-ink">Patrones clásicos</Link></li>
                  <li><Link href="/ia" className="hover:text-ink">Patrones de IA</Link></li>
                  <li><Link href="/ruta" className="hover:text-ink">Ruta de estudio</Link></li>
                  <li><Link href="/practica" className="hover:text-ink">Práctica</Link></li>
                </ul>
              </div>
              <div>
                <p className="mb-2 font-medium text-ink">Créditos</p>
                <ul className="space-y-1 text-[13px]">
                  <li>
                    <Link href="/acerca" className="hover:text-ink">
                      Sobre este proyecto y licencias
                    </Link>
                  </li>
                  <li>
                    <a
                      href="https://refactoring.guru/es/design-patterns"
                      target="_blank"
                      rel="noreferrer noopener"
                      className="hover:text-ink"
                    >
                      Refactoring.Guru ↗
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/valentinlujambio/design-patterns-python"
                      target="_blank"
                      rel="noreferrer noopener"
                      className="hover:text-ink"
                    >
                      Código del proyecto ↗
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <p className="mt-8 border-t border-line pt-6 text-xs text-ink-faint">
              Los ejemplos conceptuales GoF provienen del repositorio de Refactoring.Guru
              (CC BY-NC-ND 4.0) y se incluyen sin modificaciones. El resto del contenido
              —textos, ejemplos idiomáticos, patrones de IA, quizzes— es original de este
              proyecto.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
