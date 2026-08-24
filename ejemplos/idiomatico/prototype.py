"""
Prototype en Python idiomático.

Python trae el patrón en la biblioteca estándar: `copy.copy` y `copy.deepcopy`.
Personalizás la clonación implementando `__copy__` / `__deepcopy__`; lo único
que agrega el patrón es la disciplina de *clonar un objeto ya configurado* en
lugar de reconstruirlo desde cero.
"""
from __future__ import annotations

import copy
from dataclasses import dataclass, field


@dataclass
class Capa:
    nombre: str
    opacidad: float = 1.0


@dataclass
class Documento:
    titulo: str
    capas: list[Capa] = field(default_factory=list)
    metadatos: dict[str, str] = field(default_factory=dict)
    # Recurso caro que NO queremos duplicar al clonar (una conexión, un modelo…)
    cache_render: dict[str, str] = field(default_factory=dict, repr=False)

    def __deepcopy__(self, memo: dict[int, object]) -> "Documento":
        clon = Documento(
            titulo=f"{self.titulo} (copia)",
            capas=copy.deepcopy(self.capas, memo),
            metadatos=dict(self.metadatos),
        )
        memo[id(self)] = clon
        return clon  # el caché se deja vacío a propósito


PLANTILLA_INFORME = Documento(
    titulo="Informe mensual",
    capas=[Capa("fondo"), Capa("encabezado", 0.9), Capa("gráfico")],
    metadatos={"plantilla": "informe-v3", "autor": "equipo-datos"},
)


def nuevo_informe(mes: str) -> Documento:
    """Prototype: clonar la plantilla configurada, no rearmarla."""
    doc = copy.deepcopy(PLANTILLA_INFORME)
    doc.titulo = f"Informe {mes}"
    return doc


if __name__ == "__main__":
    enero = nuevo_informe("enero")
    febrero = nuevo_informe("febrero")
    febrero.capas[0].opacidad = 0.2

    print(enero.titulo, "→", [(c.nombre, c.opacidad) for c in enero.capas])
    print(febrero.titulo, "→", [(c.nombre, c.opacidad) for c in febrero.capas])
    print("¿la plantilla original quedó intacta?",
          PLANTILLA_INFORME.capas[0].opacidad == 1.0)
    print("copia superficial comparte las capas:",
          copy.copy(enero).capas is enero.capas)
