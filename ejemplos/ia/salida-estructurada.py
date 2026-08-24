"""
Patrón: Salida Estructurada (Structured Output)

Problema: querés un objeto de tu dominio, pero el modelo devuelve texto libre —
a veces con un ```json de más, una coma final o un campo faltante. Parsear con
regex y esperanza rompe en producción.

Solución: declarar el esquema, pedirlo explícitamente, parsear con tolerancia y
—si falla— reintentar mostrándole al modelo el error de validación. Es Builder
(construir el objeto por partes validadas) + Adapter (texto → objeto) con un
bucle de reparación acotado.
"""
from __future__ import annotations

import json
import re
from dataclasses import dataclass
from typing import Any, Callable

from _llm_falso import LLMFalso


class ErrorDeValidacion(ValueError):
    pass


@dataclass(frozen=True, slots=True)
class Ticket:
    """El objeto de dominio que queremos, tipado y validado."""

    categoria: str
    prioridad: int
    resumen: str
    requiere_humano: bool

    CATEGORIAS = ("facturación", "técnico", "cuenta", "otro")

    @classmethod
    def desde_dict(cls, datos: dict[str, Any]) -> "Ticket":
        faltantes = {"categoria", "prioridad", "resumen"} - datos.keys()
        if faltantes:
            raise ErrorDeValidacion(f"faltan los campos {sorted(faltantes)}")
        if datos["categoria"] not in cls.CATEGORIAS:
            raise ErrorDeValidacion(
                f"categoria debe ser una de {list(cls.CATEGORIAS)}, "
                f"recibí {datos['categoria']!r}")
        try:
            prioridad = int(datos["prioridad"])
        except (TypeError, ValueError):
            raise ErrorDeValidacion("prioridad debe ser un entero de 1 a 5") from None
        if not 1 <= prioridad <= 5:
            raise ErrorDeValidacion("prioridad debe estar entre 1 y 5")
        return cls(datos["categoria"], prioridad, str(datos["resumen"]),
                   bool(datos.get("requiere_humano", False)))


ESQUEMA = json.dumps({
    "categoria": "facturación|técnico|cuenta|otro",
    "prioridad": "entero 1-5",
    "resumen": "string breve",
    "requiere_humano": "bool",
}, ensure_ascii=False, indent=2)


def extraer_json(texto: str) -> dict[str, Any]:
    """Parseo tolerante: quita cercos, texto alrededor y comas finales."""
    texto = re.sub(r"^```(?:json)?|```$", "", texto.strip(), flags=re.M).strip()
    if (inicio := texto.find("{")) != -1 and (fin := texto.rfind("}")) != -1:
        texto = texto[inicio: fin + 1]
    texto = re.sub(r",\s*([}\]])", r"\1", texto)
    try:
        return json.loads(texto)
    except json.JSONDecodeError as exc:
        raise ErrorDeValidacion(f"JSON inválido: {exc.msg}") from None


def pedir_estructurado(llm: LLMFalso, mensaje: str, *,
                       construir: Callable[[dict], Any] = Ticket.desde_dict,
                       intentos: int = 3) -> Any:
    prompt = (f"Clasificá el ticket y respondé SOLO con JSON con este esquema:\n"
              f"{ESQUEMA}\n\nTicket: {mensaje}")
    ultimo_error = ""
    for intento in range(1, intentos + 1):
        respuesta = llm.completar(prompt + ultimo_error)
        try:
            objeto = construir(extraer_json(respuesta.texto))
            print(f"  intento {intento}: ✓")
            return objeto
        except ErrorDeValidacion as exc:
            print(f"  intento {intento}: ✗ {exc}")
            # La clave del patrón: el error de validación vuelve al modelo.
            ultimo_error = (f"\n\nTu respuesta anterior fue inválida ({exc}). "
                            f"Corregila y devolvé solo el JSON.")
    raise ErrorDeValidacion(f"no se obtuvo una salida válida en {intentos} intentos")


if __name__ == "__main__":
    # Las claves se evalúan en orden: la de corrección va primero para que el
    # segundo intento no vuelva a caer en la respuesta rota del primero.
    llm = LLMFalso("estandar", respuestas={
        "Tu respuesta anterior fue inválida": '{"categoria": "facturación", "prioridad": 3, '
                                              '"resumen": "No recibió la factura de marzo", '
                                              '"requiere_humano": false}',
        # 1er intento: JSON con cerco, coma final y categoría inventada.
        "Ticket: No me llegó la factura": '```json\n{"categoria": "billing", '
                                          '"prioridad": 3, "resumen": "falta factura",}\n```',
    })
    ticket = pedir_estructurado(llm, "No me llegó la factura de marzo")
    print("\nobjeto de dominio:", ticket)
    print("tipo de prioridad:", type(ticket.prioridad).__name__)
