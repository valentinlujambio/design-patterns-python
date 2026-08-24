"""
Patrón: Enrutador de Modelos (Model Router)

Problema: mandar todas las consultas al modelo más caro quema presupuesto;
mandarlas todas al más barato quema calidad. Y las consultas no son iguales:
"hola" y "refactorizá este módulo de 800 líneas" no merecen lo mismo.

Solución: un clasificador barato decide, por consulta, qué modelo y qué prompt
usar. Es Strategy (familia de modelos intercambiables) elegido en tiempo de
ejecución por un pequeño despachador, con una regla clave: siempre debe existir
una ruta por defecto.
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Callable

from _llm_falso import Contador, LLMFalso


@dataclass(frozen=True, slots=True)
class Ruta:
    nombre: str
    modelo: LLMFalso
    condicion: Callable[[str], bool]
    sistema: str


class Enrutador:
    def __init__(self, rutas: list[Ruta], por_defecto: Ruta) -> None:
        self._rutas = rutas
        self._por_defecto = por_defecto
        self.contador = Contador()

    def elegir(self, consulta: str) -> Ruta:
        for ruta in self._rutas:
            if ruta.condicion(consulta):
                return ruta
        return self._por_defecto

    def responder(self, consulta: str) -> tuple[str, str]:
        ruta = self.elegir(consulta)
        r = self.contador.registrar(
            ruta.modelo.completar(f"{ruta.sistema}\n\nUsuario: {consulta}"), ruta.nombre
        )
        return ruta.nombre, r.texto


def es_saludo(t: str) -> bool:
    return bool(re.fullmatch(r"\s*(hola|buenas|gracias|chau)[!. ]*", t, re.I))


def es_codigo(t: str) -> bool:
    return any(p in t.lower() for p in ("def ", "class ", "traceback", "refactor", "```"))


def es_largo(t: str) -> bool:
    return len(t) > 200


if __name__ == "__main__":
    mini, estandar, grande = LLMFalso("mini"), LLMFalso("estandar"), LLMFalso("grande")

    enrutador = Enrutador(
        rutas=[
            Ruta("cortesía", mini, es_saludo, "Respondé en una línea, cordial."),
            Ruta("código", grande, es_codigo, "Sos un ingeniero senior de Python."),
            Ruta("análisis-largo", estandar, es_largo, "Analizá con cuidado y estructura."),
        ],
        por_defecto=Ruta("general", mini, lambda _: True, "Respondé breve y claro."),
    )

    consultas = [
        "hola!",
        "refactorizá esta class Pedido para que use dataclass",
        "¿Cuál es la diferencia entre Strategy y State?",
        "Tengo un sistema de recomendación que " + "necesita escalar a millones. " * 8,
    ]
    for consulta in consultas:
        ruta, _ = enrutador.responder(consulta)
        print(f"{consulta[:44]:<46} → ruta '{ruta}'")

    print("\n", enrutador.contador.resumen())
    print("detalle:", enrutador.contador.detalle)
