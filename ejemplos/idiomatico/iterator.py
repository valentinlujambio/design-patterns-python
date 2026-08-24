"""
Iterator en Python idiomático.

Este patrón *es* Python: el protocolo `__iter__`/`__next__` está en el lenguaje y
los generadores lo implementan por vos. Escribir una clase iteradora a mano casi
nunca hace falta; sí hace falta entender que un iterador es perezoso y de un
solo uso.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Iterator


@dataclass
class Paginado:
    """Colección que oculta la paginación detrás de un iterador."""

    paginas: list[list[str]] = field(default_factory=list)

    def __iter__(self) -> Iterator[str]:
        """Un generador: perezoso, sin estado manual, sin StopIteration."""
        for numero, pagina in enumerate(self.paginas, 1):
            print(f"  (pidiendo página {numero})")
            yield from pagina


class ContadorRegresivo:
    """La versión 'a mano', para ver el protocolo por dentro."""

    def __init__(self, desde: int) -> None:
        self.actual = desde

    def __iter__(self) -> "ContadorRegresivo":
        return self

    def __next__(self) -> int:
        if self.actual <= 0:
            raise StopIteration
        self.actual -= 1
        return self.actual + 1


if __name__ == "__main__":
    resultados = Paginado([["a", "b"], ["c", "d"], ["e"]])

    # Perezoso: solo pide las páginas que consume.
    for i, item in enumerate(resultados):
        print("item:", item)
        if i == 2:
            break

    print("contador a mano:", list(ContadorRegresivo(3)))

    # Un iterador es de un solo uso; una colección se puede recorrer muchas veces.
    it = iter(resultados)
    print("primer recorrido:", list(it))
    print("segundo recorrido del mismo iterador:", list(it))
