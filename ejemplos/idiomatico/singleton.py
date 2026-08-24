"""
Singleton en Python idiomático.

En Python el singleton natural es el **módulo**: se importa una sola vez y su
estado queda compartido. Si necesitás un objeto, `functools.lru_cache` sobre una
función fábrica es la forma más simple y segura (la caché de `lru_cache` está
protegida por un lock). La metaclase es el último recurso; casi siempre lo que
realmente querés es *inyectar* la dependencia y no un global escondido.
"""
from __future__ import annotations

import threading
from dataclasses import dataclass, field
from functools import lru_cache


@dataclass(slots=True)
class Configuracion:
    """Objeto caro de construir que queremos tener una sola vez."""

    origen: str
    valores: dict[str, str] = field(default_factory=dict)


@lru_cache(maxsize=1)
def config() -> Configuracion:
    """Singleton perezoso y seguro entre hilos, en tres líneas."""
    print("… leyendo configuración del disco (esto pasa una sola vez)")
    return Configuracion(origen="config.toml", valores={"entorno": "prod"})


class SingletonMeta(type):
    """La versión clásica, por si necesitás controlar la clase entera."""

    _instancias: dict[type, object] = {}
    _lock = threading.Lock()

    def __call__(cls, *args: object, **kwargs: object) -> object:
        if cls not in cls._instancias:
            with cls._lock:  # doble chequeo: barato en el camino feliz
                if cls not in cls._instancias:
                    cls._instancias[cls] = super().__call__(*args, **kwargs)
        return cls._instancias[cls]


class PoolDeConexiones(metaclass=SingletonMeta):
    def __init__(self, tamano: int = 5) -> None:
        self.tamano = tamano


if __name__ == "__main__":
    print(config().valores, config() is config())

    a, b = PoolDeConexiones(tamano=10), PoolDeConexiones(tamano=99)
    print("misma instancia:", a is b, "| tamaño:", b.tamano,
          "← ojo: el segundo constructor se ignoró en silencio")

    resultados: list[bool] = []
    hilos = [threading.Thread(target=lambda: resultados.append(config() is config()))
             for _ in range(8)]
    for h in hilos:
        h.start()
    for h in hilos:
        h.join()
    print("consistente entre hilos:", all(resultados))
