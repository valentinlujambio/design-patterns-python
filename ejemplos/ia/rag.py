"""
Patrón: RAG (Generación Aumentada por Recuperación)

Problema: el modelo no conoce tus documentos, y si le pegás todo el corpus en el
prompt no entra (y sale carísimo). Sin fuentes, además, inventa.

Solución: recuperar los fragmentos relevantes en tiempo de consulta e inyectarlos
como contexto, exigiendo que la respuesta cite de dónde salió cada afirmación.
Estructuralmente es Strategy: el recuperador es intercambiable (léxico, denso,
híbrido, con reordenamiento) sin tocar el generador.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

from _llm_falso import LLMFalso, Mensaje, embeber, similitud


@dataclass(frozen=True, slots=True)
class Fragmento:
    id: str
    fuente: str
    texto: str


class Recuperador(Protocol):
    nombre: str

    def recuperar(self, consulta: str, k: int) -> list[tuple[Fragmento, float]]: ...


class RecuperadorDenso:
    """Similitud coseno sobre embeddings. Entiende sinónimos, no siglas raras."""

    nombre = "denso"

    def __init__(self, corpus: list[Fragmento]) -> None:
        self._indice = [(f, embeber(f.texto)) for f in corpus]

    def recuperar(self, consulta: str, k: int) -> list[tuple[Fragmento, float]]:
        v = embeber(consulta)
        puntuados = [(f, similitud(v, e)) for f, e in self._indice]
        return sorted(puntuados, key=lambda p: -p[1])[:k]


class RecuperadorLexico:
    """Coincidencia de palabras. Bueno para códigos, nombres propios y siglas."""

    nombre = "léxico"

    def __init__(self, corpus: list[Fragmento]) -> None:
        self._corpus = corpus

    def recuperar(self, consulta: str, k: int) -> list[tuple[Fragmento, float]]:
        terminos = set(consulta.lower().split())
        puntuados = [
            (f, len(terminos & set(f.texto.lower().split())) / (len(terminos) or 1))
            for f in self._corpus
        ]
        return sorted(puntuados, key=lambda p: -p[1])[:k]


class RecuperadorHibrido:
    """Fusiona rankings (RRF). Casi siempre gana a cualquiera de los dos solos."""

    nombre = "híbrido"

    def __init__(self, *recuperadores: Recuperador, k_rrf: int = 60) -> None:
        self._recuperadores = recuperadores
        self._k_rrf = k_rrf

    def recuperar(self, consulta: str, k: int) -> list[tuple[Fragmento, float]]:
        puntajes: dict[str, float] = {}
        por_id: dict[str, Fragmento] = {}
        for recuperador in self._recuperadores:
            for posicion, (frag, _) in enumerate(recuperador.recuperar(consulta, k * 2), 1):
                puntajes[frag.id] = puntajes.get(frag.id, 0.0) + 1 / (self._k_rrf + posicion)
                por_id[frag.id] = frag
        mejores = sorted(puntajes.items(), key=lambda p: -p[1])[:k]
        return [(por_id[i], p) for i, p in mejores]


@dataclass
class TuberiaRAG:
    recuperador: Recuperador
    llm: LLMFalso
    k: int = 3
    umbral: float = 0.01

    def responder(self, pregunta: str) -> str:
        recuperados = [(f, p) for f, p in self.recuperador.recuperar(pregunta, self.k)
                       if p >= self.umbral]
        if not recuperados:
            # Abstenerse es una respuesta válida: evita la alucinación educada.
            return "No encontré información suficiente en la base de conocimiento."

        contexto = "\n\n".join(f"[{f.id}] ({f.fuente}) {f.texto}" for f, _ in recuperados)
        mensajes = [
            Mensaje("system", "Respondé SOLO con el contexto. Citá las fuentes como [id]. "
                              "Si el contexto no alcanza, decí que no sabés."),
            Mensaje("user", f"<contexto>\n{contexto}\n</contexto>\n\nPregunta: {pregunta}"),
        ]
        r = self.llm.completar(mensajes)
        citas = ", ".join(f.id for f, _ in recuperados)
        return f"{r.texto}\n  fuentes recuperadas: {citas}"


CORPUS = [
    Fragmento("d1", "manual-vacaciones.md",
              "Las vacaciones se piden con 15 días de anticipación por el portal."),
    Fragmento("d2", "manual-vacaciones.md",
              "El saldo de días libres se acumula hasta un máximo de 30 jornadas."),
    Fragmento("d3", "politica-remoto.md",
              "El trabajo remoto se aprueba por equipo y requiere conexión estable."),
    Fragmento("d4", "seguridad.md",
              "Las claves se rotan cada 90 días y se guardan en el gestor corporativo."),
]

if __name__ == "__main__":
    llm = LLMFalso("estandar")
    denso, lexico = RecuperadorDenso(CORPUS), RecuperadorLexico(CORPUS)

    for recuperador in (denso, lexico, RecuperadorHibrido(denso, lexico)):
        tuberia = TuberiaRAG(recuperador, llm)
        print(f"— recuperador {recuperador.nombre} —")
        print(tuberia.responder("¿Con cuánta anticipación pido vacaciones?"), "\n")

    print("— pregunta fuera del corpus —")
    print(TuberiaRAG(denso, llm).responder("¿Cuál es el precio de las acciones de Tesla?"))
