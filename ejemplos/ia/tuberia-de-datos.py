"""
Patrón: Tubería de Datos (Pipeline / Transformer)

Problema: el preprocesamiento vive desparramado en el notebook. En entrenamiento
se imputa con la media del dataset completo y en producción con otra cosa: eso
es *fuga de datos* y explica la mitad de los modelos que "andaban bien en local".

Solución: cada transformación es un objeto con `fit` (aprende parámetros) y
`transform` (aplica), y la tubería los compone en orden. Los parámetros se
aprenden UNA vez, con datos de entrenamiento, y se reutilizan tal cual después.
Es la interfaz de scikit-learn: Composite + Template Method.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Protocol, Self

Fila = dict[str, float | str | None]


class Transformador(Protocol):
    def fit(self, filas: list[Fila]) -> Self: ...
    def transform(self, filas: list[Fila]) -> list[Fila]: ...


@dataclass
class ImputarPorMedia:
    columnas: list[str]
    medias: dict[str, float] = field(default_factory=dict)

    def fit(self, filas: list[Fila]) -> Self:
        for col in self.columnas:
            valores = [float(f[col]) for f in filas if f.get(col) is not None]
            self.medias[col] = sum(valores) / len(valores) if valores else 0.0
        return self

    def transform(self, filas: list[Fila]) -> list[Fila]:
        return [{**f, **{c: (self.medias[c] if f.get(c) is None else f[c])
                         for c in self.columnas}} for f in filas]


@dataclass
class EscalarEstandar:
    columnas: list[str]
    stats: dict[str, tuple[float, float]] = field(default_factory=dict)

    def fit(self, filas: list[Fila]) -> Self:
        for col in self.columnas:
            v = [float(f[col]) for f in filas]
            media = sum(v) / len(v)
            desvio = (sum((x - media) ** 2 for x in v) / len(v)) ** 0.5 or 1.0
            self.stats[col] = (media, desvio)
        return self

    def transform(self, filas: list[Fila]) -> list[Fila]:
        salida = []
        for f in filas:
            nueva = dict(f)
            for col, (media, desvio) in self.stats.items():
                nueva[col] = round((float(f[col]) - media) / desvio, 3)
            salida.append(nueva)
        return salida


@dataclass
class CodificarCategoria:
    columna: str
    vocabulario: dict[str, int] = field(default_factory=dict)

    def fit(self, filas: list[Fila]) -> Self:
        valores = sorted({str(f[self.columna]) for f in filas})
        self.vocabulario = {v: i for i, v in enumerate(valores)}
        return self

    def transform(self, filas: list[Fila]) -> list[Fila]:
        # Categoría no vista en entrenamiento → -1, nunca una excepción.
        return [{**f, self.columna: self.vocabulario.get(str(f[self.columna]), -1)}
                for f in filas]


@dataclass
class Tuberia:
    """Compuesto: se comporta igual que un transformador suelto."""

    pasos: list[tuple[str, Transformador]]

    def fit(self, filas: list[Fila]) -> Self:
        for nombre, paso in self.pasos:
            paso.fit(filas)
            filas = paso.transform(filas)
        return self

    def transform(self, filas: list[Fila]) -> list[Fila]:
        for _, paso in self.pasos:
            filas = paso.transform(filas)
        return filas

    def fit_transform(self, filas: list[Fila]) -> list[Fila]:
        return self.fit(filas).transform(filas)


ENTRENAMIENTO: list[Fila] = [
    {"edad": 30, "ingreso": 1000, "ciudad": "córdoba"},
    {"edad": 40, "ingreso": None, "ciudad": "rosario"},
    {"edad": 50, "ingreso": 3000, "ciudad": "córdoba"},
]
PRODUCCION: list[Fila] = [
    {"edad": 35, "ingreso": None, "ciudad": "salta"},   # categoría nueva
]

if __name__ == "__main__":
    tuberia = Tuberia([
        ("imputar", ImputarPorMedia(["ingreso"])),
        ("escalar", EscalarEstandar(["edad", "ingreso"])),
        ("codificar", CodificarCategoria("ciudad")),
    ])

    print("entrenamiento:")
    for fila in tuberia.fit_transform(ENTRENAMIENTO):
        print("  ", fila)

    print("\nproducción (mismos parámetros aprendidos, sin volver a hacer fit):")
    for fila in tuberia.transform(PRODUCCION):
        print("  ", fila)

    imputador = tuberia.pasos[0][1]
    print("\nmedia aprendida en entrenamiento:", imputador.medias)  # type: ignore[attr-defined]
