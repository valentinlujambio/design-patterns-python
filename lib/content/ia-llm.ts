import type { Pattern } from "@/lib/types";

export const LLM: Pattern[] = [
  {
    slug: "plantilla-de-prompt",
    name: "Plantilla de Prompt",
    aka: ["Prompt Template"],
    track: "ia",
    family: "llm",
    tagline: "Tratar el prompt como código: versionado, con variables declaradas y testeable.",
    intent:
      "Convertir los prompts en artefactos de primera clase —con nombre, versión, variables tipadas y validación— en lugar de f-strings desparramados por el código.",
    problem: [
      "Los prompts empiezan como una f-string dentro de una función y se multiplican. Terminan repetidos con variaciones mínimas en cinco archivos, sin forma de saber cuál está en producción.",
      "Cuando la calidad baja, nadie puede responder «¿qué cambió en el prompt?». Y una variable mal escrita produce un hueco silencioso en el texto en lugar de un error.",
    ],
    solution: [
      "Definí una plantilla con su nombre, su versión, sus variables declaradas y sus valores por defecto. Renderizar valida que estén todas: si falta una, falla antes de gastar un token.",
      "Guardá las plantillas en un módulo único versionado en git. Crear una variante para un A/B test es derivar una versión nueva, no editar la existente.",
    ],
    analogy: {
      title: "El formulario legal",
      body: [
        "Un contrato tipo tiene campos a completar, una versión y un responsable. Nadie reescribe la cláusula de rescisión a mano cada vez: se completa el formulario vigente. Si cambia la ley, se emite la versión siguiente y se sabe qué contratos usaron cuál.",
      ],
    },
    diagram: `  PlantillaDePrompt v2.0.0
 ┌──────────────────────────────────┐
 │ sistema: "Respondé en {idioma}…" │
 │ usuario: "Resumí {ticket} en…"   │
 │ defaults: {idioma: "español"}    │
 └──────────────┬───────────────────┘
        render(ticket="…")
                ▼
   [Mensaje(system), Mensaje(user)]  → LLM
        ▲
        └── falta una variable ⇒ KeyError ANTES de la llamada`,
    applicability: [
      {
        when: "Tenés más de tres prompts o más de una persona tocándolos",
        detail: "A partir de ahí la duplicación y la deriva son inevitables sin un registro.",
      },
      {
        when: "Querés comparar versiones de un prompt (A/B, evaluación offline)",
        detail: "Sin versión explícita no hay experimento posible: no sabés qué estás comparando.",
      },
      {
        when: "El prompt lo edita alguien que no programa",
        detail: "Separar plantilla de código permite revisarla como texto, en un PR.",
      },
    ],
    steps: [
      "Sacá el texto del prompt de la función que lo usa y ponelo en un objeto plantilla.",
      "Declará las variables explícitamente y hacé que falte una sea un error, no un hueco.",
      "Agregá `nombre` y `version` (semántica: un cambio de instrucciones es un cambio mayor).",
      "Separá el mensaje de sistema del de usuario: tienen ciclos de vida distintos.",
      "Guardá con cada respuesta qué plantilla y qué versión la generaron, para poder auditar.",
    ],
    pros: [
      "Los prompts se revisan, se versionan y se testean como cualquier otro código.",
      "Los errores de variables se detectan antes de la llamada al modelo.",
      "Habilita experimentos: dos versiones conviviendo con la misma interfaz.",
      "Un solo lugar donde cambiar el tono, el idioma o las reglas globales.",
    ],
    cons: [
      "Una capa de indirección: leer el prompt final requiere renderizar.",
      "Sobredimensionado para un script de una sola llamada.",
    ],
    pythonNotes: [
      {
        title: "`string.Formatter` a medida",
        body:
          "Heredar de `string.Formatter` y sobrescribir `get_value` permite fallar con un mensaje claro cuando falta una variable, en vez de dejar `{ticket}` literal en el texto.",
      },
      {
        title: "`dataclass(frozen=True)` + `replace`",
        body:
          "La plantilla inmutable y `dataclasses.replace` para derivar variantes: la v1 nunca se corrompe al crear la v2.",
      },
      {
        title: "Delimitadores XML para el contenido variable",
        body:
          "Envolver el texto del usuario en `<ticket>…</ticket>` reduce la confusión del modelo y hace más difícil la inyección de instrucciones.",
      },
    ],
    relations: [
      "Es Template Method aplicado al texto: estructura fija con huecos.",
      "Con Builder cuando el prompt se arma por partes condicionales.",
      "Con Strategy cuando cada variante de plantilla es intercambiable en tiempo de ejecución.",
    ],
    related: ["template-method", "builder", "cadena-de-prompts", "salida-estructurada"],
    samples: [
      {
        title: "Plantillas versionadas y validadas",
        description: "Registro de prompts con variables declaradas, defaults y derivación de versiones.",
        path: "ejemplos/ia/plantilla-de-prompt.py",
        outputPath: "ejemplos/ia/plantilla-de-prompt.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Por qué conviene que falte una variable sea un error?",
        options: [
          "Porque un hueco sin reemplazar degrada la respuesta en silencio",
          "Porque lo exige la API del modelo",
          "Porque ahorra tokens",
          "Porque permite usar `str.format`",
        ],
        answer: 0,
        why: "Con `str.format` común, `{ticket}` sin valor lanza `KeyError`; pero con plantillas parciales o `.get` es muy fácil terminar mandando el marcador literal al modelo y no enterarse nunca.",
      },
      {
        q: "¿Qué información conviene guardar junto a cada respuesta del modelo?",
        options: [
          "El nombre y la versión de la plantilla que la generó",
          "El horario del servidor",
          "El tamaño del archivo de código",
          "Nada: la respuesta se explica sola",
        ],
        answer: 0,
        why: "Sin esa trazabilidad no se puede investigar una regresión de calidad ni atribuir resultados a una versión concreta.",
      },
    ],
    exercises: [
      "Agregá un método `estimar_tokens()` que calcule el costo de la plantilla antes de llamarla.",
      "Escribí un test que verifique que todas las variables de la plantilla tienen default o se documentan.",
      "Implementá un selector A/B que elija la versión según el hash del id de usuario.",
    ],
    difficulty: 1,
    popularity: 3,
  },
  {
    slug: "adaptador-de-proveedor",
    name: "Adaptador de Proveedor",
    aka: ["Provider Adapter", "LLM Gateway"],
    track: "ia",
    family: "llm",
    tagline: "Que el SDK del proveedor no se filtre a tu dominio.",
    intent:
      "Definir una interfaz mínima propia para hablar con modelos y encapsular en adaptadores todo lo específico de cada SDK.",
    problem: [
      "Cada proveedor nombra distinto lo mismo: `messages` vs `prompt`, `max_tokens` vs `n_predict`, errores con jerarquías propias. Si tu código llama al SDK directamente, cambiar de modelo se vuelve una refactorización.",
      "Peor: los tests necesitan red o mocks del SDK ajeno, que cambian con cada versión.",
    ],
    solution: [
      "Declará la interfaz que TU aplicación necesita: normalmente un método y un tipo de respuesta propio. Escribí un adaptador finito por proveedor que traduzca ida y vuelta.",
      "El dominio depende de tu interfaz. Probar con dos proveedores en paralelo, o con un doble determinista, es cambiar un argumento.",
    ],
    analogy: {
      title: "El conversor de moneda del viajero",
      body: [
        "Llevás la contabilidad en una sola moneda y convertís en el borde. Si mezclás monedas en cada anotación, cualquier suma requiere saber de dónde salió cada número.",
      ],
    },
    diagram: `        tu dominio (habla un solo idioma)
              │  ProveedorLLM.completar(sistema, usuario)
      ┌───────┴────────┬────────────────┐
 AdaptadorA       AdaptadorB       AdaptadorFalso
      │                │                │
 SDK mensajes     SDK prompt        respuestas fijas
 (system+roles)   plano             (para tests)`,
    applicability: [
      {
        when: "Querés poder cambiar de proveedor o de modelo sin refactorizar",
        detail: "Migraciones, caídas de servicio, cambios de precio, requisitos de residencia de datos.",
      },
      {
        when: "Necesitás testear sin red ni API key",
        detail: "Un adaptador falso determinista hace que la suite corra en milisegundos.",
      },
      {
        when: "Querés centralizar reintentos, métricas y presupuesto",
        detail: "El adaptador es el punto natural para instrumentar todas las llamadas.",
      },
    ],
    steps: [
      "Escribí la interfaz mirando lo que tu app usa hoy, no lo que el SDK ofrece.",
      "Definí tipos propios para la respuesta (texto, uso de tokens, modelo).",
      "Implementá un adaptador por proveedor; todo `import` del SDK vive ahí.",
      "Traducí también los errores a excepciones propias, conservando la causa.",
      "Agregá un adaptador falso y usalo en los tests.",
    ],
    pros: [
      "Aísla el dominio de las APIs externas y de sus cambios.",
      "Hace triviales los tests y las comparaciones entre modelos.",
      "Un solo lugar para instrumentar, cachear o limitar.",
    ],
    cons: [
      "Puede ocultar capacidades específicas de un proveedor (caché de prompt, salidas nativas estructuradas).",
      "Si la interfaz crece hasta ser la unión de todos los SDK, dejó de aportar.",
    ],
    pythonNotes: [
      {
        title: "`Protocol` en lugar de clase base",
        body:
          "Los adaptadores no necesitan heredar nada; el chequeo estático verifica que cumplan la interfaz.",
      },
      {
        title: "Una escotilla de escape explícita",
        body:
          "Cuando necesites una función exclusiva de un proveedor, exponela como método adicional de ese adaptador y documentá que el código que la use queda atado a él.",
      },
      {
        title: "Traducí los errores",
        body:
          "`raise ErrorDeModelo(...) from exc` conserva la traza original y evita que el `except` del dominio dependa de la jerarquía del SDK.",
      },
    ],
    relations: [
      "Es Adapter puro; se vuelve Bridge cuando la abstracción (tu caso de uso) y la implementación (el proveedor) evolucionan por separado.",
      "Se combina con Cascada de Respaldo (varios adaptadores en cadena) y con Enrutador de Modelos.",
    ],
    related: ["adapter", "bridge", "cascada-de-respaldo", "enrutador-de-modelos"],
    samples: [
      {
        title: "Dos SDK con formas distintas, una sola interfaz",
        path: "ejemplos/ia/adaptador-de-proveedor.py",
        outputPath: "ejemplos/ia/adaptador-de-proveedor.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Cómo debería diseñarse la interfaz del adaptador?",
        options: [
          "Con lo mínimo que tu aplicación necesita hoy",
          "Con la unión de todas las funciones de todos los proveedores",
          "Copiando la del proveedor principal",
          "Con un único método `llamar(**kwargs)`",
        ],
        answer: 0,
        why: "Una interfaz mínima es fácil de implementar (incluso en un doble de test) y evita que la complejidad ajena se filtre al dominio.",
      },
      {
        q: "¿Qué se gana traduciendo los errores del SDK?",
        options: [
          "Que el manejo de errores del dominio no dependa de la jerarquía del proveedor",
          "Que las llamadas sean más rápidas",
          "Que se reduzca el consumo de tokens",
          "Nada, es ceremonia",
        ],
        answer: 0,
        why: "Si el `except` del dominio atrapa excepciones del SDK, cambiar de proveedor rompe el manejo de errores en todos lados.",
      },
    ],
    exercises: [
      "Agregá un tercer adaptador que hable con un modelo local por HTTP.",
      "Sumá al adaptador el registro de tokens y costo por llamada.",
      "Escribí un test que corra el mismo caso contra los dos adaptadores y compare las formas de salida.",
    ],
    difficulty: 1,
    popularity: 3,
  },
  {
    slug: "cadena-de-prompts",
    name: "Cadena de Prompts",
    aka: ["Prompt Chaining", "Pipeline de LLM"],
    track: "ia",
    family: "llm",
    tagline: "Varios pasos chicos y verificables en lugar de un prompt que hace todo.",
    intent:
      "Descomponer una tarea compleja en pasos encadenados, cada uno con su prompt, su validación y su salida, de modo que se puedan testear, cachear y reemplazar por separado.",
    problem: [
      "Un prompt que extrae, razona, traduce y formatea hace las cuatro cosas peor que cuatro prompts. Y cuando el resultado sale mal, no hay forma de saber en qué parte se rompió.",
      "Además, todo el trabajo se hace con el modelo más caro, incluso los pasos que no necesitan inteligencia.",
    ],
    solution: [
      "Definí una tubería de pasos con una entrada y una salida explícitas. Cada paso hace una sola cosa y deja traza.",
      "Los pasos que se pueden resolver con código determinista (truncar, ordenar, validar, buscar) no llaman al modelo: son más baratos, más rápidos y no alucinan.",
    ],
    analogy: {
      title: "La línea de montaje",
      body: [
        "Nadie construye un auto en una sola estación. Cada puesto hace una tarea, se controla al final del puesto y se puede reemplazar sin rediseñar la fábrica. Si sale un auto con la puerta mal, se sabe en qué estación mirar.",
      ],
    },
    diagram: `  entrada
    │
    ▼
 ┌────────────┐   ┌────────────┐   ┌───────────┐   ┌────────────┐
 │ 1 extraer  │──▶│ 2 analizar │──▶│ 3 truncar │──▶│ 4 redactar │
 │  (modelo   │   │  (modelo   │   │ (sin LLM) │   │  (barato)  │
 │   barato)  │   │   capaz)   │   └───────────┘   └────────────┘
 └────────────┘   └────────────┘
    cada paso: validación + traza + caché propia`,
    applicability: [
      {
        when: "La tarea tiene sub-objetivos claramente distintos",
        detail: "Extraer ≠ razonar ≠ redactar. Si podés nombrar los pasos, podés encadenarlos.",
      },
      {
        when: "Necesitás saber en qué punto se rompe la calidad",
        detail: "La traza por paso convierte un problema difuso en uno localizable.",
      },
      {
        when: "Querés bajar el costo",
        detail: "Modelo chico para lo mecánico, grande solo para el paso que lo justifica.",
      },
    ],
    steps: [
      "Escribí la tarea completa como una lista de pasos en lenguaje natural: esa lista es el diseño.",
      "Definí el tipo de dato que viaja entre pasos (un estado explícito, no un `dict` libre).",
      "Implementá cada paso como una función con la misma firma.",
      "Marcá cuáles necesitan modelo y cuáles no; convertí en código todo lo que se pueda.",
      "Agregá traza y validación entre pasos: fallar temprano es más barato que fallar al final.",
    ],
    pros: [
      "Cada paso se testea, se cachea y se mejora por separado.",
      "Reduce costo usando el modelo adecuado en cada punto.",
      "La traza hace observable un proceso que si no es una caja negra.",
      "Los pasos deterministas eliminan alucinaciones donde no hacían falta.",
    ],
    cons: [
      "Más latencia total si los pasos son secuenciales y no se pueden paralelizar.",
      "Los errores se propagan: una extracción mala arruina todo lo que sigue.",
      "Más piezas para mantener que un solo prompt.",
    ],
    pythonNotes: [
      {
        title: "Una tubería es composición de funciones",
        body:
          "`Callable[[Estado], Estado]` como tipo del paso permite componer con un `for` o con `functools.reduce`, sin framework.",
      },
      {
        title: "El estado explícito importa",
        body:
          "Un `dataclass` con campos declarados hace visible qué produce cada paso; un `dict` suelto esconde las dependencias entre pasos.",
      },
      {
        title: "Paralelizar los pasos independientes",
        body:
          "Si dos pasos no dependen entre sí, `ThreadPoolExecutor` alcanza: las llamadas a la API son I/O y el GIL no molesta.",
      },
    ],
    relations: [
      "Es Pipes and Filters / Chain of Responsibility aplicado a llamadas de modelo.",
      "Cada paso puede ser una Strategy intercambiable.",
      "Se combina con Evaluador-Optimizador para verificar la salida de un paso antes de seguir.",
    ],
    related: [
      "chain-of-responsibility",
      "tuberia-de-datos",
      "orquestador-trabajadores",
      "evaluador-optimizador",
    ],
    samples: [
      {
        title: "Tubería de cuatro pasos con traza y costo",
        path: "ejemplos/ia/cadena-de-prompts.py",
        outputPath: "ejemplos/ia/cadena-de-prompts.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Cuál es la principal desventaja de encadenar prompts?",
        options: [
          "Los errores se propagan y la latencia se acumula",
          "Que no se puede testear",
          "Que obliga a usar un solo modelo",
          "Que impide cachear",
        ],
        answer: 0,
        why: "Un paso temprano con una extracción incorrecta arruina todo lo que sigue; por eso conviene validar entre pasos y no solo al final.",
      },
      {
        q: "¿Qué pasos conviene resolver sin llamar al modelo?",
        options: [
          "Los deterministas: truncar, ordenar, buscar, validar, calcular",
          "Los que requieren razonamiento",
          "Los que reciben texto libre",
          "Ninguno: el modelo siempre es mejor",
        ],
        answer: 0,
        why: "El código determinista es más barato, más rápido, reproducible y no alucina. Reservá el modelo para lo que solo él puede hacer.",
      },
    ],
    exercises: [
      "Agregá caché por paso usando el hash del prompt como clave.",
      "Hacé que un paso falle la validación y observá cómo cortar la tubería sin perder la traza.",
      "Paralelizá dos pasos independientes con `ThreadPoolExecutor` y medí la diferencia.",
    ],
    difficulty: 2,
    popularity: 3,
  },
  {
    slug: "enrutador-de-modelos",
    name: "Enrutador de Modelos",
    aka: ["Model Router", "Dispatcher semántico"],
    track: "ia",
    family: "llm",
    tagline: "Elegir el modelo y el prompt según lo que pide cada consulta.",
    intent:
      "Clasificar la consulta con un mecanismo barato y dirigirla al modelo, el prompt y las herramientas adecuadas, con una ruta por defecto garantizada.",
    problem: [
      "Mandar todo al modelo más capaz cuesta 20 veces más de lo necesario para responder «hola». Mandar todo al más barato arruina las consultas difíciles.",
      "Y las tareas no son homogéneas: código, resumen, charla y análisis largo tienen requisitos distintos.",
    ],
    solution: [
      "Interponer un clasificador —reglas, un modelo chico o un clasificador entrenado— que elija una ruta. Cada ruta define modelo, prompt de sistema y parámetros.",
      "Siempre debe existir una ruta por defecto: si el clasificador no sabe, la consulta igual se responde.",
    ],
    analogy: {
      title: "La guardia del hospital",
      body: [
        "El triage no cura a nadie: en dos minutos decide quién va al consultorio, quién a shock room y quién a esperar. Es barato, rápido y determina la calidad de todo lo que sigue.",
      ],
    },
    diagram: `             ┌──────────────┐
  consulta ─▶│ clasificador │ (reglas o modelo chico)
             └──────┬───────┘
      ┌─────────────┼──────────────┬───────────────┐
   cortesía      código      análisis largo    por defecto
   (mini)        (grande)      (estándar)        (mini)
      └────── cada ruta: modelo + prompt + límites ──────┘`,
    applicability: [
      {
        when: "El costo por consulta importa y el tráfico es heterogéneo",
        detail: "La mayoría de las consultas reales son simples; pagarlas como si fueran difíciles es puro desperdicio.",
      },
      {
        when: "Distintos tipos de consulta necesitan prompts o herramientas distintas",
        detail: "Un prompt de sistema genérico rinde peor que tres específicos.",
      },
      {
        when: "Querés poder degradar bajo carga",
        detail: "El enrutador es el lugar natural para bajar de modelo cuando hay saturación.",
      },
    ],
    steps: [
      "Mirá 100 consultas reales y agrupalas: ahí están tus rutas, no en la teoría.",
      "Empezá con reglas (longitud, palabras clave, expresiones regulares). Son gratis y explicables.",
      "Definí la ruta por defecto primero: es la red de seguridad.",
      "Medí por ruta: costo, latencia y calidad. Sin medición, el enrutador es una corazonada.",
      "Recién cuando las reglas no alcancen, usá un modelo chico como clasificador.",
    ],
    pros: [
      "Baja el costo drásticamente sin tocar la calidad de los casos difíciles.",
      "Permite prompts especializados por tipo de tarea.",
      "Punto único para degradar, limitar o priorizar.",
    ],
    cons: [
      "Una clasificación incorrecta manda una consulta difícil a un modelo chico.",
      "Más rutas = más superficie de mantenimiento y más difícil de evaluar.",
      "Si el clasificador es un LLM, agrega latencia y una fuente más de error.",
    ],
    pythonNotes: [
      {
        title: "Las rutas son datos, no código",
        body:
          "Una lista de `dataclass` con condición y configuración permite reordenar, activar y testear rutas sin tocar la lógica del enrutador.",
      },
      {
        title: "Primera coincidencia gana",
        body:
          "Ordená de la regla más específica a la más general. Un test que verifique el orden evita regresiones silenciosas.",
      },
      {
        title: "Registrá siempre la ruta elegida",
        body:
          "Sin ese dato no se puede analizar si el enrutador acierta ni calcular el costo por segmento.",
      },
    ],
    relations: [
      "Es Strategy elegida por un despachador, con un Chain of Responsibility implícito en el orden de las reglas.",
      "Se combina con Cascada de Respaldo (qué hacer si la ruta elegida falla) y con Caché Semántica (antes de enrutar).",
    ],
    related: ["strategy", "chain-of-responsibility", "cascada-de-respaldo", "cache-semantica"],
    samples: [
      {
        title: "Enrutador con reglas, ruta por defecto y contabilidad de costo",
        path: "ejemplos/ia/enrutador-de-modelos.py",
        outputPath: "ejemplos/ia/enrutador-de-modelos.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Qué es imprescindible en cualquier enrutador?",
        options: [
          "Una ruta por defecto",
          "Un modelo grande",
          "Un clasificador entrenado",
          "Al menos cinco rutas",
        ],
        answer: 0,
        why: "Sin ruta por defecto, una consulta que no matchea ninguna regla queda sin respuesta: el peor resultado posible.",
      },
      {
        q: "¿Por qué conviene empezar con reglas en vez de un clasificador LLM?",
        options: [
          "Son gratis, instantáneas, explicables y fáciles de testear",
          "Porque los LLM no saben clasificar",
          "Porque las reglas siempre son más precisas",
          "Porque no se pueden combinar",
        ],
        answer: 0,
        why: "Un clasificador con modelo agrega latencia, costo y una fuente más de error. Empezá simple y escalá solo donde las reglas fallen de verdad.",
      },
    ],
    exercises: [
      "Agregá una ruta para consultas en otro idioma y un test que verifique el orden de evaluación.",
      "Instrumentá el enrutador para reportar costo por ruta y encontrá cuál domina el gasto.",
      "Implementá una degradación: si el gasto de la hora supera un umbral, forzá todo a la ruta barata.",
    ],
    difficulty: 2,
    popularity: 3,
  },
  {
    slug: "herramientas-del-agente",
    name: "Herramientas del Agente",
    aka: ["Tool Calling", "Function Calling"],
    track: "ia",
    family: "llm",
    tagline: "Cada capacidad, un objeto con esquema, validación y permisos.",
    intent:
      "Reificar las capacidades que el modelo puede invocar como objetos con nombre, descripción, esquema de parámetros y una función validada, publicables como catálogo.",
    problem: [
      "El modelo no sabe la hora, no consulta tu base y calcula mal. Necesita ejecutar código tuyo. Pero un `eval` de lo que devuelve el modelo es una vulnerabilidad, no una integración.",
      "Y sin esquema, el modelo inventa parámetros que tu función no acepta.",
    ],
    solution: [
      "Definí cada herramienta como un objeto: nombre, descripción (que el modelo lee), esquema JSON de parámetros y la función real. El registro publica el catálogo y ejecuta por nombre.",
      "Las herramientas que cambian el mundo se marcan como peligrosas y requieren aprobación explícita. Los errores vuelven al modelo como texto, sin romper el bucle.",
    ],
    analogy: {
      title: "La caja de herramientas con inventario",
      body: [
        "Un taller no le da a cualquiera la llave del torno. Cada herramienta tiene ficha, instrucciones de uso y nivel de habilitación. Pedirla queda registrado, y algunas requieren la firma del encargado.",
      ],
    },
    diagram: `  Registro de herramientas
 ┌────────────────────────────────────────────┐
 │ sumar     · esquema{a:number, b:number}    │
 │ stock     · esquema{sku:string}            │
 │ reembolsar· esquema{...}  ⚠ peligrosa      │
 └─────────────────┬──────────────────────────┘
   catálogo ▲      │ invocar(nombre, args)
            │      ▼
          modelo   validar → ¿aprobación? → ejecutar
                   error ⇒ vuelve como texto al modelo`,
    applicability: [
      {
        when: "El modelo necesita datos o acciones del mundo real",
        detail: "Consultar, calcular, escribir, buscar: todo lo que no está en sus pesos.",
      },
      {
        when: "Querés auditar qué hizo el agente",
        detail: "Con herramientas reificadas, cada acción queda registrada con sus argumentos.",
      },
      {
        when: "Hay acciones irreversibles en juego",
        detail: "El patrón provee el punto donde exigir confirmación humana.",
      },
    ],
    steps: [
      "Escribí la función normal, con type hints y docstring: son la fuente del esquema.",
      "Registrala con un decorador que derive el esquema JSON de la firma.",
      "Escribí la descripción pensando en el modelo: es su única documentación.",
      "Marcá las herramientas que mutan estado y exigí aprobación.",
      "Devolvé los errores como texto: el modelo puede corregirse y reintentar.",
      "Validá y limitá siempre los argumentos: vienen de un texto generado, no de tu código.",
    ],
    pros: [
      "El modelo accede a datos frescos y a cálculos exactos.",
      "Cada acción queda auditada y es testeable como función común.",
      "Los permisos y la aprobación humana quedan en un solo lugar.",
      "El catálogo se genera solo desde la firma: no se desincroniza.",
    ],
    cons: [
      "Un catálogo grande confunde al modelo y consume contexto.",
      "Las descripciones mal escritas producen invocaciones erróneas.",
      "Ampliar la superficie de acción amplía la superficie de ataque.",
    ],
    pythonNotes: [
      {
        title: "`inspect.signature` + `get_type_hints`",
        body:
          "Derivar el esquema de la firma real evita el bug clásico de que el esquema y la función se desincronicen.",
      },
      {
        title: "Nunca `eval` sobre lo que devuelve el modelo",
        body:
          "Si necesitás una calculadora, validá la expresión con una expresión regular estricta o usá `ast.literal_eval` / un parser propio.",
      },
      {
        title: "El error es información, no una excepción",
        body:
          "Capturar y devolver `ERROR: …` como resultado deja que el modelo corrija los argumentos en el siguiente turno.",
      },
    ],
    relations: [
      "Es Command: la acción reificada con sus metadatos, invocable por nombre y auditable.",
      "El registro es un Registry / Factory.",
      "Base del Agente ReAct y del Orquestador-Trabajadores.",
    ],
    related: ["command", "agente-react", "guardarrailes", "registro-de-modelos"],
    samples: [
      {
        title: "Registro con esquema derivado de la firma y aprobación humana",
        path: "ejemplos/ia/herramientas-del-agente.py",
        outputPath: "ejemplos/ia/herramientas-del-agente.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Qué debería pasar si el modelo invoca una herramienta con argumentos inválidos?",
        options: [
          "Devolverle el error como texto para que pueda corregirse",
          "Cortar la ejecución con una excepción no capturada",
          "Ejecutar igual con valores por defecto",
          "Reintentar la misma llamada indefinidamente",
        ],
        answer: 0,
        why: "El error como observación es información útil para el siguiente turno; una excepción sin capturar tira abajo el bucle del agente.",
      },
      {
        q: "¿Por qué derivar el esquema de la firma de la función?",
        options: [
          "Para que el esquema publicado y la función nunca se desincronicen",
          "Para que la función sea más rápida",
          "Porque lo exige JSON Schema",
          "Para ahorrar tokens",
        ],
        answer: 0,
        why: "Un esquema escrito a mano se desactualiza en el primer refactor, y el modelo empieza a mandar parámetros que ya no existen.",
      },
    ],
    exercises: [
      "Agregá soporte para parámetros opcionales con default y verificá cómo cambia el `required` del esquema.",
      "Implementá un límite de invocaciones por herramienta y por sesión.",
      "Registrá cada invocación con sus argumentos y resultado en un archivo de auditoría.",
    ],
    difficulty: 2,
    popularity: 3,
  },
  {
    slug: "agente-react",
    name: "Agente ReAct",
    aka: ["Razonar y Actuar", "Bucle de agente"],
    track: "ia",
    family: "llm",
    tagline: "Pensamiento → Acción → Observación, en un bucle que controla tu código.",
    intent:
      "Resolver tareas cuya cantidad de pasos no se conoce de antemano, alternando razonamiento del modelo con ejecución de herramientas, bajo límites que impone la aplicación.",
    problem: [
      "Una tubería fija no sirve cuando la cantidad de pasos depende de lo que se vaya descubriendo: primero hay que buscar un dato, y recién con ese dato se sabe qué hacer después.",
      "Pero un bucle sin límites es una factura sin límites: el modelo puede quedar dando vueltas para siempre.",
    ],
    solution: [
      "Un bucle donde el modelo emite un pensamiento y una acción; tu código ejecuta la acción y le devuelve la observación. Se repite hasta que emite una respuesta final.",
      "El control lo tiene tu código: tope de iteraciones, presupuesto de tokens, herramientas permitidas y una salida digna cuando se agota el límite.",
    ],
    analogy: {
      title: "El detective",
      body: [
        "No sabe de antemano cuántas pistas va a necesitar. Piensa, va a buscar un dato, lo mira y decide el próximo paso. Lo que evita que investigue para siempre es el plazo, no su criterio.",
      ],
    },
    diagram: `        ┌──────────────────────────────────┐
        ▼                                  │
 ┌─────────────┐   ┌──────────┐   ┌─────────────┐
 │ Pensamiento │──▶│  Acción  │──▶│ Observación │
 └─────────────┘   └──────────┘   └─────────────┘
        │            (tu código ejecuta la herramienta)
        └──▶ Respuesta final  ✔      ⏱ tope de pasos ⇒ salida digna`,
    applicability: [
      {
        when: "La cantidad de pasos depende de los resultados intermedios",
        detail: "Investigación, diagnóstico, tareas exploratorias.",
      },
      {
        when: "Hay herramientas disponibles y la elección de cuál usar es parte del problema",
        detail: "Si siempre se usan las mismas en el mismo orden, una tubería es mejor.",
      },
    ],
    steps: [
      "Definí el formato de salida esperado (Pensamiento/Acción/Respuesta) y parsealo con tolerancia.",
      "Implementá el bucle en tu código, nunca dentro del prompt.",
      "Poné un tope de iteraciones y un presupuesto de tokens desde el primer día.",
      "Manejá el formato inválido: avisale al modelo y seguí, en vez de reventar.",
      "Definí qué se responde cuando se agota el límite: nunca dejar al usuario sin respuesta.",
      "Registrá la traza completa: es la única forma de depurar un agente.",
    ],
    pros: [
      "Resuelve tareas que una tubería fija no puede.",
      "La traza es legible: se ve por qué hizo lo que hizo.",
      "Se adapta a herramientas nuevas sin cambiar el bucle.",
    ],
    cons: [
      "Costo y latencia variables e impredecibles.",
      "Puede entrar en bucles improductivos repitiendo la misma acción.",
      "Los errores del modelo se acumulan a lo largo de la traza.",
      "Es mucho más difícil de testear que una tubería determinista.",
    ],
    pythonNotes: [
      {
        title: "Parseo tolerante con `re`",
        body:
          "El modelo se sale del formato tarde o temprano. Buscá primero la respuesta final, después la acción, y tené un camino para «no entendí, reformulá».",
      },
      {
        title: "Detectá la repetición",
        body:
          "Guardá un conjunto de (acción, argumento) ya ejecutados: si se repite, avisale al modelo en vez de gastar otra vuelta.",
      },
      {
        title: "El historial crece rápido",
        body:
          "Cada vuelta agrega dos mensajes. Combiná con Memoria de Conversación o el presupuesto se agota antes que el bucle.",
      },
    ],
    relations: [
      "Usa Herramientas del Agente (Command) como catálogo de acciones.",
      "El parseo de la salida es un Intérprete simple.",
      "Con Guardarraíles para acotar qué puede ejecutar, y con Memoria para no explotar el contexto.",
    ],
    related: [
      "herramientas-del-agente",
      "guardarrailes",
      "memoria-de-conversacion",
      "orquestador-trabajadores",
    ],
    samples: [
      {
        title: "Bucle ReAct completo con herramientas y tope de pasos",
        path: "ejemplos/ia/agente-react.py",
        outputPath: "ejemplos/ia/agente-react.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Quién debe controlar el bucle del agente?",
        options: [
          "Tu código, con topes explícitos de pasos y presupuesto",
          "El modelo, decidiendo cuándo parar",
          "El proveedor del LLM",
          "El usuario, cancelando manualmente",
        ],
        answer: 0,
        why: "El modelo puede quedar iterando indefinidamente. El límite duro tiene que estar en el código, no en una instrucción del prompt.",
      },
      {
        q: "¿Qué conviene hacer cuando el modelo devuelve un formato inválido?",
        options: [
          "Avisarle del error y darle otra vuelta dentro del límite",
          "Lanzar una excepción y terminar",
          "Ignorar el turno silenciosamente",
          "Reiniciar la conversación desde cero",
        ],
        answer: 0,
        why: "Es un error recuperable: informarlo suele bastar para que el siguiente turno respete el formato, sin perder el trabajo hecho.",
      },
    ],
    exercises: [
      "Agregá detección de acciones repetidas y una advertencia al modelo.",
      "Sumá un presupuesto de tokens que corte el bucle antes que el tope de pasos.",
      "Hacé que la traza se guarde en JSON para poder reproducir la ejecución en un test.",
    ],
    difficulty: 3,
    popularity: 3,
  },
  {
    slug: "rag",
    name: "RAG",
    aka: ["Generación Aumentada por Recuperación", "Retrieval-Augmented Generation"],
    track: "ia",
    family: "llm",
    tagline: "Recuperar los fragmentos relevantes y hacer que el modelo responda solo con eso.",
    intent:
      "Inyectar en el prompt, en tiempo de consulta, los fragmentos de tu corpus relevantes para la pregunta, exigiendo citas y permitiendo la abstención.",
    problem: [
      "El modelo no conoce tus documentos internos. Poner el corpus entero en el prompt no entra y sería carísimo. Y sin fuentes, cuando no sabe, inventa con total seguridad.",
      "Reentrenar el modelo para cada cambio de documentación no es viable.",
    ],
    solution: [
      "Indexá el corpus en fragmentos. Ante una consulta, recuperá los k más relevantes e inyectalos como contexto delimitado, con instrucción de citar y de abstenerse si no alcanza.",
      "El recuperador es intercambiable: léxico (bueno para siglas y códigos), denso (bueno para sinónimos) o híbrido (fusiona ambos rankings y casi siempre gana).",
    ],
    analogy: {
      title: "El examen a libro abierto",
      body: [
        "No se te pide memorizar el código civil: se te pide encontrar el artículo que aplica y citarlo. La habilidad que se evalúa es buscar bien y no inventar lo que no está en el libro.",
      ],
    },
    diagram: `  consulta ──▶ recuperador ──▶ k fragmentos + puntaje
                    │              │
      ┌─────────────┼──────────┐   ▼  ¿supera el umbral?
   léxico       denso      híbrido      no ⇒ "no sé" (abstención)
   (BM25)      (coseno)     (RRF)       sí ⇓
                                   prompt = contexto + pregunta
                                        ▼
                                     respuesta con [citas]`,
    applicability: [
      {
        when: "Las respuestas deben basarse en documentación propia y cambiante",
        detail: "Manuales, políticas, tickets, código, catálogos de producto.",
      },
      {
        when: "Necesitás poder citar la fuente",
        detail: "Trazabilidad, cumplimiento normativo, confianza del usuario.",
      },
      {
        when: "El corpus cambia más rápido de lo que podrías reentrenar",
        detail: "Actualizar el índice es minutos; reentrenar, semanas.",
      },
    ],
    steps: [
      "Fragmentá el corpus con criterio semántico (por sección, no cada N caracteres a ciegas) y guardá metadatos: fuente, fecha, permisos.",
      "Elegí el recuperador. Empezá por el híbrido: gana casi siempre y no es mucho más difícil.",
      "Definí k y un umbral de relevancia. El umbral es lo que habilita la abstención.",
      "Inyectá el contexto delimitado y exigí citas por identificador.",
      "Evaluá recuperación y generación por separado: la mayoría de los errores de RAG son de recuperación.",
    ],
    pros: [
      "Respuestas actualizadas sin reentrenar.",
      "Citas verificables: el usuario puede ir a la fuente.",
      "Permite abstenerse en vez de inventar.",
      "Control de permisos por documento en la etapa de recuperación.",
    ],
    cons: [
      "Si la recuperación falla, la generación no puede salvarla.",
      "La fragmentación es un arte: fragmentos muy chicos pierden contexto, muy grandes traen ruido.",
      "Latencia y costo extra de indexación y búsqueda.",
      "El contexto largo diluye la atención del modelo: más fragmentos no es siempre mejor.",
    ],
    pythonNotes: [
      {
        title: "El coseno sobre diccionarios dispersos alcanza para aprender",
        body:
          "Antes de instalar una base vectorial, implementá la similitud a mano: entender qué mide el coseno cambia cómo diseñás la fragmentación.",
      },
      {
        title: "Fusión de rankings (RRF)",
        body:
          "`1 / (k + posición)` sumado entre recuperadores es sorprendentemente robusto y no requiere normalizar puntajes de escalas distintas.",
      },
      {
        title: "El umbral es una decisión de producto",
        body:
          "Abstenerse cuesta usabilidad; alucinar cuesta confianza. Ese equilibrio no lo decide el código: hay que medirlo con casos reales.",
      },
    ],
    relations: [
      "El recuperador es una Strategy intercambiable; el híbrido es un Composite de recuperadores.",
      "Se combina con Caché Semántica, Guardarraíles (verificar citas) y Evaluador-Optimizador.",
    ],
    related: ["strategy", "composite", "cache-semantica", "guardarrailes"],
    samples: [
      {
        title: "Tres recuperadores intercambiables y abstención por umbral",
        path: "ejemplos/ia/rag.py",
        outputPath: "ejemplos/ia/rag.salida.txt",
      },
    ],
    quiz: [
      {
        q: "Si un sistema RAG responde mal, ¿dónde suele estar el problema?",
        options: [
          "En la recuperación: el fragmento correcto nunca llegó al prompt",
          "En la temperatura del modelo",
          "En el tamaño del modelo",
          "En el formato de la respuesta",
        ],
        answer: 0,
        why: "Por eso conviene evaluar recuperación (¿estaba el fragmento correcto entre los k?) y generación (¿usó bien lo recuperado?) como dos métricas separadas.",
      },
      {
        q: "¿Para qué sirve el umbral de relevancia?",
        options: [
          "Para permitir que el sistema se abstenga cuando no encuentra nada útil",
          "Para ordenar los resultados",
          "Para reducir el tamaño del índice",
          "Para elegir el modelo",
        ],
        answer: 0,
        why: "Sin umbral, siempre se inyectan k fragmentos aunque sean irrelevantes, y el modelo construye una respuesta con material que no corresponde.",
      },
      {
        q: "¿Qué ventaja tiene el recuperador híbrido?",
        options: [
          "Combina coincidencia exacta (siglas, códigos) con similitud semántica (sinónimos)",
          "Es más rápido que los otros dos",
          "No necesita índice",
          "Elimina la necesidad de citar",
        ],
        answer: 0,
        why: "El denso falla con identificadores raros y el léxico con paráfrasis; la fusión de rankings cubre las dos debilidades.",
      },
    ],
    exercises: [
      "Agregá reordenamiento (rerank) de los k recuperados con un segundo criterio y medí si mejora.",
      "Sumá metadatos de permisos y filtrá los fragmentos que el usuario no puede ver, antes de generar.",
      "Escribí una evaluación que mida, sobre 10 preguntas, si el fragmento correcto está entre los recuperados.",
    ],
    difficulty: 2,
    popularity: 3,
  },
  {
    slug: "memoria-de-conversacion",
    name: "Memoria de Conversación",
    aka: ["Conversation Memory", "Gestión de contexto"],
    track: "ia",
    family: "llm",
    tagline: "Decidir qué del pasado entra en el prompt, y qué no.",
    intent:
      "Separar el historial completo de la conversación de lo que efectivamente se envía al modelo, con una política explícita de selección.",
    problem: [
      "Mandar toda la charla en cada turno hace que el costo crezca de forma cuadrática y que en algún momento se corte por límite de contexto.",
      "Pero truncar sin criterio hace que el asistente olvide el nombre del usuario a los cinco turnos.",
    ],
    solution: [
      "Modelá la memoria como una estrategia con dos operaciones: agregar un mensaje y producir el contexto para la consulta actual.",
      "Las políticas típicas: ventana deslizante (barata, olvida rápido), resumen progresivo (comprime el pasado), recuperación por relevancia (trae solo lo que aplica) y hechos fijados (nunca se descartan).",
    ],
    analogy: {
      title: "La libreta del terapeuta",
      body: [
        "No relee las 40 sesiones antes de cada consulta: tiene una hoja con los datos permanentes, un resumen del proceso y las notas de la última vez. Y si aparece un tema viejo, va a buscar esa sesión puntual.",
      ],
    },
    diagram: `  historial completo (verdad)      contexto enviado (elección)
 ┌───────────────────────┐        ┌────────────────────────┐
 │ m1 m2 m3 … m40        │───────▶│ resumen(m1..m36)       │
 └───────────────────────┘        │ + m37 m38 m39 m40      │
   política:                      └────────────────────────┘
   ventana | resumen | relevancia | hechos fijados`,
    applicability: [
      {
        when: "Las conversaciones son largas o el contexto es caro",
        detail: "Asistentes, soporte, copilotos: todo lo que dure más de unos pocos turnos.",
      },
      {
        when: "Hay datos que nunca se deben olvidar",
        detail: "Nombre, idioma, preferencias, restricciones: van como hechos fijados, no al azar de la ventana.",
      },
    ],
    steps: [
      "Guardá siempre el historial completo por separado: es tu registro, y no depende de la política.",
      "Elegí la política más simple que cumpla el objetivo; medí antes de complicarla.",
      "Definí un presupuesto de tokens para el contexto y hacelo cumplir.",
      "Extraé los hechos permanentes a una sección aparte que nunca se descarta.",
      "Medí: costo por turno y tasa de «olvidos» en casos de prueba.",
    ],
    pros: [
      "Costo por turno acotado y predecible.",
      "Conversaciones largas sin cortes por límite de contexto.",
      "Las políticas se comparan objetivamente con los mismos casos.",
    ],
    cons: [
      "Todo resumen pierde información, y no se sabe cuál hasta que hace falta.",
      "Resumir cuesta una llamada extra al modelo.",
      "La recuperación por relevancia puede traer fragmentos fuera de orden y confundir.",
    ],
    pythonNotes: [
      {
        title: "`Protocol` con dos métodos",
        body:
          "`agregar` y `contexto` alcanzan para que todas las políticas sean intercambiables y comparables en el mismo banco de pruebas.",
      },
      {
        title: "Reordená cronológicamente lo recuperado",
        body:
          "Si traés mensajes viejos por relevancia, devolvelos en orden temporal: el modelo interpreta mal una conversación desordenada.",
      },
      {
        title: "Los hechos permanentes van en el mensaje de sistema",
        body:
          "Es el lugar con más peso y el que menos se recorta. Guardarlos ahí es más confiable que esperar que sobrevivan en la ventana.",
      },
    ],
    relations: [
      "Es Strategy sobre el historial, con Memento en el resumen (una foto comprimida del pasado).",
      "La política por relevancia es RAG aplicado a la propia conversación.",
    ],
    related: ["strategy", "memento", "rag", "agente-react"],
    samples: [
      {
        title: "Cuatro políticas comparadas sobre la misma charla",
        path: "ejemplos/ia/memoria-de-conversacion.py",
        outputPath: "ejemplos/ia/memoria-de-conversacion.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Por qué conviene guardar el historial completo aparte del contexto enviado?",
        options: [
          "Porque el historial es el registro real y la política de contexto puede cambiar",
          "Porque ocupa menos memoria",
          "Porque el modelo lo exige",
          "Porque acelera la respuesta",
        ],
        answer: 0,
        why: "Separarlos permite cambiar la política, reprocesar conversaciones viejas y auditar qué pasó realmente.",
      },
      {
        q: "Al recuperar mensajes viejos por relevancia, ¿qué precaución hay que tomar?",
        options: [
          "Devolverlos en orden cronológico",
          "Convertirlos a mayúsculas",
          "Duplicar el último mensaje",
          "Eliminar el mensaje de sistema",
        ],
        answer: 0,
        why: "Un contexto con la conversación desordenada lleva al modelo a inferir secuencias de eventos que nunca ocurrieron.",
      },
    ],
    exercises: [
      "Implementá una política híbrida: hechos fijados + resumen + últimos 4 mensajes.",
      "Agregá un presupuesto de tokens que recorte automáticamente al armar el contexto.",
      "Armá un banco de 5 preguntas de memoria y comparé las políticas objetivamente.",
    ],
    difficulty: 2,
    popularity: 3,
  },
  {
    slug: "guardarrailes",
    name: "Guardarraíles",
    aka: ["Guardrails", "Barreras de seguridad"],
    track: "ia",
    family: "llm",
    tagline: "Validar la entrada y la salida fuera del modelo, siempre.",
    intent:
      "Aplicar una cadena de validadores deterministas antes y después de la llamada al modelo, con capacidad de aceptar, transformar o bloquear, y con registro del motivo.",
    problem: [
      "Un usuario puede intentar una inyección de prompt; el modelo puede devolver datos personales, salirse de tema o filtrar el prompt de sistema.",
      "Pedirle amablemente al modelo que no lo haga no es un control: es una sugerencia estadística.",
    ],
    solution: [
      "Poné una cadena de barreras en la entrada (inyección, credenciales, datos personales) y otra en la salida (redacción de PII, fugas, longitud, tono).",
      "Cada barrera acepta, transforma o bloquea, y deja el motivo registrado. La cadena de salida corre siempre, aunque el modelo «se haya portado bien».",
    ],
    analogy: {
      title: "El control de seguridad del aeropuerto",
      body: [
        "No alcanza con preguntar «¿lleva algo prohibido?». Hay un escáner a la entrada y controles a la salida del área restringida. Cada control es simple, rápido y deja registro.",
      ],
    },
    diagram: `  entrada ──▶ [inyección] ─▶ [credenciales] ─▶ [PII] ──┐
                  ⛔               ⛔            ✎ enmascara │
                                                            ▼
                                                         MODELO
                                                            │
  respuesta ◀── [longitud] ◀── [fuga] ◀── [PII salida] ◀────┘
                    ✎            ⛔          ✎ redacta`,
    applicability: [
      {
        when: "La salida llega a un usuario final o a otro sistema",
        detail: "Todo lo que sale de tu app es tu responsabilidad, no del proveedor del modelo.",
      },
      {
        when: "Manejás datos personales o regulados",
        detail: "Enmascarar en la entrada y redactar en la salida son requisitos, no mejoras.",
      },
      {
        when: "El texto del usuario llega al prompt",
        detail: "Toda entrada libre es un vector de inyección de instrucciones.",
      },
    ],
    steps: [
      "Listá qué no puede pasar nunca (bloqueos) y qué se puede corregir (transformaciones).",
      "Implementá cada regla como una función independiente y testeable.",
      "Ordená la cadena: primero lo barato y lo que corta, después lo costoso.",
      "Registrá qué barrera actuó y por qué: sin eso, no hay ajuste posible.",
      "Definí el mensaje al usuario cuando se bloquea: honesto y sin revelar la regla.",
      "Testeá con casos adversarios reales, no solo con el camino feliz.",
    ],
    pros: [
      "Control determinista, auditable y testeable, independiente del modelo.",
      "Funciona igual si mañana cambiás de proveedor.",
      "Cada regla se agrega, se ordena o se desactiva sin tocar las demás.",
    ],
    cons: [
      "Falsos positivos: una barrera agresiva bloquea consultas legítimas.",
      "Las expresiones regulares no entienden contexto ni variantes creativas.",
      "Agrega latencia y una superficie más de mantenimiento.",
    ],
    pythonNotes: [
      {
        title: "Barreras como funciones que devuelven un veredicto",
        body:
          "Un `Enum` de tres valores (pasa / transforma / bloquea) es más expresivo que un booleano y permite encadenar transformaciones.",
      },
      {
        title: "`re.subn` devuelve la cuenta",
        body:
          "Saber cuántas veces se enmascaró algo es la métrica que después te dice si la regla es demasiado agresiva.",
      },
      {
        title: "No confíes solo en regex",
        body:
          "Para PII conviene combinar patrones con validación (dígito verificador, longitud) y, en casos críticos, un clasificador. Y siempre medir falsos positivos.",
      },
    ],
    relations: [
      "Es Chain of Responsibility, con las barreras como Specification componibles.",
      "Se combina con Salida Estructurada (validar forma) y con Herramientas del Agente (aprobar acciones peligrosas).",
    ],
    related: [
      "chain-of-responsibility",
      "salida-estructurada",
      "herramientas-del-agente",
      "validacion-de-datos",
    ],
    samples: [
      {
        title: "Cadenas de entrada y salida con bloqueo, enmascarado y registro",
        path: "ejemplos/ia/guardarrailes.py",
        outputPath: "ejemplos/ia/guardarrailes.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Por qué la cadena de salida debe correr siempre?",
        options: [
          "Porque la salida del modelo no es determinista y no se puede garantizar por prompt",
          "Porque acelera la respuesta",
          "Porque lo exige el SDK",
          "No hace falta si el prompt es bueno",
        ],
        answer: 0,
        why: "Un prompt bien escrito baja la probabilidad de un problema, pero no la elimina. El control determinista es lo único que da garantías.",
      },
      {
        q: "¿Cuál es el costo principal de una barrera agresiva?",
        options: [
          "Falsos positivos que bloquean consultas legítimas",
          "Mayor consumo de tokens",
          "Que el modelo deje de responder",
          "Que se pierdan las citas",
        ],
        answer: 0,
        why: "Por eso hay que medir la tasa de bloqueo y revisar muestras: una barrera que bloquea el 5% del tráfico legítimo es un problema de producto.",
      },
    ],
    exercises: [
      "Agregá una barrera de «fuera de tema» y medí cuántas consultas legítimas bloquea.",
      "Hacé que los bloqueos se registren con un identificador para poder revisarlos después.",
      "Escribí 10 casos adversarios de inyección y verificá cuáles pasan las barreras actuales.",
    ],
    difficulty: 2,
    popularity: 3,
  },
  {
    slug: "salida-estructurada",
    name: "Salida Estructurada",
    aka: ["Structured Output", "Parseo con reparación"],
    track: "ia",
    family: "llm",
    tagline: "Del texto libre a un objeto de dominio validado, con reintento informado.",
    intent:
      "Obtener del modelo datos con forma conocida: declarar el esquema, parsear con tolerancia, validar contra el dominio y reintentar mostrando el error concreto.",
    problem: [
      "Necesitás un objeto tipado, pero el modelo devuelve texto con un ```json de más, una coma final o un campo con un valor inventado.",
      "Parsear con expresiones regulares y esperanza funciona en la demo y falla en producción, en silencio.",
    ],
    solution: [
      "Declará el esquema en el prompt. Parseá con tolerancia (quitar cercos, recortar al primer `{`, sacar comas finales). Validá contra tu dominio, no solo contra JSON.",
      "Si la validación falla, reintentá devolviéndole al modelo el error exacto. Un bucle de reparación de dos o tres vueltas resuelve la enorme mayoría de los casos.",
    ],
    analogy: {
      title: "El formulario devuelto con observaciones",
      body: [
        "El empleado no descarta tu trámite: te marca «falta el CUIT» y te lo devuelve. Corregís solo eso. Devolver el trámite sin decir qué está mal garantiza que vuelva igual de mal.",
      ],
    },
    diagram: `  prompt + esquema ──▶ modelo ──▶ texto
                                    │
                      extraer_json (tolerante)
                                    │
                         validar contra el dominio
                          ✔ objeto        ✘ error
                                            │
                     "tu respuesta fue inválida: <error>"
                                            └──▶ reintento (máx. N)`,
    applicability: [
      {
        when: "La salida alimenta a otro sistema",
        detail: "Base de datos, API, cola de trabajos: cualquier consumidor que no sea un humano.",
      },
      {
        when: "Necesitás clasificar, extraer o etiquetar",
        detail: "Casos donde el resultado es un conjunto acotado de valores, no prosa.",
      },
    ],
    steps: [
      "Definí el objeto de dominio con su validación (rangos, enumeraciones, obligatorios).",
      "Derivá el esquema que le mostrás al modelo desde ese objeto, no al revés.",
      "Escribí un parseo tolerante a las variaciones más comunes.",
      "Validá y, si falla, reintentá con el error concreto incluido en el prompt.",
      "Poné un tope de reintentos y definí el comportamiento al agotarlo.",
      "Si el proveedor soporta salida estructurada nativa, usala: reduce, pero no elimina, la necesidad de validar.",
    ],
    pros: [
      "El resto del sistema recibe objetos tipados, no texto.",
      "La validación de dominio atrapa valores plausibles pero incorrectos.",
      "El bucle de reparación sube muchísimo la tasa de éxito con muy poco código.",
    ],
    cons: [
      "Cada reintento cuesta tiempo y dinero.",
      "Un esquema muy complejo baja la calidad de la respuesta.",
      "El parseo tolerante puede aceptar algo que no era lo que el modelo quiso decir.",
    ],
    pythonNotes: [
      {
        title: "Validar en un `classmethod`",
        body:
          "`Ticket.desde_dict` concentra la validación y devuelve un objeto inmutable: el resto del código ya no verifica nada.",
      },
      {
        title: "Pydantic en producción",
        body:
          "El ejemplo usa la biblioteca estándar para que se entienda el mecanismo; en un proyecto real, Pydantic te da el esquema JSON y los mensajes de error gratis.",
      },
      {
        title: "El mensaje de error es parte del prompt",
        body:
          "«prioridad debe estar entre 1 y 5» hace que el modelo corrija; «ValidationError» no le dice nada. Escribí los errores pensando en quién los va a leer.",
      },
    ],
    relations: [
      "Es Adapter (texto → objeto) + Builder (construcción validada) con un bucle de reparación.",
      "Se combina con Guardarraíles y con Herramientas del Agente (los argumentos también son salida estructurada).",
    ],
    related: ["adapter", "builder", "guardarrailes", "herramientas-del-agente"],
    samples: [
      {
        title: "Parseo tolerante, validación de dominio y reintento informado",
        path: "ejemplos/ia/salida-estructurada.py",
        outputPath: "ejemplos/ia/salida-estructurada.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Qué hace que el reintento sea efectivo?",
        options: [
          "Incluir el error de validación concreto en el nuevo prompt",
          "Subir la temperatura",
          "Repetir el mismo prompt sin cambios",
          "Cambiar de modelo en cada intento",
        ],
        answer: 0,
        why: "Sin el error, el modelo no tiene motivo para responder distinto. Con el error, la corrección suele salir en el segundo intento.",
      },
      {
        q: "¿Por qué no alcanza con validar que el JSON sea válido?",
        options: [
          "Porque un JSON bien formado puede tener valores fuera del dominio",
          "Porque JSON no soporta números",
          "Porque el modelo nunca devuelve JSON válido",
          "Porque el parseo es lento",
        ],
        answer: 0,
        why: "`{\"categoria\": \"billing\"}` es JSON perfecto y aun así inválido si tus categorías son otras. La validación de dominio es la que importa.",
      },
    ],
    exercises: [
      "Reescribí el ejemplo con Pydantic y compará la cantidad de código.",
      "Agregá una métrica de cuántos intentos hizo falta en promedio.",
      "Hacé que después de N intentos fallidos se derive el caso a revisión humana.",
    ],
    difficulty: 2,
    popularity: 3,
  },
  {
    slug: "cache-semantica",
    name: "Caché Semántica",
    aka: ["Semantic Cache"],
    track: "ia",
    family: "llm",
    tagline: "Reusar respuestas de preguntas parecidas, no solo idénticas.",
    intent:
      "Interponer una caché que busca por similitud en vez de por clave exacta, para evitar llamadas repetidas al modelo cuando la pregunta es equivalente.",
    problem: [
      "«¿Cómo pido vacaciones?» y «cómo solicito las vacaciones» son la misma consulta y una caché por clave exacta nunca acierta.",
      "Cada fallo cuesta dinero y agrega latencia, en preguntas que ya se respondieron cien veces.",
    ],
    solution: [
      "Guardá el vector de cada consulta junto a su respuesta. Ante una consulta nueva, buscá la más parecida; si supera el umbral, devolvé la respuesta guardada.",
      "El umbral y el TTL son decisiones de producto: un umbral bajo responde la pregunta de otro.",
    ],
    analogy: {
      title: "Las preguntas frecuentes del mostrador",
      body: [
        "El empleado no consulta el manual cada vez: reconoce la pregunta aunque venga con otras palabras y responde de memoria. El riesgo es contestar de memoria una pregunta que solo *parecía* la misma.",
      ],
    },
    diagram: `  consulta ──▶ embeber ──▶ buscar el vecino más cercano
                                   │
                     similitud ≥ umbral ?
                       sí ⇒ HIT (0 ms, $0)
                       no ⇒ MISS ⇒ modelo ⇒ guardar (vector, respuesta, ttl)`,
    applicability: [
      {
        when: "Hay repetición real en las consultas",
        detail: "Soporte, FAQ, asistentes internos. Medí la repetición antes de implementarla.",
      },
      {
        when: "El costo o la latencia del modelo son un problema",
        detail: "Un 40% de aciertos es un 40% menos de gasto en esa ruta.",
      },
    ],
    steps: [
      "Medí primero cuántas consultas se repiten semánticamente: si es poco, no vale la pena.",
      "Elegí el modelo de embeddings y guardá el vector junto a la respuesta.",
      "Fijá un umbral inicial alto y bajalo con evidencia, midiendo falsos positivos.",
      "Definí TTL e invalidación: una respuesta cacheada sobre datos que cambiaron es peor que un fallo.",
      "Nunca caches respuestas personalizadas sin incluir la identidad en la clave.",
    ],
    pros: [
      "Ahorro directo de costo y latencia.",
      "Respuestas consistentes ante la misma pregunta.",
      "Absorbe picos de tráfico sobre las mismas consultas.",
    ],
    cons: [
      "Falsos positivos: responder la pregunta equivocada con total seguridad.",
      "Respuestas obsoletas si los datos cambian y no hay invalidación.",
      "Riesgo grave de filtrar información entre usuarios si la clave no incluye el contexto de permisos.",
    ],
    pythonNotes: [
      {
        title: "Mismo método, otro objeto",
        body:
          "Que la caché exponga `completar` igual que el modelo la vuelve un sustituto transparente: se activa y se desactiva cambiando una línea.",
      },
      {
        title: "El TTL se limpia al leer",
        body:
          "Purgar las entradas vencidas en cada búsqueda evita un hilo de limpieza y mantiene el ejemplo entendible.",
      },
      {
        title: "La clave incluye el contexto",
        body:
          "Usuario, idioma, versión del prompt y permisos deben formar parte de la clave. Si no, la caché filtra respuestas entre contextos distintos.",
      },
    ],
    relations: [
      "Es Proxy de caché, con la diferencia de que el acierto es aproximado.",
      "Se combina con Enrutador de Modelos (cachear antes de enrutar) y con RAG (cachear la recuperación).",
    ],
    related: ["proxy", "enrutador-de-modelos", "rag", "flyweight"],
    samples: [
      {
        title: "Caché por similitud con umbral, TTL y estadísticas",
        path: "ejemplos/ia/cache-semantica.py",
        outputPath: "ejemplos/ia/cache-semantica.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Cuál es el riesgo más grave de una caché semántica?",
        options: [
          "Devolver con total seguridad la respuesta de otra pregunta",
          "Ocupar mucha memoria",
          "Aumentar la latencia",
          "Impedir el uso de RAG",
        ],
        answer: 0,
        why: "Un falso positivo no se ve como error: el usuario recibe una respuesta coherente pero incorrecta. Por eso el umbral se baja con evidencia, no por intuición.",
      },
      {
        q: "¿Qué debe formar parte de la clave de caché?",
        options: [
          "Usuario, permisos, idioma y versión del prompt, además de la consulta",
          "Solo el texto de la consulta",
          "El timestamp",
          "El nombre del modelo únicamente",
        ],
        answer: 0,
        why: "Si dos usuarios con permisos distintos comparten entrada de caché, uno puede recibir información que no le corresponde.",
      },
    ],
    exercises: [
      "Agregá el id de usuario a la clave y verificá que no se comparten respuestas.",
      "Instrumentá falsos positivos: guardá los aciertos y revisá manualmente 20 casos.",
      "Implementá invalidación por evento: al actualizar un documento, purgar lo relacionado.",
    ],
    difficulty: 2,
    popularity: 2,
  },
  {
    slug: "cascada-de-respaldo",
    name: "Cascada de Respaldo",
    aka: ["Fallback Cascade", "Model Cascade", "Cortacircuitos"],
    track: "ia",
    family: "llm",
    tagline: "Reintentar, degradar y no dejar nunca al usuario sin respuesta.",
    intent:
      "Definir una secuencia ordenada de intentos —con reintentos, espera exponencial y cortacircuitos— que termina siempre en una respuesta, aunque sea degradada.",
    problem: [
      "Los proveedores devuelven 429 y 503, tienen cortes y a veces se ponen lentos. Un `try/except` alrededor de la llamada no es una estrategia de resiliencia.",
      "Y reintentar sin límite contra un servicio caído empeora el problema para todos.",
    ],
    solution: [
      "Ordená niveles: modelo barato, modelo capaz, otro proveedor, respuesta degradada. Dentro de cada nivel, reintentos con espera exponencial y jitter.",
      "Un cortacircuitos por nivel deja de intentar tras N fallos consecutivos y se reactiva después de un enfriamiento.",
    ],
    analogy: {
      title: "El grupo electrógeno",
      body: [
        "Primero la red. Si se corta, la batería. Si se agota, el generador. Y si nada anda, las luces de emergencia: poco, pero nunca oscuridad total. Además, el interruptor diferencial evita que sigas insistiendo sobre un circuito quemado.",
      ],
    },
    diagram: ` nivel 1 (barato)   ✗✗ → cortacircuitos ABIERTO (se saltea 30 s)
      │
      ▼
 nivel 2 (capaz)    ✗ reintento (20 ms) ✓
      │
      ▼
 nivel 3 (otro proveedor)
      │
      ▼
 degradado: "Estamos con problemas; te respondemos por email."`,
    applicability: [
      {
        when: "El servicio debe responder aunque el proveedor falle",
        detail: "Cualquier funcionalidad en el camino crítico del usuario.",
      },
      {
        when: "Querés intentar primero con un modelo barato",
        detail: "La cascada sirve para costo y para resiliencia al mismo tiempo.",
      },
    ],
    steps: [
      "Definí los niveles del más barato/rápido al más caro/lento, y la respuesta degradada final.",
      "Agregá reintentos solo para errores transitorios (429, 5xx, timeouts), nunca para un 400.",
      "Usá espera exponencial con jitter: sin jitter, todos los clientes reintentan a la vez.",
      "Agregá un cortacircuitos por nivel para no golpear a un servicio caído.",
      "Registrá qué nivel resolvió cada consulta: es la métrica de salud del sistema.",
    ],
    pros: [
      "Disponibilidad muy superior a la de cualquier proveedor individual.",
      "Degradación explícita y honesta en vez de un error 500.",
      "El cortacircuitos protege al servicio caído y a tu latencia.",
    ],
    cons: [
      "La respuesta puede venir de un modelo peor sin que el usuario lo sepa.",
      "Latencia acumulada si varios niveles fallan antes de acertar.",
      "Más configuración: topes, esperas, umbrales, enfriamientos.",
    ],
    pythonNotes: [
      {
        title: "Jitter obligatorio",
        body:
          "`espera * (1 + random() * 0.1)` evita que miles de clientes reintenten en el mismo milisegundo y tiren el servicio justo cuando se recupera.",
      },
      {
        title: "Reintentá solo lo transitorio",
        body:
          "Definí una excepción propia para errores reintentables. Reintentar un error de validación es gastar dinero tres veces por el mismo bug.",
      },
      {
        title: "`tenacity` en producción",
        body:
          "El ejemplo implementa la lógica a mano para que se vea; en un proyecto real, `tenacity` cubre reintentos, esperas y condiciones con menos código.",
      },
    ],
    relations: [
      "Chain of Responsibility (el siguiente que pueda, que responda) + Strategy (los niveles) + Proxy (el cortacircuitos envuelve al proveedor).",
      "Se combina con Adaptador de Proveedor y con Enrutador de Modelos.",
    ],
    related: [
      "chain-of-responsibility",
      "proxy",
      "adaptador-de-proveedor",
      "enrutador-de-modelos",
    ],
    samples: [
      {
        title: "Tres niveles, reintentos con jitter y cortacircuitos",
        path: "ejemplos/ia/cascada-de-respaldo.py",
        outputPath: "ejemplos/ia/cascada-de-respaldo.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Para qué sirve el jitter en la espera exponencial?",
        options: [
          "Para que los clientes no reintenten todos en el mismo instante",
          "Para que la espera sea más corta",
          "Para reducir el costo",
          "Para mejorar la calidad de la respuesta",
        ],
        answer: 0,
        why: "Sin jitter, todos los clientes sincronizan sus reintentos y generan picos que vuelven a tumbar el servicio apenas se recupera.",
      },
      {
        q: "¿Qué errores NO conviene reintentar?",
        options: [
          "Los de validación o de solicitud mal formada (4xx que no sean 429)",
          "Los timeouts",
          "Los 503",
          "Los 429",
        ],
        answer: 0,
        why: "Un error de tu solicitud va a fallar igual las tres veces: reintentarlo solo multiplica el costo y esconde el bug.",
      },
    ],
    exercises: [
      "Agregá un cuarto nivel con un modelo local y probá el comportamiento con todos los remotos caídos.",
      "Instrumentá qué porcentaje de consultas resuelve cada nivel.",
      "Implementá el estado «semiabierto» del cortacircuitos: dejar pasar una consulta de prueba antes de reabrir.",
    ],
    difficulty: 3,
    popularity: 2,
  },
  {
    slug: "orquestador-trabajadores",
    name: "Orquestador y Trabajadores",
    aka: ["Orchestrator–Workers", "Multiagente"],
    track: "ia",
    family: "llm",
    tagline: "Descomponer, repartir entre especialistas y sintetizar.",
    intent:
      "Un orquestador divide la tarea en subtareas, las asigna a trabajadores especializados —posiblemente en paralelo— y combina los resultados en una salida única.",
    problem: [
      "Hay tareas que no se resuelven en una pasada ni con una tubería fija: «analizá estos cuatro informes desde lo financiero, lo legal y lo operativo» requiere trabajos distintos que solo al final se juntan.",
      "Un solo prompt que intente todos los enfoques a la vez produce un promedio mediocre de los tres.",
    ],
    solution: [
      "El orquestador descompone (con reglas o con el modelo), asigna a trabajadores con prompt y modelo propios, y sintetiza. Los trabajadores no se conocen entre sí.",
      "Las subtareas independientes corren en paralelo: como son llamadas de red, un `ThreadPoolExecutor` alcanza.",
    ],
    analogy: {
      title: "El estudio de arquitectura",
      body: [
        "El director de proyecto no calcula la estructura ni dibuja las instalaciones: reparte, fija el criterio común y arma el legajo final. Los especialistas trabajan en paralelo sin coordinarse entre ellos.",
      ],
    },
    diagram: `             ┌────────────────┐
   objetivo ─▶│  Orquestador   │ descompone
             └───┬────┬─────┬──┘
                 ▼    ▼     ▼          (en paralelo)
              datos riesgos legal
                 └────┬─────┘
                      ▼
               síntesis (modelo capaz) ──▶ recomendación`,
    applicability: [
      {
        when: "La tarea tiene subtareas que requieren enfoques o conocimientos distintos",
        detail: "Y esas subtareas son en buena medida independientes.",
      },
      {
        when: "Podés ganar latencia paralelizando",
        detail: "Tres llamadas en paralelo tardan lo que la más lenta, no la suma.",
      },
      {
        when: "Querés especializar prompts por dominio",
        detail: "Un prompt legal específico rinde mucho más que uno genérico que también sabe de leyes.",
      },
    ],
    steps: [
      "Definí las especialidades y qué produce cada una: la salida de un trabajador es un contrato.",
      "Empezá con una descomposición fija; usá el modelo para descomponer solo si la tarea lo exige.",
      "Ejecutá en paralelo las subtareas independientes y respetá las dependencias entre las demás.",
      "Diseñá la síntesis con cuidado: es donde se pierde o se gana la calidad.",
      "Poné un presupuesto global: la paralelización multiplica el gasto por vuelta.",
    ],
    pros: [
      "Cada subtarea usa el prompt y el modelo que le corresponden.",
      "La paralelización baja la latencia total.",
      "Modular: agregar una especialidad no toca a las demás.",
    ],
    cons: [
      "Multiplica el costo: N trabajadores son N llamadas más la síntesis.",
      "La síntesis puede perder matices o contradecirse entre fuentes.",
      "Un fallo parcial deja resultados incompletos: hay que decidir qué hacer.",
      "Difícil de depurar: hay varias trazas simultáneas.",
    ],
    pythonNotes: [
      {
        title: "`ThreadPoolExecutor` alcanza",
        body:
          "Son llamadas de red: el GIL se libera durante la espera. No hace falta `asyncio` ni procesos para paralelizar la parte que importa.",
      },
      {
        title: "Manejá el fallo parcial",
        body:
          "`pool.map` propaga la primera excepción. Si querés resultados parciales, usá `submit` + `as_completed` y decidí explícitamente qué hacer con los que fallaron.",
      },
      {
        title: "Los trabajadores no comparten estado",
        body:
          "Que cada uno reciba su subtarea y devuelva su resultado evita condiciones de carrera y hace testeable a cada uno por separado.",
      },
    ],
    relations: [
      "Es Mediator (los trabajadores no se conocen) + Composite (una subtarea puede descomponerse) + Map/Reduce.",
      "Cada trabajador puede ser un Agente ReAct con sus propias herramientas.",
    ],
    related: ["mediator", "composite", "agente-react", "cadena-de-prompts"],
    samples: [
      {
        title: "Tres especialistas en paralelo y una síntesis final",
        path: "ejemplos/ia/orquestador-trabajadores.py",
        outputPath: "ejemplos/ia/orquestador-trabajadores.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Cuándo NO conviene este patrón?",
        options: [
          "Cuando la tarea se resuelve bien con una tubería fija de pasos",
          "Cuando hay subtareas independientes",
          "Cuando la latencia importa",
          "Cuando hay varias especialidades",
        ],
        answer: 0,
        why: "Multiplicar llamadas cuesta dinero y complejidad. Si el orden de los pasos es siempre el mismo, una cadena es más simple, más barata y más fácil de depurar.",
      },
      {
        q: "¿Por qué alcanza con hilos para paralelizar los trabajadores?",
        options: [
          "Porque son llamadas de red y el GIL se libera durante la espera",
          "Porque el GIL no existe",
          "Porque los LLM son deterministas",
          "Porque los hilos son más rápidos que los procesos",
        ],
        answer: 0,
        why: "El cuello de botella es I/O, no CPU. Los procesos solo agregarían costo de serialización sin ganancia.",
      },
    ],
    exercises: [
      "Agregá un trabajador de «competencia» y verificá que la síntesis lo incorpora.",
      "Manejá el fallo de un trabajador con `as_completed` y sintetizá con los resultados parciales.",
      "Hacé que el orquestador use el modelo para descomponer y compará contra la descomposición fija.",
    ],
    difficulty: 3,
    popularity: 2,
  },
  {
    slug: "evaluador-optimizador",
    name: "Evaluador–Optimizador",
    aka: ["Reflection", "LLM-as-judge", "Bucle de mejora"],
    track: "ia",
    family: "llm",
    tagline: "Generar, criticar con criterios verificables y reescribir.",
    intent:
      "Separar el rol de generar del de evaluar, e iterar mientras el resultado no cumpla criterios explícitos, con un tope de vueltas.",
    problem: [
      "La primera respuesta del modelo suele ser aceptable pero no buena, y no hay forma automática de decidir si una versión es mejor que otra.",
      "Pedirle al mismo modelo «¿está bien?» sin criterios produce un «sí» entusiasta sin valor.",
    ],
    solution: [
      "Definí criterios verificables y evaluá contra ellos. Si el puntaje no alcanza, devolvé la crítica concreta como instrucción de reescritura e iterá, con un máximo de vueltas.",
      "Cuando los criterios se pueden verificar con código (contiene un plazo, compila, pasa los tests, respeta el esquema), el evaluador determinista es mejor que un LLM: es gratis, reproducible y no alucina.",
    ],
    analogy: {
      title: "El editor y el redactor",
      body: [
        "El redactor escribe; el editor marca con lápiz rojo qué falta según una pauta. Dos o tres vueltas mejoran mucho el texto. Un editor que solo dice «me gusta» no sirve para nada.",
      ],
    },
    diagram: `  ┌──────────┐  borrador  ┌───────────────┐
  │ generar  │───────────▶│  evaluar      │
  └──────────┘            │ criterios ✓/✗ │
       ▲                  └───────┬───────┘
       │  "corregí: falta plazo"  │
       └──────────────────────────┘  puntaje ≥ umbral ⇒ listo
                                     vueltas = N        ⇒ mejor versión`,
    applicability: [
      {
        when: "Hay criterios de calidad que se pueden escribir",
        detail: "Si no podés enumerarlos, el bucle no puede mejorar nada.",
      },
      {
        when: "El resultado justifica el costo de varias vueltas",
        detail: "Textos que se publican, código que se ejecuta, respuestas de alto impacto.",
      },
      {
        when: "Existe una verificación objetiva disponible",
        detail: "Tests que pasan, esquema que valida, cálculo que cierra: ahí el bucle es muy efectivo.",
      },
    ],
    steps: [
      "Escribí los criterios como una lista verificable, no como «que esté bien».",
      "Implementá el evaluador con código siempre que se pueda.",
      "Devolvé la crítica concreta al generador, no un puntaje pelado.",
      "Poné un tope de vueltas y quedate con la mejor versión, no con la última.",
      "Medí si el bucle mejora de verdad: a veces la segunda vuelta empeora.",
    ],
    pros: [
      "Mejora medible sobre criterios explícitos.",
      "El evaluador determinista es gratis y reproducible.",
      "Deja registro de por qué una versión se consideró mejor.",
    ],
    cons: [
      "Multiplica costo y latencia por la cantidad de vueltas.",
      "Un evaluador con criterios vagos no mejora nada y da sensación de rigor.",
      "Riesgo de oscilar entre dos versiones sin converger.",
    ],
    pythonNotes: [
      {
        title: "Quedate con la mejor, no con la última",
        body:
          "Guardar el mejor puntaje visto evita el caso frecuente en que la última reescritura es peor que la anterior.",
      },
      {
        title: "El evaluador ideal no es un LLM",
        body:
          "Expresiones regulares, `ast.parse`, ejecutar los tests, validar el esquema: todo lo verificable con código debería verificarse con código.",
      },
      {
        title: "Criterios como datos",
        body:
          "Una lista de criterios permite reportar exactamente cuáles fallan y medir cuál es el que más cuesta cumplir.",
      },
    ],
    relations: [
      "Es Strategy (generar) + un evaluador tipo Visitor/Specification dentro de un bucle de control.",
      "Se combina con Salida Estructurada (validar la forma) y con Cadena de Prompts (evaluar entre pasos).",
    ],
    related: ["strategy", "salida-estructurada", "cadena-de-prompts", "guardarrailes"],
    samples: [
      {
        title: "Bucle de mejora con evaluador determinista y crítica concreta",
        path: "ejemplos/ia/evaluador-optimizador.py",
        outputPath: "ejemplos/ia/evaluador-optimizador.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Qué hace inútil a un bucle de reflexión?",
        options: [
          "Criterios vagos que no se pueden verificar",
          "Usar un modelo chico para generar",
          "Tener un tope de vueltas",
          "Guardar la mejor versión",
        ],
        answer: 0,
        why: "Sin criterios verificables, el evaluador produce elogios genéricos y el bucle solo agrega costo y una falsa sensación de rigor.",
      },
      {
        q: "¿Por qué guardar la mejor versión y no la última?",
        options: [
          "Porque una reescritura puede empeorar el resultado anterior",
          "Porque la última siempre es peor",
          "Para ahorrar memoria",
          "Porque lo exige el patrón Memento",
        ],
        answer: 0,
        why: "El bucle no garantiza monotonía: sin guardar la mejor, podés devolver una versión peor que la que ya tenías.",
      },
    ],
    exercises: [
      "Agregá un criterio nuevo y verificá que el bucle lo detecta y lo corrige.",
      "Compará el evaluador determinista contra uno basado en LLM sobre los mismos 10 casos.",
      "Medí cuántas vueltas hacen falta en promedio y si la tercera aporta algo.",
    ],
    difficulty: 2,
    popularity: 2,
  },
];
