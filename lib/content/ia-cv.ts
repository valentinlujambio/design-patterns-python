import type { Pattern } from "@/lib/types";

export const CV: Pattern[] = [
  {
    slug: "tuberia-de-transformaciones",
    name: "Tubería de Transformaciones",
    aka: ["Compose", "Augmentation Pipeline"],
    track: "ia",
    family: "cv",
    tagline: "Cada transformación un objeto; componerlas es otra transformación.",
    intent:
      "Representar cada operación sobre la imagen como un objeto invocable con la misma firma, y componerlas en una tubería que también es invocable.",
    problem: [
      "El preprocesamiento de imágenes termina en una función de 80 líneas que hace todo. Cambiar el orden, desactivar un paso en validación o replicar la secuencia exacta en producción se vuelve imposible.",
      "Y la aleatoriedad del aumento de datos se filtra a la validación, donde no debería existir.",
    ],
    solution: [
      "Cada transformación es un objeto invocable `imagen → imagen`. `Componer` las encadena y, como también es invocable, se anida sin límite.",
      "Un decorador `AlAzar(p)` agrega la aleatoriedad solo donde corresponde: entrenamiento sí, validación no. La base determinista se comparte.",
    ],
    analogy: {
      title: "Los filtros del laboratorio fotográfico",
      body: [
        "Cada filtro hace una cosa y se enrosca sobre el anterior. El orden cambia el resultado, y por eso está anotado. Para el revelado de referencia se usa siempre la misma pila, sin los filtros creativos.",
      ],
    },
    diagram: `  entrenamiento: Componer(Recortar → AlAzar(Espejar, p) → Brillo → Normalizar)
  validación:    Componer(Recortar → Normalizar)
                            ▲
                 la misma base determinista;
                 la aleatoriedad SOLO en entrenamiento

  Componer(pasos) es a su vez una transformación ⇒ se anida`,
    applicability: [
      {
        when: "Hay más de dos operaciones sobre cada muestra",
        detail: "Y necesitás variantes por etapa (entrenamiento, validación, producción).",
      },
      {
        when: "Querés reproducir exactamente el preprocesamiento en producción",
        detail: "La tubería serializada es el contrato entre entrenamiento e inferencia.",
      },
      {
        when: "Estás probando aumentos de datos",
        detail: "Comparar configuraciones es comparar listas, no editar funciones.",
      },
    ],
    steps: [
      "Definí la firma común: una entrada, una salida, sin efectos secundarios.",
      "Implementá cada transformación como objeto invocable con sus parámetros.",
      "Implementá `Componer`, que aplica en orden y también es invocable.",
      "Separá la base determinista de los aumentos aleatorios.",
      "Fijá la semilla del azar para poder reproducir una corrida.",
      "Normalizá siempre al final: es lo que espera la red.",
    ],
    pros: [
      "Configuración declarativa: la tubería se lee como una lista.",
      "Cada transformación se testea aislada.",
      "Entrenamiento y validación comparten la base sin duplicar código.",
      "Se anida y se reutiliza sin límite.",
    ],
    cons: [
      "Copias intermedias: cada paso genera una imagen nueva (importa con lotes grandes).",
      "El orden es crítico y no siempre evidente (normalizar antes de recortar da otra cosa).",
      "Depurar un paso intermedio requiere ejecutar la tubería parcialmente.",
    ],
    pythonNotes: [
      {
        title: "`__call__` en vez de `.aplicar()`",
        body:
          "Un objeto invocable es intercambiable con una función: la tubería acepta las dos cosas sin código especial.",
      },
      {
        title: "`dataclass(frozen=True)` para las transformaciones",
        body:
          "Los parámetros quedan explícitos e inmutables, y el `repr` automático documenta la configuración usada.",
      },
      {
        title: "Semilla explícita en los aumentos",
        body:
          "Un `random.Random(semilla)` propio de la transformación evita depender del estado global y hace reproducible cada corrida.",
      },
    ],
    relations: [
      "Es Decorator (`AlAzar` envuelve otra transformación) + Composite (`Componer` es una transformación).",
      "Es la contraparte visual de la Tubería de Datos de ML y de la Cadena de Prompts.",
    ],
    related: ["decorator", "composite", "tuberia-de-datos", "cadena-de-prompts"],
    samples: [
      {
        title: "Recortar, espejar, brillo y normalizar sobre una imagen ASCII",
        path: "ejemplos/ia/tuberia-de-transformaciones.py",
        outputPath: "ejemplos/ia/tuberia-de-transformaciones.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Por qué la validación no debe incluir aumentos aleatorios?",
        options: [
          "Porque la métrica dejaría de ser comparable entre corridas",
          "Porque son más lentos",
          "Porque no funcionan con imágenes chicas",
          "Sí debe incluirlos, siempre",
        ],
        answer: 0,
        why: "Con aleatoriedad, dos evaluaciones del mismo modelo dan números distintos y no se puede saber si una mejora es real.",
      },
      {
        q: "¿Qué hace que `Componer` se pueda anidar?",
        options: [
          "Que implementa la misma interfaz que una transformación individual",
          "Que usa herencia múltiple",
          "Que guarda las imágenes en disco",
          "Que es un generador",
        ],
        answer: 0,
        why: "Es la esencia del Composite: el compuesto cumple el mismo contrato que sus partes.",
      },
    ],
    exercises: [
      "Agregá una transformación `Rotar90` y probá dos órdenes distintos de la pila.",
      "Implementá `AlAzarUnaDe([...])` que elija una transformación al azar entre varias.",
      "Hacé que la tubería registre qué transformaciones se aplicaron a cada muestra.",
    ],
    difficulty: 1,
    popularity: 3,
  },
  {
    slug: "fuente-de-frames",
    name: "Fuente de Frames",
    aka: ["Frame Source", "Video Source Adapter"],
    track: "ia",
    family: "cv",
    tagline: "Cámara, archivo o carpeta: para el pipeline, todo es un iterable de frames.",
    intent:
      "Unificar todos los orígenes de video e imagen detrás de una interfaz iterable, y apilar decoradores para saltear frames, limitar la cantidad o reconectar.",
    problem: [
      "El mismo pipeline tiene que correr con una webcam en desarrollo, un RTSP en la planta, un `.mp4` en los tests y una carpeta de imágenes en el notebook.",
      "Si el código pregunta «¿es cámara o archivo?», se llena de ramas. Y un stream que se cae tira abajo todo el proceso.",
    ],
    solution: [
      "Una sola interfaz: iterar frames. Cada origen es un adaptador que la implementa; el pipeline hace `for frame in fuente` y no sabe nada más.",
      "Encima se apilan decoradores que también son fuentes: `Saltear(n)`, `Limitar(n)`, `Reconectar(fabrica)`.",
    ],
    analogy: {
      title: "La canilla",
      body: [
        "Abrís la canilla y sale agua. No te importa si viene de la red, de un tanque o de un pozo: la interfaz es la misma. Y si el suministro se corta, el tanque de reserva cubre el hueco sin que cambies de canilla.",
      ],
    },
    diagram: `  DesdeArchivo · DesdeCarpeta · DesdeCamara     (adaptadores)
            └──────────┬──────────┘
                 iterable de Frame
            ┌──────────┴──────────┐
     Saltear(n) · Limitar(n) · Reconectar(fábrica)   (decoradores)
                       │
              for frame in fuente:   ← el pipeline, siempre igual`,
    applicability: [
      {
        when: "El mismo procesamiento debe correr sobre orígenes distintos",
        detail: "Desarrollo, tests, producción y demos rara vez usan la misma fuente.",
      },
      {
        when: "Necesitás tests deterministas de un pipeline de video",
        detail: "Una fuente de archivo finita hace reproducible lo que con una cámara nunca lo es.",
      },
      {
        when: "El origen puede fallar",
        detail: "Un stream de red se cae; la reconexión debe ser una capa, no un `if` en el bucle.",
      },
    ],
    steps: [
      "Definí el tipo `Frame` con lo que el pipeline necesita: índice, timestamp y datos.",
      "Implementá un adaptador por origen, todos iterables.",
      "Implementá los decoradores como fuentes que envuelven fuentes.",
      "Manejá el origen infinito: siempre debe haber una forma de cortar (`Limitar`, señal, tope de tiempo).",
      "Encapsulá la reconexión en un decorador, con tope de reintentos.",
    ],
    pros: [
      "El pipeline es idéntico para todos los orígenes.",
      "Los decoradores se combinan libremente.",
      "Tests rápidos y deterministas sin hardware.",
      "El manejo de fallos vive en una capa aparte.",
    ],
    cons: [
      "Los orígenes en vivo pierden frames si el consumidor es más lento: hace falta una política (descartar, encolar, bloquear).",
      "Una pila profunda de decoradores complica el diagnóstico de latencia.",
      "La reconexión puede reiniciar la numeración de frames y romper suposiciones aguas abajo.",
    ],
    pythonNotes: [
      {
        title: "`__iter__` con `yield`: el patrón ya está resuelto",
        body:
          "Un generador implementa el protocolo completo. No hace falta escribir `__next__` ni manejar `StopIteration`.",
      },
      {
        title: "`yield from` para delegar",
        body:
          "Los decoradores delegan la iteración a la fuente envuelta con una línea, sin copiar elementos.",
      },
      {
        title: "Cuidado con los orígenes infinitos",
        body:
          "Un `list(fuente)` sobre una cámara nunca termina. Envolvé siempre con `Limitar` o `itertools.islice` en las pruebas.",
      },
    ],
    relations: [
      "Es Adapter (cada origen) + Iterator (la interfaz) + Decorator (las capas).",
      "Se combina con Tubería de Transformaciones e Inferencia por Lotes aguas abajo.",
    ],
    related: ["adapter", "iterator", "decorator", "inferencia-por-lotes"],
    samples: [
      {
        title: "Cuatro orígenes, tres decoradores y un pipeline que no cambia",
        path: "ejemplos/ia/fuente-de-frames.py",
        outputPath: "ejemplos/ia/fuente-de-frames.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Qué problema aparece con una fuente en vivo que no aparece con un archivo?",
        options: [
          "Los frames se pierden si el consumidor es más lento que la fuente",
          "No se puede iterar",
          "No tiene timestamps",
          "No se puede decorar",
        ],
        answer: 0,
        why: "Un archivo espera; una cámara no. Hay que decidir explícitamente si se descartan frames, se encolan o se bloquea la captura.",
      },
      {
        q: "¿Qué construcción de Python implementa la interfaz de fuente casi gratis?",
        options: [
          "Un generador con `yield` dentro de `__iter__`",
          "Una metaclase",
          "`functools.lru_cache`",
          "Un `dict` de callbacks",
        ],
        answer: 0,
        why: "El generador provee `__iter__` y `__next__`, maneja el estado del recorrido y termina con `StopIteration` sin escribir nada de eso.",
      },
    ],
    exercises: [
      "Implementá `LimitarFPS` que descarte frames para no superar N por segundo.",
      "Agregá una fuente que lea de una cola compartida entre hilos.",
      "Hacé que `Reconectar` mantenga la numeración global de frames tras reconectar.",
    ],
    difficulty: 2,
    popularity: 3,
  },
  {
    slug: "inferencia-por-lotes",
    name: "Inferencia por Lotes",
    aka: ["Micro-batching", "Dynamic Batching"],
    track: "ia",
    family: "cv",
    tagline: "Juntar pedidos que llegan de a uno para aprovechar la GPU, sin romper la latencia.",
    intent:
      "Interponer un objeto con la misma interfaz que el modelo que agrupa pedidos concurrentes hasta llenar un lote o vencer un tiempo máximo de espera.",
    problem: [
      "La GPU procesa 32 imágenes casi en el mismo tiempo que una. Pero el servicio recibe pedidos de a uno: la GPU queda al 5% y la latencia se dispara cuando llegan muchos juntos.",
      "Procesar de a uno bajo carga significa que el pedido número 16 espera a que terminen los 15 anteriores.",
    ],
    solution: [
      "Un proxy con el mismo método `predecir` encola los pedidos. Un hilo los junta hasta llegar al tamaño máximo o hasta que vence la espera, llama al modelo una sola vez y reparte los resultados.",
      "El tope de espera es lo que hace usable el patrón: sin él, un pedido solo esperaría indefinidamente a que llegue compañía.",
    ],
    analogy: {
      title: "El ascensor",
      body: [
        "Espera unos segundos por si viene alguien más, pero no espera a llenarse: si nadie llega, sube igual. Sin ese límite de espera, el primero en entrar nunca llegaría a su piso.",
      ],
    },
    diagram: `  pedidos ──▶ [cola] ──▶ juntar hasta (tamaño_max ó espera_max)
                             │
                             ▼
                      modelo.predecir_lote([16 imgs])   1 llamada
                             │
                    repartir resultados a cada pedido

  16 de a uno: 676 ms · 16 llamadas
  micro-batching: 115 ms · 2 llamadas`,
    applicability: [
      {
        when: "El modelo tiene un costo fijo alto por llamada",
        detail: "GPU, TPU, o cualquier servicio remoto con sobrecarga por request.",
      },
      {
        when: "Hay concurrencia real de pedidos",
        detail: "Sin varios pedidos simultáneos, el batching solo agrega espera.",
      },
      {
        when: "Podés tolerar unos milisegundos extra de latencia",
        detail: "El intercambio es explícito: un poco de latencia por mucho rendimiento.",
      },
    ],
    steps: [
      "Medí el costo fijo y el marginal del modelo: si el fijo no domina, no hay nada que ganar.",
      "Implementá la cola y el hilo que junta lotes.",
      "Definí tamaño máximo y espera máxima; la espera es el contrato de latencia.",
      "Devolvé cada resultado a su pedido (una cola de respuesta por pedido).",
      "Manejá los errores del lote: un fallo no debe dejar pedidos colgados esperando para siempre.",
      "Medí latencia p50 y p99 antes y después: el promedio esconde el problema.",
    ],
    pros: [
      "Aumento enorme de rendimiento con el mismo hardware.",
      "Transparente para el cliente: misma interfaz.",
      "El intercambio latencia/rendimiento queda expresado en dos parámetros.",
    ],
    cons: [
      "Agrega latencia mínima incluso sin carga.",
      "Complejidad de concurrencia: colas, hilos, timeouts, apagado ordenado.",
      "Un error en el lote afecta a todos sus pedidos.",
      "Con poca carga, empeora las cosas.",
    ],
    pythonNotes: [
      {
        title: "`queue.Queue` es segura entre hilos",
        body:
          "Con `get(timeout=…)` se implementa la ventana de espera sin locks propios ni esperas activas.",
      },
      {
        title: "Una cola de respuesta por pedido",
        body:
          "`Queue(maxsize=1)` por pedido es la forma más simple de devolverle el resultado al hilo que lo pidió y de bloquearlo mientras tanto.",
      },
      {
        title: "El GIL no molesta acá",
        body:
          "La inferencia real libera el GIL (está en C/CUDA) y la espera también. En el ejemplo, el lock del modelo simula la serialización de la GPU.",
      },
    ],
    relations: [
      "Es Proxy: misma interfaz, comportamiento agregado, control del acceso al recurso caro.",
      "Se combina con Fuente de Frames (aguas arriba) y con Post-proceso de Detecciones (aguas abajo).",
    ],
    related: ["proxy", "fuente-de-frames", "cache-semantica", "flyweight"],
    samples: [
      {
        title: "Uno por uno vs. micro-batching, con GPU simulada serializada",
        path: "ejemplos/ia/inferencia-por-lotes.py",
        outputPath: "ejemplos/ia/inferencia-por-lotes.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Por qué es imprescindible un tiempo máximo de espera?",
        options: [
          "Porque sin él un pedido solo esperaría indefinidamente a que lleguen otros",
          "Porque la GPU se sobrecalienta",
          "Porque lo exige `queue.Queue`",
          "Para reducir el uso de memoria",
        ],
        answer: 0,
        why: "El tope de espera es el contrato de latencia: define cuánto está dispuesto a esperar el sistema para ganar rendimiento.",
      },
      {
        q: "¿Cuándo el micro-batching empeora el servicio?",
        options: [
          "Con poca carga: agrega espera sin poder formar lotes",
          "Con mucha carga",
          "Cuando el modelo es chico",
          "Nunca empeora",
        ],
        answer: 0,
        why: "Sin concurrencia no hay nada que agrupar, y cada pedido paga la ventana de espera a cambio de nada.",
      },
    ],
    exercises: [
      "Agregá métricas de latencia p50/p99 y compará con y sin batching bajo distintas cargas.",
      "Implementá un apagado ordenado que vacíe la cola antes de terminar.",
      "Hacé que un error del modelo se propague a todos los pedidos del lote sin dejar ninguno colgado.",
    ],
    difficulty: 3,
    popularity: 2,
  },
  {
    slug: "postproceso-de-detecciones",
    name: "Post-proceso de Detecciones",
    aka: ["NMS Chain", "Detection Postprocessing"],
    track: "ia",
    family: "cv",
    tagline: "De miles de cajas crudas a unas pocas útiles, con una cadena configurable.",
    intent:
      "Convertir la salida cruda de un detector en detecciones utilizables mediante una cadena ordenada de filtros y reductores independientes.",
    problem: [
      "El detector devuelve miles de cajas: duplicados sobre el mismo objeto, clases que no interesan, ruido de tamaño imposible y detecciones fuera de la zona vigilada.",
      "Meter todo eso en una función con condicionales anidados hace que ajustar un umbral sea una aventura.",
    ],
    solution: [
      "Cada criterio es un paso independiente `detecciones → detecciones`: umbral de confianza, clases permitidas, área mínima, región de interés, NMS y top-k.",
      "El orden es configuración: filtrar barato primero deja mucho menos trabajo para el NMS, que es el paso caro.",
    ],
    analogy: {
      title: "El tamizado de la arena",
      body: [
        "Se pasa por tamices de malla decreciente. Nadie usa primero el más fino: se saca lo grueso rápido y barato, y el tamiz costoso trabaja sobre mucho menos material.",
      ],
    },
    diagram: `  9 cajas crudas
    │ confianza ≥ 0.5      9 → 8
    │ clases permitidas    8 → 7
    │ área ≥ 100           7 → 6
    │ NMS (IoU 0.5)        6 → 3   ← el paso caro, al final
    │ top-k                3 → 3
    ▼
  3 detecciones finales`,
    applicability: [
      {
        when: "Trabajás con cualquier detector de objetos",
        detail: "YOLO, DETR, Faster R-CNN: todos devuelven cajas crudas que hay que depurar.",
      },
      {
        when: "Los criterios cambian por caso de uso",
        detail: "La misma red con distinta configuración de post-proceso para conteo, seguridad o inventario.",
      },
      {
        when: "Necesitás explicar por qué desapareció una detección",
        detail: "La cadena con traza dice exactamente qué paso la descartó.",
      },
    ],
    steps: [
      "Definí la estructura de detección con lo necesario: caja, clase, confianza.",
      "Implementá cada criterio como una función independiente y probada.",
      "Ordená: primero lo barato que descarta mucho; el NMS al final.",
      "Aplicá el NMS por clase, no globalmente: una persona no suprime a un auto.",
      "Agregá traza por paso: el conteo antes y después es la mejor herramienta de ajuste.",
      "Ajustá los umbrales con datos reales, no con intuición.",
    ],
    pros: [
      "Cada criterio se ajusta, se activa o se desactiva por separado.",
      "La traza convierte el ajuste de umbrales en una tarea observable.",
      "Reordenar mejora el rendimiento sin cambiar el resultado.",
      "Configuración distinta por caso de uso con el mismo modelo.",
    ],
    cons: [
      "Demasiados pasos vuelven difícil predecir el resultado final.",
      "El NMS es cuadrático en el peor caso: importa cuántas cajas le llegan.",
      "Un umbral mal puesto elimina detecciones correctas sin dejar rastro visible.",
    ],
    pythonNotes: [
      {
        title: "Funciones nombradas, no lambdas",
        body:
          "Si la traza imprime `<lambda>` no sirve de nada. Definir funciones internas con nombre hace legible el informe de cada paso.",
      },
      {
        title: "El IoU en cinco líneas",
        body:
          "Implementarlo a mano una vez fija el concepto mejor que llamar a `torchvision.ops.nms` sin saber qué hace.",
      },
      {
        title: "NumPy cuando importe",
        body:
          "Con miles de cajas, vectorizar el NMS con NumPy (o usar la implementación del framework) es la diferencia entre 5 ms y 500 ms.",
      },
    ],
    relations: [
      "Es Chain of Responsibility en su forma de tubería de filtros, con cada paso como Specification.",
      "Emparentado con Guardarraíles y con Validación de Datos: la misma idea aplicada a otro dominio.",
    ],
    related: ["chain-of-responsibility", "guardarrailes", "validacion-de-datos", "composite"],
    samples: [
      {
        title: "Cinco pasos con traza, NMS por clase e IoU implementado a mano",
        path: "ejemplos/ia/postproceso-de-detecciones.py",
        outputPath: "ejemplos/ia/postproceso-de-detecciones.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Por qué conviene aplicar el NMS al final de la cadena?",
        options: [
          "Porque es el paso más caro y conviene que reciba menos cajas",
          "Porque necesita la lista ordenada alfabéticamente",
          "Porque no funciona con pocas cajas",
          "Porque debe correr antes del filtro de confianza",
        ],
        answer: 0,
        why: "El NMS compara cajas entre sí (cuadrático en el peor caso). Filtrar antes con criterios lineales reduce drásticamente su costo.",
      },
      {
        q: "¿Por qué el NMS se aplica por clase?",
        options: [
          "Porque dos objetos de clases distintas pueden solaparse legítimamente",
          "Porque es más rápido",
          "Porque el IoU no funciona entre clases",
          "Porque lo exige el detector",
        ],
        answer: 0,
        why: "Una persona adentro de un auto tiene alto solapamiento con él; suprimir una por la otra sería un error.",
      },
    ],
    exercises: [
      "Agregá un paso de fusión de cajas (promediar en vez de suprimir) y compará resultados.",
      "Medí el tiempo del NMS con 100 y con 5000 cajas de entrada.",
      "Implementá Soft-NMS (bajar la confianza en vez de eliminar) y compará.",
    ],
    difficulty: 2,
    popularity: 3,
  },
  {
    slug: "seguimiento-multiobjeto",
    name: "Seguimiento Multiobjeto",
    aka: ["Detector + Tracker", "MOT"],
    track: "ia",
    family: "cv",
    tagline: "Darle identidad a las detecciones para poder contar, medir y alertar.",
    intent:
      "Separar detección, asociación y estado con identidad, coordinados por un rastreador que publica eventos de ciclo de vida.",
    problem: [
      "Un detector cuadro a cuadro no tiene memoria: no sabe que la persona del frame 5 es la misma del frame 4. Sin identidad no se puede contar personas únicas, medir permanencia ni detectar «entró y no salió».",
      "Y las oclusiones hacen que un objeto desaparezca un par de frames y vuelva: sin manejo de ciclo de vida, se cuenta dos veces.",
    ],
    solution: [
      "Tres roles separados: el detector dice qué hay, el asociador decide qué es lo mismo que antes, y las pistas mantienen identidad y estado (tentativa → confirmada → perdida).",
      "Un rastreador coordina los tres y publica eventos (`nueva`, `confirmada`, `perdida`) a los que se suscribe la lógica de negocio.",
    ],
    analogy: {
      title: "La lista de asistencia",
      body: [
        "El preceptor no cuenta cabezas cada cinco minutos: lleva una lista con nombres. Si alguien sale un momento al baño no lo borra; si no vuelve en media hora, lo marca ausente. Contar cabezas daría un número distinto cada vez.",
      ],
    },
    diagram: `  frame ──▶ detector ──▶ detecciones
                            │ asociación (distancia + clase)
                     ┌──────┴───────┐
              pista existente   sin dueño ⇒ pista nueva
                     │
       tentativa ──▶ confirmada ──▶ perdida (n frames sin ver)
                     └─── eventos ──▶ contadores, alertas, métricas`,
    applicability: [
      {
        when: "Necesitás contar objetos únicos y no detecciones",
        detail: "Personas que entran a un local, autos que cruzan, piezas en una cinta.",
      },
      {
        when: "Te interesa el tiempo de permanencia o la trayectoria",
        detail: "Ambas requieren identidad estable entre frames.",
      },
      {
        when: "Hay oclusiones frecuentes",
        detail: "El ciclo de vida con tolerancia evita duplicar identidades.",
      },
    ],
    steps: [
      "Definí la pista: identidad, clase, posición y contadores de visto/no visto.",
      "Elegí la métrica de asociación: distancia, IoU o apariencia (o una combinación).",
      "Definí el ciclo de vida: cuántos frames para confirmar y cuántos para dar por perdida.",
      "Implementá la asociación; empezá con la voraz y pasá al algoritmo húngaro si hace falta.",
      "Publicá eventos en vez de que el rastreador haga la lógica de negocio.",
      "Suavizá la posición para que el ruido del detector no haga saltar las trayectorias.",
    ],
    pros: [
      "Habilita conteo, permanencia y alertas basadas en identidad.",
      "El ciclo de vida absorbe detecciones intermitentes y oclusiones.",
      "Los eventos desacoplan el seguimiento de la lógica de negocio.",
    ],
    cons: [
      "Los cambios de identidad (ID switch) son el error clásico y difícil de eliminar.",
      "La asociación voraz falla con objetos cercanos que se cruzan.",
      "Los parámetros (distancia, paciencia) dependen mucho de la escena.",
    ],
    pythonNotes: [
      {
        title: "Asociación voraz primero",
        body:
          "Ordenar por «hace menos que no se ve» y elegir el más cercano resuelve escenas simples. El algoritmo húngaro (`scipy.optimize.linear_sum_assignment`) es el paso siguiente.",
      },
      {
        title: "Suavizado exponencial en dos líneas",
        body:
          "`x = α·x + (1-α)·detección` estabiliza la trayectoria sin necesidad de un filtro de Kalman completo.",
      },
      {
        title: "Eventos como callables",
        body:
          "Que el rastreador publique eventos evita que la lógica de conteo, alertas y métricas se meta adentro del algoritmo.",
      },
    ],
    relations: [
      "Es Mediator (el rastreador coordina) + State (el ciclo de vida de la pista) + Observer (los eventos).",
      "Consume la salida del Post-proceso de Detecciones y la Fuente de Frames.",
    ],
    related: ["mediator", "state", "observer", "postproceso-de-detecciones"],
    samples: [
      {
        title: "Rastreador con asociación, ciclo de vida y eventos de conteo",
        path: "ejemplos/ia/seguimiento-multiobjeto.py",
        outputPath: "ejemplos/ia/seguimiento-multiobjeto.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Para qué sirve el estado «tentativa» antes de confirmar una pista?",
        options: [
          "Para no crear identidades a partir de detecciones espurias de un solo frame",
          "Para ahorrar memoria",
          "Para acelerar la asociación",
          "Para poder usar Observer",
        ],
        answer: 0,
        why: "Un falso positivo aislado crearía una identidad nueva y arruinaría el conteo. Exigir dos apariciones filtra la mayoría de esos casos.",
      },
      {
        q: "¿Qué es un «ID switch»?",
        options: [
          "Que dos objetos intercambien identidad al cruzarse",
          "Que una pista cambie de clase",
          "Que se reinicie el contador de frames",
          "Que el detector cambie de modelo",
        ],
        answer: 0,
        why: "Es el error característico del seguimiento: la asociación asigna la detección de A a la pista de B, y todas las métricas basadas en identidad se corrompen.",
      },
    ],
    exercises: [
      "Reemplazá la asociación voraz por el algoritmo húngaro y compará en una escena con cruces.",
      "Agregá un evento «permanencia mayor a N frames» y usalo para una alerta.",
      "Sumá IoU además de la distancia al criterio de asociación y medí los ID switch.",
    ],
    difficulty: 3,
    popularity: 2,
  },
];
