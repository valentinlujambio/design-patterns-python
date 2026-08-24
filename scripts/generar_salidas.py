#!/usr/bin/env python3
"""
Ejecuta cada ejemplo y guarda su salida junto al archivo, para que la app pueda
mostrar "qué imprime esto" sin ejecutar nada en el servidor.

    python3 scripts/generar_salidas.py [--check]

Con --check no escribe nada: solo verifica que todos los ejemplos corran sin
error (útil en CI).
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
CARPETAS = [RAIZ / "ejemplos" / "idiomatico", RAIZ / "ejemplos" / "ia"]


def ejemplos() -> list[Path]:
    encontrados: list[Path] = []
    for carpeta in CARPETAS:
        encontrados += sorted(p for p in carpeta.glob("*.py") if not p.name.startswith("_"))
    return encontrados


def main() -> int:
    solo_verificar = "--check" in sys.argv
    fallos = 0
    for archivo in ejemplos():
        proceso = subprocess.run(
            [sys.executable, archivo.name],
            cwd=archivo.parent, capture_output=True, text=True, timeout=120,
        )
        estado = "ok " if proceso.returncode == 0 else "FALLA"
        if proceso.returncode != 0:
            fallos += 1
            print(proceso.stderr.strip()[-500:])
        elif not solo_verificar:
            destino = archivo.with_suffix(".salida.txt")
            destino.write_text(proceso.stdout, encoding="utf-8")
        print(f"{estado} {archivo.relative_to(RAIZ)}")

    print(f"\n{len(ejemplos()) - fallos}/{len(ejemplos())} ejemplos corren sin error")
    return 1 if fallos else 0


if __name__ == "__main__":
    raise SystemExit(main())
