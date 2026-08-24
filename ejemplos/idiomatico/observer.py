"""
Observer en Python idiomático.

El sujeto mantiene una lista de callables y los llama cuando algo cambia. Dos
detalles que importan en producción: usar `weakref` para no filtrar memoria y
aislar los errores de un observador para que no tumben a los demás.
"""
from __future__ import annotations

import weakref
from typing import Callable


class Sujeto:
    def __init__(self) -> None:
        self._observadores: list[Callable[[str], None]] = []

    def suscribir(self, funcion: Callable[[str], None]) -> Callable[[], None]:
        """Devuelve la función para darse de baja (como en JS)."""
        self._observadores.append(funcion)
        return lambda: self._observadores.remove(funcion)

    def notificar(self, evento: str) -> None:
        for observador in list(self._observadores):
            try:
                observador(evento)
            except Exception as exc:  # un observador roto no rompe al resto
                print(f"  ! observador {observador!r} falló: {exc}")


class Almacen(Sujeto):
    def __init__(self) -> None:
        super().__init__()
        self._stock: dict[str, int] = {}

    def reponer(self, producto: str, cantidad: int) -> None:
        self._stock[producto] = self._stock.get(producto, 0) + cantidad
        self.notificar(f"stock:{producto}={self._stock[producto]}")


class PanelDeControl:
    """Observador con método: `self.mostrar` ya es un callable."""

    def mostrar(self, evento: str) -> None:
        print(f"[panel] {evento}")


def alerta_por_email(evento: str) -> None:
    print(f"[email] cambio detectado → {evento}")


def observador_roto(evento: str) -> None:
    raise RuntimeError("me caí")


if __name__ == "__main__":
    almacen = Almacen()
    panel = PanelDeControl()

    baja_panel = almacen.suscribir(panel.mostrar)
    almacen.suscribir(alerta_por_email)
    almacen.suscribir(observador_roto)

    almacen.reponer("teclado", 5)
    print()
    baja_panel()
    almacen.reponer("mouse", 2)
    print("\nreferencia débil, por si el observador debe morir con su dueño:",
          weakref.WeakMethod(panel.mostrar)() is not None)
