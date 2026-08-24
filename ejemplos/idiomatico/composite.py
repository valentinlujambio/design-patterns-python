"""
Composite en Python idiomático.

Un árbol donde las hojas y los nodos comparten interfaz. En Python conviene
apoyarse en `Iterable` y en la recursión: `sum(hijo.tamano() for hijo in self)`
lee mucho mejor que un bucle con acumulador.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Iterator, Protocol, runtime_checkable


@runtime_checkable
class NodoFS(Protocol):
    nombre: str

    def tamano(self) -> int: ...
    def listar(self, sangria: int = 0) -> Iterator[str]: ...


@dataclass
class Archivo:
    """Hoja."""

    nombre: str
    bytes_: int

    def tamano(self) -> int:
        return self.bytes_

    def listar(self, sangria: int = 0) -> Iterator[str]:
        yield f"{' ' * sangria}📄 {self.nombre} ({self.bytes_} B)"


@dataclass
class Carpeta:
    """Compuesto: se usa exactamente igual que una hoja."""

    nombre: str
    hijos: list[NodoFS] = field(default_factory=list)

    def agregar(self, *nodos: NodoFS) -> "Carpeta":
        self.hijos.extend(nodos)
        return self

    def tamano(self) -> int:
        return sum(hijo.tamano() for hijo in self.hijos)

    def listar(self, sangria: int = 0) -> Iterator[str]:
        yield f"{' ' * sangria}📁 {self.nombre}/ ({self.tamano()} B)"
        for hijo in self.hijos:
            yield from hijo.listar(sangria + 2)


if __name__ == "__main__":
    proyecto = Carpeta("proyecto").agregar(
        Archivo("README.md", 1200),
        Carpeta("src").agregar(Archivo("main.py", 3400), Archivo("utils.py", 980)),
        Carpeta("tests").agregar(Archivo("test_main.py", 2100)),
    )
    print("\n".join(proyecto.listar()))
    print("total:", proyecto.tamano(), "bytes")
