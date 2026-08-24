"""
Patrón: Memoria de Conversación

Problema: la ventana de contexto es finita y cara. Si mandás toda la charla en
cada turno, el costo crece de forma cuadrática y en algún momento se corta.

Solución: separar la conversación real de *lo que se envía al modelo*. Una
política de memoria decide qué entra: ventana deslizante, resumen progresivo,
recuperación por relevancia o hechos fijados. Es Strategy sobre el historial,
con un toque de Memento (el resumen es una foto comprimida del pasado).
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Protocol

from _llm_falso import LLMFalso, Mensaje, contar_tokens, embeber, similitud


class Memoria(Protocol):
    nombre: str

    def agregar(self, mensaje: Mensaje) -> None: ...
    def contexto(self, consulta: str) -> list[Mensaje]: ...


@dataclass
class MemoriaCompleta:
    """La línea de base: simple, correcta y cada vez más cara."""

    nombre: str = "completa"
    historial: list[Mensaje] = field(default_factory=list)

    def agregar(self, mensaje: Mensaje) -> None:
        self.historial.append(mensaje)

    def contexto(self, consulta: str) -> list[Mensaje]:
        return list(self.historial)


@dataclass
class MemoriaVentana:
    """Solo los últimos N turnos. Olvida rápido, cuesta poco."""

    n: int = 4
    nombre: str = "ventana"
    historial: list[Mensaje] = field(default_factory=list)

    def agregar(self, mensaje: Mensaje) -> None:
        self.historial.append(mensaje)

    def contexto(self, consulta: str) -> list[Mensaje]:
        return self.historial[-self.n:]


@dataclass
class MemoriaResumida:
    """Ventana reciente + resumen del pasado, regenerado al pasar el umbral."""

    llm: LLMFalso
    n_recientes: int = 2
    umbral_tokens: int = 60
    nombre: str = "resumida"
    historial: list[Mensaje] = field(default_factory=list)
    resumen: str = ""

    def agregar(self, mensaje: Mensaje) -> None:
        self.historial.append(mensaje)
        viejos = self.historial[: -self.n_recientes]
        if sum(contar_tokens(m.contenido) for m in viejos) > self.umbral_tokens:
            texto = "\n".join(f"{m.rol}: {m.contenido}" for m in viejos)
            self.resumen = self.llm.completar(
                f"Resumí en 2 frases lo importante de esta charla:\n{texto}"
            ).texto
            self.historial = self.historial[-self.n_recientes:]

    def contexto(self, consulta: str) -> list[Mensaje]:
        base = [Mensaje("system", f"Resumen previo: {self.resumen}")] if self.resumen else []
        return base + self.historial


@dataclass
class MemoriaPorRelevancia:
    """Trae del pasado solo lo que se parece a la consulta actual."""

    k: int = 2
    nombre: str = "relevancia"
    historial: list[Mensaje] = field(default_factory=list)

    def agregar(self, mensaje: Mensaje) -> None:
        self.historial.append(mensaje)

    def contexto(self, consulta: str) -> list[Mensaje]:
        v = embeber(consulta)
        viejos, recientes = self.historial[:-2], self.historial[-2:]
        mejores = sorted(viejos, key=lambda m: -similitud(v, embeber(m.contenido)))[: self.k]
        # Se reordenan cronológicamente para no confundir al modelo.
        mejores.sort(key=self.historial.index)
        return mejores + recientes


CHARLA = [
    Mensaje("user", "Hola, soy Valentín y estoy aprendiendo patrones de diseño en Python."),
    Mensaje("assistant", "¡Buenísimo! ¿Querés empezar por los creacionales?"),
    Mensaje("user", "Sí. Mi objetivo es aplicarlos en un proyecto de visión por computadora."),
    Mensaje("assistant", "Entonces Strategy y Pipeline te van a servir mucho."),
    Mensaje("user", "Ah, y trabajo con cámaras RTSP en tiempo real."),
    Mensaje("assistant", "Ahí conviene un Adapter para la fuente de frames."),
    Mensaje("user", "¿Cómo me llamo y qué patrón me recomendaste para las cámaras?"),
]

if __name__ == "__main__":
    llm = LLMFalso("mini", respuestas={
        "Resumí en 2 frases": (
            "El usuario se llama Valentín, aprende patrones de diseño en Python "
            "y trabaja en visión por computadora con cámaras RTSP."
        )
    })
    memorias: list[Memoria] = [
        MemoriaCompleta(), MemoriaVentana(n=3),
        MemoriaResumida(llm=llm), MemoriaPorRelevancia(k=2),
    ]
    for memoria in memorias:
        for mensaje in CHARLA[:-1]:
            memoria.agregar(mensaje)
        contexto = memoria.contexto(CHARLA[-1].contenido)
        tokens = sum(contar_tokens(m.contenido) for m in contexto)
        recuerda = any("Valentín" in m.contenido for m in contexto)
        print(f"{memoria.nombre:<12} {len(contexto)} mensajes · {tokens:>3} tokens "
              f"· ¿recuerda el nombre? {'sí' if recuerda else 'no'}")
