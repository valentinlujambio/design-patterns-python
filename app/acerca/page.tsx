import type { Metadata } from "next";
import Link from "next/link";
import { STATS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Sobre este proyecto",
  description:
    "Cómo está hecha esta app, de dónde sale cada contenido, qué licencias aplican y cómo correr los ejemplos y el scraper.",
};

function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="scroll-mt-24">
      <h2 className="mb-3 text-xl font-semibold tracking-tight">{titulo}</h2>
      <div className="prose-app space-y-3 text-[15px] text-ink-soft">{children}</div>
    </section>
  );
}

export default function Pagina() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Sobre este proyecto</h1>
        <p className="mt-3 text-lg leading-relaxed text-ink-soft">
          Una app para aprender patrones de diseño en Python: {STATS.gof} clásicos, {STATS.ia} de
          inteligencia artificial, {STATS.fundamentos} textos de fundamentos y {STATS.ejemplos}{" "}
          ejemplos que se ejecutan de verdad.
        </p>
      </header>

      <div className="space-y-9">
        <Bloque titulo="De dónde sale cada contenido">
          <p>
            Este repositorio es un fork del de{" "}
            <a href="https://refactoring.guru/es/design-patterns" target="_blank" rel="noreferrer noopener" className="text-accent-ink underline decoration-dotted underline-offset-2">
              Refactoring.Guru
            </a>
            , que contiene los ejemplos conceptuales de los patrones GoF en Python. Esos archivos
            —los de <code>src/</code>— se incluyen <strong>sin modificar</strong> y con
            atribución, tal como permite su licencia{" "}
            <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/deed.es" target="_blank" rel="noreferrer noopener" className="text-accent-ink underline decoration-dotted underline-offset-2">
              CC BY-NC-ND 4.0
            </a>{" "}
            (atribución, no comercial, sin obras derivadas).
          </p>
          <p>
            Todo el resto es original de este proyecto: los textos en español, los ejemplos en{" "}
            <code>ejemplos/idiomatico/</code> y <code>ejemplos/ia/</code>, los diagramas, los
            quizzes y los ejercicios. La prosa de refactoring.guru{" "}
            <strong>no se reproduce</strong>: la app enlaza a cada artículo original en lugar de
            copiarlo.
          </p>
        </Bloque>

        <Bloque titulo="El scraper">
          <p>
            El repositorio incluye <code>scripts/scrape-refactoring-guru.mjs</code>, que recorre
            las secciones de fundamentos y los artículos de patrones del sitio en español, con
            límite de tasa y respetando <code>robots.txt</code>. Se ejecuta con:
          </p>
          <pre className="overflow-x-auto rounded-xl border border-line bg-surface p-4 font-mono text-[13px] leading-relaxed">
{`npm run scrape           # descarga a .cache/refactoring-guru/
npm run scrape -- --help # opciones (límite, demora, solo índice)`}
          </pre>
          <p>
            Lo que descarga queda en <code>.cache/</code>, que está en el{" "}
            <code>.gitignore</code>: sirve como <strong>material de consulta local</strong> y para
            generar el índice de enlaces, no para publicarlo. Republicar el texto de un sitio con
            licencia ND en un deploy público sería una infracción, así que la app deliberadamente
            no depende de esa descarga para funcionar.
          </p>
        </Bloque>

        <Bloque titulo="Correr los ejemplos">
          <p>
            Los {STATS.ejemplos} ejemplos son archivos Python sueltos, sin dependencias. Los de IA
            usan un modelo de lenguaje simulado y determinista (
            <code>ejemplos/ia/_llm_falso.py</code>) cuya interfaz imita la de los SDK reales: no
            hace falta API key ni conexión.
          </p>
          <pre className="overflow-x-auto rounded-xl border border-line bg-surface p-4 font-mono text-[13px] leading-relaxed">
{`python3 ejemplos/idiomatico/strategy.py
python3 ejemplos/ia/rag.py

python3 scripts/generar_salidas.py           # regenera las salidas versionadas
python3 scripts/generar_salidas.py --check   # solo verifica que todos corran`}
          </pre>
        </Bloque>

        <Bloque titulo="Cómo está hecha la app">
          <p>
            Next.js con App Router, React y Tailwind. Todas las páginas son estáticas: el código
            Python se lee del repositorio y se resalta con Shiki en tiempo de compilación, así que
            en producción no hay servidor haciendo trabajo ni base de datos.
          </p>
          <p>
            El progreso de estudio se guarda en <code>localStorage</code>. No hay cuentas, ni
            analítica, ni datos que salgan de tu navegador.
          </p>
          <pre className="overflow-x-auto rounded-xl border border-line bg-surface p-4 font-mono text-[13px] leading-relaxed">
{`npm install
npm run dev      # http://localhost:3000
npm run build    # verifica que las 60+ páginas compilen

node --experimental-strip-types scripts/verificar-contenido.mts`}
          </pre>
        </Bloque>

        <Bloque titulo="Desplegar en Vercel">
          <p>
            El proyecto está en la raíz del repositorio y no necesita configuración: importás el
            repo en Vercel, detecta Next.js y publica. No hay variables de entorno ni servicios
            externos que configurar.
          </p>
          <p>
            Como el contenido se lee del repositorio en tiempo de compilación, agregar un patrón
            es agregar su entrada en <code>lib/content/</code> y su archivo Python en{" "}
            <code>ejemplos/</code>: el próximo deploy lo incluye.
          </p>
        </Bloque>

        <Bloque titulo="Licencias">
          <ul className="space-y-2">
            <li className="flex gap-2">
              <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
              <span>
                <strong>Ejemplos conceptuales GoF</strong> (<code>src/</code>): © Refactoring.Guru
                — Alexander Shvets y Alexey Pyltsyn. CC BY-NC-ND 4.0, incluidos sin modificar.
              </span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
              <span>
                <strong>Todo lo demás</strong>: contenido y código originales de este proyecto.
              </span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
              <span>
                <strong>Design Patterns</strong> (1994), de Gamma, Helm, Johnson y Vlissides, es
                la fuente del catálogo clásico. Vale la pena leerlo.
              </span>
            </li>
          </ul>
        </Bloque>

        <Bloque titulo="Cómo seguir">
          <p>
            Si recién llegás, empezá por{" "}
            <Link href="/fundamentos/que-es-un-patron" className="text-accent-ink underline decoration-dotted underline-offset-2">
              qué es un patrón de diseño
            </Link>{" "}
            y seguí la{" "}
            <Link href="/ruta" className="text-accent-ink underline decoration-dotted underline-offset-2">
              ruta de ocho semanas
            </Link>
            . Si ya conocés los clásicos, andá directo a los{" "}
            <Link href="/ia" className="text-accent-ink underline decoration-dotted underline-offset-2">
              patrones de IA
            </Link>
            .
          </p>
        </Bloque>
      </div>
    </div>
  );
}
