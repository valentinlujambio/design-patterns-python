"""
Chain of Responsibility en Python idiomático.

La cadena clásica encadena objetos con `set_next`. En Python una lista de
funciones (o `functools.reduce`) suele bastar: cada eslabón recibe la petición y
decide si la resuelve, la transforma o la deja pasar.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable, Iterable


@dataclass
class Peticion:
    ruta: str
    usuario: str | None = None
    rol: str = "anonimo"
    marcas: list[str] = field(default_factory=list)


# Un manejador devuelve None para "seguí" o una cadena para "corté acá".
Manejador = Callable[[Peticion], str | None]


def limitar_tasa(peticion: Peticion) -> str | None:
    if peticion.ruta.startswith("/api/export"):
        return "429 demasiadas peticiones"
    peticion.marcas.append("tasa-ok")
    return None


def autenticar(peticion: Peticion) -> str | None:
    if peticion.usuario is None:
        return "401 no autenticado"
    peticion.marcas.append("autenticado")
    return None


def autorizar(peticion: Peticion) -> str | None:
    if peticion.ruta.startswith("/admin") and peticion.rol != "admin":
        return "403 prohibido"
    peticion.marcas.append("autorizado")
    return None


def manejar(peticion: Peticion) -> str:
    peticion.marcas.append("manejado")
    return f"200 OK ({peticion.ruta})"


def cadena(*eslabones: Manejador) -> Callable[[Peticion], str]:
    """Compone la cadena: el primero que devuelve algo, gana."""

    def ejecutar(peticion: Peticion) -> str:
        for eslabon in eslabones:
            resultado = eslabon(peticion)
            if resultado is not None:
                return resultado
        return manejar(peticion)

    return ejecutar


if __name__ == "__main__":
    tuberia = cadena(limitar_tasa, autenticar, autorizar)
    casos: Iterable[Peticion] = [
        Peticion("/perfil", usuario="ana"),
        Peticion("/admin/usuarios", usuario="ana", rol="editor"),
        Peticion("/perfil"),
        Peticion("/api/export/todo", usuario="ana"),
    ]
    for caso in casos:
        print(f"{caso.ruta:<20} → {tuberia(caso):<24} {caso.marcas}")
