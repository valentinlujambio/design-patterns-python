"""
Visitor en Python idiomático.

Visitor separa los algoritmos de la estructura de datos que recorren. Python no
tiene sobrecarga por tipo, así que el doble despacho se hace con `accept()`… o,
mucho más cómodo, con `functools.singledispatch`, que elige la implementación
según el tipo del primer argumento.
"""
from __future__ import annotations

from dataclasses import dataclass
from functools import singledispatch


# ── La estructura: nodos de una expresión aritmética ────────────────────────
@dataclass(frozen=True, slots=True)
class Numero:
    valor: float


@dataclass(frozen=True, slots=True)
class Suma:
    izq: "Nodo"
    der: "Nodo"


@dataclass(frozen=True, slots=True)
class Producto:
    izq: "Nodo"
    der: "Nodo"


Nodo = Numero | Suma | Producto


# ── Visitante 1: evaluar ────────────────────────────────────────────────────
@singledispatch
def evaluar(nodo: Nodo) -> float:
    raise TypeError(f"nodo desconocido: {nodo!r}")


@evaluar.register
def _(nodo: Numero) -> float:
    return nodo.valor


@evaluar.register
def _(nodo: Suma) -> float:
    return evaluar(nodo.izq) + evaluar(nodo.der)


@evaluar.register
def _(nodo: Producto) -> float:
    return evaluar(nodo.izq) * evaluar(nodo.der)


# ── Visitante 2: imprimir. Se agrega sin tocar los nodos ────────────────────
@singledispatch
def formatear(nodo: Nodo) -> str:
    raise TypeError(f"nodo desconocido: {nodo!r}")


@formatear.register
def _(nodo: Numero) -> str:
    return f"{nodo.valor:g}"


@formatear.register
def _(nodo: Suma) -> str:
    return f"({formatear(nodo.izq)} + {formatear(nodo.der)})"


@formatear.register
def _(nodo: Producto) -> str:
    return f"{formatear(nodo.izq)} · {formatear(nodo.der)}"


if __name__ == "__main__":
    expresion = Producto(Suma(Numero(2), Numero(3)), Numero(4))
    print(formatear(expresion), "=", evaluar(expresion))

    # `match` es la otra forma pythónica de despachar por tipo:
    def profundidad(nodo: Nodo) -> int:
        match nodo:
            case Numero():
                return 1
            case Suma(izq, der) | Producto(izq, der):
                return 1 + max(profundidad(izq), profundidad(der))
        raise TypeError(nodo)

    print("profundidad del árbol:", profundidad(expresion))
