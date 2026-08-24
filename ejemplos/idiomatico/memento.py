"""
Memento en Python idiomático.

Guardar una foto del estado interno sin romper el encapsulamiento. En Python el
memento suele ser un `dataclass(frozen=True)` o directamente `copy.deepcopy` del
estado; lo que aporta el patrón es que *el que guarda no puede leer adentro*.
"""
from __future__ import annotations

from dataclasses import dataclass, replace
from typing import Iterator


@dataclass(frozen=True, slots=True)
class Memento:
    """Opaco para el cuidador: solo el editor sabe interpretarlo."""

    _texto: str
    _cursor: int


class Editor:
    def __init__(self) -> None:
        self._texto = ""
        self._cursor = 0

    def escribir(self, s: str) -> None:
        self._texto = self._texto[: self._cursor] + s + self._texto[self._cursor:]
        self._cursor += len(s)

    def mover_cursor(self, i: int) -> None:
        self._cursor = max(0, min(i, len(self._texto)))

    def guardar(self) -> Memento:
        return Memento(self._texto, self._cursor)

    def restaurar(self, m: Memento) -> None:
        self._texto, self._cursor = m._texto, m._cursor

    def __str__(self) -> str:
        return f"{self._texto[:self._cursor]}|{self._texto[self._cursor:]}"


class Cuidador:
    """No inspecciona los mementos: solo los apila."""

    def __init__(self, editor: Editor) -> None:
        self._editor = editor
        self._pila: list[Memento] = []

    def punto_de_control(self) -> None:
        self._pila.append(self._editor.guardar())

    def deshacer(self) -> None:
        if self._pila:
            self._editor.restaurar(self._pila.pop())


if __name__ == "__main__":
    editor = Editor()
    cuidador = Cuidador(editor)

    editor.escribir("hola")
    cuidador.punto_de_control()
    editor.escribir(" mundo")
    cuidador.punto_de_control()
    editor.mover_cursor(0)
    editor.escribir(">> ")
    print(editor)
    cuidador.deshacer()
    print(editor, "← un paso atrás")
    cuidador.deshacer()
    print(editor, "← dos pasos atrás")
