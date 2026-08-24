"""
LLM simulado, determinista y sin dependencias.

Todos los ejemplos de patrones de IA de esta carpeta lo usan para que puedas
ejecutarlos sin API key, sin red y con salidas reproducibles. La *forma* de la
interfaz imita la de los SDK reales (mensajes con rol, uso de tokens, latencia,
errores transitorios), así que el patrón que aprendas acá se traslada tal cual a
Anthropic, OpenAI, Ollama o el proveedor que uses.
"""
from __future__ import annotations

import hashlib
import math
import random
import re
import time
from dataclasses import dataclass, field


@dataclass(frozen=True, slots=True)
class Mensaje:
    rol: str  # "system" | "user" | "assistant" | "tool"
    contenido: str


@dataclass(frozen=True, slots=True)
class Respuesta:
    texto: str
    modelo: str
    tokens_entrada: int
    tokens_salida: int
    latencia_ms: float

    @property
    def costo_usd(self) -> float:
        precio = PRECIOS.get(self.modelo, (1.0, 3.0))
        return (self.tokens_entrada * precio[0] + self.tokens_salida * precio[1]) / 1e6


# USD por millón de tokens (entrada, salida). Valores de juguete.
PRECIOS: dict[str, tuple[float, float]] = {
    "mini": (0.15, 0.60),
    "estandar": (3.00, 15.00),
    "grande": (15.00, 75.00),
}


class ErrorTransitorio(RuntimeError):
    """Simula un 429/503: el patrón de reintento existe por esto."""


def contar_tokens(texto: str) -> int:
    """Aproximación honesta: ~1 token cada 4 caracteres."""
    return max(1, math.ceil(len(texto) / 4))


class LLMFalso:
    """Un 'modelo' determinista: la misma entrada da siempre la misma salida."""

    def __init__(
        self,
        modelo: str = "mini",
        latencia_ms: float = 12.0,
        prob_error: float = 0.0,
        respuestas: dict[str, str] | None = None,
    ) -> None:
        self.modelo = modelo
        self.latencia_ms = latencia_ms
        self.prob_error = prob_error
        self.respuestas = respuestas or {}
        self.llamadas = 0

    def completar(
        self,
        mensajes: list[Mensaje] | str,
        *,
        temperatura: float = 0.0,
        max_tokens: int = 256,
    ) -> Respuesta:
        if isinstance(mensajes, str):
            mensajes = [Mensaje("user", mensajes)]
        self.llamadas += 1

        prompt = "\n".join(f"{m.rol}: {m.contenido}" for m in mensajes)
        semilla = int(hashlib.sha256(prompt.encode()).hexdigest()[:8], 16)
        rng = random.Random(semilla + self.llamadas if self.prob_error else semilla)

        if self.prob_error and rng.random() < self.prob_error:
            raise ErrorTransitorio(f"429 el modelo {self.modelo} está saturado")

        time.sleep(self.latencia_ms / 1000)
        texto = self._generar(prompt, mensajes[-1].contenido, rng)
        return Respuesta(
            texto=texto,
            modelo=self.modelo,
            tokens_entrada=contar_tokens(prompt),
            tokens_salida=contar_tokens(texto),
            latencia_ms=self.latencia_ms,
        )

    # ── generación de juguete ───────────────────────────────────────────────
    def _generar(self, prompt: str, ultimo: str, rng: random.Random) -> str:
        # Primero se busca una respuesta guionada para el último mensaje, y
        # recién después en todo el prompt: así los bucles de agente avanzan.
        for fuente in (ultimo, prompt):
            for clave, valor in self.respuestas.items():
                if clave.lower() in fuente.lower():
                    return valor
        tema = " ".join(re.findall(r"[a-záéíóúñ]{4,}", ultimo.lower())[:3]) or "el tema"
        plantillas = [
            f"[{self.modelo}] Respuesta sobre {tema}: es un caso donde conviene "
            f"empezar por lo más simple y medir antes de optimizar.",
            f"[{self.modelo}] En resumen sobre {tema}: hay tres factores clave y el "
            f"contexto decide cuál pesa más.",
        ]
        return plantillas[rng.randrange(len(plantillas))]


# ── Embeddings de juguete (bolsa de palabras normalizada) ───────────────────
def embeber(texto: str) -> dict[str, float]:
    """Vector disperso: suficiente para ver funcionar la similitud coseno."""
    palabras = re.findall(r"[a-záéíóúñ0-9]{3,}", texto.lower())
    vector: dict[str, float] = {}
    for palabra in palabras:
        vector[palabra] = vector.get(palabra, 0.0) + 1.0
    norma = math.sqrt(sum(v * v for v in vector.values())) or 1.0
    return {k: v / norma for k, v in vector.items()}


def similitud(a: dict[str, float], b: dict[str, float]) -> float:
    """Coseno entre dos vectores dispersos."""
    if len(a) > len(b):
        a, b = b, a
    return sum(peso * b.get(clave, 0.0) for clave, peso in a.items())


@dataclass
class Contador:
    """Acumula uso para poder mostrar costo y latencia en los ejemplos."""

    llamadas: int = 0
    tokens_entrada: int = 0
    tokens_salida: int = 0
    costo_usd: float = 0.0
    detalle: list[str] = field(default_factory=list)

    def registrar(self, r: Respuesta, etiqueta: str = "") -> Respuesta:
        self.llamadas += 1
        self.tokens_entrada += r.tokens_entrada
        self.tokens_salida += r.tokens_salida
        self.costo_usd += r.costo_usd
        self.detalle.append(f"{etiqueta or 'llamada'}: {r.modelo} "
                            f"({r.tokens_entrada}+{r.tokens_salida} tok)")
        return r

    def resumen(self) -> str:
        return (f"{self.llamadas} llamadas · "
                f"{self.tokens_entrada + self.tokens_salida} tokens · "
                f"US$ {self.costo_usd:.6f}")
