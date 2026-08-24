"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { EntradaBuscador } from "@/lib/content";
import { Buscador } from "./buscador";
import { ThemeToggle } from "./theme-toggle";

const ENLACES = [
  { href: "/fundamentos", texto: "Fundamentos" },
  { href: "/patrones", texto: "Patrones GoF" },
  { href: "/ia", texto: "Patrones de IA" },
  { href: "/ruta", texto: "Ruta" },
  { href: "/practica", texto: "Práctica" },
];

export function SiteHeader({ indice }: { indice: EntradaBuscador[] }) {
  const ruta = usePathname();
  const [menu, setMenu] = useState(false);

  return (
    <header className="no-print sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-accent text-[13px] font-bold text-white">
            {"{}"}
          </span>
          <span className="hidden sm:inline">Patrones en Python</span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 md:flex">
          {ENLACES.map((e) => {
            const activo = ruta === e.href || ruta.startsWith(e.href + "/");
            return (
              <Link
                key={e.href}
                href={e.href}
                className={`rounded-lg px-2.5 py-1.5 text-sm transition ${
                  activo
                    ? "bg-accent-soft font-medium text-accent-ink"
                    : "text-ink-soft hover:bg-surface-2 hover:text-ink"
                }`}
              >
                {e.texto}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Buscador indice={indice} />
          <ThemeToggle />
          <button
            onClick={() => setMenu((v) => !v)}
            aria-label="Menú"
            aria-expanded={menu}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink-soft md:hidden"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menu ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>

      {menu && (
        <nav className="border-t border-line bg-surface px-4 py-2 md:hidden">
          {ENLACES.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              onClick={() => setMenu(false)}
              className="block rounded-lg px-2 py-2.5 text-sm text-ink-soft hover:bg-surface-2"
            >
              {e.texto}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
