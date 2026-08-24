"""
Abstract Factory en Python idiomático.

La "fábrica abstracta" no necesita ser una jerarquía de clases: puede ser un
`dataclass` que agrupa los constructores de una familia coherente de productos.
Lo esencial del patrón se conserva: elegís la familia una sola vez y el resto
del código ya no puede mezclar piezas incompatibles.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Protocol


class Boton(Protocol):
    def pintar(self) -> str: ...


class CasillaVerificacion(Protocol):
    def pintar(self) -> str: ...


class BotonMac:
    def pintar(self) -> str:
        return "( Aceptar )  ← botón redondeado de macOS"


class CasillaMac:
    def pintar(self) -> str:
        return "☑ casilla de macOS"


class BotonWin:
    def pintar(self) -> str:
        return "[ Aceptar ]  ← botón rectangular de Windows"


class CasillaWin:
    def pintar(self) -> str:
        return "[x] casilla de Windows"


@dataclass(frozen=True, slots=True)
class KitDeInterfaz:
    """La fábrica abstracta: una familia de constructores que van juntos."""

    nombre: str
    boton: Callable[[], Boton]
    casilla: Callable[[], CasillaVerificacion]


MAC = KitDeInterfaz("macOS", BotonMac, CasillaMac)
WINDOWS = KitDeInterfaz("Windows", BotonWin, CasillaWin)

KITS: dict[str, KitDeInterfaz] = {"darwin": MAC, "win32": WINDOWS}


def render_formulario(kit: KitDeInterfaz) -> str:
    """Cliente: usa la familia sin saber qué implementación le tocó."""
    return "\n".join(
        [f"— Formulario ({kit.nombre}) —", kit.casilla().pintar(), kit.boton().pintar()]
    )


if __name__ == "__main__":
    for plataforma in ("darwin", "win32"):
        print(render_formulario(KITS[plataforma]))
        print()
