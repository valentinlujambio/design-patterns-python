import type { Pattern } from "@/lib/types";

export const ESTRUCTURALES: Pattern[] = [
  {
    slug: "adapter",
    name: "Adapter",
    aka: ["Adaptador", "Wrapper", "Envoltorio"],
    track: "gof",
    family: "estructural",
    tagline: "Hacer que dos interfaces incompatibles trabajen juntas.",
    intent: "Permite la colaboración entre objetos con interfaces incompatibles.",
    problem: [
      "Tu aplicación trabaja con datos en XML y querés integrar una biblioteca de análisis que solo entiende JSON. No podés cambiar la biblioteca (es de terceros) ni reescribir toda tu app.",
      "Peor: si la biblioteca cambia de versión y renombra métodos, cada lugar que la usa se rompe.",
    ],
    solution: [
      "Creá un objeto intermedio que implemente la interfaz que tu código espera y que, por dentro, traduzca las llamadas al formato que entiende el otro lado.",
      "Todo el conocimiento sobre la biblioteca externa queda encerrado en el adaptador: es el único archivo que hay que tocar cuando el proveedor cambia.",
    ],
    analogy: {
      title: "El adaptador de enchufe",
      body: [
        "Tu notebook tiene ficha europea y la pared, americana. No cambiás la notebook ni la pared: ponés una pieza en el medio que presenta una cara a cada lado. El adaptador no genera electricidad: solo traduce la forma.",
      ],
    },
    diagram: `  Cliente          Adaptador                Servicio ajeno
 ┌────────┐     ┌────────────────┐        ┌───────────────┐
 │ usa    │────▶│ guardar(clave, │        │ SET(k: bytes, │
 │ Almacen│     │        valor)  │───────▶│     v: bytes) │
 └────────┘     │  ↳ json+encode │        └───────────────┘
   «interfaz    └────────────────┘
    esperada»    traduce nombres, tipos y formato`,
    applicability: [
      {
        when: "Querés usar una clase existente cuya interfaz no encaja con tu código",
        detail: "Sobre todo si es de terceros y no la podés modificar.",
      },
      {
        when: "Querés reutilizar varias subclases a las que les falta una funcionalidad común",
        detail: "Y agregarla a la superclase no es posible o rompería a otros.",
      },
      {
        when: "Querés poder testear sin el sistema externo",
        detail:
          "Con la interfaz propia definida, escribir una implementación en memoria para los tests es trivial.",
      },
    ],
    steps: [
      "Identificá dos clases con interfaces incompatibles: una que no podés cambiar (servicio) y una que necesita usarla (cliente).",
      "Declará la interfaz del cliente: la que TU código necesita, no la unión de todo lo que ofrece el servicio.",
      "Creá la clase adaptadora que la implementa.",
      "Guardá una referencia al servicio en el adaptador y delegá, traduciendo datos en el camino.",
      "El cliente usa siempre la interfaz; nunca importa el SDK directamente.",
    ],
    pros: [
      "Responsabilidad única: la conversión vive separada de la lógica de negocio.",
      "Abierto/cerrado: podés sumar adaptadores nuevos sin tocar el cliente.",
      "Habilita testeo con dobles en memoria.",
    ],
    cons: [
      "Aumenta la cantidad de piezas.",
      "Un adaptador que crece hasta replicar toda la API externa dejó de ser un adaptador: es un acoplamiento con pasos extra.",
    ],
    pythonNotes: [
      {
        title: "Duck typing achica el patrón",
        body:
          "No hace falta heredar de nada: si tu clase tiene los métodos, ya sirve. `typing.Protocol` documenta el contrato y lo verifica estáticamente.",
      },
      {
        title: "Adaptar una función",
        body:
          "Si la diferencia es el orden o el nombre de los argumentos, `functools.partial` o un `lambda` alcanzan. No todo adaptador necesita una clase.",
      },
      {
        title: "`__getattr__` para delegar el resto",
        body:
          "Un adaptador puede interceptar dos métodos y delegar todos los demás con `__getattr__`. Útil, pero cuidado: lo que delega no está tipado.",
      },
    ],
    relations: [
      "Bridge se diseña por adelantado para que abstracción e implementación varíen; Adapter se aplica después, sobre código que ya existe.",
      "Decorator mantiene la interfaz y agrega comportamiento; Adapter cambia la interfaz.",
      "Facade define una interfaz nueva y simple sobre un subsistema; Adapter reutiliza una interfaz existente.",
      "Proxy mantiene la misma interfaz y controla el acceso.",
    ],
    related: ["bridge", "decorator", "facade", "proxy"],
    samples: [
      {
        title: "Ejemplo conceptual (composición)",
        path: "src/Adapter/Conceptual/object/main.py",
        outputPath: "src/Adapter/Conceptual/object/Output.txt",
        credit: "Refactoring.Guru (CC BY-NC-ND 4.0)",
      },
      {
        title: "Ejemplo conceptual (herencia múltiple)",
        path: "src/Adapter/Conceptual/class/main.py",
        outputPath: "src/Adapter/Conceptual/class/Output.txt",
        credit: "Refactoring.Guru (CC BY-NC-ND 4.0)",
      },
      {
        title: "Versión Python idiomática",
        description: "Adaptar un cliente estilo Redis a una interfaz de dominio, con doble en memoria.",
        path: "ejemplos/idiomatico/adapter.py",
        outputPath: "ejemplos/idiomatico/adapter.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿En qué se diferencia Adapter de Decorator?",
        options: [
          "Adapter cambia la interfaz; Decorator la conserva y agrega comportamiento",
          "Decorator solo funciona con funciones",
          "Adapter necesita herencia y Decorator no",
          "No hay diferencia práctica",
        ],
        answer: 0,
        why: "Los dos envuelven un objeto, pero con objetivos distintos: traducir una interfaz (Adapter) vs. extender el comportamiento manteniéndola (Decorator).",
      },
      {
        q: "¿Qué interfaz debería declarar tu adaptador?",
        options: [
          "La que tu aplicación necesita, aunque sea más chica que la del servicio",
          "Toda la API del servicio externo, por si acaso",
          "Una interfaz vacía y resolver con `__getattr__`",
          "La del framework que uses",
        ],
        answer: 0,
        why: "Una interfaz mínima (Interface Segregation) es más fácil de implementar en los tests y evita que la API ajena se filtre a tu dominio.",
      },
    ],
    exercises: [
      "Agregá un `AdaptadorArchivo` que guarde en JSON en disco y verificá que `registrar_visita` no cambia.",
      "Sumá un método `borrar` a la interfaz y observá qué adaptadores hay que tocar.",
      "Escribí un test que use `AlmacenEnMemoria` para probar la lógica sin Redis.",
    ],
    difficulty: 1,
    popularity: 3,
    guruUrl: "https://refactoring.guru/es/design-patterns/adapter",
  },
  {
    slug: "bridge",
    name: "Bridge",
    aka: ["Puente"],
    track: "gof",
    family: "estructural",
    tagline: "Separar dos jerarquías que varían por su cuenta, para que no se multipliquen.",
    intent:
      "Permite dividir una clase grande, o un grupo de clases relacionadas, en dos jerarquías separadas —abstracción e implementación— que pueden desarrollarse de forma independiente.",
    problem: [
      "Tenés `Figura` con `Circulo` y `Cuadrado`, y querés agregar color: aparecen `CirculoRojo`, `CirculoAzul`, `CuadradoRojo`… La cantidad de clases crece como el producto de las dimensiones.",
      "Cada forma nueva multiplica por la cantidad de colores, y viceversa. La herencia está modelando dos ejes independientes en un solo árbol.",
    ],
    solution: [
      "Convertí una de las dimensiones en un objeto aparte y componé en vez de heredar: `Figura` tiene un `Renderizador`. Las dos jerarquías crecen sumando (2 + 2) en vez de multiplicando (2 × 2).",
      "La «abstracción» (qué se hace) delega el trabajo de bajo nivel en la «implementación» (cómo se hace). Ese delegar es el puente.",
    ],
    analogy: {
      title: "El control remoto y el televisor",
      body: [
        "Los controles remotos (básico, con voz, app del teléfono) y los dispositivos (TV, aire, parlante) evolucionan por separado. El control no hereda de la TV: la usa a través de una interfaz. Por eso una app nueva funciona con todos los dispositivos existentes.",
      ],
    },
    diagram: `  Abstracción                     Implementación
 ┌─────────────┐   tiene-un   ┌────────────────────┐
 │  Figura     │─────────────▶│  Renderizador      │ «interfaz»
 │ + dibujar() │              │ + circulo(x,y,r)   │
 └──────┬──────┘              └─────────┬──────────┘
   ┌────┴────┐                    ┌─────┴──────┐
 Circulo  Cuadrado            RenderSVG   RenderTexto

  2 + 2 = 4 clases   (con herencia serían 2 × 2 = 4… y 3 × 4 = 12)`,
    applicability: [
      {
        when: "Querés dividir una clase monolítica con varias variantes de una funcionalidad",
        detail: "Por ejemplo, una clase que soporta varios servidores de base de datos.",
      },
      {
        when: "Necesitás extender una clase en varias dimensiones ortogonales",
        detail: "Forma × color, plataforma × tema, formato × destino.",
      },
      {
        when: "Querés cambiar la implementación en tiempo de ejecución",
        detail: "Como es composición, se reemplaza con una asignación.",
      },
    ],
    steps: [
      "Identificá las dimensiones ortogonales: abstracción/plataforma, dominio/infraestructura, interfaz/lógica.",
      "Definí qué operaciones necesita el cliente y declaralas en la clase de abstracción.",
      "Determiná las operaciones de bajo nivel disponibles en todas las plataformas y declaralas en la interfaz de implementación.",
      "Creá las clases de implementación concretas, una por plataforma.",
      "Dentro de la abstracción, guardá una referencia a la implementación y delegá.",
    ],
    pros: [
      "Podés crear clases y aplicaciones independientes de plataforma.",
      "El código cliente trabaja con abstracciones de alto nivel y no se expone a los detalles.",
      "Abierto/cerrado: agregás abstracciones e implementaciones por separado.",
      "Responsabilidad única: la lógica de alto nivel y los detalles quedan en clases distintas.",
    ],
    cons: [
      "Puede complicar el diseño si se aplica a una clase que en realidad es cohesiva.",
      "Requiere identificar bien las dimensiones: si están mal elegidas, el puente estorba.",
    ],
    pythonNotes: [
      {
        title: "La implementación puede ser una función",
        body:
          "Si la interfaz de implementación tiene un solo método, pasá directamente un callable. El puente sigue existiendo, pero sin clases de más.",
      },
      {
        title: "Inyectar en el `__init__`",
        body:
          "El puente es, básicamente, inyección de dependencias con nombre propio: la implementación llega por constructor y se puede cambiar con un atributo.",
      },
      {
        title: "`Protocol` en vez de clase base abstracta",
        body:
          "Así las implementaciones no necesitan heredar de nada, incluso si vienen de otra biblioteca.",
      },
    ],
    relations: [
      "Bridge se diseña por adelantado; Adapter se aplica sobre código existente.",
      "Bridge, State y Strategy tienen la misma estructura (delegar en un objeto) pero resuelven problemas distintos.",
      "Abstract Factory suele usarse para crear pares abstracción/implementación compatibles.",
    ],
    related: ["adapter", "strategy", "state", "abstract-factory"],
    samples: [
      {
        title: "Ejemplo conceptual",
        path: "src/Bridge/Conceptual/main.py",
        outputPath: "src/Bridge/Conceptual/Output.txt",
        credit: "Refactoring.Guru (CC BY-NC-ND 4.0)",
      },
      {
        title: "Versión Python idiomática",
        description: "Figuras × renderizadores con `Protocol` y composición.",
        path: "ejemplos/idiomatico/bridge.py",
        outputPath: "ejemplos/idiomatico/bridge.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Cuál es el síntoma que anticipa la necesidad de Bridge?",
        options: [
          "Una explosión combinatoria de subclases al cruzar dos dimensiones",
          "Un constructor con muchos parámetros",
          "Objetos que se crean muy seguido",
          "Un método demasiado largo",
        ],
        answer: 0,
        why: "Cuando las clases se llaman `CirculoRojoSVG`, la herencia está intentando modelar dos ejes independientes en un solo árbol.",
      },
      {
        q: "Bridge y Strategy tienen la misma forma. ¿En qué se diferencian?",
        options: [
          "En la intención: Bridge separa dimensiones estructurales; Strategy intercambia algoritmos",
          "Bridge no permite cambiar la implementación en tiempo de ejecución",
          "Strategy requiere herencia",
          "Bridge es solo para interfaces gráficas",
        ],
        answer: 0,
        why: "Los patrones se distinguen por intención, no por diagrama: la estructura idéntica resuelve problemas conceptualmente distintos.",
      },
    ],
    exercises: [
      "Agregá un `RenderASCII` y comprobá que no tocás ninguna figura.",
      "Agregá un `Triangulo` y contá cuántas clases nuevas hicieron falta (comparalo con la versión por herencia).",
      "Permití cambiar el renderizador en tiempo de ejecución con una propiedad y demostralo en el `__main__`.",
    ],
    difficulty: 3,
    popularity: 1,
    guruUrl: "https://refactoring.guru/es/design-patterns/bridge",
  },
  {
    slug: "composite",
    name: "Composite",
    aka: ["Objeto compuesto", "Árbol"],
    track: "gof",
    family: "estructural",
    tagline: "Tratar a un objeto y a un grupo de objetos exactamente igual.",
    intent:
      "Permite componer objetos en estructuras de árbol y trabajar con esas estructuras como si fueran objetos individuales.",
    problem: [
      "Un pedido tiene productos y cajas; una caja tiene productos y más cajas. Calcular el precio total obliga a recorrer el árbol preguntando «¿esto es una caja o un producto?» en cada nivel.",
      "Ese `isinstance` desparramado es frágil: cada tipo nuevo obliga a revisar todos los recorridos.",
    ],
    solution: [
      "Definí una interfaz común con la operación que te interesa (`precio()`, `tamano()`, `render()`). Las hojas la resuelven directamente; los compuestos la delegan en sus hijos y combinan los resultados.",
      "El cliente llama al método sobre la raíz y no necesita saber si atrás hay un elemento o diez mil.",
    ],
    analogy: {
      title: "El organigrama de una empresa",
      body: [
        "«¿Cuánta gente hay bajo tu cargo?» se responde igual si sos jefe de un equipo o director de una división: cada quien pregunta hacia abajo y suma. Nadie necesita conocer la forma completa del árbol.",
      ],
    },
    diagram: `             ┌────────────────┐
             │   Componente   │  «interfaz»
             │  + operacion() │
             └───────┬────────┘
          ┌──────────┴───────────┐
   ┌──────┴─────┐        ┌───────┴────────┐
   │   Hoja     │        │   Compuesto    │◀──┐
   │ operacion()│        │ hijos: [Comp]  │   │ contiene
   └────────────┘        │ operacion():   │───┘ componentes
                         │  suma(hijos)   │
                         └────────────────┘`,
    applicability: [
      {
        when: "Tenés que representar una jerarquía de objetos en forma de árbol",
        detail: "Sistemas de archivos, menús, escenas gráficas, organigramas, expresiones.",
      },
      {
        when: "Querés que el cliente trate igual a los elementos simples y a los compuestos",
        detail: "Elimina condicionales por tipo en todos los recorridos.",
      },
    ],
    steps: [
      "Verificá que tu modelo se pueda representar como árbol: elementos simples y contenedores.",
      "Declará la interfaz común con las operaciones que tienen sentido para ambos.",
      "Implementá las hojas: resuelven el trabajo real.",
      "Implementá el compuesto: guarda hijos como la interfaz común y delega recursivamente.",
      "Decidí dónde van `agregar`/`quitar`: en la interfaz común (más simple para el cliente, menos seguro) o solo en el compuesto (más seguro, con más `isinstance`).",
    ],
    pros: [
      "Trabajás con estructuras complejas de forma uniforme, usando polimorfismo y recursión.",
      "Abierto/cerrado: nuevos tipos de elemento entran sin tocar el código existente.",
    ],
    cons: [
      "Puede ser difícil definir una interfaz común si los tipos difieren mucho: se termina con una interfaz demasiado general.",
      "Un árbol muy profundo puede agotar la pila de recursión (en Python, límite por defecto ~1000).",
    ],
    pythonNotes: [
      {
        title: "Comprensiones y `sum` en vez de bucles",
        body:
          "`sum(hijo.tamano() for hijo in self.hijos)` es la traducción directa y legible de la operación compuesta.",
      },
      {
        title: "`yield from` para recorrer",
        body:
          "Los generadores recursivos con `yield from` producen recorridos perezosos sin materializar listas intermedias.",
      },
      {
        title: "Cuidado con la recursión profunda",
        body:
          "Si el árbol puede ser muy hondo, convertí el recorrido en iterativo con una pila explícita antes de tocar `sys.setrecursionlimit`.",
      },
    ],
    relations: [
      "Se combina con Builder para construir el árbol, y con Iterator para recorrerlo.",
      "Visitor permite ejecutar operaciones sobre todo el árbol sin tocar las clases.",
      "Decorator tiene una estructura parecida pero con un solo hijo y otra intención.",
      "Flyweight ayuda a compartir las hojas repetidas para ahorrar memoria.",
    ],
    related: ["decorator", "iterator", "visitor", "flyweight", "builder"],
    samples: [
      {
        title: "Ejemplo conceptual",
        path: "src/Composite/Conceptual/main.py",
        outputPath: "src/Composite/Conceptual/Output.txt",
        credit: "Refactoring.Guru (CC BY-NC-ND 4.0)",
      },
      {
        title: "Versión Python idiomática",
        description: "Árbol de archivos y carpetas con `yield from` y `dataclass`.",
        path: "ejemplos/idiomatico/composite.py",
        outputPath: "ejemplos/idiomatico/composite.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Cuál es el compromiso al poner `agregar`/`quitar` en la interfaz común?",
        options: [
          "El cliente es más uniforme, pero puede llamar a `agregar` sobre una hoja",
          "Se pierde el polimorfismo",
          "Deja de poder usarse recursión",
          "Obliga a usar herencia múltiple",
        ],
        answer: 0,
        why: "Es la tensión clásica del patrón: transparencia (todo igual) vs. seguridad de tipos (solo los compuestos gestionan hijos).",
      },
      {
        q: "¿Qué construcción de Python se presta especialmente al recorrido de un Composite?",
        options: [
          "`yield from` en un generador recursivo",
          "`__slots__`",
          "`functools.lru_cache`",
          "Las metaclases",
        ],
        answer: 0,
        why: "`yield from` delega la iteración al subárbol, produciendo un recorrido perezoso y muy legible.",
      },
    ],
    exercises: [
      "Agregá un método `buscar(nombre)` que devuelva la ruta completa del primer nodo que coincida.",
      "Implementá `__len__` para que devuelva la cantidad total de archivos del subárbol.",
      "Convertí `listar` en un recorrido iterativo con una pila y comparalo con la versión recursiva.",
    ],
    difficulty: 2,
    popularity: 3,
    guruUrl: "https://refactoring.guru/es/design-patterns/composite",
  },
  {
    slug: "decorator",
    name: "Decorator",
    aka: ["Decorador", "Envoltorio", "Wrapper"],
    track: "gof",
    family: "estructural",
    tagline: "Agregar responsabilidades envolviendo el objeto, sin tocar su clase.",
    intent:
      "Permite añadir funcionalidades a objetos colocándolos dentro de objetos envoltorio que las contienen.",
    problem: [
      "Una biblioteca de notificaciones manda emails. Piden agregar SMS, Slack y Telegram, y además poder combinarlos: email + Slack, o los cuatro a la vez.",
      "Con herencia hacen falta 2ⁿ subclases para cubrir todas las combinaciones. Y la herencia es estática: no podés cambiarla en tiempo de ejecución.",
    ],
    solution: [
      "Creá envoltorios que implementen la misma interfaz que el objeto envuelto. Cada uno hace su parte y delega el resto al objeto interno.",
      "Como el envoltorio también cumple la interfaz, se puede envolver a otro envoltorio: las combinaciones se arman en tiempo de ejecución, apilando.",
    ],
    analogy: {
      title: "La ropa",
      body: [
        "Tenés frío: te ponés un buzo. Sigue lloviendo: te ponés una campera encima. Cada prenda agrega una capacidad y se puede sacar. No sos una persona distinta con cada combinación: seguís siendo vos, envuelto.",
      ],
    },
    diagram: `  ┌──────────────────────────────────────────────┐
  │  Numerada( Mayusculas( ArchivoDeTexto ) )    │
  └──────────────────────────────────────────────┘
        │            │              │
        ▼            ▼              ▼
   agrega nº    pasa a MAYÚS   devuelve el texto
        └──────── todos cumplen  leer() -> str  ─────┘

  Componente ◀── Decorador (tiene-un Componente) ◀── DecoradorConcreto`,
    applicability: [
      {
        when: "Querés agregar comportamiento a objetos concretos en tiempo de ejecución",
        detail: "Sin afectar a otros objetos de la misma clase.",
      },
      {
        when: "No podés extender por herencia",
        detail: "Porque la clase es `final`, o porque la combinatoria de subclases explota.",
      },
      {
        when: "Necesitás componer responsabilidades transversales",
        detail: "Logging, caché, reintentos, métricas, compresión, cifrado.",
      },
    ],
    steps: [
      "Asegurate de que exista una interfaz común entre el componente y sus extensiones.",
      "Creá la clase componente concreta con el comportamiento base.",
      "Creá la clase decoradora base: guarda una referencia al componente envuelto y delega todo.",
      "Derivá decoradores concretos que hagan su parte antes o después de delegar.",
      "El cliente arma la pila de envoltorios en el orden que necesita.",
    ],
    pros: [
      "Extendés comportamiento sin crear subclases.",
      "Agregás y quitás responsabilidades en tiempo de ejecución.",
      "Combinás varios comportamientos apilando envoltorios.",
      "Responsabilidad única: una clase monolítica se divide en piezas chicas.",
    ],
    cons: [
      "Es difícil quitar un envoltorio específico del medio de la pila.",
      "El comportamiento depende del orden de la pila, y eso no siempre es obvio.",
      "Muchas capas hacen que el stacktrace y la depuración sean incómodos.",
    ],
    pythonNotes: [
      {
        title: "`@decorador` no es exactamente el patrón",
        body:
          "Los decoradores de Python envuelven funciones y clases; el patrón GoF envuelve instancias. Comparten la idea (envolver para extender) pero no son lo mismo. Los dos aparecen en el ejemplo idiomático.",
      },
      {
        title: "`functools.wraps` es obligatorio",
        body:
          "Sin él, el nombre, el docstring y la firma del original se pierden, y las herramientas de introspección (y los frameworks) dejan de funcionar bien.",
      },
      {
        title: "`contextlib` y `cached_property`",
        body:
          "La biblioteca estándar está llena de decoradores que son este patrón: `lru_cache`, `cached_property`, `contextmanager`, `singledispatch`.",
      },
    ],
    relations: [
      "Adapter cambia la interfaz; Decorator la mantiene y agrega comportamiento.",
      "Composite y Decorator comparten estructura recursiva; el Decorator tiene un solo hijo y no suma comportamiento de hijos, sino propio.",
      "Chain of Responsibility se parece, pero cualquier eslabón puede cortar el flujo; en Decorator todos ejecutan.",
      "Proxy también envuelve, pero controla el acceso al objeto en lugar de agregarle capacidades.",
    ],
    related: ["adapter", "composite", "proxy", "chain-of-responsibility"],
    samples: [
      {
        title: "Ejemplo conceptual",
        path: "src/Decorator/Conceptual/main.py",
        outputPath: "src/Decorator/Conceptual/Output.txt",
        credit: "Refactoring.Guru (CC BY-NC-ND 4.0)",
      },
      {
        title: "Versión Python idiomática",
        description: "Las dos caras: decorador de función con reintentos y Decorator GoF apilable.",
        path: "ejemplos/idiomatico/decorator.py",
        outputPath: "ejemplos/idiomatico/decorator.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Cuál es la diferencia entre el Decorator GoF y el `@decorador` de Python?",
        options: [
          "El GoF envuelve instancias en tiempo de ejecución; el de Python envuelve funciones o clases al definirlas",
          "Son exactamente lo mismo",
          "El de Python no puede apilarse",
          "El GoF solo aplica a interfaces gráficas",
        ],
        answer: 0,
        why: "Comparten la idea de envolver, pero operan sobre cosas distintas y en momentos distintos. Los decoradores de Python son azúcar sintáctica para `f = deco(f)`.",
      },
      {
        q: "¿Por qué importa el orden en que se apilan los decoradores?",
        options: [
          "Porque cada capa transforma la entrada o la salida de la siguiente",
          "Porque Python los ejecuta al azar",
          "Porque solo el último se ejecuta",
          "No importa: el resultado es siempre igual",
        ],
        answer: 0,
        why: "`Numerada(Mayusculas(x))` numera después de pasar a mayúsculas; al revés, numeraría antes y las mayúsculas afectarían también a los números.",
      },
    ],
    exercises: [
      "Agregá un decorador `Truncada(n)` y probá dos órdenes distintos de la pila.",
      "Escribí un decorador de función `@medir_tiempo` con `functools.wraps` y comprobá que `__name__` se conserva.",
      "Convertí `con_reintentos` para que acepte qué excepciones reintentar como parámetro.",
    ],
    difficulty: 2,
    popularity: 3,
    guruUrl: "https://refactoring.guru/es/design-patterns/decorator",
  },
  {
    slug: "facade",
    name: "Facade",
    aka: ["Fachada"],
    track: "gof",
    family: "estructural",
    tagline: "Una puerta simple a un subsistema complicado.",
    intent:
      "Proporciona una interfaz simplificada a una biblioteca, un framework o cualquier conjunto complejo de clases.",
    problem: [
      "Para convertir un video necesitás inicializar códecs, leer bitrates, extraer audio, remuxar y liberar recursos en el orden correcto. Tu código de negocio termina lleno de detalles de una biblioteca que no le importan.",
      "Cuando la biblioteca cambia, hay que tocar todos esos lugares.",
    ],
    solution: [
      "Creá una clase (o un módulo) que ofrezca una operación de alto nivel: `convertir(archivo, formato)`. Adentro coordina el subsistema; afuera expone lo mínimo indispensable.",
      "La fachada no impide el acceso directo al subsistema para los casos avanzados: solo hace fácil lo común.",
    ],
    analogy: {
      title: "El número de atención al cliente",
      body: [
        "Llamás, pedís «quiero dar de baja el servicio» y una persona coordina sistemas, formularios y departamentos que ni conocés. La fachada no hace el trabajo: lo orquesta y te da una sola puerta.",
      ],
    },
    diagram: `   Cliente
      │  una sola llamada
      ▼
 ┌──────────────────────┐
 │      Fachada         │
 │  convertir(url)      │
 └──┬────┬────┬─────┬───┘
    ▼    ▼    ▼     ▼
 Descarg Decod Resize Codif   ← el subsistema sigue disponible
                                para quien necesite el control fino`,
    applicability: [
      {
        when: "Necesitás una interfaz limitada y directa a un subsistema complejo",
        detail: "El 90% de los usos suele necesitar el 10% de la API.",
      },
      {
        when: "Querés estructurar un subsistema en capas",
        detail: "Una fachada por capa reduce el acoplamiento entre ellas.",
      },
    ],
    steps: [
      "Verificá si es posible una interfaz más simple que la que ofrece el subsistema hoy.",
      "Declará esa interfaz en una clase o módulo nuevo.",
      "Movelé toda la coordinación: el cliente debe llamar a la fachada, no al subsistema.",
      "Si la fachada crece demasiado, dividila en varias fachadas más chicas y enfocadas.",
    ],
    pros: [
      "Aísla el código de la complejidad de un subsistema.",
      "Reduce dependencias: solo la fachada conoce las clases internas.",
      "Facilita testear el código cliente con un doble de la fachada.",
    ],
    cons: [
      "Puede convertirse en un objeto todopoderoso acoplado a todas las clases de la app.",
      "Si esconde de más, empuja a la gente a saltearla, y termina desactualizada.",
    ],
    pythonNotes: [
      {
        title: "En Python, la fachada suele ser un módulo",
        body:
          "`requests.get(...)` es la fachada de urllib3 y todo el manejo de conexiones. Un `__init__.py` que expone tres funciones públicas ya es este patrón.",
      },
      {
        title: "`__all__` define la puerta",
        body:
          "Declarar `__all__` documenta qué es interfaz pública y qué es detalle interno (por convención, con guion bajo adelante).",
      },
      {
        title: "No escondas los errores",
        body:
          "Una fachada que traga excepciones del subsistema es una trampa. Traducilas a errores propios de tu dominio, sin perder la causa (`raise ... from exc`).",
      },
    ],
    relations: [
      "Adapter reutiliza una interfaz existente; Facade define una nueva.",
      "Abstract Factory puede ser una alternativa cuando lo único que se quiere ocultar es la creación.",
      "Mediator y Facade se parecen: el Mediator centraliza la comunicación *entre* componentes que lo conocen; la Facade es unidireccional y los componentes no la conocen.",
      "Una fachada suele bastar con una sola instancia: se combina con Singleton.",
    ],
    related: ["adapter", "mediator", "abstract-factory", "singleton", "proxy"],
    samples: [
      {
        title: "Ejemplo conceptual",
        path: "src/Facade/Conceptual/main.py",
        outputPath: "src/Facade/Conceptual/Output.txt",
        credit: "Refactoring.Guru (CC BY-NC-ND 4.0)",
      },
      {
        title: "Versión Python idiomática",
        description: "Conversor de video: cuatro subsistemas privados detrás de un método.",
        path: "ejemplos/idiomatico/facade.py",
        outputPath: "ejemplos/idiomatico/facade.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿En qué se diferencian Facade y Mediator?",
        options: [
          "La Facade es unidireccional y los subsistemas no la conocen; el Mediator es bidireccional y los componentes le hablan",
          "El Mediator solo aplica a interfaces gráficas",
          "La Facade no puede tener estado",
          "Son sinónimos",
        ],
        answer: 0,
        why: "En Mediator los componentes dependen explícitamente del mediador para comunicarse entre sí; en Facade el subsistema ni sabe que existe.",
      },
      {
        q: "¿Cuál es el riesgo típico de una fachada?",
        options: [
          "Convertirse en un objeto dios acoplado a toda la aplicación",
          "Ser demasiado rápida",
          "Impedir el testeo",
          "Requerir herencia múltiple",
        ],
        answer: 0,
        why: "Cuando cada necesidad nueva se agrega a la misma fachada, termina conociendo todo. La solución es dividirla en fachadas por contexto.",
      },
    ],
    exercises: [
      "Agregá al conversor una opción de subtítulos sin cambiar la firma de `convertir`.",
      "Convertí la fachada en un módulo con `__all__` y funciones de nivel superior.",
      "Hacé que un error del descargador se traduzca a una excepción propia con `raise ... from`.",
    ],
    difficulty: 1,
    popularity: 3,
    guruUrl: "https://refactoring.guru/es/design-patterns/facade",
  },
  {
    slug: "flyweight",
    name: "Flyweight",
    aka: ["Peso mosca", "Caché"],
    track: "gof",
    family: "estructural",
    tagline: "Compartir el estado que se repite en lugar de duplicarlo un millón de veces.",
    intent:
      "Permite mantener más objetos dentro de la cantidad disponible de RAM compartiendo las partes comunes del estado entre múltiples objetos.",
    problem: [
      "Un juego dibuja un bosque de un millón de árboles. Cada árbol guarda su especie, color y textura (un bitmap de varios KB) además de su posición: la memoria explota.",
      "Pero la textura del roble es la misma para los 500.000 robles: se está duplicando información idéntica.",
    ],
    solution: [
      "Separá el estado **intrínseco** (el que se repite y no cambia: especie, textura) del **extrínseco** (el único de cada instancia: coordenadas).",
      "Guardá el intrínseco en objetos inmutables compartidos —los flyweights— y pasá el extrínseco como argumento. Una fábrica con caché garantiza que la misma combinación devuelva siempre el mismo objeto.",
    ],
    analogy: {
      title: "Los tipos móviles de la imprenta",
      body: [
        "Gutenberg no tallaba una letra nueva por cada aparición: tenía un juego de tipos y los reutilizaba en distintas posiciones de la página. El tipo (la forma de la letra) es el estado intrínseco; su posición en el molde, el extrínseco.",
      ],
    },
    diagram: `  1.000.000 de árboles                3 flyweights compartidos
  ┌───────────────────┐             ┌────────────────────────┐
  │ Arbol(x, y, tipo) │────────────▶│ TipoDeArbol(roble, …)  │
  │ Arbol(x, y, tipo) │────────────▶│ TipoDeArbol(pino, …)   │
  │ …                 │────────────▶│ TipoDeArbol(sauce, …)  │
  └───────────────────┘             └────────────────────────┘
      extrínseco                      intrínseco (inmutable)`,
    applicability: [
      {
        when: "Tu programa crea una cantidad enorme de objetos similares y la RAM es el cuello de botella",
        detail:
          "El patrón solo vale la pena en ese escenario. Aplicarlo «por las dudas» solo agrega indirección.",
      },
      {
        when: "Los objetos contienen estado duplicado que se puede extraer y compartir",
        detail: "Y ese estado es inmutable, o se lo puede volver inmutable.",
      },
    ],
    steps: [
      "Dividí los campos en intrínsecos (repetidos, inmutables) y extrínsecos (únicos, mutables).",
      "Dejá los intrínsecos en la clase flyweight y hacela inmutable: solo se inicializan por constructor.",
      "Movelé los extrínsecos al código cliente o a un objeto contexto que referencia al flyweight.",
      "Creá una fábrica con caché que devuelva flyweights existentes o cree uno nuevo.",
      "Medí antes y después. Si no bajó la memoria, revertí.",
    ],
    pros: ["Ahorra mucha RAM cuando hay muchísimos objetos con estado repetido."],
    cons: [
      "Cambia memoria por CPU: recalcular o buscar el estado extrínseco tiene un costo.",
      "El código se vuelve más difícil de leer: el estado de una entidad queda partido en dos lugares.",
      "Si los flyweights no son inmutables, los bugs por estado compartido son brutales.",
    ],
    pythonNotes: [
      {
        title: "Python ya hace esto",
        body:
          "Los enteros chicos y muchas cadenas están internados: `a = 256; b = 256; a is b` da `True`. `sys.intern` permite forzarlo para cadenas.",
      },
      {
        title: "`lru_cache` como fábrica de flyweights",
        body:
          "`@lru_cache(maxsize=None)` sobre una función constructora garantiza que la misma clave devuelva el mismísimo objeto.",
      },
      {
        title: "`__slots__` y `frozen=True`",
        body:
          "`__slots__` elimina el `__dict__` por instancia (el ahorro real cuando hay millones de objetos) y `frozen=True` asegura que el flyweight compartido no se pueda mutar.",
      },
    ],
    relations: [
      "Composite + Flyweight: compartir las hojas repetidas del árbol.",
      "Singleton se parece si hay un solo flyweight, pero Singleton es único por definición y Flyweight puede tener muchos, todos inmutables.",
      "Se combina con Factory Method o con una fábrica cacheada para gestionar el pool.",
    ],
    related: ["composite", "singleton", "factory-method", "proxy"],
    samples: [
      {
        title: "Ejemplo conceptual",
        path: "src/Flyweight/Conceptual/main.py",
        outputPath: "src/Flyweight/Conceptual/Output.txt",
        credit: "Refactoring.Guru (CC BY-NC-ND 4.0)",
      },
      {
        title: "Versión Python idiomática",
        description: "Bosque de 10.000 árboles con 2 flyweights, `lru_cache` y `__slots__`.",
        path: "ejemplos/idiomatico/flyweight.py",
        outputPath: "ejemplos/idiomatico/flyweight.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Qué es el estado extrínseco?",
        options: [
          "El estado único de cada instancia, que NO se comparte",
          "El estado compartido entre todos los objetos",
          "El estado guardado en disco",
          "El estado privado de la clase",
        ],
        answer: 0,
        why: "El intrínseco es lo que se repite y se comparte (inmutable); el extrínseco es lo propio de cada uso y vive en el contexto o se pasa por parámetro.",
      },
      {
        q: "¿Por qué el flyweight debe ser inmutable?",
        options: [
          "Porque lo comparten muchos objetos: mutarlo los afectaría a todos",
          "Porque lo exige el recolector de basura",
          "Para que ocupe menos memoria",
          "No hace falta que lo sea",
        ],
        answer: 0,
        why: "El objeto compartido no tiene un dueño: cualquier mutación se propaga a todos los contextos que lo referencian, con bugs imposibles de rastrear.",
      },
    ],
    exercises: [
      "Medí con `tracemalloc` la memoria del bosque con y sin flyweight.",
      "Quitá `__slots__` de `Arbol` y compará `sys.getsizeof`.",
      "Hacé mutable a `TipoDeArbol`, cambiá el color de un árbol y observá qué le pasa a los otros 4.999.",
    ],
    difficulty: 3,
    popularity: 1,
    guruUrl: "https://refactoring.guru/es/design-patterns/flyweight",
  },
  {
    slug: "proxy",
    name: "Proxy",
    aka: ["Apoderado", "Sustituto"],
    track: "gof",
    family: "estructural",
    tagline: "Un sustituto con la misma cara que controla el acceso al objeto real.",
    intent:
      "Permite proporcionar un sustituto o marcador de posición para otro objeto, controlando el acceso al objeto original y permitiendo hacer algo antes o después de que la solicitud llegue a él.",
    problem: [
      "Tenés un objeto pesado que consume muchos recursos y no siempre se usa: una conexión, un modelo de machine learning, un archivo grande.",
      "Podrías crearlo de forma perezosa, pero ese código de inicialización terminaría duplicado en todos los clientes. Y si además querés cachear, loguear o controlar permisos, cada cliente se llena de responsabilidades ajenas.",
    ],
    solution: [
      "Creá una clase con la misma interfaz que el objeto real. El cliente le habla al proxy sin notar la diferencia; el proxy decide cuándo (y si) delegar al objeto real.",
      "Las variantes clásicas: **virtual** (creación perezosa), **de caché**, **de protección** (permisos), **remoto** (la llamada viaja por red), **de registro** (logging) y **inteligente** (cuenta referencias, libera recursos).",
    ],
    analogy: {
      title: "La tarjeta de crédito",
      body: [
        "La tarjeta se usa igual que el efectivo (misma interfaz para el comercio) pero por detrás valida saldo, registra la operación y puede rechazarla. El comercio no necesita saber nada de eso.",
      ],
    },
    diagram: `  Cliente ──▶ ┌───────────────┐  ──crea/delega──▶ ┌──────────────┐
              │    Proxy      │                   │ ServicioReal │
              │ consultar()   │                   │ consultar()  │
              │  ↳ ¿cacheado? │                   └──────────────┘
              │  ↳ ¿permiso?  │        (se crea recién cuando
              │  ↳ log        │         alguien lo necesita)
              └───────────────┘
              misma interfaz que el servicio real`,
    applicability: [
      {
        when: "Inicialización perezosa de un objeto pesado",
        detail: "El proxy virtual difiere la creación hasta el primer uso real.",
      },
      {
        when: "Control de acceso",
        detail: "El proxy de protección deja pasar solo a quien corresponde.",
      },
      {
        when: "Caché de resultados o de objetos",
        detail: "Especialmente cuando las peticiones se repiten mucho.",
      },
      {
        when: "Registro, métricas o limitación de tasa",
        detail: "Sin ensuciar el servicio real ni el cliente.",
      },
    ],
    steps: [
      "Si no existe una interfaz común, extraela (o usá duck typing / `Protocol`).",
      "Creá la clase proxy con una referencia al servicio real.",
      "Implementá los métodos del proxy: hacé lo tuyo y delegá.",
      "Considerá crear el servicio real de forma perezosa, dentro del proxy.",
      "Decidí quién construye el proxy: idealmente una fábrica, para que el cliente no elija.",
    ],
    pros: [
      "Controlás el servicio sin que el cliente se entere.",
      "Podés gestionar el ciclo de vida del objeto real.",
      "Funciona aunque el servicio no esté disponible o listo.",
      "Abierto/cerrado: agregás proxies nuevos sin tocar servicio ni cliente.",
    ],
    cons: [
      "Más clases e indirección.",
      "Puede agregar latencia (una caché mal dimensionada empeora las cosas).",
      "Depurar una pila de proxies es incómodo.",
    ],
    pythonNotes: [
      {
        title: "`__getattr__` para un proxy genérico",
        body:
          "Interceptás lo que te interesa y delegás todo lo demás. Cuidado: lo delegado escapa al chequeo de tipos y a los IDE.",
      },
      {
        title: "Descriptores y `cached_property`",
        body:
          "`functools.cached_property` es un proxy virtual de un solo atributo: calcula al primer acceso y después devuelve el valor guardado.",
      },
      {
        title: "`weakref.proxy`",
        body:
          "Un proxy que no impide que el objeto se libere: útil para romper ciclos de referencias sin filtrar memoria.",
      },
    ],
    relations: [
      "Adapter cambia la interfaz; Proxy la mantiene idéntica.",
      "Decorator también envuelve manteniendo la interfaz, pero para agregar comportamiento; el Proxy gestiona el ciclo de vida y el acceso, y suele construir él mismo el objeto real.",
      "Facade simplifica una interfaz compleja; el Proxy reproduce exactamente la misma.",
    ],
    related: ["adapter", "decorator", "facade", "flyweight"],
    samples: [
      {
        title: "Ejemplo conceptual",
        path: "src/Proxy/Conceptual/main.py",
        outputPath: "src/Proxy/Conceptual/Output.txt",
        credit: "Refactoring.Guru (CC BY-NC-ND 4.0)",
      },
      {
        title: "Versión Python idiomática",
        description: "Proxy perezoso con caché + proxy genérico de registro con `__getattr__`.",
        path: "ejemplos/idiomatico/proxy.py",
        outputPath: "ejemplos/idiomatico/proxy.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Cuál es la diferencia entre Proxy y Decorator?",
        options: [
          "El Proxy controla el acceso y suele gestionar el ciclo de vida del objeto real; el Decorator agrega comportamiento",
          "El Proxy cambia la interfaz",
          "El Decorator no puede apilarse",
          "Ninguna: son el mismo patrón",
        ],
        answer: 0,
        why: "Estructuralmente son casi idénticos. La diferencia está en la intención y en quién controla el objeto envuelto: el proxy suele crearlo él mismo.",
      },
      {
        q: "¿Qué variante de Proxy difiere la creación del objeto pesado?",
        options: ["Virtual", "De protección", "Remoto", "Inteligente"],
        answer: 0,
        why: "El proxy virtual mantiene un `None` hasta que alguien realmente necesita el servicio, y recién ahí lo construye.",
      },
    ],
    exercises: [
      "Agregá un TTL a la caché del proxy y probá que expira.",
      "Escribí un proxy de protección que rechace consultas de usuarios sin permiso.",
      "Usá `functools.cached_property` para lograr el mismo efecto perezoso en un atributo y compará el código.",
    ],
    difficulty: 2,
    popularity: 2,
    guruUrl: "https://refactoring.guru/es/design-patterns/proxy",
  },
];
