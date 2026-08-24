"""
Patrón: Validación de Datos (Data Contract)

Problema: el modelo no falla cuando los datos se rompen: sigue prediciendo, pero
mal. Una columna que pasa de metros a centímetros, una categoría nueva o un 30%
de nulos degradan la calidad en silencio durante semanas.

Solución: un contrato explícito de expectativas que se evalúa en cada lote, antes
de entrenar y antes de predecir, con severidades (bloquear vs. avisar). Es Chain
of Responsibility con Specification: cada expectativa es un objeto componible y
el informe dice exactamente qué falló y con qué evidencia.
"""
from __future__ import annotations

import statistics
from dataclasses import dataclass, field
from enum import Enum
from typing import Callable, Protocol, Sequence

Fila = dict[str, float | str | None]


class Severidad(Enum):
    AVISO = "aviso"
    ERROR = "error"


@dataclass(frozen=True, slots=True)
class Hallazgo:
    expectativa: str
    severidad: Severidad
    detalle: str


class Expectativa(Protocol):
    severidad: Severidad

    def verificar(self, filas: Sequence[Fila]) -> Hallazgo | None: ...


@dataclass(frozen=True, slots=True)
class NoNulos:
    columna: str
    maximo_pct: float = 0.0
    severidad: Severidad = Severidad.ERROR

    def verificar(self, filas: Sequence[Fila]) -> Hallazgo | None:
        nulos = sum(1 for f in filas if f.get(self.columna) is None)
        pct = nulos / len(filas)
        if pct > self.maximo_pct:
            return Hallazgo(f"no_nulos({self.columna})", self.severidad,
                            f"{pct:.0%} de nulos (máximo {self.maximo_pct:.0%})")
        return None


@dataclass(frozen=True, slots=True)
class EnRango:
    columna: str
    minimo: float
    maximo: float
    severidad: Severidad = Severidad.ERROR

    def verificar(self, filas: Sequence[Fila]) -> Hallazgo | None:
        fuera = [f[self.columna] for f in filas
                 if isinstance(f.get(self.columna), (int, float))
                 and not self.minimo <= float(f[self.columna]) <= self.maximo]
        if fuera:
            return Hallazgo(f"en_rango({self.columna})", self.severidad,
                            f"{len(fuera)} valores fuera de [{self.minimo}, {self.maximo}]: "
                            f"{fuera[:3]}")
        return None


@dataclass(frozen=True, slots=True)
class CategoriasConocidas:
    columna: str
    permitidas: frozenset[str]
    severidad: Severidad = Severidad.AVISO

    def verificar(self, filas: Sequence[Fila]) -> Hallazgo | None:
        vistas = {str(f[self.columna]) for f in filas} - self.permitidas
        if vistas:
            return Hallazgo(f"categorías({self.columna})", self.severidad,
                            f"valores nuevos: {sorted(vistas)}")
        return None


@dataclass(frozen=True, slots=True)
class SinDeriva:
    """Compara la media del lote contra la de referencia (deriva de datos)."""

    columna: str
    media_referencia: float
    tolerancia: float = 0.25
    severidad: Severidad = Severidad.AVISO

    def verificar(self, filas: Sequence[Fila]) -> Hallazgo | None:
        valores = [float(f[self.columna]) for f in filas
                   if isinstance(f.get(self.columna), (int, float))]
        if not valores:
            return None
        media = statistics.fmean(valores)
        desvio = abs(media - self.media_referencia) / (abs(self.media_referencia) or 1)
        if desvio > self.tolerancia:
            return Hallazgo(f"sin_deriva({self.columna})", self.severidad,
                            f"media {media:.1f} vs referencia "
                            f"{self.media_referencia:.1f} ({desvio:.0%})")
        return None


@dataclass
class Contrato:
    nombre: str
    expectativas: list[Expectativa] = field(default_factory=list)

    def validar(self, filas: Sequence[Fila]) -> list[Hallazgo]:
        return [h for h in (e.verificar(filas) for e in self.expectativas) if h]

    def exigir(self, filas: Sequence[Fila]) -> None:
        hallazgos = self.validar(filas)
        for h in hallazgos:
            icono = "⛔" if h.severidad is Severidad.ERROR else "⚠️ "
            print(f"  {icono} {h.expectativa}: {h.detalle}")
        errores = [h for h in hallazgos if h.severidad is Severidad.ERROR]
        if errores:
            raise ValueError(f"{self.nombre}: {len(errores)} expectativas violadas")
        if not hallazgos:
            print("  ✅ el lote cumple el contrato")


CONTRATO = Contrato("clientes-v1", [
    NoNulos("edad"),
    NoNulos("ingreso", maximo_pct=0.10),
    EnRango("edad", 18, 110),
    CategoriasConocidas("ciudad", frozenset({"córdoba", "rosario", "salta"})),
    SinDeriva("ingreso", media_referencia=1500.0),
])

LOTE_BUENO: list[Fila] = [
    {"edad": 30, "ingreso": 1400, "ciudad": "córdoba"},
    {"edad": 45, "ingreso": 1600, "ciudad": "rosario"},
]
LOTE_ROTO: list[Fila] = [
    {"edad": 30, "ingreso": None, "ciudad": "córdoba"},
    {"edad": 450, "ingreso": 160000, "ciudad": "montevideo"},  # centímetros→edad, ARS→??
    {"edad": None, "ingreso": 1500, "ciudad": "salta"},
]

if __name__ == "__main__":
    print("— lote bueno —")
    CONTRATO.exigir(LOTE_BUENO)

    print("\n— lote roto —")
    try:
        CONTRATO.exigir(LOTE_ROTO)
    except ValueError as exc:
        print("  entrenamiento abortado:", exc)
