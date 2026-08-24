"""
Mediator en Python idiomático.

En vez de que N componentes se conozcan entre sí (N² acoplamientos), todos
hablan con un mediador. En Python el mediador suele ser un pequeño bus de
eventos: un `dict[str, list[callable]]`.
"""
from __future__ import annotations

from collections import defaultdict
from typing import Any, Callable


class Mediador:
    def __init__(self) -> None:
        self._suscriptores: dict[str, list[Callable[..., None]]] = defaultdict(list)

    def on(self, evento: str, funcion: Callable[..., None]) -> None:
        self._suscriptores[evento].append(funcion)

    def emitir(self, evento: str, **datos: Any) -> None:
        for funcion in self._suscriptores[evento]:
            funcion(**datos)


class CampoBusqueda:
    def __init__(self, mediador: Mediador) -> None:
        self.mediador = mediador

    def escribir(self, texto: str) -> None:
        print(f"[campo] el usuario escribió {texto!r}")
        self.mediador.emitir("busqueda_cambiada", texto=texto)


class ListaResultados:
    def __init__(self, mediador: Mediador) -> None:
        mediador.on("busqueda_cambiada", self.recargar)

    def recargar(self, texto: str) -> None:
        print(f"[lista] mostrando resultados de {texto!r}")


class BotonLimpiar:
    def __init__(self, mediador: Mediador) -> None:
        mediador.on("busqueda_cambiada", self.actualizar)

    def actualizar(self, texto: str) -> None:
        print(f"[botón] {'habilitado' if texto else 'deshabilitado'}")


if __name__ == "__main__":
    mediador = Mediador()
    campo = CampoBusqueda(mediador)
    ListaResultados(mediador)
    BotonLimpiar(mediador)

    campo.escribir("patrones")
    print()
    campo.escribir("")
