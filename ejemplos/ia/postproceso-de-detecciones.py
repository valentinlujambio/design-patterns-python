"""
Patrón: Post-proceso de Detecciones

Problema: la salida cruda de un detector no es utilizable: trae miles de cajas,
duplicados sobre el mismo objeto, detecciones de clases que no interesan y ruido
de tamaño imposible. Meter todo eso en un `if` gigante hace el código imposible
de ajustar.

Solución: una cadena de filtros y reductores independientes —umbral de confianza,
clases permitidas, área mínima, NMS, región de interés— que se ordena y se
configura por caso de uso. Es Chain of Responsibility sobre una lista: cada paso
recibe detecciones y devuelve detecciones.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Sequence


@dataclass(frozen=True, slots=True)
class Caja:
    x1: float
    y1: float
    x2: float
    y2: float
    clase: str
    confianza: float

    @property
    def area(self) -> float:
        return max(0.0, self.x2 - self.x1) * max(0.0, self.y2 - self.y1)

    def iou(self, otra: "Caja") -> float:
        ix1, iy1 = max(self.x1, otra.x1), max(self.y1, otra.y1)
        ix2, iy2 = min(self.x2, otra.x2), min(self.y2, otra.y2)
        interseccion = max(0.0, ix2 - ix1) * max(0.0, iy2 - iy1)
        union = self.area + otra.area - interseccion
        return interseccion / union if union else 0.0


Paso = Callable[[list[Caja]], list[Caja]]


def por_confianza(minimo: float) -> Paso:
    def confianza(cajas: list[Caja]) -> list[Caja]:
        return [c for c in cajas if c.confianza >= minimo]

    return confianza


def solo_clases(*clases: str) -> Paso:
    permitidas = set(clases)

    def clases_(cajas: list[Caja]) -> list[Caja]:
        return [c for c in cajas if c.clase in permitidas]

    return clases_


def area_minima(minimo: float) -> Paso:
    def area(cajas: list[Caja]) -> list[Caja]:
        return [c for c in cajas if c.area >= minimo]

    return area


def dentro_de(x1: float, y1: float, x2: float, y2: float) -> Paso:
    """Región de interés: descarta lo que pasa fuera de la zona vigilada."""

    def roi(cajas: list[Caja]) -> list[Caja]:
        return [c for c in cajas
                if x1 <= (c.x1 + c.x2) / 2 <= x2 and y1 <= (c.y1 + c.y2) / 2 <= y2]

    return roi


def nms(umbral_iou: float = 0.5) -> Paso:
    """Supresión de no-máximos, por clase: el paso que hace el trabajo pesado."""

    def nms_(cajas: list[Caja]) -> list[Caja]:
        conservadas: list[Caja] = []
        for clase in sorted({c.clase for c in cajas}):
            candidatas = sorted((c for c in cajas if c.clase == clase),
                                key=lambda c: -c.confianza)
            while candidatas:
                mejor = candidatas.pop(0)
                conservadas.append(mejor)
                candidatas = [c for c in candidatas if mejor.iou(c) < umbral_iou]
        return sorted(conservadas, key=lambda c: -c.confianza)

    return nms_


def top_k(k: int) -> Paso:
    def top(cajas: list[Caja]) -> list[Caja]:
        return sorted(cajas, key=lambda c: -c.confianza)[:k]

    return top


def postproceso(*pasos: Paso, verboso: bool = False) -> Paso:
    def ejecutar(cajas: list[Caja]) -> list[Caja]:
        for paso in pasos:
            antes = len(cajas)
            cajas = paso(cajas)
            if verboso:
                nombre = getattr(paso, "__name__", type(paso).__name__)
                print(f"    {nombre:<10} {antes:>3} → {len(cajas):>3}")
        return cajas

    return ejecutar


CRUDAS = [
    Caja(10, 10, 60, 60, "persona", 0.95),
    Caja(12, 11, 62, 63, "persona", 0.91),     # duplicado del anterior
    Caja(14, 13, 58, 59, "persona", 0.88),     # otro duplicado
    Caja(200, 40, 260, 110, "persona", 0.80),
    Caja(100, 100, 104, 104, "persona", 0.72), # ruido: área diminuta
    Caja(150, 150, 220, 220, "auto", 0.65),
    Caja(151, 152, 219, 221, "auto", 0.60),    # duplicado
    Caja(300, 300, 340, 340, "gato", 0.99),    # clase que no interesa
    Caja(20, 20, 40, 40, "persona", 0.20),     # baja confianza
]

if __name__ == "__main__":
    print("  detecciones crudas:", len(CRUDAS))
    tuberia = postproceso(
        por_confianza(0.5),
        solo_clases("persona", "auto"),
        area_minima(100),
        nms(0.5),
        top_k(5),
        verboso=True,
    )
    finales = tuberia(list(CRUDAS))
    print("\n  detecciones finales:")
    for c in finales:
        print(f"    {c.clase:<8} conf={c.confianza:.2f} área={c.area:.0f}")
