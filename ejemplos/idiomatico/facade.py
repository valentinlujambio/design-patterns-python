"""
Facade en Python idiomático.

Una fachada suele ser, sencillamente, *un módulo con dos funciones públicas* que
esconde diez clases internas. Acá la modelamos como clase para que se vea la
composición, pero la señal de que la fachada es buena es que el cliente hace una
sola llamada.
"""
from __future__ import annotations

from dataclasses import dataclass


class _Descargador:
    def obtener(self, url: str) -> bytes:
        return f"<video crudo de {url}>".encode()


class _Decodificador:
    def decodificar(self, datos: bytes) -> list[str]:
        return [f"frame-{i}" for i in range(1, 4)]


class _Redimensionador:
    def escalar(self, frames: list[str], ancho: int) -> list[str]:
        return [f"{f}@{ancho}px" for f in frames]


class _Codificador:
    def codificar(self, frames: list[str], formato: str) -> bytes:
        return (f"{formato}:" + ",".join(frames)).encode()


@dataclass
class ConversorDeVideo:
    """Fachada: una función pública, cuatro subsistemas escondidos."""

    ancho: int = 640
    formato: str = "mp4"

    def convertir(self, url: str) -> bytes:
        crudo = _Descargador().obtener(url)
        frames = _Decodificador().decodificar(crudo)
        frames = _Redimensionador().escalar(frames, self.ancho)
        return _Codificador().codificar(frames, self.formato)


if __name__ == "__main__":
    print(ConversorDeVideo(ancho=320).convertir("https://ejemplo.com/clip").decode())
