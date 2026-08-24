"""
Patrón: Evaluador–Optimizador (Reflection / LLM-as-judge)

Problema: la primera respuesta de un modelo suele ser aceptable pero no buena, y
no tenés forma automática de saber cuál de dos versiones es mejor.

Solución: separar en dos roles — un generador que produce y un evaluador que
puntúa contra criterios explícitos — e iterar mientras el puntaje no alcance el
umbral, con un tope duro de vueltas. Es Strategy (generar) + Visitor/Observer
(evaluar) dentro de un bucle de control tuyo. Regla práctica: el evaluador debe
tener criterios verificables, si no la mejora es imaginaria.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field

from _llm_falso import Contador, LLMFalso

CRITERIOS = [
    "menciona un plazo concreto",
    "ofrece un canal de contacto",
    "no promete reembolsos",
]


@dataclass(frozen=True, slots=True)
class Evaluacion:
    puntaje: float
    fallas: tuple[str, ...]

    @property
    def aprueba(self) -> bool:
        return self.puntaje >= 1.0


class EvaluadorDeterminista:
    """Reglas verificables: baratas, reproducibles y sin alucinaciones."""

    def evaluar(self, texto: str) -> Evaluacion:
        fallas = []
        if not re.search(r"\b(\d+\s*(horas?|días?|hs))\b", texto, re.I):
            fallas.append(CRITERIOS[0])
        if not re.search(r"(@|soporte|teléfono|chat)", texto, re.I):
            fallas.append(CRITERIOS[1])
        if re.search(r"reembols", texto, re.I):
            fallas.append(CRITERIOS[2])
        return Evaluacion(1 - len(fallas) / len(CRITERIOS), tuple(fallas))


@dataclass
class BucleDeMejora:
    generador: LLMFalso
    evaluador: EvaluadorDeterminista
    max_vueltas: int = 3
    contador: Contador = field(default_factory=Contador)

    def ejecutar(self, tarea: str) -> tuple[str, Evaluacion]:
        prompt, mejor, mejor_eval = tarea, "", Evaluacion(-1.0, ())
        for vuelta in range(1, self.max_vueltas + 1):
            texto = self.contador.registrar(
                self.generador.completar(prompt), f"gen-{vuelta}").texto
            evaluacion = self.evaluador.evaluar(texto)
            print(f"  vuelta {vuelta}: puntaje {evaluacion.puntaje:.2f} "
                  f"fallas={list(evaluacion.fallas) or '—'}")
            if evaluacion.puntaje > mejor_eval.puntaje:
                mejor, mejor_eval = texto, evaluacion
            if evaluacion.aprueba:
                break
            # La crítica concreta vuelve como instrucción de reescritura.
            prompt = (f"{tarea}\n\nTu borrador anterior fue:\n{texto}\n\n"
                      f"Corregí estos problemas: {'; '.join(evaluacion.fallas)}.")
        return mejor, mejor_eval


if __name__ == "__main__":
    generador = LLMFalso("estandar", respuestas={
        "Corregí estos problemas: menciona un plazo concreto; ofrece un canal":
            "Ya estamos revisando tu caso y te respondemos en 48 horas. "
            "Escribinos a soporte@empresa.com si necesitás algo antes.",
        "Corregí estos problemas":
            "Lamentamos la demora, seguimos trabajando en tu caso.",
        "Redactá una respuesta":
            "Lamentamos lo ocurrido, vamos a analizar tu reclamo y te "
            "ofreceremos un reembolso.",
    })
    texto, evaluacion = BucleDeMejora(generador, EvaluadorDeterminista()).ejecutar(
        "Redactá una respuesta a un cliente que reclama por una demora.")
    print(f"\nmejor versión (puntaje {evaluacion.puntaje:.2f}):\n  {texto}")
