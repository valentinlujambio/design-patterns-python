"""
Patrón: Orquestador y Trabajadores (Orchestrator–Workers)

Problema: hay tareas que no se resuelven en una pasada ni con una tubería fija:
"analizá estos 4 informes y escribí una conclusión" necesita descomponerse en
subtareas que dependen de la entrada.

Solución: un orquestador descompone la tarea, la reparte entre trabajadores
especializados (cada uno con su prompt, su modelo y sus herramientas) y después
sintetiza. Es Mediator (los trabajadores no se conocen entre sí) + Composite (una
subtarea puede volver a descomponerse) + Map/Reduce.
"""
from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, field

from _llm_falso import Contador, LLMFalso


@dataclass(frozen=True, slots=True)
class Subtarea:
    id: str
    especialidad: str
    instruccion: str


@dataclass
class Trabajador:
    especialidad: str
    modelo: LLMFalso
    sistema: str

    def trabajar(self, subtarea: Subtarea) -> str:
        return self.modelo.completar(f"{self.sistema}\n\nTarea: {subtarea.instruccion}").texto


@dataclass
class Orquestador:
    trabajadores: dict[str, Trabajador]
    sintetizador: LLMFalso
    contador: Contador = field(default_factory=Contador)

    def descomponer(self, objetivo: str) -> list[Subtarea]:
        """En producción esto lo decide un LLM; acá va fijo para que sea legible."""
        return [
            Subtarea("t1", "datos", f"Extraé las métricas clave de: {objetivo}"),
            Subtarea("t2", "riesgos", f"Listá los riesgos de: {objetivo}"),
            Subtarea("t3", "legal", f"Señalá restricciones normativas de: {objetivo}"),
        ]

    def ejecutar(self, objetivo: str, paralelo: bool = True) -> str:
        subtareas = self.descomponer(objetivo)
        faltantes = [s.especialidad for s in subtareas if s.especialidad not in self.trabajadores]
        if faltantes:
            raise ValueError(f"sin trabajador para: {faltantes}")

        def correr(s: Subtarea) -> tuple[str, str]:
            return s.id, self.trabajadores[s.especialidad].trabajar(s)

        if paralelo:
            with ThreadPoolExecutor(max_workers=len(subtareas)) as pool:
                resultados = dict(pool.map(correr, subtareas))
        else:
            resultados = dict(correr(s) for s in subtareas)

        partes = "\n".join(f"[{i}] {t}" for i, t in resultados.items())
        sintesis = self.sintetizador.completar(
            f"Sintetizá estos hallazgos en una recomendación:\n{partes}")
        self.contador.registrar(sintesis, "síntesis")
        return sintesis.texto


if __name__ == "__main__":
    import time

    orquestador = Orquestador(
        trabajadores={
            "datos": Trabajador("datos", LLMFalso("mini", latencia_ms=60),
                                "Sos analista de datos. Solo números y fuentes."),
            "riesgos": Trabajador("riesgos", LLMFalso("estandar", latencia_ms=60),
                                  "Sos analista de riesgo operativo."),
            "legal": Trabajador("legal", LLMFalso("estandar", latencia_ms=60),
                                "Sos abogado corporativo. Señalá restricciones."),
        },
        sintetizador=LLMFalso("grande", latencia_ms=60),
    )

    objetivo = "abrir una sucursal en Córdoba en el primer trimestre"
    for paralelo in (False, True):
        inicio = time.perf_counter()
        salida = orquestador.ejecutar(objetivo, paralelo=paralelo)
        ms = (time.perf_counter() - inicio) * 1000
        print(f"{'paralelo' if paralelo else 'secuencial':<11} {ms:6.0f} ms → {salida[:60]}…")
