import type { Pattern } from "@/lib/types";

export const ML: Pattern[] = [
  {
    slug: "tuberia-de-datos",
    name: "Tubería de Datos",
    aka: ["Pipeline", "Transformer API"],
    track: "ia",
    family: "ml",
    tagline: "fit aprende, transform aplica: la única forma de evitar fuga de datos.",
    intent:
      "Encapsular cada transformación como un objeto con `fit` y `transform`, y componerlas en una tubería que aprende sus parámetros una sola vez, con datos de entrenamiento.",
    problem: [
      "El preprocesamiento vive desparramado en el notebook. La media para imputar se calcula sobre el dataset completo —incluyendo validación— y el modelo «anda bárbaro» en local y mal en producción.",
      "Y cuando llega el momento de servir, hay que reimplementar el preprocesamiento en otro lado, con la garantía de que va a quedar distinto.",
    ],
    solution: [
      "Cada paso es un objeto: `fit` aprende parámetros (medias, vocabularios, escalas) y `transform` los aplica. La tubería los encadena y expone la misma interfaz que un paso suelto.",
      "En producción se llama solo a `transform`, con los parámetros aprendidos en entrenamiento. Ese es todo el patrón, y es lo que elimina la fuga de datos y el desfasaje entre entrenamiento y servicio.",
    ],
    analogy: {
      title: "La receta y las medidas",
      body: [
        "La primera vez calibrás la balanza con la harina que tenés. Después usás esa calibración siempre, aunque cambie la harina. Si recalibrás con cada bolsa, ninguna torta sale igual a la anterior.",
      ],
    },
    diagram: `  ENTRENAMIENTO            PRODUCCIÓN
  fit_transform(X_train)   transform(X_new)
 ┌──────────────┐         ┌──────────────┐
 │ imputar      │ aprende │ imputar      │ usa
 │  media=2000  │────────▶│  media=2000  │ (la misma)
 │ escalar      │         │ escalar      │
 │ codificar    │         │ codificar    │ categoría nueva ⇒ -1
 └──────────────┘         └──────────────┘
   ✗ nunca fit sobre datos de validación o producción`,
    applicability: [
      {
        when: "Cualquier preprocesamiento que aprenda parámetros de los datos",
        detail: "Imputación, escalado, codificación, selección de variables, PCA.",
      },
      {
        when: "El mismo preprocesamiento debe correr en entrenamiento y en servicio",
        detail: "La tubería serializada es el contrato entre las dos etapas.",
      },
      {
        when: "Querés hacer validación cruzada sin trampa",
        detail: "La tubería completa entra en cada fold: si no, la fuga es inevitable.",
      },
    ],
    steps: [
      "Identificá qué pasos aprenden algo de los datos: esos necesitan `fit`.",
      "Implementá cada uno con `fit` (guarda parámetros) y `transform` (los aplica).",
      "Encadenalos en una tubería que también exponga `fit`/`transform`.",
      "Definí el comportamiento ante lo desconocido (categoría nueva, nulo inesperado): nunca una excepción en producción.",
      "Serializá la tubería entrenada junto al modelo: son una sola unidad.",
    ],
    pros: [
      "Elimina la fuga de datos por construcción.",
      "Garantiza el mismo preprocesamiento en entrenamiento y en servicio.",
      "Cada paso se testea por separado.",
      "Se puede insertar entera en una validación cruzada o en una búsqueda de hiperparámetros.",
    ],
    cons: [
      "Más ceremonia que unas líneas de pandas en el notebook.",
      "Depurar un paso intermedio requiere ejecutar la tubería parcialmente.",
      "Serializar objetos con estado tiene sus propios problemas de versionado.",
    ],
    pythonNotes: [
      {
        title: "Es la API de scikit-learn",
        body:
          "`fit`/`transform`/`fit_transform` no es una convención arbitraria: aprenderla te abre todo el ecosistema (`Pipeline`, `ColumnTransformer`, `GridSearchCV`).",
      },
      {
        title: "`Self` como tipo de retorno de `fit`",
        body:
          "Permite encadenar (`.fit(X).transform(X)`) y funciona bien con subclases.",
      },
      {
        title: "Categoría desconocida: -1, no excepción",
        body:
          "En producción va a aparecer un valor que no estaba en entrenamiento. Decidí hoy qué hacer, o lo va a decidir un stacktrace a las 3 de la mañana.",
      },
    ],
    relations: [
      "Es Composite (la tubería es un paso más) + Template Method (`fit_transform` fija la secuencia).",
      "Emparentado con Cadena de Prompts y con Tubería de Transformaciones de visión.",
    ],
    related: [
      "composite",
      "template-method",
      "cadena-de-prompts",
      "tuberia-de-transformaciones",
    ],
    samples: [
      {
        title: "Imputar, escalar y codificar con parámetros aprendidos una sola vez",
        path: "ejemplos/ia/tuberia-de-datos.py",
        outputPath: "ejemplos/ia/tuberia-de-datos.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Qué es la fuga de datos (data leakage) en este contexto?",
        options: [
          "Usar información del conjunto de evaluación al calcular parámetros de preprocesamiento",
          "Que se filtren datos personales en los logs",
          "Perder filas al hacer un join",
          "Guardar el modelo sin cifrar",
        ],
        answer: 0,
        why: "Calcular la media de imputación sobre todo el dataset le da al modelo información de validación: la métrica sube y en producción se cae.",
      },
      {
        q: "¿Qué debe pasar en producción con una categoría no vista en entrenamiento?",
        options: [
          "Manejarse explícitamente (por ejemplo, mapear a -1)",
          "Lanzar una excepción",
          "Reentrenar el modelo",
          "Ignorar la fila silenciosamente",
        ],
        answer: 0,
        why: "Va a pasar seguro. Un valor centinela documentado es predecible; una excepción tira el servicio y un descarte silencioso sesga las métricas.",
      },
    ],
    exercises: [
      "Agregá un paso `SeleccionarColumnas` y verificá que la tubería sigue funcionando igual.",
      "Provocá deliberadamente una fuga (haciendo `fit` sobre todo el dataset) y medí la diferencia de métrica.",
      "Serializá la tubería con `pickle` y cargala en otro script para transformar datos nuevos.",
    ],
    difficulty: 2,
    popularity: 3,
  },
  {
    slug: "registro-de-modelos",
    name: "Registro de Modelos",
    aka: ["Model Registry"],
    track: "ia",
    family: "ml",
    tagline: "Versiones inmutables, métricas, linaje y una compuerta de calidad para promover.",
    intent:
      "Indexar versiones de modelos con sus métricas y su linaje, gestionar sus etapas (staging/producción) y permitir que el código pida «el modelo de producción» en vez de un archivo.",
    problem: [
      "«¿Qué modelo está en producción?» se responde mirando el nombre de un `.pkl` en el disco de alguien. Reproducir un resultado de hace tres meses es imposible.",
      "Y promover un modelo peor a producción es un `cp` de distancia, sin ninguna verificación.",
    ],
    solution: [
      "Un registro donde cada versión es inmutable y guarda métricas, hiperparámetros y el hash de los datos con que se entrenó. Las etapas se cambian con una operación que valida.",
      "El código cliente pide por nombre lógico y el registro devuelve el objeto listo. Volver atrás es cambiar una etapa, no un despliegue.",
    ],
    analogy: {
      title: "El registro de medicamentos",
      body: [
        "Ningún lote llega a la farmacia sin número, análisis y aprobación. Si algo sale mal, se sabe exactamente qué lote fue, con qué insumos se hizo y se puede retirar. Nadie «promueve» un lote copiándolo a otro estante.",
      ],
    },
    diagram: `  riesgo:v1  staging     auc=0.71 ✗ compuerta (mín. 0.80)
  riesgo:v2  producción  auc=0.83 ✓ promovida
  riesgo:v0  archivado

  app: registro.cargar("riesgo") ──▶ objeto de la versión en producción
  linaje: sha256(hiperparámetros + hash de datos) = 42f3eb2f3630`,
    applicability: [
      {
        when: "Hay más de un modelo, o más de una versión del mismo",
        detail: "Es decir: siempre que el proyecto sobreviva al primer mes.",
      },
      {
        when: "Necesitás poder volver atrás rápido",
        detail: "El rollback es cambiar la etapa, no reconstruir un despliegue.",
      },
      {
        when: "Tenés que auditar o reproducir un resultado",
        detail: "El linaje conecta modelo, datos y configuración.",
      },
    ],
    steps: [
      "Definí qué identifica a una versión: nombre lógico + número incremental.",
      "Guardá métricas, hiperparámetros y el hash del dataset con cada versión.",
      "Hacé las versiones inmutables: promover crea un estado nuevo, no edita el anterior.",
      "Implementá la compuerta de calidad: no se promueve nada que no supere el umbral.",
      "Que el código cargue por nombre lógico, nunca por ruta de archivo.",
    ],
    pros: [
      "Trazabilidad completa: qué está en producción y por qué.",
      "Rollback inmediato.",
      "La compuerta de calidad evita promociones por error.",
      "Desacopla la aplicación del formato y la ubicación del artefacto.",
    ],
    cons: [
      "Infraestructura extra que hay que mantener.",
      "Sobredimensionado para un experimento de una semana.",
      "El linaje solo vale si los datos también están versionados.",
    ],
    pythonNotes: [
      {
        title: "`dataclass(frozen=True, slots=True)`",
        body:
          "Versiones inmutables por construcción; cambiar la etapa produce un objeto nuevo, no muta el histórico.",
      },
      {
        title: "El constructor como `Callable`",
        body:
          "Guardar una función que reconstruye el modelo (en vez del objeto) permite carga perezosa y evita problemas de deserialización.",
      },
      {
        title: "MLflow hace esto en serio",
        body:
          "El ejemplo muestra el mecanismo; en producción, MLflow o similar te dan registro, artefactos, etapas y UI. El patrón es el mismo.",
      },
    ],
    relations: [
      "Es Registry + Factory: resuelve nombres lógicos a objetos construidos.",
      "Se combina con Campeón-Retador y con Checkpoint (los checkpoints son insumo del registro).",
    ],
    related: ["factory-method", "singleton", "checkpoint-y-reanudacion", "validacion-de-datos"],
    samples: [
      {
        title: "Registro con etapas, compuerta de calidad y linaje",
        path: "ejemplos/ia/registro-de-modelos.py",
        outputPath: "ejemplos/ia/registro-de-modelos.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Para qué sirve la compuerta de calidad al promover?",
        options: [
          "Para impedir que un modelo peor llegue a producción por error humano",
          "Para acelerar el entrenamiento",
          "Para reducir el tamaño del modelo",
          "Para versionar los datos",
        ],
        answer: 0,
        why: "Automatizar el criterio («AUC mínimo 0.80 sobre el conjunto de referencia») saca la decisión del terreno de la memoria y el apuro.",
      },
      {
        q: "¿Qué compone el linaje de una versión?",
        options: [
          "Hiperparámetros, versión de los datos y código con que se entrenó",
          "Solo el nombre del archivo",
          "La fecha de creación",
          "El nombre de quien la subió",
        ],
        answer: 0,
        why: "Sin esos tres elementos no se puede reproducir un resultado ni explicar por qué dos versiones difieren.",
      },
    ],
    exercises: [
      "Agregá la posibilidad de promover con varias métricas a la vez (todas deben pasar).",
      "Implementá `rollback(nombre)` que devuelva a producción la última versión archivada.",
      "Guardá también la versión del código (hash de git) en el linaje.",
    ],
    difficulty: 2,
    popularity: 3,
  },
  {
    slug: "callbacks-de-entrenamiento",
    name: "Callbacks de Entrenamiento",
    aka: ["Training Callbacks", "Hooks"],
    track: "ia",
    family: "ml",
    tagline: "El bucle emite eventos; todo lo demás se engancha.",
    intent:
      "Mantener el bucle de entrenamiento mínimo, emitiendo eventos a los que se suscriben observadores que registran, guardan checkpoints, ajustan el learning rate o cortan el entrenamiento.",
    problem: [
      "El bucle empieza con dos líneas y termina con logging, early stopping, checkpoints, scheduler y métricas a un servidor remoto, todo mezclado.",
      "Cambiar el criterio de early stopping obliga a tocar el bucle, con el riesgo de romper el entrenamiento entero.",
    ],
    solution: [
      "El bucle emite eventos en puntos definidos (`al_empezar_epoca`, `al_terminar_epoca`, `al_terminar_entrenamiento`) y recorre una lista de callbacks.",
      "Cada callback es independiente, se activa por configuración y puede modificar el estado compartido (por ejemplo, poner `detener = True`).",
    ],
    analogy: {
      title: "La carrera y los puestos de control",
      body: [
        "El corredor corre. En cada puesto hay quien toma el tiempo, quien da agua y quien puede retirarlo por razones médicas. Ninguna de esas tareas es del corredor, pero todas ocurren en puntos previstos del recorrido.",
      ],
    },
    diagram: `  for época in épocas:
      ├─ entrenar()
      └─ emitir("al_terminar_epoca", estado)
             ├──▶ Registrador     imprime métricas
             ├──▶ ReducirLR       estado.lr *= 0.5
             ├──▶ GuardarMejor    escribe checkpoint
             └──▶ EarlyStopping   estado.detener = True`,
    applicability: [
      {
        when: "El bucle de entrenamiento acumula responsabilidades ajenas",
        detail: "Si tiene más de 30 líneas, ya hay algo para extraer.",
      },
      {
        when: "Querés activar comportamientos por configuración",
        detail: "Early stopping en la búsqueda de hiperparámetros, no en la corrida final.",
      },
      {
        when: "Varias personas necesitan enganchar cosas distintas",
        detail: "Cada una agrega su callback sin tocar el bucle compartido.",
      },
    ],
    steps: [
      "Definí los puntos de enganche: inicio/fin de entrenamiento, de época y de lote.",
      "Definí el objeto de estado que se pasa a los callbacks y qué pueden modificar de él.",
      "Creá una clase base con implementaciones vacías para no obligar a definir todos los ganchos.",
      "Implementá cada comportamiento como un callback independiente.",
      "Cuidado con el orden: el que modifica el estado afecta a los que vienen después.",
    ],
    pros: [
      "El bucle queda corto y legible.",
      "Cada comportamiento se testea y se activa por separado.",
      "Es la arquitectura de Keras, Lightning y HuggingFace: te vas a encontrar con ella igual.",
    ],
    cons: [
      "El orden importa y no es evidente al leer la lista.",
      "El estado compartido y mutable puede producir interacciones sorpresivas.",
      "Difícil seguir el flujo cuando hay muchos callbacks activos.",
    ],
    pythonNotes: [
      {
        title: "Clase base con métodos vacíos",
        body:
          "Evita que cada callback tenga que implementar los cinco ganchos. Es el hook opcional del Template Method.",
      },
      {
        title: "El estado como `dataclass`",
        body:
          "Hace explícito qué pueden leer y escribir los callbacks; un `dict` libre esconde el contrato.",
      },
      {
        title: "Un callback que falla",
        body:
          "Decidí si un error en el logger debe tirar abajo un entrenamiento de 12 horas. Normalmente no: aislalo.",
      },
    ],
    relations: [
      "Es Observer, con toques de Template Method (los ganchos) y Mediator (el estado compartido).",
      "Se combina con Checkpoint y Reanudación (el callback que guarda) y con Registro de Modelos.",
    ],
    related: ["observer", "template-method", "checkpoint-y-reanudacion", "registro-de-modelos"],
    samples: [
      {
        title: "Registrador, scheduler, checkpoints y early stopping sobre el mismo bucle",
        path: "ejemplos/ia/callbacks-de-entrenamiento.py",
        outputPath: "ejemplos/ia/callbacks-de-entrenamiento.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Por qué importa el orden de los callbacks?",
        options: [
          "Porque unos modifican el estado que otros leen",
          "Porque el primero cancela a los demás",
          "Porque Python los ejecuta al azar",
          "No importa",
        ],
        answer: 0,
        why: "Si `ReducirLR` corre antes que el `Registrador`, el log muestra el learning rate ya modificado. No es un bug, pero hay que saberlo.",
      },
      {
        q: "¿Qué aporta la clase base con métodos vacíos?",
        options: [
          "Que cada callback implemente solo los ganchos que le interesan",
          "Que se ejecuten más rápido",
          "Que se puedan ordenar automáticamente",
          "Que no haga falta la lista de callbacks",
        ],
        answer: 0,
        why: "Es el mecanismo de hooks opcionales: sin ella, cada callback tendría que definir todos los métodos aunque no haga nada.",
      },
    ],
    exercises: [
      "Agregá un callback que registre métricas en un archivo CSV.",
      "Implementá un gancho `al_terminar_lote` y medí el impacto en el rendimiento del bucle.",
      "Hacé que un error en un callback no interrumpa el entrenamiento, pero quede registrado.",
    ],
    difficulty: 1,
    popularity: 3,
  },
  {
    slug: "checkpoint-y-reanudacion",
    name: "Checkpoint y Reanudación",
    aka: ["Checkpointing", "Resumable Training"],
    track: "ia",
    family: "ml",
    tagline: "Guardar todo el estado, de forma atómica, y poder continuar exactamente desde ahí.",
    intent:
      "Persistir periódicamente el estado completo del entrenamiento —pesos, optimizador, época, semillas— para poder reanudar de forma equivalente a no haber sido interrumpido.",
    problem: [
      "Un entrenamiento de 14 horas se corta en la hora 12 y se pierde todo. O peor: se reanuda mal, con el optimizador en cero, y el modelo empeora sin que nadie lo note.",
      "Y un proceso que muere mientras escribe el checkpoint deja un archivo corrupto que rompe el próximo intento.",
    ],
    solution: [
      "Guardá un estado completo: pesos, estado del optimizador (momentos incluidos), época, semillas y mejor métrica. Todo lo que haga falta para continuar.",
      "Escribí en un archivo temporal y renombrá: `os.replace` es atómico, así que nunca queda un checkpoint a medio escribir.",
    ],
    analogy: {
      title: "El punto de guardado del videojuego",
      body: [
        "Un guardado que solo recuerda en qué nivel estabas, pero no tu inventario ni tu vida, es peor que no guardar: retomás en un estado inconsistente y no entendés por qué todo va mal.",
      ],
    },
    diagram: `  época 3 ──▶ ckpt.tmp ──os.replace──▶ ckpt.json   (atómico)
                 pesos + optimizador + época + semilla + mejor métrica
  💥 caída
  reanudar ──▶ restaurar(ckpt) ──▶ época 4, 5 …
  verificación: entrenar 5 de corrido == 3 + reanudar 2  ✔`,
    applicability: [
      {
        when: "El entrenamiento dura más de lo que garantiza tu infraestructura",
        detail: "Instancias spot, colas con límite de tiempo, notebooks que se desconectan.",
      },
      {
        when: "Querés guardar la mejor época, no la última",
        detail: "El checkpoint es también el mecanismo de selección de modelo.",
      },
    ],
    steps: [
      "Enumerá todo lo que cambia durante el entrenamiento: si no está en la lista, no se restaura.",
      "Incluí el estado del optimizador: es el error más común y el más difícil de detectar.",
      "Guardá las semillas para que el azar también se reanude.",
      "Escribí de forma atómica (temporal + `os.replace`).",
      "Versioná el formato del checkpoint y verificá la versión al cargar.",
      "Testeá la reanudación: entrenar N de corrido debe dar lo mismo que entrenar N-k y reanudar k.",
    ],
    pros: [
      "Tolerancia a fallos sin perder horas de cómputo.",
      "Permite usar instancias baratas e interrumpibles.",
      "El checkpoint sirve también para seleccionar el mejor modelo y para auditar.",
    ],
    cons: [
      "Costo de I/O: guardar muy seguido frena el entrenamiento.",
      "Los checkpoints son pesados y hay que rotarlos.",
      "Un estado incompleto da una reanudación silenciosamente incorrecta.",
    ],
    pythonNotes: [
      {
        title: "`os.replace` es atómico",
        body:
          "En el mismo sistema de archivos, el renombrado es atómico: o está el archivo viejo o el nuevo, nunca uno a medias.",
      },
      {
        title: "`version_formato` desde el día uno",
        body:
          "Cuando cambies qué guardás, los checkpoints viejos van a existir igual. Un campo de versión convierte un error críptico en un mensaje claro.",
      },
      {
        title: "Reanudar el azar",
        body:
          "`random.seed(semilla + época)` hace que la secuencia de aleatoriedad dependa de la época, y por lo tanto sea reproducible al reanudar.",
      },
    ],
    relations: [
      "Es Memento: el objeto produce y consume una foto opaca de su propio estado.",
      "Se combina con Callbacks (el que guarda) y con Registro de Modelos (dónde termina el artefacto).",
    ],
    related: ["memento", "callbacks-de-entrenamiento", "registro-de-modelos", "prototype"],
    samples: [
      {
        title: "Checkpoint atómico y verificación de equivalencia al reanudar",
        path: "ejemplos/ia/checkpoint-y-reanudacion.py",
        outputPath: "ejemplos/ia/checkpoint-y-reanudacion.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Qué se olvida guardar con más frecuencia?",
        options: [
          "El estado del optimizador (momentos, contadores)",
          "Los pesos del modelo",
          "El número de época",
          "El nombre del experimento",
        ],
        answer: 0,
        why: "Sin los momentos, el optimizador arranca de cero al reanudar: el entrenamiento sigue, pero la trayectoria cambia y nadie se entera.",
      },
      {
        q: "¿Por qué escribir en un temporal y después renombrar?",
        options: [
          "Porque el renombrado es atómico y evita checkpoints corruptos",
          "Porque es más rápido",
          "Porque ahorra espacio",
          "Porque lo exige JSON",
        ],
        answer: 0,
        why: "Si el proceso muere a mitad de la escritura, el archivo bueno anterior sigue intacto; nunca queda un archivo parcial que rompa la próxima reanudación.",
      },
    ],
    exercises: [
      "Agregá rotación: conservar solo los 3 últimos checkpoints y el mejor.",
      "Cambiá el formato a la versión 2 y hacé que cargar uno v1 dé un error claro.",
      "Escribí un test que verifique la equivalencia entre corrido y reanudado.",
    ],
    difficulty: 2,
    popularity: 2,
  },
  {
    slug: "ensamble-de-modelos",
    name: "Ensamble de Modelos",
    aka: ["Ensemble", "Voting", "Stacking"],
    track: "ia",
    family: "ml",
    tagline: "Varios modelos que votan, con la misma interfaz que un modelo solo.",
    intent:
      "Combinar las predicciones de varios modelos mediante una estrategia de agregación, exponiendo la misma interfaz que un modelo individual.",
    problem: [
      "Un solo modelo tiene sus propios sesgos: acierta en unos casos y falla sistemáticamente en otros. Cambiarlo por otro mueve el problema de lugar.",
      "Y si combinás a mano las predicciones en el código cliente, cada cambio de ensamble obliga a tocar ese código.",
    ],
    solution: [
      "El ensamble implementa la misma interfaz que un modelo: recibe una entrada y devuelve una predicción. Adentro consulta a sus miembros y los combina.",
      "Al cumplir el mismo contrato, un ensamble puede contener otros ensambles y reemplazar a un modelo suelto sin tocar nada.",
    ],
    analogy: {
      title: "El tribunal",
      body: [
        "Tres jueces con formaciones distintas fallan mejor que uno solo, siempre que sean realmente independientes. Tres jueces que estudiaron juntos y piensan igual no aportan más que uno.",
      ],
    },
    diagram: `           ┌──────────── Ensamble (es un Modelo) ────────────┐
  x ──────▶│  a>0.5 ─▶ 1                                      │
           │  b>0.5 ─▶ 0     combinar: voto | promedio | RRF  │──▶ ŷ
           │  c>0.5 ─▶ 1                                      │
           └──────────────────────────────────────────────────┘
  cada miembro: 0.75 de exactitud → el ensamble: 1.00`,
    applicability: [
      {
        when: "Tenés varios modelos con errores poco correlacionados",
        detail: "La ganancia viene de la diversidad, no de la cantidad.",
      },
      {
        when: "Querés más estabilidad frente a datos ruidosos",
        detail: "El promedio reduce la varianza de las predicciones.",
      },
      {
        when: "Necesitás migrar de un modelo a otro gradualmente",
        detail: "Un ensamble ponderado permite mover el peso de forma progresiva.",
      },
    ],
    steps: [
      "Definí la interfaz de modelo y hacé que el ensamble la implemente.",
      "Elegí la estrategia de combinación: voto, promedio, mediana (robusta a atípicos) o ponderada.",
      "Verificá que los miembros sean realmente diversos: medí la correlación de sus errores.",
      "Evaluá el ensamble contra cada miembro: si no mejora, no lo pongas en producción.",
      "Tené en cuenta el costo: N modelos son N inferencias.",
    ],
    pros: [
      "Suele mejorar la exactitud y siempre reduce la varianza.",
      "Se compone: un ensamble puede contener ensambles.",
      "Permite migraciones graduales entre modelos.",
    ],
    cons: [
      "Costo de inferencia multiplicado por la cantidad de miembros.",
      "Menos interpretable: explicar una decisión se vuelve más difícil.",
      "Si los miembros son parecidos, la ganancia es nula y el costo real.",
    ],
    pythonNotes: [
      {
        title: "El combinador es una Strategy",
        body:
          "`Callable[[list[float]], float]`: voto, promedio y mediana son funciones de una línea, intercambiables sin tocar el ensamble.",
      },
      {
        title: "`statistics.median` para robustez",
        body:
          "La mediana ignora un miembro que se dispara; el promedio se lo come entero.",
      },
      {
        title: "Composición recursiva",
        body:
          "Que `Ensamble` sea también un `Modelo` permite anidarlos sin código especial: es Composite puro.",
      },
    ],
    relations: [
      "Es Composite (un modelo hecho de modelos) + Strategy (la combinación).",
      "Emparentado con el recuperador híbrido de RAG y con la Cascada de Respaldo.",
    ],
    related: ["composite", "strategy", "rag", "cascada-de-respaldo"],
    samples: [
      {
        title: "Tres modelos débiles, cuatro combinadores y un ensamble anidado",
        path: "ejemplos/ia/ensamble-de-modelos.py",
        outputPath: "ejemplos/ia/ensamble-de-modelos.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿De dónde viene la ganancia de un ensamble?",
        options: [
          "De que los miembros cometan errores distintos (diversidad)",
          "De la cantidad de miembros",
          "De usar siempre el promedio",
          "De entrenar más épocas",
        ],
        answer: 0,
        why: "Si todos los modelos se equivocan en los mismos casos, combinarlos reproduce el mismo error a mayor costo.",
      },
      {
        q: "¿Qué combinador es más robusto a un miembro que se dispara?",
        options: ["La mediana", "El promedio", "El máximo", "La suma"],
        answer: 0,
        why: "La mediana ignora los valores extremos; el promedio se ve arrastrado por un solo valor muy alejado.",
      },
    ],
    exercises: [
      "Medí la correlación de errores entre los miembros y relacionala con la ganancia del ensamble.",
      "Implementá stacking: un modelo que aprende cómo combinar las salidas de los miembros.",
      "Agregá pesos aprendidos a partir de la exactitud individual de cada miembro.",
    ],
    difficulty: 2,
    popularity: 2,
  },
  {
    slug: "validacion-de-datos",
    name: "Validación de Datos",
    aka: ["Data Contract", "Expectativas"],
    track: "ia",
    family: "ml",
    tagline: "El modelo no falla cuando los datos se rompen: sigue prediciendo, pero mal.",
    intent:
      "Declarar expectativas verificables sobre cada lote de datos —nulos, rangos, categorías, deriva— y evaluarlas antes de entrenar y antes de predecir, con severidades.",
    problem: [
      "Una columna pasa de metros a centímetros, aparece una categoría nueva o sube el porcentaje de nulos. El pipeline no falla: el modelo predice peor y nadie se entera durante semanas.",
      "Cuando alguien lo detecta, ya hay tres meses de decisiones tomadas con predicciones degradadas.",
    ],
    solution: [
      "Un contrato de datos: una lista de expectativas independientes, cada una con su severidad. Se evalúa en cada lote y produce un informe con la evidencia concreta.",
      "Los errores bloquean; los avisos alertan. La deriva estadística se compara contra una referencia guardada del conjunto de entrenamiento.",
    ],
    analogy: {
      title: "El control de calidad del insumo",
      body: [
        "La fábrica no acepta la harina sin analizarla. No porque desconfíe del proveedor, sino porque un lote fuera de especificación arruina la producción de todo el día, y se detecta cuando ya está empaquetada.",
      ],
    },
    diagram: `  lote ──▶ ┌──────────────────────────────────────┐
           │ no_nulos(edad)          ⛔ ERROR     │
           │ en_rango(edad, 18..110) ⛔ ERROR     │
           │ categorías(ciudad)      ⚠️  AVISO    │
           │ sin_deriva(ingreso)     ⚠️  AVISO    │
           └──────────────────────────────────────┘
                  ⛔ ⇒ aborta   ⚠️ ⇒ alerta y sigue`,
    applicability: [
      {
        when: "Los datos vienen de un sistema que no controlás",
        detail: "Otro equipo, un proveedor, un scraping, la carga manual de un usuario.",
      },
      {
        when: "El modelo está en producción",
        detail: "La deriva de datos es la causa número uno de degradación silenciosa.",
      },
      {
        when: "Querés detectar problemas antes de entrenar",
        detail: "Entrenar 6 horas con datos rotos es la forma más cara de descubrirlo.",
      },
    ],
    steps: [
      "Escribí las expectativas mirando el conjunto de entrenamiento: rangos, categorías, tasas de nulos.",
      "Guardá estadísticas de referencia (medias, distribuciones) para comparar la deriva.",
      "Asigná severidad a cada expectativa: qué bloquea y qué solo avisa.",
      "Ejecutá el contrato antes de entrenar y en cada lote de inferencia.",
      "Reportá con evidencia: «media 80750 vs referencia 1500» es accionable; «datos inválidos» no.",
      "Revisá el contrato cuando el negocio cambia: una expectativa desactualizada genera ruido y se termina ignorando.",
    ],
    pros: [
      "Detecta problemas de datos antes de que degraden el modelo.",
      "Cada expectativa es independiente y testeable.",
      "El informe con evidencia acelera el diagnóstico.",
      "Documenta implícitamente qué espera el modelo de sus entradas.",
    ],
    cons: [
      "Mantener el contrato cuesta trabajo y hay que actualizarlo.",
      "Demasiados avisos generan fatiga de alertas y se ignoran.",
      "Distinguir deriva legítima de un error de datos requiere criterio, no solo umbrales.",
    ],
    pythonNotes: [
      {
        title: "Expectativas como `dataclass(frozen=True)`",
        body:
          "Cada una es configuración pura y se puede declarar en una lista que se lee como documentación.",
      },
      {
        title: "Severidad con `Enum`",
        body:
          "Distinguir bloqueo de aviso en el tipo evita el booleano `es_critico` que nadie recuerda cómo interpretar.",
      },
      {
        title: "Great Expectations / pandera en producción",
        body:
          "El ejemplo muestra el mecanismo con la biblioteca estándar; esas herramientas agregan perfilado, informes y catálogos de expectativas listas.",
      },
    ],
    relations: [
      "Es Chain of Responsibility con expectativas tipo Specification, componibles.",
      "Es el equivalente en datos de los Guardarraíles de LLM.",
    ],
    related: ["chain-of-responsibility", "guardarrailes", "tuberia-de-datos", "composite"],
    samples: [
      {
        title: "Contrato con cinco expectativas, severidades e informe con evidencia",
        path: "ejemplos/ia/validacion-de-datos.py",
        outputPath: "ejemplos/ia/validacion-de-datos.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Por qué la degradación por datos es «silenciosa»?",
        options: [
          "Porque el modelo sigue prediciendo, solo que peor",
          "Porque los logs se borran",
          "Porque el pipeline lanza excepciones",
          "Porque el modelo deja de responder",
        ],
        answer: 0,
        why: "No hay error visible: hay una métrica de negocio que baja de a poco. Sin validación explícita, la causa se descubre meses después.",
      },
      {
        q: "¿Qué hace accionable a un informe de validación?",
        options: [
          "Incluir la evidencia concreta: valores, porcentajes y referencia",
          "Ser lo más corto posible",
          "Bloquear siempre el pipeline",
          "Estar en formato JSON",
        ],
        answer: 0,
        why: "«media 80750 vs referencia 1500 (5283%)» dice qué mirar; «datos inválidos» obliga a investigar desde cero.",
      },
    ],
    exercises: [
      "Agregá una expectativa de unicidad de la clave primaria.",
      "Implementá deriva con una prueba estadística en vez de comparar medias.",
      "Hacé que el contrato se genere automáticamente perfilando el conjunto de entrenamiento.",
    ],
    difficulty: 2,
    popularity: 3,
  },
];
