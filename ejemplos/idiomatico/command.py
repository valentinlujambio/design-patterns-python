"""
Command en Python idiomático.

Un comando es una acción convertida en objeto: se guarda, se encola, se
deshace. En Python un `dataclass` con `ejecutar()` y `deshacer()` alcanza; si el
comando no necesita deshacerse, una `partial` ya es un comando.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Protocol


class Comando(Protocol):
    def ejecutar(self) -> None: ...
    def deshacer(self) -> None: ...


@dataclass
class Documento:
    texto: str = ""


@dataclass
class Escribir:
    doc: Documento
    fragmento: str

    def ejecutar(self) -> None:
        self.doc.texto += self.fragmento

    def deshacer(self) -> None:
        self.doc.texto = self.doc.texto[: -len(self.fragmento)]


@dataclass
class Reemplazar:
    doc: Documento
    viejo: str
    nuevo: str
    _antes: str = ""

    def ejecutar(self) -> None:
        self._antes = self.doc.texto           # el comando guarda lo necesario
        self.doc.texto = self.doc.texto.replace(self.viejo, self.nuevo)

    def deshacer(self) -> None:
        self.doc.texto = self._antes


@dataclass
class Historial:
    """Invocador: ejecuta comandos y sabe deshacerlos en orden inverso."""

    hechos: list[Comando] = field(default_factory=list)

    def ejecutar(self, comando: Comando) -> None:
        comando.ejecutar()
        self.hechos.append(comando)

    def deshacer(self) -> None:
        if self.hechos:
            self.hechos.pop().deshacer()


if __name__ == "__main__":
    doc = Documento()
    historial = Historial()
    historial.ejecutar(Escribir(doc, "hola mundo"))
    historial.ejecutar(Reemplazar(doc, "mundo", "patrones"))
    print(repr(doc.texto))
    historial.deshacer()
    print(repr(doc.texto), "← deshecho el reemplazo")
    historial.deshacer()
    print(repr(doc.texto), "← deshecha la escritura")
