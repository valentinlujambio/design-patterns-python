/**
 * Modelo de contenido de la app.
 *
 * Todo el material didáctico (prosa en español, quizzes, ejercicios) es
 * original de este proyecto. Los ejemplos de código GoF provienen del repo
 * Refactoring.Guru (CC BY-NC-ND 4.0) y se incluyen sin modificar, con
 * atribución. Los ejemplos de IA/ML/CV son propios de este repo.
 */

export type Track = "gof" | "ia";

export type Family =
  | "creacional"
  | "estructural"
  | "comportamiento"
  | "llm"
  | "ml"
  | "cv";

export interface QuizItem {
  /** Enunciado de la pregunta. */
  q: string;
  options: string[];
  /** Índice (0-based) de la opción correcta. */
  answer: number;
  /** Explicación que se muestra al responder. */
  why: string;
}

export interface CodeSample {
  title: string;
  description?: string;
  /** Ruta del archivo relativa a la raíz del repositorio. */
  path: string;
  /** Salida esperada del programa, si está versionada. */
  outputPath?: string;
  /** Atribución cuando el código no es original de este repo. */
  credit?: string;
}

export interface Applicability {
  when: string;
  detail: string;
}

export interface Note {
  title: string;
  body: string;
}

export interface Pattern {
  slug: string;
  name: string;
  aka?: string[];
  track: Track;
  family: Family;
  /** Una línea que resume el patrón (para tarjetas y buscador). */
  tagline: string;
  /** Propósito, en una o dos frases. */
  intent: string;
  problem: string[];
  solution: string[];
  analogy?: { title: string; body: string[] };
  /** Diagrama en texto monoespaciado. */
  diagram?: string;
  applicability: Applicability[];
  steps: string[];
  pros: string[];
  cons: string[];
  /** Cómo se ve el patrón cuando lo escribís en Python idiomático. */
  pythonNotes: Note[];
  relations: string[];
  /** Slugs de patrones relacionados. */
  related: string[];
  samples: CodeSample[];
  quiz: QuizItem[];
  exercises: string[];
  /** 1 = fácil, 3 = difícil. */
  difficulty: 1 | 2 | 3;
  /** 1 = raro, 3 = se usa en todos lados. */
  popularity: 1 | 2 | 3;
  /** Enlace al artículo original en refactoring.guru (español). */
  guruUrl?: string;
}

export interface FundamentalSection {
  heading?: string;
  body?: string[];
  list?: string[];
  numbered?: string[];
  code?: { caption?: string; source: string };
  callout?: { tone: "info" | "warn" | "tip"; title: string; body: string };
  table?: { head: string[]; rows: string[][] };
}

export interface Fundamental {
  slug: string;
  title: string;
  tagline: string;
  /** Minutos estimados de lectura. */
  minutes: number;
  sections: FundamentalSection[];
  quiz?: QuizItem[];
  guruUrl?: string;
}

export const FAMILY_LABEL: Record<Family, string> = {
  creacional: "Creacional",
  estructural: "Estructural",
  comportamiento: "De comportamiento",
  llm: "LLM y agentes",
  ml: "Aprendizaje automático",
  cv: "Visión por computadora",
};

export const FAMILY_BLURB: Record<Family, string> = {
  creacional:
    "Mecanismos de creación de objetos que aumentan la flexibilidad y la reutilización del código existente.",
  estructural:
    "Cómo ensamblar objetos y clases en estructuras más grandes manteniéndolas flexibles y eficientes.",
  comportamiento:
    "Algoritmos y el reparto de responsabilidades entre objetos que colaboran.",
  llm: "Estructuras recurrentes al construir aplicaciones sobre modelos de lenguaje: prompts, herramientas, agentes, RAG y control de calidad.",
  ml: "Formas probadas de organizar datos, entrenamiento, experimentos y despliegue de modelos.",
  cv: "Patrones para tuberías de imagen y video: captura, transformación, inferencia y post-proceso.",
};

export const TRACK_LABEL: Record<Track, string> = {
  gof: "Patrones clásicos (GoF)",
  ia: "Patrones de IA, LLM, ML y visión",
};
