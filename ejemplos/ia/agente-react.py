"""
Patrón: Agente ReAct (Razonar + Actuar)

Problema: una sola llamada al modelo no alcanza cuando la tarea requiere buscar
información, usar el resultado y recién ahí decidir. Encadenar pasos fijos
tampoco sirve: la cantidad de pasos depende del caso.

Solución: un bucle donde el modelo alterna Pensamiento → Acción → Observación
hasta producir una Respuesta final. El bucle lo controla tu código, no el
modelo: vos ponés el tope de iteraciones, el presupuesto y las herramientas
permitidas. Es un Command Loop con un Intérprete simple de la salida del modelo.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Callable

from _llm_falso import Contador, LLMFalso, Mensaje

SISTEMA = """Resolvés tareas alternando estos bloques:
Pensamiento: <razonamiento breve>
Acción: <herramienta>[<argumento>]
… y cuando ya sabés la respuesta:
Respuesta: <respuesta final>
Herramientas disponibles: {herramientas}"""


@dataclass
class Agente:
    llm: LLMFalso
    herramientas: dict[str, Callable[[str], str]]
    max_pasos: int = 5
    contador: Contador = field(default_factory=Contador)

    def ejecutar(self, tarea: str) -> str:
        historial: list[Mensaje] = [
            Mensaje("system", SISTEMA.format(herramientas=", ".join(self.herramientas))),
            Mensaje("user", tarea),
        ]

        for paso in range(1, self.max_pasos + 1):
            r = self.contador.registrar(self.llm.completar(historial), f"paso-{paso}")
            print(f"  [{paso}] {r.texto.strip()}")
            historial.append(Mensaje("assistant", r.texto))

            if (final := re.search(r"Respuesta:\s*(.+)", r.texto, re.S)):
                return final.group(1).strip()

            accion = re.search(r"Acción:\s*(\w+)\[(.*?)\]", r.texto)
            if not accion:
                # El modelo se salió del formato: se lo decimos y seguimos.
                historial.append(Mensaje("user", "Formato inválido. Usá 'Acción: x[y]'."))
                continue

            nombre, argumento = accion.group(1), accion.group(2)
            herramienta = self.herramientas.get(nombre)
            observacion = (herramienta(argumento) if herramienta
                           else f"no existe la herramienta {nombre!r}")
            print(f"      observación → {observacion}")
            historial.append(Mensaje("user", f"Observación: {observacion}"))

        # Tope alcanzado: terminar con gracia es parte del patrón.
        return "No pude resolverlo dentro del límite de pasos."


def buscar(consulta: str) -> str:
    base = {"población de uruguay": "3.4 millones (2023)",
            "población de paraguay": "6.1 millones (2023)"}
    return base.get(consulta.lower().strip(), "sin resultados")


def calcular(expresion: str) -> str:
    if not re.fullmatch(r"[\d\s.+\-*/()]+", expresion):
        return "expresión no permitida"
    return str(round(eval(expresion, {"__builtins__": {}}), 3))  # noqa: S307


if __name__ == "__main__":
    # Guionamos las respuestas del modelo falso para que el bucle sea observable.
    guion = {
        "población combinada": "Pensamiento: necesito los dos datos.\n"
                               "Acción: buscar[población de Uruguay]",
        "3.4 millones": "Pensamiento: falta Paraguay.\n"
                        "Acción: buscar[población de Paraguay]",
        "6.1 millones": "Pensamiento: ahora sumo.\nAcción: calcular[3.4 + 6.1]",
        "9.5": "Respuesta: La población combinada es de unos 9.5 millones.",
    }
    agente = Agente(
        llm=LLMFalso("estandar", respuestas=guion),
        herramientas={"buscar": buscar, "calcular": calcular},
    )
    print("tarea: población combinada de Uruguay y Paraguay\n")
    print("\nresultado:", agente.ejecutar("¿Cuál es la población combinada de Uruguay y Paraguay?"))
    print("uso:", agente.contador.resumen())
