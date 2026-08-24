"""
Patrón: Plantilla de Prompt (Prompt Template)

Problema: los prompts terminan concatenados con f-strings desperdigados por todo
el código. No se pueden versionar, testear ni comparar, y una coma de más en
producción cambia la calidad sin que nadie se entere.

Solución: tratar el prompt como un artefacto de primera clase — plantilla con
variables declaradas, versión, valores por defecto y validación de entrada.
Es Template Method (la estructura fija con huecos) + Builder (el armado por
partes) aplicados al texto.
"""
from __future__ import annotations

import string
from dataclasses import dataclass, field

from _llm_falso import LLMFalso, Mensaje


class _Formateador(string.Formatter):
    """Falla ruidosamente si falta una variable, en vez de dejar un hueco."""

    def get_value(self, key, args, kwargs):  # type: ignore[no-untyped-def]
        if isinstance(key, str) and key not in kwargs:
            raise KeyError(f"falta la variable {key!r} en el prompt")
        return super().get_value(key, args, kwargs)


@dataclass(frozen=True, slots=True)
class PlantillaDePrompt:
    nombre: str
    version: str
    sistema: str
    usuario: str
    defaults: dict[str, str] = field(default_factory=dict)

    @property
    def variables(self) -> set[str]:
        campos = string.Formatter().parse(self.sistema + self.usuario)
        return {nombre for _, nombre, _, _ in campos if nombre}

    def render(self, **valores: str) -> list[Mensaje]:
        datos = {**self.defaults, **valores}
        fmt = _Formateador()
        return [
            Mensaje("system", fmt.vformat(self.sistema, (), datos)),
            Mensaje("user", fmt.vformat(self.usuario, (), datos)),
        ]

    def con_version(self, version: str, **cambios: str) -> "PlantillaDePrompt":
        """Variante para A/B: la original queda intacta."""
        from dataclasses import replace

        return replace(self, version=version, **cambios)


# El "registro de prompts": una sola fuente de verdad, versionada en git.
RESUMEN_V1 = PlantillaDePrompt(
    nombre="resumen-de-ticket",
    version="1.0.0",
    sistema=(
        "Sos un asistente de soporte. Respondés en {idioma}, en tono {tono}, "
        "sin inventar datos que no estén en el ticket."
    ),
    usuario=(
        "Resumí el siguiente ticket en {max_frases} frases y terminá con una "
        "línea 'Acción sugerida:'.\n\n<ticket>\n{ticket}\n</ticket>"
    ),
    defaults={"idioma": "español", "tono": "neutral", "max_frases": "2"},
)

RESUMEN_V2 = RESUMEN_V1.con_version(
    "2.0.0",
    usuario=(
        "Leé el ticket y devolvé:\n"
        "1. Problema (1 frase)\n2. Impacto (1 frase)\n3. Acción sugerida\n\n"
        "<ticket>\n{ticket}\n</ticket>"
    ),
)


if __name__ == "__main__":
    llm = LLMFalso("estandar")
    ticket = "No puedo exportar el reporte mensual, la descarga corta al 40%."

    print("variables declaradas:", sorted(RESUMEN_V1.variables), "\n")

    for plantilla in (RESUMEN_V1, RESUMEN_V2):
        mensajes = plantilla.render(ticket=ticket, tono="empático")
        respuesta = llm.completar(mensajes)
        print(f"— {plantilla.nombre} v{plantilla.version} —")
        print("system:", mensajes[0].contenido)
        print("tokens de entrada:", respuesta.tokens_entrada, "\n")

    try:
        RESUMEN_V1.render()  # falta 'ticket'
    except KeyError as exc:
        print("Error detectado antes de gastar un token:", exc)
