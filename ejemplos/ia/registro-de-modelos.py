"""
Patrón: Registro de Modelos (Model Registry)

Problema: "¿qué modelo está en producción?" se responde mirando un archivo en la
notebook de alguien. No hay forma de reproducir un resultado ni de volver atrás.

Solución: un registro que indexa versiones inmutables con sus métricas, su
linaje (datos + código + hiperparámetros) y su etapa (staging/producción). El
código pide "el modelo de producción para riesgo-crediticio" y no un archivo.
Es Registry + Factory: resuelve nombres a objetos y centraliza la construcción.
"""
from __future__ import annotations

import hashlib
import json
from dataclasses import asdict, dataclass, field
from typing import Callable, Iterator


@dataclass(frozen=True, slots=True)
class VersionDeModelo:
    nombre: str
    version: int
    etapa: str                       # "staging" | "produccion" | "archivado"
    metricas: dict[str, float]
    hiperparametros: dict[str, float | str]
    hash_datos: str
    constructor: Callable[[], Callable[[list[float]], float]] = field(repr=False)

    @property
    def id(self) -> str:
        return f"{self.nombre}:v{self.version}"

    def linaje(self) -> str:
        base = json.dumps({"hp": self.hiperparametros, "datos": self.hash_datos},
                          sort_keys=True)
        return hashlib.sha256(base.encode()).hexdigest()[:12]


class RegistroDeModelos:
    def __init__(self) -> None:
        self._versiones: list[VersionDeModelo] = []

    def registrar(self, **kwargs) -> VersionDeModelo:  # type: ignore[no-untyped-def]
        version = 1 + sum(1 for v in self._versiones if v.nombre == kwargs["nombre"])
        entrada = VersionDeModelo(version=version, etapa="staging", **kwargs)
        self._versiones.append(entrada)
        return entrada

    def promover(self, nombre: str, version: int, *, metrica: str,
                 minimo: float) -> VersionDeModelo:
        """Promoción con compuerta de calidad: no se promueve a mano."""
        candidato = self.obtener(nombre, version)
        valor = candidato.metricas.get(metrica, float("-inf"))
        if valor < minimo:
            raise ValueError(f"{candidato.id} no pasa la compuerta "
                             f"({metrica}={valor} < {minimo})")
        nuevas = []
        for v in self._versiones:
            if v.nombre == nombre and v.etapa == "produccion":
                v = _con_etapa(v, "archivado")
            if v.id == candidato.id:
                v = _con_etapa(v, "produccion")
            nuevas.append(v)
        self._versiones = nuevas
        return self.produccion(nombre)

    def obtener(self, nombre: str, version: int) -> VersionDeModelo:
        for v in self._versiones:
            if v.nombre == nombre and v.version == version:
                return v
        raise KeyError(f"{nombre}:v{version} no existe")

    def produccion(self, nombre: str) -> VersionDeModelo:
        for v in self._versiones:
            if v.nombre == nombre and v.etapa == "produccion":
                return v
        raise LookupError(f"{nombre} no tiene versión en producción")

    def cargar(self, nombre: str) -> Callable[[list[float]], float]:
        """La app pide por nombre; el registro devuelve el objeto listo."""
        return self.produccion(nombre).constructor()

    def __iter__(self) -> Iterator[VersionDeModelo]:
        return iter(self._versiones)


def _con_etapa(v: VersionDeModelo, etapa: str) -> VersionDeModelo:
    datos = {k: getattr(v, k) for k in v.__slots__ if k != "etapa"}
    return VersionDeModelo(etapa=etapa, **datos)


def modelo_lineal(pesos: list[float], sesgo: float) -> Callable[[list[float]], float]:
    return lambda x: round(sum(p * v for p, v in zip(pesos, x)) + sesgo, 4)


if __name__ == "__main__":
    registro = RegistroDeModelos()
    registro.registrar(nombre="riesgo", metricas={"auc": 0.71, "ks": 0.30},
                       hiperparametros={"lr": 0.1}, hash_datos="ds-2026-01",
                       constructor=lambda: modelo_lineal([0.2, 0.5], 0.1))
    registro.registrar(nombre="riesgo", metricas={"auc": 0.83, "ks": 0.41},
                       hiperparametros={"lr": 0.05, "profundidad": 6},
                       hash_datos="ds-2026-03",
                       constructor=lambda: modelo_lineal([0.4, 0.6], -0.2))

    try:
        registro.promover("riesgo", 1, metrica="auc", minimo=0.80)
    except ValueError as exc:
        print("compuerta de calidad:", exc)

    produccion = registro.promover("riesgo", 2, metrica="auc", minimo=0.80)
    print("en producción:", produccion.id, "linaje", produccion.linaje())

    predecir = registro.cargar("riesgo")
    print("predicción:", predecir([1.0, 2.0]))
    print("\ninventario:")
    for v in registro:
        print(f"  {v.id:<12} {v.etapa:<11} auc={v.metricas['auc']}")
