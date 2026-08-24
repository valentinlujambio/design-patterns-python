"""
Patrón: Caché Semántica

Problema: los usuarios preguntan lo mismo escrito de veinte maneras. Una caché
por clave exacta casi nunca acierta, y cada fallo cuesta dinero y latencia.

Solución: interponer un objeto con la misma interfaz que el modelo que busca por
*similitud* antes de llamar. Es Proxy de caché; la diferencia con el Proxy
clásico es que el acierto es aproximado, así que el umbral y la invalidación son
decisiones de producto, no de infraestructura.
"""
from __future__ import annotations

import time
from dataclasses import dataclass, field

from _llm_falso import LLMFalso, Respuesta, embeber, similitud


@dataclass
class Entrada:
    consulta: str
    respuesta: Respuesta
    vector: dict[str, float]
    guardada_en: float
    aciertos: int = 0


@dataclass
class CacheSemantica:
    """Mismo método `completar` que el modelo: es un sustituto transparente."""

    modelo: LLMFalso
    umbral: float = 0.82
    ttl_segundos: float = 300.0
    entradas: list[Entrada] = field(default_factory=list)
    estadisticas: dict[str, int] = field(default_factory=lambda: {"hits": 0, "misses": 0})

    def _buscar(self, consulta: str) -> Entrada | None:
        vector = embeber(consulta)
        ahora = time.time()
        self.entradas = [e for e in self.entradas if ahora - e.guardada_en < self.ttl_segundos]
        mejor, mejor_puntaje = None, 0.0
        for entrada in self.entradas:
            puntaje = similitud(vector, entrada.vector)
            if puntaje > mejor_puntaje:
                mejor, mejor_puntaje = entrada, puntaje
        return mejor if mejor and mejor_puntaje >= self.umbral else None

    def completar(self, consulta: str, **kwargs: object) -> tuple[Respuesta, str]:
        if (entrada := self._buscar(consulta)) is not None:
            entrada.aciertos += 1
            self.estadisticas["hits"] += 1
            return entrada.respuesta, f"HIT (≈ {entrada.consulta!r})"
        self.estadisticas["misses"] += 1
        respuesta = self.modelo.completar(consulta)
        self.entradas.append(Entrada(consulta, respuesta, embeber(consulta), time.time()))
        return respuesta, "MISS"


if __name__ == "__main__":
    cache = CacheSemantica(LLMFalso("estandar", latencia_ms=80))

    consultas = [
        "¿Cómo pido vacaciones?",
        "¿Cómo pido las vacaciones?",          # casi idéntica → HIT
        "cómo solicito vacaciones",            # parecida, otras palabras
        "¿Cuál es la política de trabajo remoto?",
        "¿Cómo pido vacaciones?",              # exacta → HIT
    ]
    for consulta in consultas:
        inicio = time.perf_counter()
        _, estado = cache.completar(consulta)
        ms = (time.perf_counter() - inicio) * 1000
        print(f"{consulta:<42} {estado:<28} {ms:6.1f} ms")

    total = sum(cache.estadisticas.values())
    print(f"\ntasa de acierto: {cache.estadisticas['hits'] / total:.0%} "
          f"· llamadas reales al modelo: {cache.modelo.llamadas}")
    print("ojo: un umbral bajo devuelve respuestas de otra pregunta; "
          "medí falsos positivos antes de bajarlo.")
