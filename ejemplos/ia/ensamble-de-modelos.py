"""
Patrón: Ensamble de Modelos (Ensemble)

Problema: un solo modelo tiene sesgos propios. Cambiarlo por otro mejora unos
casos y empeora otros, y no hay forma de combinar lo bueno de cada uno.

Solución: tratar a "varios modelos que votan" como un modelo más, con la misma
interfaz. Al cumplir el mismo contrato, el ensamble se puede anidar, envolver o
reemplazar sin que el código cliente se entere. Es Composite, y la combinación
(promedio, voto, ponderado, apilado) es una Strategy.
"""
from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from statistics import median
from typing import Callable, Protocol, Sequence

Vector = Sequence[float]


class Modelo(Protocol):
    nombre: str

    def predecir(self, x: Vector) -> float: ...


@dataclass
class Umbral:
    """Modelo débil: mira una sola característica."""

    nombre: str
    indice: int
    corte: float
    invertido: bool = False

    def predecir(self, x: Vector) -> float:
        decision = x[self.indice] > self.corte
        return float(decision != self.invertido)


Combinador = Callable[[list[float]], float]


def voto_mayoritario(predicciones: list[float]) -> float:
    return float(Counter(predicciones).most_common(1)[0][0])


def promedio(predicciones: list[float]) -> float:
    return sum(predicciones) / len(predicciones)


def mediana(predicciones: list[float]) -> float:
    return float(median(predicciones))


def ponderado(pesos: Sequence[float]) -> Combinador:
    def combinar(predicciones: list[float]) -> float:
        total = sum(pesos)
        return sum(p * w for p, w in zip(predicciones, pesos)) / total

    return combinar


@dataclass
class Ensamble:
    """Composite: es un Modelo hecho de Modelos (que pueden ser ensambles)."""

    nombre: str
    miembros: list[Modelo]
    combinar: Combinador = voto_mayoritario

    def predecir(self, x: Vector) -> float:
        return self.combinar([m.predecir(x) for m in self.miembros])

    def explicar(self, x: Vector) -> str:
        detalle = ", ".join(f"{m.nombre}={m.predecir(x):g}" for m in self.miembros)
        return f"{detalle} → {self.predecir(x):g}"


def exactitud(modelo: Modelo, datos: list[tuple[Vector, float]]) -> float:
    aciertos = sum(round(modelo.predecir(x)) == y for x, y in datos)
    return aciertos / len(datos)


# Datos de juguete: y = 1 cuando la MAYORÍA de las tres señales está alta.
# Ningún umbral individual puede acertar siempre; el voto de los tres, sí.
DATOS: list[tuple[Vector, float]] = [
    ((0.9, 0.9, 0.9), 1.0), ((0.9, 0.9, 0.1), 1.0),
    ((0.9, 0.1, 0.9), 1.0), ((0.1, 0.9, 0.9), 1.0),
    ((0.9, 0.1, 0.1), 0.0), ((0.1, 0.9, 0.1), 0.0),
    ((0.1, 0.1, 0.9), 0.0), ((0.1, 0.1, 0.1), 0.0),
]

if __name__ == "__main__":
    debiles = [
        Umbral("a>0.5", 0, 0.5),
        Umbral("b>0.5", 1, 0.5),
        Umbral("c>0.5", 2, 0.5),
    ]
    for m in debiles:
        print(f"  {m.nombre:<8} exactitud {exactitud(m, DATOS):.2f}")

    print()
    for nombre, combinador in [("voto", voto_mayoritario), ("promedio", promedio),
                               ("mediana", mediana),
                               ("ponderado", ponderado([2, 2, 1]))]:
        ensamble = Ensamble(f"ens-{nombre}", debiles, combinador)
        print(f"  ensamble {nombre:<10} exactitud {exactitud(ensamble, DATOS):.2f}")

    # Un ensamble de ensambles sigue siendo un modelo:
    anidado = Ensamble("anidado", [Ensamble("e1", debiles[:2]), debiles[2]], promedio)
    print(f"\n  {anidado.nombre}: {anidado.explicar((0.9, 0.1, 0.1))}")
