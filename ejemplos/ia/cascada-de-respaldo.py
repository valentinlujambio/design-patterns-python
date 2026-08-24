"""
Patrón: Cascada de Respaldo (Fallback Cascade / Model Cascade)

Problema: los proveedores fallan (429, 503, timeouts) y los modelos caros no se
justifican para todas las consultas. Un `try/except` suelto alrededor de la
llamada no es una estrategia de resiliencia.

Solución: una lista ordenada de intentos — modelo barato, modelo capaz, modelo de
otro proveedor, respuesta degradada — con reintentos y espera exponencial dentro
de cada nivel, y un cortacircuitos que deja de golpear al que está caído.
Combina Chain of Responsibility (el siguiente que pueda, que responda), Strategy
y Proxy (el cortacircuitos envuelve al proveedor).
"""
from __future__ import annotations

import random
import time
from dataclasses import dataclass, field

from _llm_falso import ErrorTransitorio, LLMFalso, Respuesta


@dataclass
class Cortacircuitos:
    """Después de N fallos consecutivos, deja de intentar por un rato."""

    umbral: int = 2
    enfriamiento_s: float = 30.0
    fallos: int = 0
    abierto_hasta: float = 0.0

    @property
    def abierto(self) -> bool:
        return time.time() < self.abierto_hasta

    def exito(self) -> None:
        self.fallos = 0

    def fallo(self) -> None:
        self.fallos += 1
        if self.fallos >= self.umbral:
            self.abierto_hasta = time.time() + self.enfriamiento_s


@dataclass
class Nivel:
    nombre: str
    modelo: LLMFalso
    reintentos: int = 2
    breaker: Cortacircuitos = field(default_factory=Cortacircuitos)

    def intentar(self, prompt: str) -> Respuesta | None:
        if self.breaker.abierto:
            print(f"  · {self.nombre}: cortacircuitos abierto, se saltea")
            return None
        for intento in range(1, self.reintentos + 1):
            try:
                respuesta = self.modelo.completar(prompt)
                self.breaker.exito()
                return respuesta
            except ErrorTransitorio as exc:
                espera = 0.02 * 2 ** (intento - 1) * (1 + random.random() * 0.1)
                print(f"  · {self.nombre}: {exc} (intento {intento}), "
                      f"espero {espera * 1000:.0f} ms")
                time.sleep(espera)
        self.breaker.fallo()
        return None


class Cascada:
    def __init__(self, *niveles: Nivel, degradado: str) -> None:
        self._niveles = niveles
        self._degradado = degradado

    def completar(self, prompt: str) -> tuple[str, str]:
        for nivel in self._niveles:
            respuesta = nivel.intentar(prompt)
            if respuesta is not None:
                return nivel.nombre, respuesta.texto
        # Nunca dejes al usuario sin respuesta: degradá con honestidad.
        return "degradado", self._degradado


if __name__ == "__main__":
    random.seed(7)
    cascada = Cascada(
        Nivel("primario-barato", LLMFalso("mini", prob_error=1.0)),      # siempre cae
        Nivel("secundario-capaz", LLMFalso("estandar", prob_error=0.5)),
        Nivel("terciario-otro-proveedor", LLMFalso("grande", prob_error=0.0)),
        degradado="Estamos con problemas técnicos; te respondemos por email.",
    )

    for i in range(1, 4):
        print(f"— consulta {i} —")
        nivel, texto = cascada.completar("¿Cómo configuro las notificaciones?")
        print(f"  → resuelta por: {nivel}\n    {texto[:70]}…\n")
