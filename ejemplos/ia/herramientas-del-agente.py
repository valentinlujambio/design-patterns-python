"""
Patrón: Herramientas del Agente (Tool / Function Calling)

Problema: un LLM no sabe la hora, no consulta tu base y no hace cuentas
confiables. Necesita ejecutar código tuyo — pero dejarlo elegir qué ejecutar es
justamente donde se rompen las cosas.

Solución: convertir cada capacidad en un objeto Herramienta con nombre,
descripción, esquema de parámetros y una función validada. Es Command (una
acción reificada, con metadatos, registrable y auditable) más un Registro que
publica el catálogo al modelo.
"""
from __future__ import annotations

import inspect
import json
from dataclasses import dataclass
from typing import Any, Callable, get_type_hints

TIPOS_JSON = {str: "string", int: "integer", float: "number", bool: "boolean"}


@dataclass(frozen=True, slots=True)
class Herramienta:
    nombre: str
    descripcion: str
    parametros: dict[str, Any]
    funcion: Callable[..., Any]
    """¿Puede cambiar el mundo? Las que sí, piden confirmación."""
    peligrosa: bool = False

    def ejecutar(self, **kwargs: Any) -> str:
        try:
            return str(self.funcion(**kwargs))
        except Exception as exc:  # el error vuelve al modelo, no rompe el bucle
            return f"ERROR: {type(exc).__name__}: {exc}"


class RegistroDeHerramientas:
    def __init__(self) -> None:
        self._herramientas: dict[str, Herramienta] = {}

    def herramienta(self, descripcion: str, peligrosa: bool = False):
        """Decorador: el esquema se deriva de la firma y los type hints."""

        def envolver(fn: Callable[..., Any]) -> Callable[..., Any]:
            firma = inspect.signature(fn)
            hints = get_type_hints(fn)
            propiedades, requeridos = {}, []
            for nombre, param in firma.parameters.items():
                propiedades[nombre] = {"type": TIPOS_JSON.get(hints.get(nombre, str), "string")}
                if param.default is inspect.Parameter.empty:
                    requeridos.append(nombre)
            self._herramientas[fn.__name__] = Herramienta(
                nombre=fn.__name__,
                descripcion=descripcion,
                parametros={"type": "object", "properties": propiedades,
                            "required": requeridos},
                funcion=fn,
                peligrosa=peligrosa,
            )
            return fn

        return envolver

    def catalogo(self) -> str:
        """Lo que se le muestra al modelo."""
        return json.dumps(
            [{"name": h.nombre, "description": h.descripcion, "input_schema": h.parametros}
             for h in self._herramientas.values()],
            ensure_ascii=False, indent=2,
        )

    def invocar(self, nombre: str, argumentos: dict[str, Any],
                aprobar: Callable[[Herramienta, dict], bool] | None = None) -> str:
        herramienta = self._herramientas.get(nombre)
        if herramienta is None:
            return f"ERROR: no existe la herramienta {nombre!r}"
        if herramienta.peligrosa and not (aprobar and aprobar(herramienta, argumentos)):
            return "ERROR: acción rechazada por el humano"
        return herramienta.ejecutar(**argumentos)


registro = RegistroDeHerramientas()


@registro.herramienta("Suma dos números y devuelve el resultado exacto.")
def sumar(a: float, b: float) -> float:
    return a + b


@registro.herramienta("Busca el stock actual de un producto por su SKU.")
def stock(sku: str) -> str:
    inventario = {"TEC-01": 12, "MOU-07": 0}
    return f"{sku}: {inventario.get(sku, 'SKU inexistente')}"


@registro.herramienta("Emite un reembolso al cliente.", peligrosa=True)
def reembolsar(pedido: str, monto: float) -> str:
    return f"reembolso de ${monto} emitido para {pedido}"


if __name__ == "__main__":
    print("catálogo publicado al modelo:")
    print(registro.catalogo()[:280], "…\n")

    # Estas llamadas serían las que "decide" el modelo:
    print(registro.invocar("sumar", {"a": 21, "b": 21}))
    print(registro.invocar("stock", {"sku": "MOU-07"}))
    print(registro.invocar("stock", {}))                    # error recuperable
    print(registro.invocar("reembolsar", {"pedido": "A-1", "monto": 100.0}))
    print(registro.invocar("reembolsar", {"pedido": "A-1", "monto": 100.0},
                           aprobar=lambda h, a: a["monto"] <= 500))
