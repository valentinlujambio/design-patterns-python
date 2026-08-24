import type { Fundamental } from "@/lib/types";

export const FUNDAMENTOS: Fundamental[] = [
  {
    slug: "que-es-un-patron",
    title: "Qué es un patrón de diseño",
    tagline: "Una solución probada a un problema recurrente, no una receta para copiar.",
    minutes: 6,
    guruUrl: "https://refactoring.guru/es/design-patterns/what-is-pattern",
    sections: [
      {
        body: [
          "Un **patrón de diseño** es la descripción de una solución típica a un problema que se repite en el diseño de software. No es un fragmento de código listo para pegar: es un enfoque general que se adapta a cada situación concreta.",
          "La diferencia con un algoritmo es importante y suele confundirse. Un algoritmo define **una secuencia de pasos** con un resultado determinado: es una receta. Un patrón describe **una estructura y unas responsabilidades**: es más parecido al plano de una casa que a las instrucciones para hornear un pan. Dos implementaciones del mismo patrón pueden verse muy distintas y ser igual de correctas.",
        ],
      },
      {
        heading: "De qué está hecho un patrón",
        list: [
          "**Propósito**: el problema que resuelve, en una o dos frases.",
          "**Motivación**: por qué ese problema aparece y por qué duele.",
          "**Estructura**: qué piezas participan y cómo se relacionan.",
          "**Consecuencias**: qué ganás y qué pagás. Esta parte es la que más se saltea y la más importante.",
          "**Ejemplo de código**: una implementación concreta, en un lenguaje concreto.",
        ],
      },
      {
        heading: "De dónde vienen",
        body: [
          "El concepto lo tomó prestado la ingeniería de software de la arquitectura: en 1977, Christopher Alexander publicó *A Pattern Language*, un catálogo de soluciones recurrentes para diseñar edificios y ciudades.",
          'En 1994, cuatro autores —Erich Gamma, Richard Helm, Ralph Johnson y John Vlissides, conocidos como la *Gang of Four* (GoF)— publicaron *Design Patterns: Elements of Reusable Object-Oriented Software*, con 23 patrones para programación orientada a objetos. Ese libro fijó el vocabulario que seguimos usando treinta años después.',
        ],
      },
      {
        callout: {
          tone: "info",
          title: "Por qué este catálogo tiene 22 y no 23",
          body: "Como Refactoring.Guru, esta app deja afuera **Interpreter**: es el patrón más específico del libro original (construir un intérprete de un lenguaje pequeño) y casi nunca se aplica en el trabajo diario. Si algún día necesitás uno, vas a encontrarlo en la bibliografía sobre compiladores, mejor explicado.",
        },
      },
      {
        heading: "Para qué sirve aprenderlos",
        numbered: [
          "**Son soluciones probadas.** Alguien ya se comió el problema, exploró los caminos malos y documentó el que funciona.",
          "**Son vocabulario.** Decir «acá va un Adapter» transmite en dos palabras una estructura completa. Sin ese vocabulario, esa misma explicación toma diez minutos y un diagrama en una servilleta.",
          "**Te enseñan a mirar.** Aunque nunca implementes un Visitor, entenderlo te da un criterio nuevo para leer código ajeno.",
        ],
      },
      {
        heading: "Y para qué NO sirven",
        body: [
          "El error más caro con los patrones no es desconocerlos: es aplicarlos donde no hacen falta. Quien acaba de aprenderlos tiende a ver patrones en todos lados y a convertir tres funciones en once clases.",
          "La pregunta correcta nunca es «¿qué patrón aplico acá?». Es «¿qué está cambiando en este código, y con qué frecuencia?». Los patrones son respuestas a la pregunta de qué varía; si nada varía, la respuesta es no hacer nada.",
        ],
      },
      {
        callout: {
          tone: "warn",
          title: "La regla práctica",
          body: "Aplicá un patrón cuando ya sentiste el dolor que resuelve, no cuando lo anticipás. La primera vez, escribilo directo. La segunda, duplicá. La tercera, refactorizá hacia el patrón. Diseñar para un futuro que nunca llega tiene su propio nombre: sobreingeniería.",
        },
      },
    ],
    quiz: [
      {
        q: "¿Cuál es la diferencia entre un patrón y un algoritmo?",
        options: [
          "El algoritmo define pasos concretos; el patrón describe una estructura adaptable",
          "El patrón es más rápido",
          "El algoritmo solo aplica a estructuras de datos",
          "No hay diferencia",
        ],
        answer: 0,
        why: "Un algoritmo es una receta: mismos pasos, mismo resultado. Un patrón es un plano: la misma idea puede materializarse de formas muy distintas.",
      },
      {
        q: "¿Cuál es el error más común al empezar con patrones?",
        options: [
          "Aplicarlos donde no hacía falta",
          "No memorizar los 23 nombres",
          "Usar Python en vez de Java",
          "Leer las consecuencias antes que la estructura",
        ],
        answer: 0,
        why: "La sobreingeniería es el riesgo real: convertir código simple en una jerarquía de clases para resolver una flexibilidad que nadie pidió.",
      },
    ],
  },
  {
    slug: "clasificacion",
    title: "Cómo se clasifican",
    tagline: "Creacionales, estructurales y de comportamiento: tres preguntas distintas.",
    minutes: 5,
    guruUrl: "https://refactoring.guru/es/design-patterns/classification",
    sections: [
      {
        body: [
          "Los patrones se agrupan según **qué tipo de problema** resuelven. La clasificación no es burocracia: te dice en qué sección buscar cuando tenés un problema entre manos.",
        ],
      },
      {
        heading: "Creacionales — ¿cómo se crean los objetos?",
        body: [
          "Se ocupan de la creación de objetos, aumentando la flexibilidad y la reutilización del código existente. Todos atacan la misma pregunta: **cómo evitar que el código quede atado a clases concretas**.",
        ],
        list: [
          "**Factory Method** — delegar qué clase se instancia.",
          "**Abstract Factory** — crear familias de objetos que deben combinar entre sí.",
          "**Builder** — construir objetos complejos paso a paso.",
          "**Prototype** — crear clonando un objeto ya configurado.",
          "**Singleton** — una única instancia con acceso global.",
        ],
      },
      {
        heading: "Estructurales — ¿cómo se componen?",
        body: [
          "Explican cómo ensamblar objetos y clases en estructuras más grandes manteniéndolas flexibles y eficientes. Casi todos giran alrededor de la **composición**: un objeto que contiene a otro y le agrega, le traduce o le controla algo.",
        ],
        list: [
          "**Adapter** — traducir una interfaz a otra.",
          "**Bridge** — separar dos jerarquías que varían por su cuenta.",
          "**Composite** — tratar igual a un objeto y a un árbol de objetos.",
          "**Decorator** — agregar responsabilidades envolviendo.",
          "**Facade** — una puerta simple a un subsistema complejo.",
          "**Flyweight** — compartir el estado que se repite.",
          "**Proxy** — un sustituto que controla el acceso.",
        ],
      },
      {
        heading: "De comportamiento — ¿cómo colaboran?",
        body: [
          "Se ocupan de los algoritmos y del reparto de responsabilidades entre objetos. Son los más numerosos porque hay muchas formas de que dos objetos se comuniquen sin quedar pegados.",
        ],
        list: [
          "**Chain of Responsibility** — pasar la petición por una cadena.",
          "**Command** — convertir una acción en objeto.",
          "**Iterator** — recorrer sin exponer la estructura.",
          "**Mediator** — comunicar a través de un intermediario.",
          "**Memento** — guardar y restaurar estado.",
          "**Observer** — notificar a los interesados.",
          "**State** — cambiar de comportamiento con el estado.",
          "**Strategy** — algoritmos intercambiables.",
          "**Template Method** — esqueleto fijo con huecos.",
          "**Visitor** — operaciones nuevas sin tocar las clases.",
        ],
      },
      {
        heading: "Los que se confunden entre sí",
        table: {
          head: ["Parecidos en estructura", "Los distingue"],
          rows: [
            [
              "Strategy · State · Bridge",
              "Strategy: el cliente elige el algoritmo. State: los estados se conocen y disparan transiciones. Bridge: separa dos dimensiones estructurales.",
            ],
            [
              "Adapter · Decorator · Proxy · Facade",
              "Adapter cambia la interfaz. Decorator la conserva y agrega. Proxy la conserva y controla el acceso. Facade crea una interfaz nueva y más simple.",
            ],
            [
              "Decorator · Chain of Responsibility",
              "En la cadena, cualquier eslabón puede cortar el flujo. En Decorator, todos ejecutan.",
            ],
            [
              "Mediator · Observer · Facade",
              "Observer notifica cambios. Mediator coordina comportamiento. La Facade es unidireccional y el subsistema ni la conoce.",
            ],
            [
              "Template Method · Strategy",
              "Herencia (se fija al definir la clase) vs. composición (se cambia en tiempo de ejecución).",
            ],
          ],
        },
      },
      {
        callout: {
          tone: "tip",
          title: "Cómo usar esta tabla",
          body: "Cuando dos patrones te parezcan iguales, no busques la diferencia en el diagrama: los diagramas se repiten. Buscala en la intención y en quién decide qué. Esa pregunta —¿quién elige?— desempata casi todos los casos.",
        },
      },
    ],
    quiz: [
      {
        q: "¿A qué familia pertenece Proxy?",
        options: ["Estructural", "Creacional", "De comportamiento", "A ninguna"],
        answer: 0,
        why: "Proxy compone: envuelve un objeto para controlar su acceso, sin cambiar su interfaz.",
      },
      {
        q: "Dos patrones tienen exactamente el mismo diagrama. ¿Cómo se distinguen?",
        options: [
          "Por su intención y por quién toma las decisiones",
          "Por la cantidad de clases",
          "Por el lenguaje de programación",
          "Por su rendimiento",
        ],
        answer: 0,
        why: "Strategy, State y Bridge comparten estructura. Lo que los diferencia es qué problema resuelven y quién decide qué implementación se usa.",
      },
    ],
  },
  {
    slug: "principios-de-diseno",
    title: "Principios de diseño",
    tagline: "Los patrones son consecuencias; esto es la causa.",
    minutes: 7,
    guruUrl: "https://refactoring.guru/es/design-patterns/what-is-pattern",
    sections: [
      {
        body: [
          "Casi todos los patrones son aplicaciones de un puñado de principios. Si entendés los principios, podés derivar los patrones; si solo memorizás los patrones, vas a aplicarlos donde no van.",
        ],
      },
      {
        heading: "1. Encapsulá lo que varía",
        body: [
          "Identificá qué partes del código cambian y separalas de las que se mantienen estables. El objetivo es que un cambio futuro afecte a un solo lugar.",
          "Es el principio que origina Strategy (varía el algoritmo), Factory Method (varía qué se crea), State (varía el comportamiento según el estado) y Bridge (varían dos cosas a la vez).",
        ],
        code: {
          caption: "Antes: el cálculo de impuestos vive dentro del pedido y crece con cada país.",
          source: `def total(pedido, pais):
    subtotal = sum(i.precio for i in pedido.items)
    if pais == "AR":
        return subtotal * 1.21
    elif pais == "UY":
        return subtotal * 1.22
    elif pais == "CL":
        return subtotal * 1.19
    ...  # y así con cada país nuevo

# Después: lo que varía queda afuera, en datos.
IVA = {"AR": 0.21, "UY": 0.22, "CL": 0.19}

def total(pedido, pais):
    subtotal = sum(i.precio for i in pedido.items)
    return subtotal * (1 + IVA[pais])`,
        },
      },
      {
        heading: "2. Programá contra interfaces, no contra implementaciones",
        body: [
          "Tu código debe depender de lo que un objeto *hace*, no de qué clase es. Así podés reemplazar la implementación —por otra, por un doble de test, por una versión con caché— sin tocar nada.",
          "En Python esto no requiere clases abstractas: alcanza con documentar el contrato y, si querés verificación estática, usar `typing.Protocol`.",
        ],
      },
      {
        heading: "3. Preferí la composición a la herencia",
        body: [
          "La herencia es el acoplamiento más fuerte que ofrece un lenguaje: la subclase depende de los detalles internos de la base, no puede cambiar en tiempo de ejecución y no se puede combinar libremente.",
          "La composición resuelve lo mismo con objetos que colaboran. Es lo que hacen Strategy, Decorator, Bridge, State y Composite. La herencia sigue siendo útil para expresar «es un» real y para compartir implementación en jerarquías chicas y estables.",
        ],
        table: {
          head: ["Herencia", "Composición"],
          rows: [
            ["Se fija al escribir la clase", "Se decide y se cambia en tiempo de ejecución"],
            ["Una sola jerarquía; combinar explota en subclases", "Se combinan libremente"],
            ["La subclase ve los detalles de la base", "Solo se ve la interfaz pública"],
            ["Menos código para casos simples", "Un poco más de cableado inicial"],
          ],
        },
      },
      {
        heading: "4. Acoplamiento bajo, cohesión alta",
        list: [
          "**Acoplamiento**: cuánto sabe un módulo sobre otro. Querés poco: cuanto menos sepa, menos se rompe cuando el otro cambia.",
          "**Cohesión**: cuánto tienen que ver entre sí las cosas que están juntas. Querés mucha: una clase que hace una sola cosa se entiende, se testea y se reemplaza.",
          "Casi todos los patrones bajan acoplamiento a cambio de agregar indirección. Ese es el precio, y no siempre vale la pena pagarlo.",
        ],
      },
      {
        heading: "5. Las tres reglas de contención",
        list: [
          "**DRY** (*Don't Repeat Yourself*): cada pieza de conocimiento vive en un solo lugar. Ojo: dos fragmentos parecidos que cambian por razones distintas NO son duplicación.",
          "**KISS** (*Keep It Simple*): entre dos soluciones que funcionan, la más simple. El código se lee muchas más veces de las que se escribe.",
          "**YAGNI** (*You Aren't Gonna Need It*): no construyas para el requisito que imaginás. La flexibilidad que no se usa es solo complejidad.",
        ],
      },
      {
        callout: {
          tone: "warn",
          title: "DRY mal entendido es peor que la duplicación",
          body: "Unificar dos funciones parecidas que evolucionan por motivos distintos crea una función con un parámetro booleano, después con dos, y termina en un `if` gigante. La duplicación es más barata que la abstracción equivocada.",
        },
      },
    ],
    quiz: [
      {
        q: "¿Cuál es la principal desventaja de la herencia frente a la composición?",
        options: [
          "Se fija al escribir la clase y no puede cambiar en tiempo de ejecución",
          "Es más lenta",
          "No existe en Python",
          "No permite reutilizar código",
        ],
        answer: 0,
        why: "Además, expone a la subclase los detalles internos de la base: cualquier cambio ahí puede romperla sin que nadie lo note.",
      },
      {
        q: "Dos funciones son casi idénticas pero cambian por razones distintas. ¿Qué conviene?",
        options: [
          "Dejarlas separadas: no son duplicación real",
          "Unificarlas con un parámetro booleano",
          "Unificarlas siempre, por DRY",
          "Borrar una",
        ],
        answer: 0,
        why: "DRY se trata de conocimiento duplicado, no de texto parecido. Unificar cosas que evolucionan distinto produce funciones con banderas que nadie entiende.",
      },
    ],
  },
  {
    slug: "solid",
    title: "SOLID en Python",
    tagline: "Cinco principios, traducidos a un lenguaje con duck typing.",
    minutes: 8,
    sections: [
      {
        body: [
          "SOLID es un acrónimo de cinco principios de diseño orientado a objetos, popularizados por Robert C. Martin. Nacieron pensando en lenguajes con tipado estático y herencia obligatoria; en Python algunos se aplican distinto y uno casi desaparece.",
        ],
      },
      {
        heading: "S — Responsabilidad única",
        body: [
          "Una clase debería tener una sola razón para cambiar. No «hacer una sola cosa»: **cambiar por un solo motivo**. Una clase que se toca cuando cambia la base de datos y también cuando cambia el formato del reporte tiene dos razones, y dos dueños.",
          "Es el principio detrás de casi todos los patrones: Facade, Command, Strategy y Mediator existen para separar responsabilidades que estaban mezcladas.",
        ],
      },
      {
        heading: "O — Abierto/cerrado",
        body: [
          "Abierto a la extensión, cerrado a la modificación: agregar un caso nuevo no debería obligar a editar código existente y probado.",
          "En Python el registro con decorador es la forma más común: agregar una clase la registra sin tocar la fábrica. Ojo, es un ideal, no una ley: a veces editar es más honesto que un punto de extensión que nadie va a usar.",
        ],
        code: {
          caption: "Abierto/cerrado con un registro: agregar un exportador no toca el código existente.",
          source: `EXPORTADORES: dict[str, Callable[[dict], str]] = {}

def exportador(formato: str):
    def envolver(fn):
        EXPORTADORES[formato] = fn
        return fn
    return envolver

@exportador("json")
def a_json(datos: dict) -> str:
    return json.dumps(datos)

@exportador("csv")          # ← agregar esto no modifica nada de arriba
def a_csv(datos: dict) -> str:
    return "\\n".join(f"{k},{v}" for k, v in datos.items())`,
      },
      },
      {
        heading: "L — Sustitución de Liskov",
        body: [
          "Si `B` hereda de `A`, cualquier código que funcione con `A` debe seguir funcionando con `B`. Sin sorpresas: sin precondiciones más estrictas, sin excepciones nuevas, sin métodos que dejan de hacer lo que prometen.",
          "El ejemplo clásico: `Cuadrado` heredando de `Rectangulo`. Matemáticamente un cuadrado *es* un rectángulo; en código, `rect.ancho = 5; rect.alto = 3` rompe la invariante del cuadrado. La relación «es un» del mundo real no siempre sobrevive al código.",
        ],
      },
      {
        heading: "I — Segregación de interfaces",
        body: [
          "Mejor varias interfaces chicas y específicas que una grande que obliga a implementar métodos que no aplican.",
          "En Python se traduce a: definí `Protocol` mínimos. Si tu función solo necesita `leer()`, pedí un protocolo con `leer()`, no toda la interfaz de un archivo.",
        ],
      },
      {
        heading: "D — Inversión de dependencias",
        body: [
          "Los módulos de alto nivel no deben depender de los de bajo nivel: ambos deben depender de abstracciones.",
          "En la práctica, en Python: **pasá las dependencias por parámetro**. Una función que importa y construye su cliente de base de datos adentro es imposible de testear; una que lo recibe se prueba con un diccionario.",
        ],
        code: {
          caption: "La forma más simple de inversión de dependencias en Python: un parámetro.",
          source: `# Difícil de testear: la dependencia está escondida adentro.
def procesar_pedido(pedido):
    db = PostgresClient(os.environ["DB_URL"])   # ← acoplamiento oculto
    db.guardar(pedido)

# Fácil de testear: la dependencia es visible y reemplazable.
def procesar_pedido(pedido, almacen: AlmacenPedidos):
    almacen.guardar(pedido)

procesar_pedido(pedido, AlmacenEnMemoria())     # en los tests`,
        },
      },
      {
        callout: {
          tone: "tip",
          title: "SOLID no es una checklist",
          body: "Son heurísticas para detectar diseños frágiles, no reglas que hay que cumplir en cada archivo. Un script de 40 líneas no necesita inversión de dependencias. Aplicalos cuando el código empieza a doler, no antes.",
        },
      },
    ],
    quiz: [
      {
        q: "¿Qué significa «una sola razón para cambiar»?",
        options: [
          "Que la clase se modifique por un único motivo de negocio o técnico",
          "Que tenga un solo método",
          "Que tenga menos de 100 líneas",
          "Que no herede de nada",
        ],
        answer: 0,
        why: "Una clase con varias razones para cambiar tiene varios dueños, y cada cambio arriesga romper lo que le importa a otro.",
      },
      {
        q: "¿Cuál es la forma más directa de aplicar inversión de dependencias en Python?",
        options: [
          "Pasar la dependencia como parámetro en vez de construirla adentro",
          "Usar una metaclase",
          "Heredar de una clase abstracta",
          "Usar variables globales",
        ],
        answer: 0,
        why: "No hace falta un contenedor de inyección: un parámetro con un `Protocol` como tipo alcanza para desacoplar y para poder testear.",
      },
    ],
  },
  {
    slug: "patrones-en-python",
    title: "Los patrones en Python",
    tagline: "Muchos ya vienen incluidos; otros cambian de forma; algunos sobran.",
    minutes: 8,
    sections: [
      {
        body: [
          "Los 22 patrones del catálogo se formularon pensando en C++ y Smalltalk, y se popularizaron con Java. Python tiene funciones de primera clase, duck typing, decoradores, generadores y una biblioteca estándar generosa: varios patrones se vuelven una línea, y otros dejan de ser necesarios.",
          "Aprenderlos igual vale la pena. Pero traducirlos literalmente desde Java produce código que un pythonista va a rechazar en el code review.",
        ],
      },
      {
        heading: "Patrones que Python ya trae",
        table: {
          head: ["Patrón", "En Python es…"],
          rows: [
            ["Iterator", "El protocolo `__iter__`/`__next__` y los generadores. Está en el lenguaje."],
            ["Prototype", "`copy.copy` y `copy.deepcopy`, con `__copy__` / `__deepcopy__` para personalizar."],
            ["Singleton", "El módulo (se importa una sola vez) o `functools.lru_cache(maxsize=1)`."],
            ["Decorator", "La sintaxis `@` para funciones y clases (primo del patrón, no idéntico)."],
            ["Flyweight", "El internado de cadenas y enteros chicos; `lru_cache` como fábrica."],
            ["Visitor", "`functools.singledispatch` y el `match` estructural, sin doble despacho manual."],
            ["Strategy", "Una función. Con `functools.partial` si necesita configuración."],
            ["Facade", "Un módulo con dos funciones públicas y el resto con guion bajo."],
          ],
        },
      },
      {
        heading: "Las herramientas que reemplazan ceremonia",
        list: [
          "**`typing.Protocol`** — contratos estructurales sin herencia: la implementación no necesita saber que el protocolo existe. Es duck typing con verificación estática.",
          "**`dataclasses`** — reemplaza al Builder en el caso más común y da `__init__`, `__repr__` y `__eq__` gratis. Con `frozen=True`, objetos inmutables.",
          "**`functools`** — `partial` (Strategy configurada), `lru_cache` (Singleton, Flyweight, Proxy de caché), `singledispatch` (Visitor), `wraps` (Decorator bien hecho).",
          "**Generadores** — Iterator perezoso sin escribir una clase; `yield from` para Composite.",
          "**`__getattr__`** — un Proxy genérico que delega todo lo que no intercepta.",
          "**`match`** — despacho por forma y por tipo, alternativa legible a State y Visitor.",
        ],
      },
      {
        heading: "Lo que NO conviene traducir literalmente",
        list: [
          "**Una interfaz con un solo método** → una función. `Callable[[float], float]` es una interfaz perfectamente válida.",
          "**Getters y setters por costumbre** → atributos públicos, y `@property` recién cuando haga falta lógica.",
          "**Clases abstractas en todos lados** → `Protocol` cuando querés verificación, nada cuando alcanza con la convención.",
          "**Una jerarquía de fábricas** → un `dict[str, Callable]` y un decorador de registro.",
          "**Metaclases** → casi nunca. Un decorador de clase o `__init_subclass__` resuelve el 95% de los casos.",
        ],
      },
      {
        callout: {
          tone: "tip",
          title: "La prueba del pythonista",
          body: "Si tu implementación tiene más clases que comportamientos distintos, o si escribiste una clase abstracta con un solo método abstracto, probá la versión con funciones y compará. En este catálogo, cada patrón GoF tiene su ejemplo conceptual y su versión en Python idiomático, justamente para que puedas comparar los dos.",
        },
      },
      {
        heading: "Los que siguen valiendo tal cual",
        body: [
          "No todo se disuelve en funciones. **Composite**, **Observer**, **Command** (cuando necesita deshacer), **Chain of Responsibility**, **Mediator**, **State** (con muchos estados) y **Bridge** siguen siendo, en Python, más o menos lo que describe el libro. Ahí la estructura del patrón *es* la solución, y no hay azúcar sintáctica que la reemplace.",
        ],
      },
    ],
    quiz: [
      {
        q: "¿Qué reemplaza en Python a una interfaz con un solo método?",
        options: [
          "Una función (el tipo `Callable`)",
          "Una metaclase",
          "Un `Enum`",
          "Una clase abstracta con `@abstractmethod`",
        ],
        answer: 0,
        why: "Las funciones son objetos de primera clase: se pasan, se guardan y se combinan igual que cualquier instancia, sin ceremonia.",
      },
      {
        q: "¿Qué patrón está literalmente incorporado al lenguaje?",
        options: ["Iterator", "Mediator", "Bridge", "Composite"],
        answer: 0,
        why: "El protocolo de iteración es parte de Python: `for`, comprensiones, `zip` y el desempaquetado se apoyan en `__iter__`/`__next__`.",
      },
      {
        q: "¿Cuándo conviene usar una metaclase?",
        options: [
          "Casi nunca: un decorador de clase o `__init_subclass__` suele alcanzar",
          "Siempre que quieras un Singleton",
          "Para implementar Strategy",
          "Para cualquier clase abstracta",
        ],
        answer: 0,
        why: "Las metaclases son potentes y difíciles de depurar. La regla de Tim Peters sigue vigente: si no estás seguro de necesitarlas, no las necesitás.",
      },
    ],
  },
  {
    slug: "patrones-de-ia",
    title: "Por qué hacen falta patrones para IA",
    tagline: "Los mismos principios, sobre un componente que no es determinista.",
    minutes: 7,
    sections: [
      {
        body: [
          "Construir sobre un modelo de lenguaje rompe una suposición que todo el diseño de software daba por sentada: que el mismo llamado con la misma entrada devuelve lo mismo. Un LLM no garantiza formato, no garantiza corrección, cuesta dinero por llamada, tarda segundos y a veces falla.",
          "Los patrones clásicos siguen aplicando —de hecho, casi todos los patrones de IA de este catálogo son un patrón GoF con otro nombre—, pero aparecen problemas nuevos que el libro de 1994 no podía anticipar.",
        ],
      },
      {
        heading: "Qué cambia respecto del software tradicional",
        table: {
          head: ["Supuesto tradicional", "Con un LLM en el medio"],
          rows: [
            ["La misma entrada da la misma salida", "La salida varía; hay que validar siempre"],
            ["Una llamada a función es gratis", "Cada llamada cuesta dinero y cientos de milisegundos"],
            ["Los errores son excepciones", "El error más peligroso es una respuesta plausible pero incorrecta"],
            ["El contrato es la firma de la función", "El contrato es un texto en lenguaje natural que el modelo puede ignorar"],
            ["Testear es comparar valores", "Testear es evaluar calidad sobre un conjunto de casos"],
          ],
        },
      },
      {
        heading: "El mapa: cada patrón de IA es un patrón clásico",
        table: {
          head: ["Patrón de IA", "Patrón clásico subyacente"],
          rows: [
            ["Plantilla de Prompt", "Template Method + Builder"],
            ["Adaptador de Proveedor", "Adapter (y Bridge cuando ambas dimensiones varían)"],
            ["Cadena de Prompts", "Pipes and Filters / Chain of Responsibility"],
            ["Enrutador de Modelos", "Strategy elegida por un despachador"],
            ["Herramientas del Agente", "Command + Registry"],
            ["RAG", "Strategy (el recuperador) + Composite (el híbrido)"],
            ["Memoria de Conversación", "Strategy + Memento"],
            ["Guardarraíles", "Chain of Responsibility + Specification"],
            ["Caché Semántica", "Proxy de caché"],
            ["Cascada de Respaldo", "Chain of Responsibility + Proxy (cortacircuitos)"],
            ["Orquestador y Trabajadores", "Mediator + Composite + Map/Reduce"],
            ["Tubería de Datos", "Composite + Template Method"],
            ["Callbacks de Entrenamiento", "Observer"],
            ["Checkpoint y Reanudación", "Memento"],
            ["Ensamble de Modelos", "Composite + Strategy"],
            ["Fuente de Frames", "Adapter + Iterator + Decorator"],
            ["Inferencia por Lotes", "Proxy"],
            ["Seguimiento Multiobjeto", "Mediator + State + Observer"],
          ],
        },
      },
      {
        callout: {
          tone: "info",
          title: "Por qué igual merecen un nombre propio",
          body: "Decir «RAG es un Strategy» es cierto y no alcanza: no te dice nada sobre fragmentación, umbrales de relevancia ni abstención. El patrón de IA agrega el contexto —qué falla, qué medir, qué decidir— que el patrón estructural no puede aportar.",
        },
      },
      {
        heading: "Tres reglas que atraviesan todo el catálogo de IA",
        numbered: [
          "**Lo que se puede resolver con código, resolvelo con código.** Es más barato, más rápido, reproducible y no alucina. Usá el modelo solo donde hace falta.",
          "**Todo lo que sale del modelo se valida.** Formato, contenido y seguridad, con código determinista y fuera del prompt. Una instrucción en el prompt no es un control.",
          "**Medí antes de optimizar.** Costo por consulta, latencia p99, tasa de acierto de la caché, calidad sobre un conjunto de evaluación. Sin números, cualquier cambio en el prompt es superstición.",
        ],
      },
    ],
    quiz: [
      {
        q: "¿Cuál es el error más peligroso al construir sobre un LLM?",
        options: [
          "Una respuesta plausible pero incorrecta, sin ninguna señal de error",
          "Un timeout",
          "Un error de sintaxis en el prompt",
          "Un 429",
        ],
        answer: 0,
        why: "Un timeout se ve y se maneja. Una alucinación bien redactada atraviesa el sistema y llega al usuario como si fuera verdad.",
      },
      {
        q: "¿Qué patrón clásico está detrás de los Guardarraíles?",
        options: [
          "Chain of Responsibility",
          "Singleton",
          "Prototype",
          "Abstract Factory",
        ],
        answer: 0,
        why: "Cada barrera es un eslabón que puede aceptar, transformar o bloquear, exactamente como los manejadores de una cadena.",
      },
    ],
  },
  {
    slug: "como-estudiarlos",
    title: "Cómo estudiar este catálogo",
    tagline: "Una ruta de ocho semanas y una forma de estudiar que sirve.",
    minutes: 5,
    sections: [
      {
        body: [
          "Leer los 47 patrones de corrido no funciona: a la semana te quedan los nombres y ninguna intuición. Lo que funciona es estudiar pocos por vez, escribir el código a mano y volver.",
        ],
      },
      {
        heading: "El método, para cada patrón",
        numbered: [
          "**Leé el problema primero y pará ahí.** Antes de ver la solución, pensá cómo lo resolverías vos. Es la parte que más enseña y la que todo el mundo se saltea.",
          "**Leé la solución y las consecuencias.** Prestá especial atención a las contras: los patrones se eligen por sus costos, no por sus beneficios.",
          "**Mirá el ejemplo conceptual** para entender los roles, y después el **Python idiomático** para ver cómo se escribe de verdad.",
          "**Escribilo a mano, sin copiar.** Diez minutos tipeando valen más que una hora leyendo.",
          "**Hacé el quiz y un ejercicio.** El quiz detecta lo que creías entender; el ejercicio consolida.",
          "**Buscalo en el código que ya usás.** Encontrar un Adapter en una biblioteca que usás todos los días es el momento en que el patrón se vuelve tuyo.",
        ],
      },
      {
        heading: "Ruta sugerida",
        table: {
          head: ["Semana", "Contenido", "Por qué en este orden"],
          rows: [
            ["1", "Fundamentos + Strategy, Factory Method, Observer", "Los tres más usados y los más fáciles de reconocer."],
            ["2", "Decorator, Adapter, Facade, Singleton", "Estructurales cotidianos; Singleton con su crítica incluida."],
            ["3", "Composite, Iterator, Template Method, Command", "Aparecen en toda biblioteca que uses."],
            ["4", "Builder, Prototype, Abstract Factory, State", "Creacionales completos y el primer patrón con transiciones."],
            ["5", "Chain of Responsibility, Mediator, Memento, Proxy", "La base de los middlewares, el deshacer y las cachés."],
            ["6", "Bridge, Flyweight, Visitor + repaso general", "Los tres más difíciles, ya con contexto suficiente."],
            ["7", "IA: Plantilla de Prompt, Adaptador de Proveedor, Cadena de Prompts, Enrutador, Herramientas, RAG, Guardarraíles", "El núcleo de cualquier aplicación con LLM."],
            ["8", "IA: agentes, memoria, resiliencia + ML y visión", "Los que suponen todo lo anterior."],
          ],
        },
      },
      {
        callout: {
          tone: "tip",
          title: "Marcá tu progreso",
          body: "Cada patrón tiene un botón para marcarlo como estudiado. El progreso se guarda en tu navegador (nada se envía a ningún servidor) y aparece en la portada. Volver a un patrón marcado hace dos semanas y no acordarte es información útil, no un fracaso.",
        },
      },
      {
        heading: "Cómo saber que lo entendiste",
        list: [
          "Podés explicar **qué problema resuelve** sin nombrar el patrón.",
          "Podés nombrar **al menos una desventaja** concreta.",
          "Podés decir **en qué se diferencia** del patrón más parecido.",
          "Reconocés un ejemplo **en código que no escribiste vos**.",
          "Podés decir **cuándo NO lo usarías**.",
        ],
      },
    ],
    quiz: [
      {
        q: "Según el método propuesto, ¿qué conviene hacer antes de leer la solución?",
        options: [
          "Pensar cómo resolverías el problema vos",
          "Memorizar el diagrama",
          "Leer el código de ejemplo",
          "Hacer el quiz",
        ],
        answer: 0,
        why: "Intentarlo antes te da con qué comparar: sin ese intento, la solución parece obvia y no queda nada.",
      },
      {
        q: "¿Cuál es la mejor señal de que entendiste un patrón?",
        options: [
          "Podés explicar el problema y decir cuándo NO usarlo",
          "Te acordás del nombre en inglés",
          "Podés dibujar el diagrama de memoria",
          "Sabés en qué familia está",
        ],
        answer: 0,
        why: "Saber cuándo no aplicarlo requiere entender sus costos, que es exactamente lo que separa a quien usa patrones de quien los colecciona.",
      },
    ],
  },
  {
    slug: "criticas",
    title: "Críticas y sobreingeniería",
    tagline: "El capítulo que casi nadie lee y el que más código salva.",
    minutes: 5,
    guruUrl: "https://refactoring.guru/es/design-patterns/criticism",
    sections: [
      {
        heading: "1. «Son parches para lenguajes limitados»",
        body: [
          "Peter Norvig mostró que 16 de los 23 patrones del GoF se simplifican o desaparecen en lenguajes dinámicos como Lisp o Python. Y tiene razón: Strategy es una función, Iterator está en el lenguaje, Singleton es un módulo.",
          "La conclusión correcta no es «los patrones no sirven», sino: **aprendé el problema, no la implementación**. El problema que resuelve Strategy —querer intercambiar comportamiento sin tocar el cliente— existe en cualquier lenguaje. Lo que cambia es cuánto código hace falta.",
        ],
      },
      {
        heading: "2. Soluciones ineficientes por costumbre",
        body: [
          "Aplicar un patrón «porque así se hace» agrega indirección, asignaciones y llamadas. En un bucle caliente, cinco capas de decoradores se notan.",
          "Antes de aplicar un patrón por rendimiento —Flyweight, Proxy de caché, batching— **medí**. Y después de aplicarlo, medí de nuevo.",
        ],
      },
      {
        heading: "3. Uso injustificado: el martillo dorado",
        body: [
          "Es la crítica más certera. Quien acaba de aprender patrones los ve en todos lados y convierte tres funciones en once clases con nombres que terminan en `Factory`, `Manager` y `Strategy`.",
          "El síntoma: para entender qué hace el código hay que abrir cinco archivos y ninguno hace nada por sí solo.",
        ],
      },
      {
        callout: {
          tone: "warn",
          title: "Señales de sobreingeniería",
          body: "Una interfaz con una sola implementación y sin planes de una segunda. Una fábrica que devuelve siempre la misma clase. Un Strategy con una sola estrategia. Una capa de abstracción que solo delega. Un `BaseAbstractManagerFactory`. Si lo reconocés en tu código, borrar suele ser el mejor refactor disponible.",
        },
      },
      {
        heading: "Antipatrones cercanos",
        list: [
          "**Objeto dios** — una clase que sabe y hace todo. Suele aparecer cuando una Facade o un Mediator crecen sin límite.",
          "**Abstracción especulativa** — puntos de extensión para requisitos imaginarios. Es YAGNI con más pasos.",
          "**Infierno de indirección** — tantas capas que ninguna hace nada visible; seguir una llamada requiere ocho archivos.",
          "**Programación por copia de patrón** — traducir literalmente el ejemplo en Java, incluyendo getters, setters y clases abstractas que Python no necesita.",
        ],
      },
      {
        heading: "El balance honesto",
        body: [
          "Los patrones son un vocabulario y una biblioteca de soluciones evaluadas. Valen mucho como **herramienta de comunicación** y como **catálogo de compromisos conocidos**.",
          "Valen poco como checklist de arquitectura. Nadie diseñó un buen sistema eligiendo patrones primero. Se diseña resolviendo el problema, y a veces el resultado tiene nombre.",
        ],
      },
    ],
    quiz: [
      {
        q: "¿Cuál es la crítica de Peter Norvig?",
        options: [
          "Muchos patrones se simplifican o desaparecen en lenguajes dinámicos",
          "Que los patrones son demasiado rápidos",
          "Que el libro GoF tiene errores",
          "Que solo funcionan en Java",
        ],
        answer: 0,
        why: "Mostró que 16 de los 23 patrones se vuelven triviales o innecesarios en Lisp. La lección: aprendé el problema, no la ceremonia.",
      },
      {
        q: "¿Cuál de estas es una señal clara de sobreingeniería?",
        options: [
          "Una interfaz con una sola implementación y sin planes de otra",
          "Usar `dataclass`",
          "Tener tests",
          "Documentar el código",
        ],
        answer: 0,
        why: "Una abstracción existe para permitir variación. Si no hay variación ni la va a haber, solo agrega un archivo entre vos y el código que importa.",
      },
    ],
  },
  {
    slug: "leer-diagramas",
    title: "Leer los diagramas",
    tagline: "El UML mínimo indispensable para entender un patrón de un vistazo.",
    minutes: 4,
    sections: [
      {
        body: [
          "No hace falta saber UML para programar, pero sí para leer literatura de patrones. Con cinco símbolos alcanza para el 95% de los diagramas que vas a encontrar.",
        ],
      },
      {
        heading: "Las cinco relaciones",
        table: {
          head: ["Notación", "Significa", "En Python"],
          rows: [
            ["`A ──▷ B` (triángulo vacío)", "A hereda de B", "`class A(B):`"],
            ["`A ┈┈▷ B` (línea punteada)", "A implementa la interfaz B", "`Protocol`, o simplemente tener los métodos"],
            ["`A ──▶ B` (flecha simple)", "A usa a B (asociación)", "A recibe o guarda una referencia a B"],
            ["`A ◇──▶ B` (rombo vacío)", "Agregación: A tiene B, pero B vive sin A", "`self.items: list[B]`"],
            ["`A ◆──▶ B` (rombo lleno)", "Composición: A tiene B y B muere con A", "A crea B en su `__init__`"],
          ],
        },
      },
      {
        heading: "En una caja de clase",
        list: [
          "**Arriba** el nombre. En *cursiva* si es abstracta; con `«interfaz»` si es una interfaz.",
          "**Al medio** los atributos: `- privado`, `+ público`, `# protegido`.",
          "**Abajo** los métodos, con la misma notación de visibilidad. En cursiva los abstractos.",
          "`subrayado` significa estático (de clase, no de instancia).",
        ],
      },
      {
        callout: {
          tone: "tip",
          title: "Cómo leer un diagrama de patrón en 30 segundos",
          body: "1) Buscá la interfaz (la caja con «interfaz» o en cursiva): ahí está el contrato. 2) Buscá quién la implementa: esas son las variantes. 3) Buscá quién la usa sin conocer las variantes: ese es el cliente, y su desacoplamiento es el punto del patrón. 4) Buscá la flecha que va del compuesto hacia la interfaz: ahí está la recursión, si la hay.",
        },
      },
      {
        body: [
          "En esta app los diagramas están en texto monoespaciado en lugar de UML formal. Es a propósito: se leen igual de rápido, funcionan en cualquier pantalla y se copian y pegan en un comentario del código.",
        ],
      },
    ],
    quiz: [
      {
        q: "¿Qué indica un rombo lleno en un diagrama UML?",
        options: [
          "Composición: la parte no existe sin el todo",
          "Herencia",
          "Implementación de interfaz",
          "Un método estático",
        ],
        answer: 0,
        why: "El rombo vacío es agregación (la parte sobrevive al todo); el lleno es composición (el todo crea y destruye a la parte).",
      },
      {
        q: "En un diagrama de patrón, ¿qué buscarías primero?",
        options: [
          "La interfaz: ahí está el contrato que desacopla al cliente",
          "La clase con más métodos",
          "La primera caja de arriba a la izquierda",
          "Los atributos privados",
        ],
        answer: 0,
        why: "Todo patrón se organiza alrededor de un contrato. Identificarlo te dice quién varía, quién permanece y por qué el cliente no se rompe.",
      },
    ],
  },
];
