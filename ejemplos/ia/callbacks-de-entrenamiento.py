"""
Patrón: Callbacks de Entrenamiento

Problema: el bucle de entrenamiento se llena de responsabilidades ajenas —
imprimir, guardar checkpoints, cortar por early stopping, loguear a un servidor,
bajar el learning rate— y termina imposible de leer y de reutilizar.

Solución: el bucle emite eventos (`al_empezar_epoca`, `al_terminar_lote`, …) y
los observadores se enganchan. Es Observer, y es exactamente como funcionan
Keras, PyTorch Lightning y HuggingFace Trainer.
"""
from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Protocol


@dataclass
class Estado:
    epoca: int = 0
    metricas: dict[str, float] = field(default_factory=dict)
    lr: float = 0.1
    detener: bool = False


class Callback(Protocol):
    def al_empezar_entrenamiento(self, e: Estado) -> None: ...
    def al_terminar_epoca(self, e: Estado) -> None: ...
    def al_terminar_entrenamiento(self, e: Estado) -> None: ...


class CallbackBase:
    """Implementaciones vacías para no obligar a definir todos los ganchos."""

    def al_empezar_entrenamiento(self, e: Estado) -> None: ...
    def al_terminar_epoca(self, e: Estado) -> None: ...
    def al_terminar_entrenamiento(self, e: Estado) -> None: ...


class Registrador(CallbackBase):
    def al_terminar_epoca(self, e: Estado) -> None:
        m = " ".join(f"{k}={v:.4f}" for k, v in e.metricas.items())
        print(f"  época {e.epoca:>2} · lr={e.lr:.4f} · {m}")


@dataclass
class EarlyStopping(CallbackBase):
    metrica: str = "val_loss"
    paciencia: int = 2
    mejor: float = math.inf
    espera: int = 0
    mejor_epoca: int = 0

    def al_terminar_epoca(self, e: Estado) -> None:
        valor = e.metricas[self.metrica]
        if valor < self.mejor - 1e-4:
            self.mejor, self.espera, self.mejor_epoca = valor, 0, e.epoca
        else:
            self.espera += 1
            if self.espera >= self.paciencia:
                e.detener = True
                print(f"  ⏹ early stopping: {self.metrica} no mejora hace "
                      f"{self.paciencia} épocas")

    def al_terminar_entrenamiento(self, e: Estado) -> None:
        print(f"  mejor época: {self.mejor_epoca} ({self.metrica}={self.mejor:.4f})")


@dataclass
class ReducirLR(CallbackBase):
    factor: float = 0.5
    cada: int = 2

    def al_terminar_epoca(self, e: Estado) -> None:
        if e.epoca % self.cada == 0:
            e.lr *= self.factor


@dataclass
class GuardarMejor(CallbackBase):
    metrica: str = "val_loss"
    mejor: float = math.inf
    guardados: list[str] = field(default_factory=list)

    def al_terminar_epoca(self, e: Estado) -> None:
        if e.metricas[self.metrica] < self.mejor:
            self.mejor = e.metricas[self.metrica]
            self.guardados.append(f"checkpoint-epoca-{e.epoca}.pt")


def entrenar(epocas: int, callbacks: list[Callback]) -> Estado:
    """El bucle: corto, legible y sin saber quién lo está escuchando."""
    estado = Estado()
    for cb in callbacks:
        cb.al_empezar_entrenamiento(estado)

    perdidas = [0.90, 0.62, 0.48, 0.47, 0.475, 0.478, 0.48]
    for epoca in range(1, epocas + 1):
        estado.epoca = epoca
        val = perdidas[min(epoca - 1, len(perdidas) - 1)]
        estado.metricas = {"train_loss": round(val * 0.9, 4), "val_loss": val}
        for cb in callbacks:
            cb.al_terminar_epoca(estado)
        if estado.detener:
            break

    for cb in callbacks:
        cb.al_terminar_entrenamiento(estado)
    return estado


if __name__ == "__main__":
    guardado = GuardarMejor()
    entrenar(10, [Registrador(), ReducirLR(), guardado, EarlyStopping(paciencia=2)])
    print("  checkpoints escritos:", guardado.guardados)
