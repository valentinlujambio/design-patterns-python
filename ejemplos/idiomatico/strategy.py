"""
Strategy en Python idiomático.

Este es el caso donde la versión pythónica es más corta que la clásica: una
estrategia es *una función*. No hace falta una clase con un solo método; si
necesita configuración, usá `functools.partial` o un `dataclass` invocable.
"""
from __future__ import annotations

from dataclasses import dataclass
from functools import partial
from typing import Callable, Iterable

Estrategia = Callable[[float], float]


def sin_descuento(total: float) -> float:
    return total


def porcentaje(total: float, pct: float) -> float:
    return total * (1 - pct / 100)


def dos_por_uno(total: float, precio_unitario: float) -> float:
    unidades = int(total // precio_unitario)
    return total - (unidades // 2) * precio_unitario


@dataclass(frozen=True, slots=True)
class TopeDeDescuento:
    """Estrategia con estado: un objeto invocable sigue siendo una función."""

    estrategia: Estrategia
    maximo: float

    def __call__(self, total: float) -> float:
        return max(self.estrategia(total), total - self.maximo)


@dataclass
class Carrito:
    items: list[float]
    descuento: Estrategia = sin_descuento

    def total(self) -> float:
        return round(self.descuento(sum(self.items)), 2)


if __name__ == "__main__":
    items = [100.0, 100.0, 100.0, 50.0]
    estrategias: Iterable[tuple[str, Estrategia]] = [
        ("sin descuento", sin_descuento),
        ("15%", partial(porcentaje, pct=15)),
        ("2x1 de $100", partial(dos_por_uno, precio_unitario=100)),
        ("15% con tope $30", TopeDeDescuento(partial(porcentaje, pct=15), 30)),
    ]
    for nombre, estrategia in estrategias:
        print(f"{nombre:<20} → ${Carrito(items, estrategia).total()}")
