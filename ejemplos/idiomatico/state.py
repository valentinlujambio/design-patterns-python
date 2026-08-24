"""
State en Python idiomático.

Un objeto cambia de comportamiento al cambiar de estado interno. La versión
pythónica evita el `if estado == ...` gigante: cada estado es una clase (o una
entrada en una tabla de transiciones) y el contexto delega en el estado actual.
"""
from __future__ import annotations

from typing import Protocol


class Estado(Protocol):
    nombre: str

    def publicar(self, doc: "Documento") -> None: ...
    def rechazar(self, doc: "Documento") -> None: ...


class Borrador:
    nombre = "borrador"

    def publicar(self, doc: "Documento") -> None:
        doc.transicionar(EnRevision())

    def rechazar(self, doc: "Documento") -> None:
        print("  un borrador no se puede rechazar")


class EnRevision:
    nombre = "en revisión"

    def publicar(self, doc: "Documento") -> None:
        if doc.autor_es_admin:
            doc.transicionar(Publicado())
        else:
            print("  hace falta un admin para publicar")

    def rechazar(self, doc: "Documento") -> None:
        doc.transicionar(Borrador())


class Publicado:
    nombre = "publicado"

    def publicar(self, doc: "Documento") -> None:
        print("  ya está publicado")

    def rechazar(self, doc: "Documento") -> None:
        doc.transicionar(Borrador())


class Documento:
    def __init__(self, autor_es_admin: bool = False) -> None:
        self.autor_es_admin = autor_es_admin
        self._estado: Estado = Borrador()

    @property
    def estado(self) -> str:
        return self._estado.nombre

    def transicionar(self, nuevo: Estado) -> None:
        print(f"  {self._estado.nombre} → {nuevo.nombre}")
        self._estado = nuevo

    # El contexto solo delega: cero condicionales sobre el estado.
    def publicar(self) -> None:
        self._estado.publicar(self)

    def rechazar(self) -> None:
        self._estado.rechazar(self)


if __name__ == "__main__":
    for admin in (False, True):
        print(f"— autor admin={admin} —")
        doc = Documento(autor_es_admin=admin)
        doc.publicar()
        doc.publicar()
        doc.rechazar()
        print("  estado final:", doc.estado, "\n")
