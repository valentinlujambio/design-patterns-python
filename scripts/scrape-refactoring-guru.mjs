#!/usr/bin/env node
/**
 * Descarga, para consulta local, las páginas de refactoring.guru relacionadas con
 * los fundamentos de los patrones de diseño y con sus ejemplos en Python.
 *
 *     npm run scrape
 *     npm run scrape -- --demora 2000 --limite 40
 *     npm run scrape -- --solo-indice
 *
 * Qué hace y qué NO hace, a propósito:
 *
 *  · Respeta robots.txt (User-agent: *) y se detiene si una ruta está prohibida.
 *  · Descarga de a una página por vez, con demora configurable entre pedidos.
 *  · Guarda el HTML y una versión en texto en .cache/refactoring-guru/, que está
 *    en el .gitignore.
 *  · Genera content/indice-guru.json con título y URL de cada página: eso sí se
 *    puede versionar, porque son enlaces, no contenido.
 *
 * El contenido de refactoring.guru tiene licencia CC BY-NC-ND: se puede leer y
 * citar, no republicar. Por eso esta app enlaza a los artículos originales y su
 * material didáctico es propio. Usá lo descargado para estudiar, no para publicar.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const DESTINO = join(RAIZ, ".cache", "refactoring-guru");
const INDICE = join(RAIZ, "content", "indice-guru.json");

const BASE = "https://refactoring.guru";
const AGENTE = "PatronesEnPythonBot/1.0 (uso educativo; una página cada N ms)";

const PREFIJOS_PERMITIDOS = ["/es/design-patterns", "/es/refactoring/what-is-refactoring"];

const SEMILLAS = [
  "/es/design-patterns",
  "/es/design-patterns/what-is-pattern",
  "/es/design-patterns/classification",
  "/es/design-patterns/criticism",
  "/es/design-patterns/catalog",
  "/es/design-patterns/python",
];

function opciones(argv) {
  const o = { demora: 1500, limite: 120, soloIndice: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--demora") o.demora = Number(argv[++i]);
    else if (a === "--limite") o.limite = Number(argv[++i]);
    else if (a === "--solo-indice") o.soloIndice = true;
    else if (a === "--help" || a === "-h") o.ayuda = true;
  }
  return o;
}

const AYUDA = `
Uso: npm run scrape -- [opciones]

  --demora <ms>    Espera entre pedidos (por defecto 1500).
  --limite <n>     Máximo de páginas a descargar (por defecto 120).
  --solo-indice    No guarda el contenido: solo arma el índice de enlaces.
  --help           Muestra esta ayuda.

Salida:
  .cache/refactoring-guru/   HTML y texto (ignorado por git)
  content/indice-guru.json   título + URL de cada página (versionable)
`;

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

async function traer(url) {
  const res = await fetch(url, {
    headers: { "user-agent": AGENTE, "accept-language": "es-AR,es;q=0.9" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  return res.text();
}

/** Parseo mínimo de robots.txt para el User-agent genérico. */
function parsearRobots(texto) {
  const prohibidas = [];
  let aplica = false;
  for (const linea of texto.split("\n")) {
    const l = linea.split("#")[0].trim();
    if (!l) continue;
    const [clave, ...resto] = l.split(":");
    const valor = resto.join(":").trim();
    const k = clave.trim().toLowerCase();
    if (k === "user-agent") aplica = valor === "*";
    else if (aplica && k === "disallow" && valor) prohibidas.push(valor);
  }
  return prohibidas;
}

const permitida = (ruta, prohibidas) =>
  PREFIJOS_PERMITIDOS.some((p) => ruta.startsWith(p)) &&
  !prohibidas.some((p) => ruta.startsWith(p));

function titulo(html) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].replace(/\s+/g, " ").trim() : "(sin título)";
}

function enlaces(html) {
  const salida = new Set();
  for (const m of html.matchAll(/href="([^"#?]+)/g)) {
    const href = m[1];
    if (href.startsWith("/")) salida.add(href.replace(/\/$/, ""));
    else if (href.startsWith(BASE)) salida.add(href.slice(BASE.length).replace(/\/$/, ""));
  }
  return [...salida];
}

/** HTML → texto legible. Suficiente para leer y buscar, no para republicar. */
function aTexto(html) {
  const cuerpo = html.match(/<article[\s\S]*?<\/article>/i)?.[0] ?? html;
  return cuerpo
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<\/(p|div|li|h[1-6]|pre|tr)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const nombreArchivo = (ruta) => ruta.replace(/^\//, "").replace(/\//g, "_") || "index";

async function main() {
  const o = opciones(process.argv.slice(2));
  if (o.ayuda) {
    console.log(AYUDA);
    return;
  }

  console.log(`Descargando de ${BASE} · demora ${o.demora} ms · límite ${o.limite}\n`);

  let prohibidas = [];
  try {
    prohibidas = parsearRobots(await traer(`${BASE}/robots.txt`));
    console.log(`robots.txt: ${prohibidas.length} reglas Disallow para User-agent: *`);
  } catch (e) {
    console.error(`No se pudo leer robots.txt (${e.message}). Se aborta por precaución.`);
    console.error("Si estás detrás de un proxy, probá con NODE_USE_ENV_PROXY=1.");
    process.exit(1);
  }

  const bloqueadas = SEMILLAS.filter((s) => !permitida(s, prohibidas));
  if (bloqueadas.length === SEMILLAS.length) {
    console.error("robots.txt prohíbe todas las rutas semilla. No se descarga nada.");
    process.exit(1);
  }

  if (!o.soloIndice) await mkdir(DESTINO, { recursive: true });
  await mkdir(dirname(INDICE), { recursive: true });

  const pendientes = SEMILLAS.filter((s) => permitida(s, prohibidas));
  const vistas = new Set(pendientes);
  const indice = [];
  let descargadas = 0;
  let errores = 0;

  while (pendientes.length > 0 && descargadas < o.limite) {
    const ruta = pendientes.shift();
    try {
      const html = await traer(BASE + ruta);
      descargadas++;
      const t = titulo(html);
      indice.push({ ruta, url: BASE + ruta, titulo: t });

      if (!o.soloIndice) {
        const base = join(DESTINO, nombreArchivo(ruta));
        await writeFile(`${base}.html`, html, "utf8");
        await writeFile(`${base}.txt`, `${BASE + ruta}\n${t}\n\n${aTexto(html)}\n`, "utf8");
      }

      for (const href of enlaces(html)) {
        if (!vistas.has(href) && permitida(href, prohibidas)) {
          vistas.add(href);
          pendientes.push(href);
        }
      }

      console.log(`  ${String(descargadas).padStart(3)} · ${t.slice(0, 68)}`);
    } catch (e) {
      errores++;
      console.error(`  ✗ ${ruta}: ${e.message}`);
    }
    await dormir(o.demora);
  }

  indice.sort((a, b) => a.ruta.localeCompare(b.ruta));
  await writeFile(
    INDICE,
    JSON.stringify(
      {
        generado: new Date().toISOString(),
        fuente: BASE,
        licencia: "Contenido © Refactoring.Guru — CC BY-NC-ND 4.0. Índice de enlaces únicamente.",
        paginas: indice,
      },
      null,
      2,
    ) + "\n",
    "utf8",
  );

  console.log(`\n${descargadas} páginas · ${errores} errores`);
  if (!o.soloIndice) console.log(`Contenido en ${DESTINO} (ignorado por git)`);
  console.log(`Índice en ${INDICE}`);
  if (pendientes.length) console.log(`Quedaron ${pendientes.length} sin visitar (subí --limite)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
