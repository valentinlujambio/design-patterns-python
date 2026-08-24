/**
 * Verifica la integridad del contenido: rutas de ejemplos que existen,
 * slugs relacionados que resuelven, quizzes bien formados y slugs únicos.
 *
 *     node --experimental-strip-types scripts/verificar-contenido.mts
 */
import { existsSync } from "node:fs";
import { CREACIONALES } from "../lib/content/gof-creacionales.ts";
import { ESTRUCTURALES } from "../lib/content/gof-estructurales.ts";
import { COMPORTAMIENTO } from "../lib/content/gof-comportamiento.ts";
import { LLM } from "../lib/content/ia-llm.ts";
import { ML } from "../lib/content/ia-ml.ts";
import { CV } from "../lib/content/ia-cv.ts";
import { FUNDAMENTOS } from "../lib/content/fundamentos.ts";
import { RUTA } from "../lib/content/ruta.ts";

const PATTERNS = [...CREACIONALES, ...ESTRUCTURALES, ...COMPORTAMIENTO, ...LLM, ...ML, ...CV];
const STATS = {
  patrones: PATTERNS.length,
  gof: PATTERNS.filter((p) => p.track === "gof").length,
  ia: PATTERNS.filter((p) => p.track === "ia").length,
  fundamentos: FUNDAMENTOS.length,
  preguntas:
    PATTERNS.reduce((n, p) => n + p.quiz.length, 0) +
    FUNDAMENTOS.reduce((n, f) => n + (f.quiz?.length ?? 0), 0),
  ejemplos: PATTERNS.reduce((n, p) => n + p.samples.length, 0),
};

const errores: string[] = [];
const avisos: string[] = [];
const slugs = new Set(PATTERNS.map((p) => p.slug));

if (slugs.size !== PATTERNS.length) errores.push("Hay slugs de patrón duplicados");

for (const p of PATTERNS) {
  for (const s of p.samples) {
    if (!existsSync(s.path)) errores.push(`${p.slug}: no existe ${s.path}`);
    if (s.outputPath && !existsSync(s.outputPath))
      errores.push(`${p.slug}: no existe la salida ${s.outputPath}`);
  }
  for (const r of p.related) {
    if (!slugs.has(r)) errores.push(`${p.slug}: patrón relacionado inexistente '${r}'`);
    if (r === p.slug) errores.push(`${p.slug}: se relaciona consigo mismo`);
  }
  p.quiz.forEach((q, i) => {
    if (q.answer < 0 || q.answer >= q.options.length)
      errores.push(`${p.slug}: quiz ${i} con respuesta fuera de rango`);
    if (q.options.length < 2) errores.push(`${p.slug}: quiz ${i} con menos de dos opciones`);
  });
  if (p.quiz.length === 0) avisos.push(`${p.slug}: sin preguntas`);
  if (p.samples.length === 0) errores.push(`${p.slug}: sin ejemplos de código`);
  if (p.pros.length === 0 || p.cons.length === 0)
    errores.push(`${p.slug}: faltan pros o contras`);
}

const fundSlugs = new Set(FUNDAMENTOS.map((f) => f.slug));
if (fundSlugs.size !== FUNDAMENTOS.length) errores.push("Slugs de fundamento duplicados");

const enRuta = new Set(RUTA.flatMap((r) => r.slugs));
for (const s of enRuta) if (!slugs.has(s)) errores.push(`Ruta: slug inexistente '${s}'`);
for (const s of slugs) if (!enRuta.has(s)) avisos.push(`Fuera de la ruta de estudio: ${s}`);

console.log(`Patrones: ${STATS.patrones} (GoF ${STATS.gof} · IA ${STATS.ia})`);
console.log(`Fundamentos: ${STATS.fundamentos} · Preguntas: ${STATS.preguntas} · Ejemplos: ${STATS.ejemplos}`);
for (const a of avisos) console.log(`  aviso: ${a}`);
if (errores.length) {
  console.error(`\n${errores.length} errores:`);
  for (const e of errores) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log("\n✓ contenido consistente");
