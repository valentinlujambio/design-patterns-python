"""
Patrón: Tubería de Transformaciones (Compose / Augmentation Pipeline)

Problema: el preprocesamiento de imágenes se escribe como una función gigante
que hace todo. Cambiar el orden, desactivar un paso en validación o repetir
exactamente la misma secuencia en producción se vuelve imposible.

Solución: cada transformación es un objeto invocable con la misma firma
(imagen → imagen) y `Componer` las encadena. Es Decorator/Composite: la
composición es a su vez una transformación, así que se anida sin límite. Es la
API de torchvision y Albumentations.
"""
from __future__ import annotations

import random
from dataclasses import dataclass, field, replace
from typing import Callable, Protocol


@dataclass(frozen=True, slots=True)
class Imagen:
    """Imagen en escala de grises, chiquita y sin dependencias."""

    ancho: int
    alto: int
    pixeles: tuple[int, ...]

    def en(self, x: int, y: int) -> int:
        return self.pixeles[y * self.ancho + x]

    def dibujar(self) -> str:
        escala = " .:-=+*#%@"
        filas = []
        for y in range(self.alto):
            filas.append("".join(escala[min(self.en(x, y), 255) * 9 // 255]
                                 for x in range(self.ancho)))
        return "\n".join(filas)


class Transformacion(Protocol):
    def __call__(self, img: Imagen) -> Imagen: ...


@dataclass(frozen=True, slots=True)
class Recortar:
    x: int
    y: int
    ancho: int
    alto: int

    def __call__(self, img: Imagen) -> Imagen:
        pix = tuple(img.en(self.x + dx, self.y + dy)
                    for dy in range(self.alto) for dx in range(self.ancho))
        return Imagen(self.ancho, self.alto, pix)


@dataclass(frozen=True, slots=True)
class EspejarHorizontal:
    def __call__(self, img: Imagen) -> Imagen:
        pix = tuple(img.en(img.ancho - 1 - x, y)
                    for y in range(img.alto) for x in range(img.ancho))
        return replace(img, pixeles=pix)


@dataclass(frozen=True, slots=True)
class AjustarBrillo:
    delta: int

    def __call__(self, img: Imagen) -> Imagen:
        return replace(img, pixeles=tuple(max(0, min(255, p + self.delta))
                                          for p in img.pixeles))


@dataclass(frozen=True, slots=True)
class Normalizar:
    """Siempre al final: deja los valores listos para la red."""

    media: float = 128.0
    desvio: float = 64.0

    def __call__(self, img: Imagen) -> Imagen:
        return replace(img, pixeles=tuple(
            int(round((p - self.media) / self.desvio * 64 + 128)) for p in img.pixeles))


@dataclass(frozen=True, slots=True)
class AlAzar:
    """Decorator: aplica otra transformación con probabilidad p."""

    transformacion: Transformacion
    p: float = 0.5
    rng: random.Random = field(default_factory=lambda: random.Random(0))

    def __call__(self, img: Imagen) -> Imagen:
        return self.transformacion(img) if self.rng.random() < self.p else img


@dataclass(frozen=True, slots=True)
class Componer:
    """Composite: una lista de transformaciones ES una transformación."""

    pasos: tuple[Transformacion, ...]

    def __call__(self, img: Imagen) -> Imagen:
        for paso in self.pasos:
            img = paso(img)
        return img

    def __repr__(self) -> str:
        return "Componer(" + " → ".join(type(p).__name__ for p in self.pasos) + ")"


def gradiente(ancho: int, alto: int) -> Imagen:
    return Imagen(ancho, alto, tuple((x * 255) // (ancho - 1) for _ in range(alto)
                                     for x in range(ancho)))


if __name__ == "__main__":
    original = gradiente(16, 6)

    # La clave: entrenamiento y validación comparten la base determinista y
    # solo el de entrenamiento agrega aleatoriedad.
    base = (Recortar(2, 1, 12, 4), Normalizar())
    entrenamiento = Componer((Recortar(2, 1, 12, 4),
                              AlAzar(EspejarHorizontal(), p=1.0),
                              AjustarBrillo(-40), Normalizar()))
    validacion = Componer(base)

    print("original:")
    print(original.dibujar())
    print(f"\n{validacion!r}:")
    print(validacion(original).dibujar())
    print(f"\n{entrenamiento!r}:")
    print(entrenamiento(original).dibujar())
