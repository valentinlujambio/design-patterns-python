"""
Patrón: Fuente de Frames (Frame Source)

Problema: el mismo pipeline tiene que correr con una webcam en el laboratorio,
un RTSP en la planta, un archivo .mp4 en los tests y una carpeta de imágenes en
el notebook. Si el código pregunta "¿es cámara o archivo?", se llena de ramas.

Solución: una sola interfaz iterable de frames. Cada origen es un Adapter que la
implementa, y el pipeline solo hace `for frame in fuente`. Encima se apilan
decoradores: saltear frames, limitar FPS, reconectar. Adapter + Iterator +
Decorator.
"""
from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Iterator, Protocol


@dataclass(frozen=True, slots=True)
class Frame:
    indice: int
    timestamp: float
    datos: str          # en la vida real: un ndarray


class FuenteDeFrames(Protocol):
    nombre: str

    def __iter__(self) -> Iterator[Frame]: ...


@dataclass
class DesdeArchivo:
    """Origen finito y reproducible: ideal para tests."""

    ruta: str
    cantidad: int = 6
    nombre: str = "archivo"

    def __iter__(self) -> Iterator[Frame]:
        for i in range(self.cantidad):
            yield Frame(i, i / 30, f"{self.ruta}#frame{i}")


@dataclass
class DesdeCarpeta:
    archivos: list[str]
    nombre: str = "carpeta"

    def __iter__(self) -> Iterator[Frame]:
        for i, archivo in enumerate(sorted(self.archivos)):
            yield Frame(i, time.time(), archivo)


@dataclass
class DesdeCamara:
    """Origen infinito y con fallas: el que rompe los pipelines ingenuos."""

    url: str
    fallar_en: int = 3
    nombre: str = "cámara"

    def __iter__(self) -> Iterator[Frame]:
        i = 0
        while True:
            if i == self.fallar_en:
                raise ConnectionError(f"se cayó el stream {self.url}")
            yield Frame(i, time.time(), f"{self.url}#live{i}")
            i += 1


# ── Decoradores: se apilan sobre cualquier fuente ──────────────────────────
@dataclass
class Saltear:
    """Procesar 1 de cada n frames: la optimización más barata de todas."""

    fuente: FuenteDeFrames
    n: int = 2

    @property
    def nombre(self) -> str:
        return f"{self.fuente.nombre}+saltear({self.n})"

    def __iter__(self) -> Iterator[Frame]:
        for i, frame in enumerate(self.fuente):
            if i % self.n == 0:
                yield frame


@dataclass
class Limitar:
    fuente: FuenteDeFrames
    maximo: int

    @property
    def nombre(self) -> str:
        return f"{self.fuente.nombre}+limitar({self.maximo})"

    def __iter__(self) -> Iterator[Frame]:
        for i, frame in enumerate(self.fuente):
            if i >= self.maximo:
                return
            yield frame


@dataclass
class Reconectar:
    """Un stream que se cae no debe tumbar el proceso."""

    fabrica: object          # callable que devuelve una fuente nueva
    intentos: int = 3

    @property
    def nombre(self) -> str:
        return "reconectable"

    def __iter__(self) -> Iterator[Frame]:
        for intento in range(1, self.intentos + 1):
            try:
                yield from self.fabrica()  # type: ignore[operator]
                return
            except ConnectionError as exc:
                print(f"    ! {exc} (reintento {intento}/{self.intentos})")
        print("    ! se agotaron los reintentos")


def procesar(fuente: FuenteDeFrames) -> None:
    """El pipeline: idéntico para todos los orígenes."""
    print(f"  fuente '{fuente.nombre}':")
    for frame in fuente:
        print(f"    · frame {frame.indice}: {frame.datos}")


if __name__ == "__main__":
    procesar(DesdeArchivo("clip.mp4", cantidad=4))
    procesar(Saltear(DesdeArchivo("clip.mp4", cantidad=6), n=3))
    procesar(DesdeCarpeta(["b.png", "a.png"]))
    procesar(Limitar(Reconectar(lambda: DesdeCamara("rtsp://planta/1")), maximo=5))
