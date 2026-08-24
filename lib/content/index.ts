import type { Family, Fundamental, Pattern, QuizItem, Track } from "@/lib/types";
import { CREACIONALES } from "./gof-creacionales";
import { ESTRUCTURALES } from "./gof-estructurales";
import { COMPORTAMIENTO } from "./gof-comportamiento";
import { LLM } from "./ia-llm";
import { ML } from "./ia-ml";
import { CV } from "./ia-cv";
import { FUNDAMENTOS } from "./fundamentos";
import { RUTA } from "./ruta";

export { FUNDAMENTOS, RUTA };

export const PATTERNS: Pattern[] = [
  ...CREACIONALES,
  ...ESTRUCTURALES,
  ...COMPORTAMIENTO,
  ...LLM,
  ...ML,
  ...CV,
];

const POR_SLUG = new Map(PATTERNS.map((p) => [p.slug, p]));

export function getPattern(slug: string): Pattern | undefined {
  return POR_SLUG.get(slug);
}

export function getFundamento(slug: string): Fundamental | undefined {
  return FUNDAMENTOS.find((f) => f.slug === slug);
}

export function patternsByTrack(track: Track): Pattern[] {
  return PATTERNS.filter((p) => p.track === track);
}

export function patternsByFamily(family: Family): Pattern[] {
  return PATTERNS.filter((p) => p.family === family);
}

export const FAMILIES_BY_TRACK: Record<Track, Family[]> = {
  gof: ["creacional", "estructural", "comportamiento"],
  ia: ["llm", "ml", "cv"],
};

export interface EntradaBuscador {
  slug: string;
  tipo: "patron" | "fundamento";
  href: string;
  titulo: string;
  subtitulo: string;
  familia: string;
  /** Texto plano donde busca el filtro del buscador. */
  texto: string;
}

/** Índice liviano que se envía al cliente para el buscador. */
export function buildSearchIndex(): EntradaBuscador[] {
  const patrones: EntradaBuscador[] = PATTERNS.map((p) => ({
    slug: p.slug,
    tipo: "patron",
    href: `/${p.track === "gof" ? "patrones" : "ia"}/${p.slug}`,
    titulo: p.name,
    subtitulo: p.tagline,
    familia: p.family,
    texto: [p.name, ...(p.aka ?? []), p.tagline, p.intent, ...p.problem]
      .join(" ")
      .toLowerCase(),
  }));

  const fundamentos: EntradaBuscador[] = FUNDAMENTOS.map((f) => ({
    slug: f.slug,
    tipo: "fundamento",
    href: `/fundamentos/${f.slug}`,
    titulo: f.title,
    subtitulo: f.tagline,
    familia: "fundamentos",
    texto: [f.title, f.tagline].join(" ").toLowerCase(),
  }));

  return [...patrones, ...fundamentos];
}

export interface PreguntaGlobal extends QuizItem {
  origen: string;
  href: string;
}

/** Todas las preguntas del catálogo, para el modo práctica. */
export function allQuizItems(): PreguntaGlobal[] {
  const dePatrones = PATTERNS.flatMap((p) =>
    p.quiz.map((q) => ({
      ...q,
      origen: p.name,
      href: `/${p.track === "gof" ? "patrones" : "ia"}/${p.slug}`,
    })),
  );
  const deFundamentos = FUNDAMENTOS.flatMap((f) =>
    (f.quiz ?? []).map((q) => ({
      ...q,
      origen: f.title,
      href: `/fundamentos/${f.slug}`,
    })),
  );
  return [...dePatrones, ...deFundamentos];
}

export const STATS = {
  patrones: PATTERNS.length,
  gof: PATTERNS.filter((p) => p.track === "gof").length,
  ia: PATTERNS.filter((p) => p.track === "ia").length,
  fundamentos: FUNDAMENTOS.length,
  preguntas: allQuizItems().length,
  ejemplos: PATTERNS.reduce((n, p) => n + p.samples.length, 0),
};
