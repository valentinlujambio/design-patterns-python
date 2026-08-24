"""
Patrón: Cadena de Prompts (Prompt Chaining / Pipeline)

Problema: un único prompt que extrae, razona, traduce y formatea hace las cuatro
cosas mal. Además es imposible saber en qué paso se rompió.

Solución: descomponer la tarea en pasos chicos, cada uno con su prompt, su
validación y su salida tipada. La salida de un paso es la entrada del siguiente.
Es Pipes and Filters / Chain aplicado a llamadas de modelo: cada paso se testea,
se cachea y se reemplaza por separado (algunos ni siquiera necesitan un LLM).
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable

from _llm_falso import Contador, LLMFalso, Mensaje


@dataclass
class Estado:
    """Lo que viaja por la tubería."""

    entrada: str
    datos: dict[str, str] = field(default_factory=dict)
    traza: list[str] = field(default_factory=list)


Paso = Callable[[Estado], Estado]


def paso_llm(nombre: str, llm: LLMFalso, plantilla: str, salida: str,
             contador: Contador) -> Paso:
    def ejecutar(estado: Estado) -> Estado:
        prompt = plantilla.format(entrada=estado.entrada, **estado.datos)
        r = contador.registrar(llm.completar([Mensaje("user", prompt)]), nombre)
        estado.datos[salida] = r.texto
        estado.traza.append(f"{nombre} → {r.tokens_salida} tok")
        return estado

    return ejecutar


def paso_puro(nombre: str, funcion: Callable[[Estado], None]) -> Paso:
    """Un paso determinista: más barato y más confiable que un LLM."""

    def ejecutar(estado: Estado) -> Estado:
        funcion(estado)
        estado.traza.append(f"{nombre} (sin LLM)")
        return estado

    return ejecutar


def tuberia(*pasos: Paso) -> Paso:
    def ejecutar(estado: Estado) -> Estado:
        for paso in pasos:
            estado = paso(estado)
        return estado

    return ejecutar


if __name__ == "__main__":
    contador = Contador()
    barato, capaz = LLMFalso("mini"), LLMFalso("estandar")

    proceso = tuberia(
        paso_llm("1-extraer", barato,
                 "Extraé los hechos verificables de:\n{entrada}", "hechos", contador),
        paso_llm("2-analizar", capaz,
                 "Dados estos hechos:\n{hechos}\n¿Cuál es la causa raíz?",
                 "analisis", contador),
        paso_puro("3-truncar",
                  lambda e: e.datos.__setitem__("analisis", e.datos["analisis"][:120])),
        paso_llm("4-redactar", barato,
                 "Escribí una respuesta al cliente basada en: {analisis}",
                 "respuesta", contador),
    )

    estado = proceso(Estado(entrada=(
        "El cliente reporta que la app tarda 40s en abrir desde el martes. "
        "El martes desplegamos la versión 3.2 con el nuevo índice de búsqueda."
    )))

    for linea in estado.traza:
        print(" ·", linea)
    print("\nrespuesta final:", estado.datos["respuesta"][:100], "…")
    print("uso total:", contador.resumen())
