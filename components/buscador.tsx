"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { EntradaBuscador } from "@/lib/content";

const ETIQUETA: Record<string, string> = {
  creacional: "Creacional",
  estructural: "Estructural",
  comportamiento: "Comportamiento",
  llm: "LLM",
  ml: "ML",
  cv: "Visión",
  fundamentos: "Fundamentos",
};

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function Buscador({ indice }: { indice: EntradaBuscador[] }) {
  const [abierto, setAbierto] = useState(false);
  const [consulta, setConsulta] = useState("");
  const [seleccion, setSeleccion] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  const normalizado = useMemo(
    () => indice.map((e) => ({ ...e, busqueda: normalizar(e.texto) })),
    [indice],
  );

  const resultados = useMemo(() => {
    const q = normalizar(consulta.trim());
    if (!q) return normalizado.slice(0, 8);
    const terminos = q.split(/\s+/);
    return normalizado
      .filter((e) => terminos.every((t) => e.busqueda.includes(t)))
      .slice(0, 12);
  }, [consulta, normalizado]);

  useEffect(() => {
    function atajo(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setAbierto((v) => !v);
      }
      if (e.key === "Escape") setAbierto(false);
    }
    window.addEventListener("keydown", atajo);
    return () => window.removeEventListener("keydown", atajo);
  }, []);

  useEffect(() => {
    if (abierto) {
      setSeleccion(0);
      requestAnimationFrame(() => input.current?.focus());
    } else {
      setConsulta("");
    }
  }, [abierto]);

  function teclas(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSeleccion((s) => Math.min(s + 1, resultados.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSeleccion((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter" && resultados[seleccion]) {
      window.location.href = resultados[seleccion].href;
    }
  }

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        className="flex h-9 items-center gap-2 rounded-lg border border-line bg-surface-2 px-3 text-sm text-ink-faint transition hover:border-line-strong hover:text-ink-soft sm:w-56"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <span className="hidden sm:inline">Buscar patrón…</span>
        <kbd className="ml-auto hidden rounded border border-line px-1.5 py-0.5 font-mono text-[10px] sm:inline">
          ⌘K
        </kbd>
      </button>

      {abierto && (
        <div
          className="fixed inset-0 z-50 bg-black/40 p-4 backdrop-blur-sm sm:p-[10vh]"
          onClick={() => setAbierto(false)}
        >
          <div
            className="mx-auto max-w-xl overflow-hidden rounded-xl border border-line bg-surface shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={input}
              value={consulta}
              onChange={(e) => {
                setConsulta(e.target.value);
                setSeleccion(0);
              }}
              onKeyDown={teclas}
              placeholder={`Buscar entre ${indice.length} páginas…`}
              className="w-full border-b border-line bg-transparent px-4 py-3.5 text-[15px] outline-none placeholder:text-ink-faint"
            />
            <ul className="max-h-[55vh] overflow-y-auto p-1.5">
              {resultados.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-ink-faint">
                  Sin resultados para «{consulta}»
                </li>
              )}
              {resultados.map((r, i) => (
                <li key={r.href}>
                  <Link
                    href={r.href}
                    onClick={() => setAbierto(false)}
                    onMouseEnter={() => setSeleccion(i)}
                    className={`flex items-baseline gap-3 rounded-lg px-3 py-2.5 ${
                      i === seleccion ? "bg-accent-soft" : ""
                    }`}
                  >
                    <span className="text-sm font-medium">{r.titulo}</span>
                    <span className="truncate text-xs text-ink-faint">{r.subtitulo}</span>
                    <span className="ml-auto shrink-0 text-[10px] uppercase tracking-wide text-ink-faint">
                      {ETIQUETA[r.familia] ?? r.familia}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
