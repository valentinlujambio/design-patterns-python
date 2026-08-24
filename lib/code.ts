import { readFileSync } from "node:fs";
import { join } from "node:path";
import { codeToHtml } from "shiki";

/**
 * Lee un archivo de ejemplo del repositorio en tiempo de compilación.
 *
 * Solo se permiten dos carpetas, y con prefijo estático: así el rastreador de
 * dependencias de Next sabe qué se lee y no termina empaquetando el repo entero.
 * Todas las páginas son estáticas, de modo que esto nunca corre en producción.
 */
export function readRepoFile(relativo: string): string | null {
  if (relativo.includes("..")) return null;
  let ruta: string;
  if (relativo.startsWith("src/")) {
    ruta = join(/* turbopackIgnore: true */ process.cwd(), "src", relativo.slice(4));
  } else if (relativo.startsWith("ejemplos/")) {
    ruta = join(/* turbopackIgnore: true */ process.cwd(), "ejemplos", relativo.slice(9));
  } else {
    return null;
  }
  try {
    return readFileSync(ruta, "utf8");
  } catch {
    return null;
  }
}

export async function highlight(codigo: string, lang = "python"): Promise<string> {
  return codeToHtml(codigo, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });
}

export function countLines(codigo: string): number {
  return codigo.trimEnd().split("\n").length;
}
