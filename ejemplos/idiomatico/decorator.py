"""
Decorator en Python idiomático.

Ojo con el nombre: el patrón GoF (envolver un *objeto*) y los decoradores de
Python (`@algo`, que envuelven una *función*) son primos, no gemelos. Los dos
agregan comportamiento sin tocar el original y se pueden apilar. Este archivo
muestra las dos caras.
"""
from __future__ import annotations

import functools
import time
from typing import Callable, Protocol, TypeVar

F = TypeVar("F", bound=Callable[..., object])


# ── 1. Decorador de funciones (la forma que Python trae de fábrica) ──────────
def con_reintentos(veces: int = 3, espera: float = 0.0) -> Callable[[F], F]:
    def decorador(fn: F) -> F:
        @functools.wraps(fn)
        def envuelto(*args: object, **kwargs: object) -> object:
            for intento in range(1, veces + 1):
                try:
                    return fn(*args, **kwargs)
                except RuntimeError as exc:
                    print(f"  intento {intento} falló: {exc}")
                    if intento == veces:
                        raise
                    time.sleep(espera)
            raise AssertionError("inalcanzable")

        return envuelto  # type: ignore[return-value]

    return decorador


_llamadas = {"n": 0}


@con_reintentos(veces=3)
def consultar_api() -> str:
    _llamadas["n"] += 1
    if _llamadas["n"] < 3:
        raise RuntimeError("503 servicio no disponible")
    return "{'ok': true}"


# ── 2. Decorator GoF: envolver un objeto que cumple el mismo protocolo ───────
class FuenteDeTexto(Protocol):
    def leer(self) -> str: ...


class ArchivoDeTexto:
    def __init__(self, contenido: str) -> None:
        self._contenido = contenido

    def leer(self) -> str:
        return self._contenido


class Mayusculas:
    def __init__(self, fuente: FuenteDeTexto) -> None:
        self._fuente = fuente

    def leer(self) -> str:
        return self._fuente.leer().upper()


class Numerada:
    def __init__(self, fuente: FuenteDeTexto) -> None:
        self._fuente = fuente

    def leer(self) -> str:
        lineas = self._fuente.leer().splitlines()
        return "\n".join(f"{i:>2}| {l}" for i, l in enumerate(lineas, 1))


if __name__ == "__main__":
    print("respuesta:", consultar_api(), "\n")

    fuente: FuenteDeTexto = ArchivoDeTexto("hola mundo\nsegunda línea")
    print(Numerada(Mayusculas(fuente)).leer())
