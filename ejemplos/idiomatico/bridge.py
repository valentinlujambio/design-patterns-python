"""
Bridge en Python idiomático.

Bridge = composición explícita entre dos jerarquías que varían por separado
(abstracción × implementación). En Python la "implementación" puede ser
cualquier objeto o función que cumpla el protocolo; lo importante es inyectarla
en el constructor en vez de heredar de ella.
"""
from __future__ import annotations

from typing import Protocol


class Renderizador(Protocol):
    """Implementación: cómo se dibuja."""

    def circulo(self, x: float, y: float, r: float) -> str: ...
    def rectangulo(self, x: float, y: float, w: float, h: float) -> str: ...


class RenderSVG:
    def circulo(self, x: float, y: float, r: float) -> str:
        return f'<circle cx="{x}" cy="{y}" r="{r}"/>'

    def rectangulo(self, x: float, y: float, w: float, h: float) -> str:
        return f'<rect x="{x}" y="{y}" width="{w}" height="{h}"/>'


class RenderTexto:
    def circulo(self, x: float, y: float, r: float) -> str:
        return f"círculo en ({x},{y}) radio {r}"

    def rectangulo(self, x: float, y: float, w: float, h: float) -> str:
        return f"rectángulo {w}x{h} en ({x},{y})"


class Figura:
    """Abstracción: qué se dibuja. Crece sin tocar los renderizadores."""

    def __init__(self, render: Renderizador) -> None:
        self.render = render

    def dibujar(self) -> str:  # pragma: no cover - interfaz
        raise NotImplementedError


class Circulo(Figura):
    def __init__(self, render: Renderizador, x: float, y: float, r: float) -> None:
        super().__init__(render)
        self.x, self.y, self.r = x, y, r

    def dibujar(self) -> str:
        return self.render.circulo(self.x, self.y, self.r)


class Cuadrado(Figura):
    def __init__(self, render: Renderizador, x: float, y: float, lado: float) -> None:
        super().__init__(render)
        self.x, self.y, self.lado = x, y, lado

    def dibujar(self) -> str:
        return self.render.rectangulo(self.x, self.y, self.lado, self.lado)


if __name__ == "__main__":
    # 2 figuras × 2 renderizadores = 4 combinaciones, y solo 4 clases.
    for render in (RenderSVG(), RenderTexto()):
        for figura in (Circulo(render, 10, 10, 5), Cuadrado(render, 0, 0, 8)):
            print(figura.dibujar())
