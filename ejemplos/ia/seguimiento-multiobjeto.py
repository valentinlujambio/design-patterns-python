"""
Patrón: Seguimiento Multiobjeto (Detector + Tracker)

Problema: un detector cuadro a cuadro no tiene memoria: no sabe que la persona
del frame 5 es la misma del frame 4. Sin identidad no se puede contar, ni medir
permanencia, ni disparar alertas ("entró y no salió").

Solución: separar tres roles — el detector (qué hay), el asociador (qué es lo
mismo que antes) y las pistas (el estado con identidad y ciclo de vida) — y que
un coordinador los conecte y publique eventos. Es Mediator entre detector y
pistas, State en el ciclo de vida de cada pista y Observer para los eventos.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable, Iterable, Sequence


@dataclass(frozen=True, slots=True)
class Deteccion:
    x: float
    y: float
    clase: str
    confianza: float


@dataclass
class Pista:
    """Estado con identidad. `visible`/`tentativa`/`perdida` es un State simple."""

    id: int
    clase: str
    x: float
    y: float
    frames_vista: int = 1
    frames_sin_ver: int = 0
    estado: str = "tentativa"

    def actualizar(self, d: Deteccion, suavizado: float = 0.6) -> None:
        self.x = suavizado * self.x + (1 - suavizado) * d.x
        self.y = suavizado * self.y + (1 - suavizado) * d.y
        self.frames_vista += 1
        self.frames_sin_ver = 0
        if self.estado == "tentativa" and self.frames_vista >= 2:
            self.estado = "confirmada"

    def envejecer(self) -> None:
        self.frames_sin_ver += 1


def distancia(p: Pista, d: Deteccion) -> float:
    return ((p.x - d.x) ** 2 + (p.y - d.y) ** 2) ** 0.5


@dataclass
class Rastreador:
    """El mediador: nadie más conoce las reglas de asociación."""

    max_distancia: float = 40.0
    max_frames_sin_ver: int = 2
    pistas: list[Pista] = field(default_factory=list)
    observadores: list[Callable[[str, Pista], None]] = field(default_factory=list)
    _proximo_id: int = 1

    def suscribir(self, funcion: Callable[[str, Pista], None]) -> None:
        self.observadores.append(funcion)

    def _emitir(self, evento: str, pista: Pista) -> None:
        for observador in self.observadores:
            observador(evento, pista)

    def paso(self, detecciones: Sequence[Deteccion]) -> list[Pista]:
        libres = list(detecciones)

        # 1. Asociación voraz por cercanía (en producción: húngaro + IoU + Kalman).
        for pista in sorted(self.pistas, key=lambda p: p.frames_sin_ver):
            candidatas = [d for d in libres
                          if d.clase == pista.clase
                          and distancia(pista, d) <= self.max_distancia]
            if not candidatas:
                pista.envejecer()
                continue
            elegida = min(candidatas, key=lambda d: distancia(pista, d))
            libres.remove(elegida)
            estado_previo = pista.estado
            pista.actualizar(elegida)
            if estado_previo == "tentativa" and pista.estado == "confirmada":
                self._emitir("confirmada", pista)

        # 2. Detecciones sin dueño → pistas nuevas.
        for deteccion in libres:
            pista = Pista(self._proximo_id, deteccion.clase, deteccion.x, deteccion.y)
            self._proximo_id += 1
            self.pistas.append(pista)
            self._emitir("nueva", pista)

        # 3. Pistas viejas → se dan de baja.
        vivas = []
        for pista in self.pistas:
            if pista.frames_sin_ver > self.max_frames_sin_ver:
                self._emitir("perdida", pista)
            else:
                vivas.append(pista)
        self.pistas = vivas
        return [p for p in self.pistas if p.estado == "confirmada"]


SECUENCIA: list[list[Deteccion]] = [
    [Deteccion(10, 10, "persona", 0.9), Deteccion(200, 50, "auto", 0.8)],
    [Deteccion(18, 12, "persona", 0.9), Deteccion(205, 52, "auto", 0.8)],
    [Deteccion(26, 15, "persona", 0.9)],                       # el auto se ocluye
    [Deteccion(35, 18, "persona", 0.9), Deteccion(300, 300, "persona", 0.7)],
    [Deteccion(44, 20, "persona", 0.9)],                       # se va el segundo
    [Deteccion(52, 23, "persona", 0.9)],
]

if __name__ == "__main__":
    contador = {"personas": 0}

    def al_evento(evento: str, pista: Pista) -> None:
        if evento == "confirmada" and pista.clase == "persona":
            contador["personas"] += 1
        print(f"      · {evento}: #{pista.id} {pista.clase}")

    rastreador = Rastreador()
    rastreador.suscribir(al_evento)

    for i, detecciones in enumerate(SECUENCIA):
        activas = rastreador.paso(detecciones)
        print(f"  frame {i}: {len(detecciones)} detecciones → "
              f"{[f'#{p.id}' for p in activas]} confirmadas")

    print(f"\n  personas únicas contadas: {contador['personas']}")
