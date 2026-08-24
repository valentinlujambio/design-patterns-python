"""
Patrón: Inferencia por Lotes (Micro-batching)

Problema: una GPU procesa 32 imágenes casi en el mismo tiempo que una sola, pero
el servicio recibe pedidos de a uno. Resultado: la GPU al 5% y la latencia por
las nubes cuando llegan muchos pedidos juntos.

Solución: interponer un objeto con la misma interfaz que el modelo que junta
pedidos hasta llenar un lote o hasta que vence un tiempo máximo de espera, y
recién ahí llama al modelo. Es Proxy (mismo contrato, comportamiento agregado)
con una política explícita de latencia máxima: sin ese tope, el batching
degrada la experiencia en vez de mejorarla.
"""
from __future__ import annotations

import queue
import threading
import time
from dataclasses import dataclass, field
from typing import Callable, Sequence


@dataclass
class ModeloVision:
    """Costo fijo alto por llamada + costo marginal bajo por elemento."""

    costo_fijo_ms: float = 40.0
    costo_por_item_ms: float = 2.0
    llamadas: int = 0
    items: int = 0
    # Una GPU atiende una inferencia por vez: sin este lock la simulación
    # mentiría, porque los hilos de Python correrían "en paralelo".
    _lock: threading.Lock = field(default_factory=threading.Lock)

    def predecir_lote(self, entradas: Sequence[str]) -> list[str]:
        with self._lock:
            self.llamadas += 1
            self.items += len(entradas)
            time.sleep((self.costo_fijo_ms + self.costo_por_item_ms * len(entradas)) / 1000)
            return [f"clase({e})" for e in entradas]


@dataclass
class _Pedido:
    entrada: str
    resultado: queue.Queue = field(default_factory=lambda: queue.Queue(maxsize=1))


class ProxyPorLotes:
    """Mismo `predecir`, pero agrupando por detrás."""

    def __init__(self, modelo: ModeloVision, tamano_max: int = 8,
                 espera_max_ms: float = 10.0) -> None:
        self._modelo = modelo
        self._tamano_max = tamano_max
        self._espera_max = espera_max_ms / 1000
        self._cola: queue.Queue[_Pedido] = queue.Queue()
        self._corriendo = True
        self._hilo = threading.Thread(target=self._bucle, daemon=True)
        self._hilo.start()

    def _juntar(self) -> list[_Pedido]:
        lote = [self._cola.get()]                 # bloquea hasta el primero
        limite = time.monotonic() + self._espera_max
        while len(lote) < self._tamano_max:
            restante = limite - time.monotonic()
            if restante <= 0:
                break
            try:
                lote.append(self._cola.get(timeout=restante))
            except queue.Empty:
                break
        return lote

    def _bucle(self) -> None:
        while self._corriendo:
            try:
                lote = self._juntar()
            except Exception:                      # pragma: no cover
                continue
            salidas = self._modelo.predecir_lote([p.entrada for p in lote])
            for pedido, salida in zip(lote, salidas):
                pedido.resultado.put(salida)

    def predecir(self, entrada: str) -> str:
        pedido = _Pedido(entrada)
        self._cola.put(pedido)
        return pedido.resultado.get()


def medir(nombre: str, llamar: Callable[[str], str], n: int) -> None:
    inicio = time.perf_counter()
    hilos = [threading.Thread(target=llamar, args=(f"img{i}",)) for i in range(n)]
    for h in hilos:
        h.start()
    for h in hilos:
        h.join()
    print(f"  {nombre:<22} {n} pedidos en {(time.perf_counter() - inicio) * 1000:6.0f} ms")


if __name__ == "__main__":
    directo = ModeloVision()
    medir("uno por uno", lambda e: directo.predecir_lote([e])[0], 16)
    print(f"    → {directo.llamadas} llamadas al modelo para {directo.items} imágenes")

    por_lotes_modelo = ModeloVision()
    proxy = ProxyPorLotes(por_lotes_modelo, tamano_max=8, espera_max_ms=15)
    medir("con micro-batching", proxy.predecir, 16)
    print(f"    → {por_lotes_modelo.llamadas} llamadas al modelo para "
          f"{por_lotes_modelo.items} imágenes")
