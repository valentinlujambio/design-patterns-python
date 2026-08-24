"""
Patrón: Adaptador de Proveedor (Provider Adapter)

Problema: el SDK de cada proveedor tiene su propia forma de nombrar mensajes,
parámetros y errores. Si esa forma se filtra a tu dominio, cambiar de modelo
—o probar dos en paralelo— implica tocar medio código.

Solución: definir *tu* interfaz mínima (la que tu app necesita, no la unión de
todas) y escribir un adaptador finito por proveedor. Es Adapter, y cuando la
abstracción y la implementación evolucionan por separado, Bridge.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

from _llm_falso import LLMFalso, Mensaje


@dataclass(frozen=True, slots=True)
class Completado:
    """El tipo que circula por TU dominio. No es el de ningún SDK."""

    texto: str
    modelo: str
    tokens: int


class ProveedorLLM(Protocol):
    """La interfaz mínima que tu app realmente necesita."""

    nombre: str

    def completar(self, sistema: str, usuario: str, *, max_tokens: int = 512) -> Completado: ...


# ── SDK ajeno #1: estilo "mensajes con rol" ────────────────────────────────
class SDKEstiloMensajes:
    def __init__(self, modelo: str) -> None:
        self._llm = LLMFalso(modelo)

    def messages_create(self, *, system: str, messages: list[dict], max_tokens: int):
        r = self._llm.completar(
            [Mensaje("system", system)] + [Mensaje(m["role"], m["content"]) for m in messages],
            max_tokens=max_tokens,
        )
        return {"content": [{"text": r.texto}],
                "usage": {"input_tokens": r.tokens_entrada,
                          "output_tokens": r.tokens_salida},
                "model": r.modelo}


# ── SDK ajeno #2: estilo "prompt plano" ────────────────────────────────────
class SDKEstiloPromptPlano:
    def __init__(self, modelo: str) -> None:
        self._llm = LLMFalso(modelo)

    def generate(self, prompt: str, n_predict: int = 512):
        r = self._llm.completar(prompt, max_tokens=n_predict)
        return {"generation": r.texto, "token_count": r.tokens_entrada + r.tokens_salida}


# ── Los adaptadores: todo el conocimiento del SDK vive acá adentro ─────────
class AdaptadorMensajes:
    nombre = "proveedor-mensajes"

    def __init__(self, sdk: SDKEstiloMensajes) -> None:
        self._sdk = sdk

    def completar(self, sistema: str, usuario: str, *, max_tokens: int = 512) -> Completado:
        cruda = self._sdk.messages_create(
            system=sistema,
            messages=[{"role": "user", "content": usuario}],
            max_tokens=max_tokens,
        )
        uso = cruda["usage"]
        return Completado(
            texto=cruda["content"][0]["text"],
            modelo=cruda["model"],
            tokens=uso["input_tokens"] + uso["output_tokens"],
        )


class AdaptadorPromptPlano:
    nombre = "proveedor-plano"

    def __init__(self, sdk: SDKEstiloPromptPlano, modelo: str) -> None:
        self._sdk = sdk
        self._modelo = modelo

    def completar(self, sistema: str, usuario: str, *, max_tokens: int = 512) -> Completado:
        cruda = self._sdk.generate(f"### Instrucciones\n{sistema}\n\n### Consulta\n{usuario}",
                                   n_predict=max_tokens)
        return Completado(cruda["generation"], self._modelo, cruda["token_count"])


def responder_pregunta(proveedor: ProveedorLLM, pregunta: str) -> str:
    """Código de dominio: intercambiable sin tocar una línea."""
    salida = proveedor.completar("Sos un tutor de programación conciso.", pregunta)
    return f"[{proveedor.nombre}/{salida.modelo}] {salida.texto[:70]}… ({salida.tokens} tok)"


if __name__ == "__main__":
    proveedores: list[ProveedorLLM] = [
        AdaptadorMensajes(SDKEstiloMensajes("estandar")),
        AdaptadorPromptPlano(SDKEstiloPromptPlano("mini"), "mini"),
    ]
    for p in proveedores:
        print(responder_pregunta(p, "¿Cuándo conviene usar el patrón Strategy?"))
