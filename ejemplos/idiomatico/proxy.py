"""
Proxy en Python idiomático.

Un proxy expone la misma interfaz que el objeto real y se mete en el medio para
retrasar la creación, cachear, controlar acceso o registrar llamadas. En Python
`__getattr__` permite escribir un proxy genérico que delega todo lo que no
intercepta.
"""
from __future__ import annotations

import time
from typing import Any, Protocol


class Servicio(Protocol):
    def consultar(self, termino: str) -> list[str]: ...


class ServicioReal:
    """El objeto caro: cada consulta cuesta tiempo y dinero."""

    def __init__(self) -> None:
        print("… inicializando el servicio real (lento)")

    def consultar(self, termino: str) -> list[str]:
        time.sleep(0.05)
        return [f"{termino}-{i}" for i in range(3)]


class ProxyPerezosoConCache:
    """Proxy: crea el real recién cuando hace falta y cachea resultados."""

    def __init__(self) -> None:
        self._real: ServicioReal | None = None
        self._cache: dict[str, list[str]] = {}
        self.estadisticas = {"hits": 0, "misses": 0}

    def consultar(self, termino: str) -> list[str]:
        if termino in self._cache:
            self.estadisticas["hits"] += 1
            return self._cache[termino]
        self.estadisticas["misses"] += 1
        if self._real is None:  # inicialización perezosa
            self._real = ServicioReal()
        self._cache[termino] = self._real.consultar(termino)
        return self._cache[termino]


class ProxyRegistrador:
    """Proxy genérico: delega todo con __getattr__ y registra por el camino."""

    def __init__(self, destino: object) -> None:
        self._destino = destino

    def __getattr__(self, nombre: str) -> Any:
        atributo = getattr(self._destino, nombre)
        if not callable(atributo):
            return atributo

        def envuelto(*args: object, **kwargs: object) -> object:
            inicio = time.perf_counter()
            resultado = atributo(*args, **kwargs)
            ms = (time.perf_counter() - inicio) * 1000
            print(f"  · {nombre}{args} → {ms:.1f} ms")
            return resultado

        return envuelto


if __name__ == "__main__":
    proxy = ProxyPerezosoConCache()
    print("(todavía no se creó nada caro)")
    servicio: Servicio = ProxyRegistrador(proxy)  # type: ignore[assignment]
    servicio.consultar("gatos")
    servicio.consultar("gatos")
    servicio.consultar("perros")
    print("estadísticas:", proxy.estadisticas)
