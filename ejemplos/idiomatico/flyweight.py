"""
Flyweight en Python idiomático.

Compartir el estado intrínseco (el que se repite) en vez de duplicarlo.
Python ya lo hace solo en varios lugares: interna cadenas cortas y enteros
chicos. Para lo tuyo alcanza con `functools.lru_cache` como fábrica de
flyweights y `__slots__` para que el estado extrínseco pese poco.
"""
from __future__ import annotations

import sys
from dataclasses import dataclass
from functools import lru_cache


@dataclass(frozen=True, slots=True)
class TipoDeArbol:
    """Estado intrínseco: se comparte entre millones de árboles."""

    especie: str
    color: str
    textura: str


@lru_cache(maxsize=None)
def tipo_de_arbol(especie: str, color: str, textura: str) -> TipoDeArbol:
    """Fábrica de flyweights: misma clave → mismísimo objeto."""
    return TipoDeArbol(especie, color, textura)


class Arbol:
    """Estado extrínseco: lo único que cambia por instancia."""

    __slots__ = ("x", "y", "tipo")

    def __init__(self, x: int, y: int, tipo: TipoDeArbol) -> None:
        self.x, self.y, self.tipo = x, y, tipo


if __name__ == "__main__":
    bosque = [
        Arbol(i % 1000, i // 1000, tipo_de_arbol(*e))
        for i, e in enumerate(
            [("roble", "verde", "rugosa"), ("pino", "verde oscuro", "aguja")] * 5000
        )
    ]
    print("árboles:", len(bosque))
    print("objetos TipoDeArbol distintos:", tipo_de_arbol.cache_info().currsize)
    print("¿comparten el flyweight?", bosque[0].tipo is bosque[2].tipo)
    print("bytes por árbol (con __slots__):", sys.getsizeof(bosque[0]))
