"use client";

import { useEffect, useState } from "react";

type Tema = "claro" | "oscuro";

export function ThemeToggle() {
  const [tema, setTema] = useState<Tema | null>(null);

  useEffect(() => {
    setTema(document.documentElement.classList.contains("dark") ? "oscuro" : "claro");
  }, []);

  function alternar() {
    const nuevo: Tema = tema === "oscuro" ? "claro" : "oscuro";
    document.documentElement.classList.toggle("dark", nuevo === "oscuro");
    try {
      localStorage.setItem("patrones:tema", nuevo);
    } catch {
      /* sin persistencia */
    }
    setTema(nuevo);
  }

  return (
    <button
      onClick={alternar}
      aria-label={tema === "oscuro" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      title="Cambiar tema"
      className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink-soft transition hover:bg-surface-2 hover:text-ink"
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        {tema === "oscuro" ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
          </>
        ) : (
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
        )}
      </svg>
    </button>
  );
}
