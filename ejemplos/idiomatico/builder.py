"""
Builder en Python idiomático.

Python tiene argumentos por nombre y valores por defecto, así que el Builder
"clásico" (un setter por campo) casi nunca hace falta: se resuelve con un
`dataclass`. El Builder sigue valiendo la pena cuando la construcción es *por
pasos*, cuando hay que validar combinaciones o cuando querés una API fluida y
reutilizable, como los constructores de consultas SQL.
"""
from __future__ import annotations

from dataclasses import dataclass, replace
from typing import Any, Self


@dataclass(frozen=True, slots=True)
class Consulta:
    """El producto: inmutable, imposible de dejar a medio construir."""

    tabla: str
    columnas: tuple[str, ...] = ("*",)
    condiciones: tuple[str, ...] = ()
    orden: str | None = None
    limite: int | None = None
    parametros: tuple[Any, ...] = ()

    def sql(self) -> str:
        partes = [f"SELECT {', '.join(self.columnas)}", f"FROM {self.tabla}"]
        if self.condiciones:
            partes.append("WHERE " + " AND ".join(self.condiciones))
        if self.orden:
            partes.append(f"ORDER BY {self.orden}")
        if self.limite is not None:
            partes.append(f"LIMIT {self.limite}")
        return " ".join(partes)


class ConsultaBuilder:
    """Builder fluido: cada paso devuelve `self` y se puede encadenar."""

    def __init__(self, tabla: str) -> None:
        self._c = Consulta(tabla=tabla)

    def seleccionar(self, *columnas: str) -> Self:
        self._c = replace(self._c, columnas=columnas or ("*",))
        return self

    def donde(self, condicion: str, *valores: Any) -> Self:
        self._c = replace(
            self._c,
            condiciones=self._c.condiciones + (condicion,),
            parametros=self._c.parametros + valores,
        )
        return self

    def ordenar_por(self, columna: str, desc: bool = False) -> Self:
        self._c = replace(self._c, orden=f"{columna}{' DESC' if desc else ''}")
        return self

    def limitar(self, n: int) -> Self:
        if n <= 0:
            raise ValueError("el límite debe ser positivo")
        self._c = replace(self._c, limite=n)
        return self

    def construir(self) -> Consulta:
        return self._c


def usuarios_activos_recientes(builder: ConsultaBuilder) -> Consulta:
    """Un 'Director': encapsula una receta de construcción reutilizable."""
    return (
        builder.seleccionar("id", "email")
        .donde("activo = ?", True)
        .donde("ultimo_login > ?", "2026-01-01")
        .ordenar_por("ultimo_login", desc=True)
        .limitar(50)
        .construir()
    )


if __name__ == "__main__":
    consulta = usuarios_activos_recientes(ConsultaBuilder("usuarios"))
    print(consulta.sql())
    print("parámetros:", consulta.parametros)

    # Para objetos simples, el "builder" de Python ya viene incluido:
    print(Consulta(tabla="logs", columnas=("nivel",), limite=10).sql())
