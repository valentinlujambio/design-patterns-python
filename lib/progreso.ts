"use client";

import { useCallback, useEffect, useState } from "react";

const CLAVE = "patrones:aprendidos";
const EVENTO = "patrones:progreso";

function leer(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    return new Set(crudo ? (JSON.parse(crudo) as string[]) : []);
  } catch {
    return new Set();
  }
}

function escribir(valores: Set<string>): void {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify([...valores]));
  } catch {
    /* modo privado o almacenamiento bloqueado: el progreso no persiste */
  }
  window.dispatchEvent(new CustomEvent(EVENTO));
}

/**
 * Progreso de estudio guardado en el navegador. No se envía a ningún servidor.
 * `listo` distingue "todavía no leí localStorage" de "no hay nada guardado",
 * para no parpadear en la hidratación.
 */
export function useProgreso() {
  const [aprendidos, setAprendidos] = useState<Set<string>>(new Set());
  const [listo, setListo] = useState(false);

  useEffect(() => {
    const sincronizar = () => setAprendidos(leer());
    sincronizar();
    setListo(true);
    window.addEventListener(EVENTO, sincronizar);
    window.addEventListener("storage", sincronizar);
    return () => {
      window.removeEventListener(EVENTO, sincronizar);
      window.removeEventListener("storage", sincronizar);
    };
  }, []);

  const alternar = useCallback((slug: string) => {
    const actuales = leer();
    if (actuales.has(slug)) actuales.delete(slug);
    else actuales.add(slug);
    escribir(actuales);
  }, []);

  const reiniciar = useCallback(() => escribir(new Set()), []);

  return { aprendidos, listo, alternar, reiniciar };
}
