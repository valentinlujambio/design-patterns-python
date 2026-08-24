"""
Factory Method en Python idiomático.

En Java el patrón obliga a crear una jerarquía de "creadores". En Python las
funciones y las clases son objetos de primera clase, así que un *factory* suele
ser simplemente una función (o un `classmethod`) que devuelve la instancia
adecuada. El punto del patrón no es la jerarquía: es que el código cliente
dependa de una interfaz y no del constructor concreto.
"""
from __future__ import annotations

from typing import Callable, Protocol


class Notificador(Protocol):
    """El contrato. Con `Protocol` no hace falta heredar de nada."""

    def enviar(self, mensaje: str) -> str: ...


class Email:
    def __init__(self, destino: str) -> None:
        self.destino = destino

    def enviar(self, mensaje: str) -> str:
        return f"[email->{self.destino}] {mensaje}"


class SMS:
    def __init__(self, numero: str) -> None:
        self.numero = numero

    def enviar(self, mensaje: str) -> str:
        return f"[sms->{self.numero}] {mensaje}"


class Webhook:
    def __init__(self, url: str) -> None:
        self.url = url

    def enviar(self, mensaje: str) -> str:
        return f"[POST {self.url}] {mensaje}"


# El "creador" es un diccionario de constructores: cero clases extra.
REGISTRO: dict[str, Callable[[str], Notificador]] = {
    "email": Email,
    "sms": SMS,
    "webhook": Webhook,
}


def crear_notificador(canal: str, destino: str) -> Notificador:
    """Factory Method: el cliente pide por nombre, no instancia clases."""
    try:
        constructor = REGISTRO[canal]
    except KeyError:
        raise ValueError(f"Canal desconocido: {canal!r}") from None
    return constructor(destino)


def registrar(canal: str) -> Callable[[type], type]:
    """Un decorador deja que cada módulo se auto-registre al importarse."""

    def envolver(cls: type) -> type:
        REGISTRO[canal] = cls  # type: ignore[assignment]
        return cls

    return envolver


@registrar("consola")
class Consola:
    def __init__(self, destino: str) -> None:
        self.destino = destino

    def enviar(self, mensaje: str) -> str:
        return f"[consola] {mensaje}"


def avisar_a_todos(mensaje: str, destinos: dict[str, str]) -> list[str]:
    """Código cliente: no menciona ninguna clase concreta."""
    return [crear_notificador(c, d).enviar(mensaje) for c, d in destinos.items()]


if __name__ == "__main__":
    for linea in avisar_a_todos(
        "El build pasó a verde.",
        {"email": "ana@ejemplo.com", "sms": "+54911", "consola": "-"},
    ):
        print(linea)

    try:
        crear_notificador("paloma-mensajera", "-")
    except ValueError as exc:
        print("Error esperado:", exc)
