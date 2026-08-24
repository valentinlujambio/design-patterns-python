"""
Template Method en Python idiomático.

La clase base fija el esqueleto del algoritmo y deja "huecos" para las
subclases. En Python conviene marcar los huecos con `@abstractmethod` y dejar
los opcionales como *hooks* con implementación vacía. Alternativa sin herencia:
pasar los pasos como funciones (ahí el patrón se vuelve Strategy).
"""
from __future__ import annotations

from abc import ABC, abstractmethod


class ImportadorDeDatos(ABC):
    """El template method es `ejecutar`: nunca se sobreescribe."""

    def ejecutar(self, origen: str) -> dict:
        crudo = self.extraer(origen)
        filas = self.parsear(crudo)
        filas = [f for f in filas if self.es_valida(f)]   # hook con default
        self.cargar(filas)
        return {"origen": origen, "cargadas": len(filas)}

    @abstractmethod
    def extraer(self, origen: str) -> str: ...

    @abstractmethod
    def parsear(self, crudo: str) -> list[dict]: ...

    def es_valida(self, fila: dict) -> bool:  # hook opcional
        return True

    def cargar(self, filas: list[dict]) -> None:
        print(f"  cargando {len(filas)} filas en la base")


class ImportadorCSV(ImportadorDeDatos):
    def extraer(self, origen: str) -> str:
        return "nombre,edad\nana,33\nluis,17\nzoe,41"

    def parsear(self, crudo: str) -> list[dict]:
        cabecera, *lineas = crudo.splitlines()
        claves = cabecera.split(",")
        return [dict(zip(claves, linea.split(","))) for linea in lineas]

    def es_valida(self, fila: dict) -> bool:
        return int(fila["edad"]) >= 18


class ImportadorJSONL(ImportadorDeDatos):
    def extraer(self, origen: str) -> str:
        return '{"nombre": "ada"}\n{"nombre": "alan"}'

    def parsear(self, crudo: str) -> list[dict]:
        import json

        return [json.loads(linea) for linea in crudo.splitlines()]


if __name__ == "__main__":
    for importador in (ImportadorCSV(), ImportadorJSONL()):
        print(type(importador).__name__)
        print("  →", importador.ejecutar("archivo-de-ejemplo"))
