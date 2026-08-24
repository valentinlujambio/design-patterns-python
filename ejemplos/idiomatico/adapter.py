"""
Adapter en Python idiomático.

Como Python usa *duck typing*, adaptar suele ser envolver un objeto ajeno en una
clase pequeña que expone los nombres que tu código espera. Cuando la diferencia
es una sola llamada, `functools.partial` o una función alcanzan.
"""
from __future__ import annotations

import json
from typing import Protocol


class AlmacenClaveValor(Protocol):
    """La interfaz que espera nuestro dominio."""

    def guardar(self, clave: str, valor: dict) -> None: ...
    def leer(self, clave: str) -> dict | None: ...


class RedisFalso:
    """Servicio externo: nombres distintos y solo habla en bytes."""

    def __init__(self) -> None:
        self._datos: dict[bytes, bytes] = {}

    def SET(self, key: bytes, value: bytes) -> None:
        self._datos[key] = value

    def GET(self, key: bytes) -> bytes | None:
        return self._datos.get(key)


class AdaptadorRedis:
    """Adapter: traduce nombres, tipos y formato de serialización."""

    def __init__(self, cliente: RedisFalso, prefijo: str = "app:") -> None:
        self._cliente = cliente
        self._prefijo = prefijo

    def _k(self, clave: str) -> bytes:
        return f"{self._prefijo}{clave}".encode()

    def guardar(self, clave: str, valor: dict) -> None:
        self._cliente.SET(self._k(clave), json.dumps(valor).encode())

    def leer(self, clave: str) -> dict | None:
        crudo = self._cliente.GET(self._k(clave))
        return json.loads(crudo) if crudo is not None else None


class AlmacenEnMemoria:
    """Otra implementación de la misma interfaz, útil en tests."""

    def __init__(self) -> None:
        self._datos: dict[str, dict] = {}

    def guardar(self, clave: str, valor: dict) -> None:
        self._datos[clave] = dict(valor)

    def leer(self, clave: str) -> dict | None:
        return self._datos.get(clave)


def registrar_visita(almacen: AlmacenClaveValor, usuario: str) -> dict:
    """Cliente: no sabe si atrás hay Redis, un dict o un archivo."""
    perfil = almacen.leer(usuario) or {"usuario": usuario, "visitas": 0}
    perfil["visitas"] += 1
    almacen.guardar(usuario, perfil)
    return perfil


if __name__ == "__main__":
    for almacen in (AdaptadorRedis(RedisFalso()), AlmacenEnMemoria()):
        registrar_visita(almacen, "ana")
        print(type(almacen).__name__, "→", registrar_visita(almacen, "ana"))
