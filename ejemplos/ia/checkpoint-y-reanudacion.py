"""
Patrón: Checkpoint y Reanudación

Problema: un entrenamiento de 14 horas se corta en la hora 12 porque se cayó la
instancia. Sin checkpoints se pierde todo; con checkpoints mal hechos se
reanuda con el optimizador en cero y el modelo empeora sin que nadie lo note.

Solución: guardar periódicamente un estado *completo y atómico* — pesos,
optimizador, época, semillas, posición del dataloader — y poder reconstruir el
entrenamiento exactamente desde ahí. Es Memento: el objeto entrega una foto
opaca de su estado y sabe restaurarse desde ella.
"""
from __future__ import annotations

import json
import os
import random
import tempfile
from dataclasses import asdict, dataclass, field
from pathlib import Path


@dataclass(frozen=True, slots=True)
class Checkpoint:
    """El memento: todo lo necesario para continuar, nada más."""

    epoca: int
    pesos: list[float]
    estado_optimizador: dict[str, float]
    semilla: int
    mejor_metrica: float
    version_formato: int = 1


@dataclass
class Entrenador:
    pesos: list[float] = field(default_factory=lambda: [0.0, 0.0])
    momento: list[float] = field(default_factory=lambda: [0.0, 0.0])
    lr: float = 0.1
    epoca: int = 0
    mejor_metrica: float = 1e9
    semilla: int = 42

    # ── Memento ────────────────────────────────────────────────────────────
    def crear_checkpoint(self) -> Checkpoint:
        return Checkpoint(
            epoca=self.epoca,
            pesos=list(self.pesos),
            estado_optimizador={"lr": self.lr, "m0": self.momento[0], "m1": self.momento[1]},
            semilla=self.semilla,
            mejor_metrica=self.mejor_metrica,
        )

    def restaurar(self, c: Checkpoint) -> None:
        if c.version_formato != 1:
            raise ValueError(f"formato de checkpoint no soportado: {c.version_formato}")
        self.epoca, self.pesos = c.epoca, list(c.pesos)
        self.lr = c.estado_optimizador["lr"]
        self.momento = [c.estado_optimizador["m0"], c.estado_optimizador["m1"]]
        self.semilla, self.mejor_metrica = c.semilla, c.mejor_metrica
        random.seed(self.semilla + self.epoca)  # reanudar también el azar

    # ── Entrenamiento de juguete ───────────────────────────────────────────
    def una_epoca(self) -> float:
        self.epoca += 1
        random.seed(self.semilla + self.epoca)
        ruido = random.random() * 0.01
        for i in range(len(self.pesos)):
            gradiente = (self.pesos[i] - (0.7 if i == 0 else -0.3)) + ruido
            self.momento[i] = 0.9 * self.momento[i] - self.lr * gradiente
            self.pesos[i] += self.momento[i]
        perdida = round(sum(abs(p - o) for p, o in zip(self.pesos, (0.7, -0.3))), 5)
        self.mejor_metrica = min(self.mejor_metrica, perdida)
        return perdida


def guardar_atomico(c: Checkpoint, destino: Path) -> None:
    """Escribir y renombrar: nunca dejar un checkpoint a medio escribir."""
    temporal = destino.with_suffix(".tmp")
    temporal.write_text(json.dumps(asdict(c)))
    os.replace(temporal, destino)   # atómico en el mismo sistema de archivos


def cargar(origen: Path) -> Checkpoint:
    return Checkpoint(**json.loads(origen.read_text()))


if __name__ == "__main__":
    carpeta = Path(tempfile.mkdtemp())
    ruta = carpeta / "ckpt-ultimo.json"

    entrenador = Entrenador()
    print("— corrida 1 (se corta en la época 3) —")
    for _ in range(3):
        perdida = entrenador.una_epoca()
        guardar_atomico(entrenador.crear_checkpoint(), ruta)
        print(f"  época {entrenador.epoca}: pérdida {perdida} (checkpoint guardado)")

    print("\n💥 la instancia se cayó\n")

    print("— corrida 2 (reanuda desde el checkpoint) —")
    reanudado = Entrenador()
    reanudado.restaurar(cargar(ruta))
    print(f"  restaurado en la época {reanudado.epoca} con pesos "
          f"{[round(p, 4) for p in reanudado.pesos]}")
    for _ in range(2):
        print(f"  época {reanudado.epoca + 1}: pérdida {reanudado.una_epoca()}")

    print("\n— control: correr 5 épocas de una sola vez —")
    de_una = Entrenador()
    for _ in range(5):
        perdida = de_una.una_epoca()
    print(f"  pérdida final de corrido: {perdida}")
    print(f"  pérdida final reanudando: "
          f"{round(sum(abs(p - o) for p, o in zip(reanudado.pesos, (0.7, -0.3))), 5)}")
    print("  ¿la reanudación es equivalente?",
          [round(p, 6) for p in de_una.pesos] == [round(p, 6) for p in reanudado.pesos])
