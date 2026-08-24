import type { Pattern } from "@/lib/types";

export const CREACIONALES: Pattern[] = [
  {
    slug: "factory-method",
    name: "Factory Method",
    aka: ["Método de fábrica", "Constructor virtual"],
    track: "gof",
    family: "creacional",
    tagline: "Delegar en subclases (o en un registro) qué objeto concreto se crea.",
    intent:
      "Proporciona una interfaz para crear objetos en una superclase, mientras permite a las subclases alterar el tipo de objetos que se crean.",
    problem: [
      "Tu aplicación empezó manejando un solo tipo de cosa: una app de logística que solo transportaba en camión. La clase `Camion` está instanciada con `Camion()` en veinte lugares distintos.",
      "Ahora hay que agregar barcos. Cada `Camion()` esparcido por el código es un punto donde hay que decidir, con un `if`, qué clase construir. El código de negocio queda acoplado a clases concretas y cada transporte nuevo obliga a tocar todos esos lugares.",
    ],
    solution: [
      "Reemplazá las llamadas directas al constructor por llamadas a un **método fábrica**. El método sigue devolviendo objetos, pero el tipo concreto lo decide quien implementa el método, no quien lo llama.",
      "El código cliente trabaja contra la interfaz común (`Transporte`) y nunca menciona `Camion` ni `Barco`. Agregar un transporte nuevo es agregar una implementación, no editar el cliente.",
    ],
    analogy: {
      title: "El cadete que trae el café",
      body: [
        "Le pedís «un café» a quien va al bar. No especificás la máquina, la marca ni el barista: definiste el *qué*, y el *cómo* lo resuelve el otro lado. Si mañana el bar cambia de proveedor, tu pedido sigue siendo el mismo.",
      ],
    },
    diagram: `      ┌────────────────────┐            ┌──────────────┐
      │      Creador       │            │  Producto    │  «interfaz»
      ├────────────────────┤            ├──────────────┤
      │ + operacion()      │ ─ ─ crea ▶ │ + hacer()    │
      │ + crearProducto()  │            └──────┬───────┘
      └─────────┬──────────┘                   │
                │                     ┌────────┴────────┐
     ┌──────────┴─────────┐           │                 │
┌────┴─────┐        ┌─────┴────┐  ┌───┴────┐      ┌─────┴───┐
│CreadorA  │        │CreadorB  │  │ProdA   │      │ProdB    │
│crearProd │        │crearProd │  └────────┘      └─────────┘
│ → ProdA  │        │ → ProdB  │
└──────────┘        └──────────┘`,
    applicability: [
      {
        when: "No sabés de antemano los tipos exactos que va a necesitar tu código",
        detail:
          "El patrón separa el código que *usa* productos del que los *crea*, así que agregar tipos no obliga a tocar el primero.",
      },
      {
        when: "Querés que quien use tu biblioteca pueda extender sus componentes",
        detail:
          "Exponés el método fábrica como punto de extensión: el usuario lo sobrescribe (o registra su clase) y su tipo entra en el flujo.",
      },
      {
        when: "Querés reutilizar objetos caros en vez de reconstruirlos",
        detail:
          "El método fábrica puede devolver una instancia de un pool o de una caché; el cliente ni se entera.",
      },
    ],
    steps: [
      "Hacé que todos los productos sigan la misma interfaz, con los métodos que el cliente realmente usa.",
      "Agregá un método fábrica vacío (o abstracto) en la clase creadora, con la interfaz del producto como tipo de retorno.",
      "Reemplazá en el creador todas las referencias a constructores concretos por llamadas al método fábrica.",
      "Creá una subclase (o una entrada de registro) por cada tipo de producto y sobrescribí ahí el método.",
      "Si el método fábrica queda vacío en la base, mové el caso más común a una implementación por defecto.",
    ],
    pros: [
      "Evita el acoplamiento fuerte entre el creador y los productos concretos.",
      "Principio de responsabilidad única: el código de creación vive en un solo lugar.",
      "Principio abierto/cerrado: introducís tipos nuevos sin romper el código existente.",
    ],
    cons: [
      "Puede inflar la jerarquía de clases si se aplica donde alcanzaba con una función.",
      "Un registro global de fábricas se vuelve un punto oscuro si nadie documenta qué se registra y cuándo.",
    ],
    pythonNotes: [
      {
        title: "Las clases ya son objetos",
        body:
          "En Python no necesitás una jerarquía de creadores: un `dict[str, type]` o `dict[str, Callable]` funciona como fábrica y se puede poblar con un decorador de registro.",
      },
      {
        title: "`classmethod` como constructor alternativo",
        body:
          "`Fecha.desde_iso(...)`, `Path.cwd()`, `dict.fromkeys(...)`: la biblioteca estándar está llena de métodos fábrica que evitan constructores sobrecargados.",
      },
      {
        title: "Cuándo NO usarlo",
        body:
          "Si solo tenés dos tipos y ningún plan de crecer, `Camion() if ... else Barco()` es más honesto que tres clases nuevas.",
      },
    ],
    relations: [
      "Muchos diseños empiezan con Factory Method y evolucionan hacia Abstract Factory, Prototype o Builder cuando hacen falta más grados de libertad.",
      "Abstract Factory suele implementarse como un conjunto de Factory Methods.",
      "Template Method es lo mismo pero a nivel algoritmo: Factory Method es un paso especializado de un Template Method.",
    ],
    related: ["abstract-factory", "prototype", "builder", "template-method"],
    samples: [
      {
        title: "Ejemplo conceptual",
        description: "La estructura del patrón con comentarios sobre cada rol.",
        path: "src/FactoryMethod/Conceptual/main.py",
        outputPath: "src/FactoryMethod/Conceptual/Output.txt",
        credit: "Refactoring.Guru (CC BY-NC-ND 4.0)",
      },
      {
        title: "Versión Python idiomática",
        description: "Registro de constructores con decorador, `Protocol` y cero clases creadoras.",
        path: "ejemplos/idiomatico/factory-method.py",
        outputPath: "ejemplos/idiomatico/factory-method.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Cuál es la diferencia central entre Factory Method y Abstract Factory?",
        options: [
          "Factory Method crea un producto; Abstract Factory crea familias de productos relacionados",
          "Factory Method es más rápido en tiempo de ejecución",
          "Abstract Factory no se puede usar con herencia",
          "Son sinónimos, cambia solo el nombre según el lenguaje",
        ],
        answer: 0,
        why: "Factory Method resuelve la creación de UN producto mediante una operación sobrescribible. Abstract Factory agrupa varios métodos fábrica para garantizar que los productos creados pertenezcan a la misma familia.",
      },
      {
        q: "En Python, ¿qué reemplaza con frecuencia a la jerarquía de creadores?",
        options: [
          "Un diccionario que mapea nombres a clases o funciones",
          "Una metaclase obligatoria",
          "El módulo `abc` con herencia múltiple",
          "Nada: hay que replicar la jerarquía tal cual",
        ],
        answer: 0,
        why: "Como las clases son objetos de primera clase, un registro `dict[str, Callable]` cumple el rol del creador sin agregar clases.",
      },
      {
        q: "El código cliente de un Factory Method bien aplicado…",
        options: [
          "solo conoce la interfaz del producto",
          "conoce todas las clases concretas para poder elegir",
          "debe importar el módulo de cada producto",
          "necesita un `if` por cada tipo nuevo",
        ],
        answer: 0,
        why: "Si el cliente sigue mencionando clases concretas, el patrón no está aportando nada: el objetivo es justamente eliminar ese acoplamiento.",
      },
    ],
    exercises: [
      "Agregá un canal `slack` al ejemplo idiomático sin tocar la función `crear_notificador`.",
      "Convertí el registro en uno que valide, al registrar, que la clase cumple el `Protocol` (usá `runtime_checkable` e `isinstance`).",
      "Escribí un test que verifique que `crear_notificador` levanta `ValueError` con un canal inválido, y otro que compruebe que el decorador registró la clase.",
    ],
    difficulty: 1,
    popularity: 3,
    guruUrl: "https://refactoring.guru/es/design-patterns/factory-method",
  },
  {
    slug: "abstract-factory",
    name: "Abstract Factory",
    aka: ["Fábrica abstracta"],
    track: "gof",
    family: "creacional",
    tagline: "Crear familias de objetos que tienen que combinar entre sí.",
    intent:
      "Permite producir familias de objetos relacionados sin especificar sus clases concretas.",
    problem: [
      "Tenés una tienda de muebles con familias (`Art déco`, `Victoriano`, `Moderno`) y tipos (`Silla`, `Sofá`, `Mesa`). Necesitás que el cliente que arma un living no termine con una silla art déco y un sofá moderno.",
      "Con constructores directos nada impide esa mezcla, y cada familia nueva obliga a revisar todo el código de creación.",
    ],
    solution: [
      "Declará una interfaz por cada tipo de producto y una interfaz de fábrica con un método de creación por tipo.",
      "Cada familia implementa la fábrica devolviendo sus propias variantes. El cliente recibe una fábrica y ya no puede mezclar: sea cual sea la que le toque, todo lo que cree pertenece a la misma familia.",
    ],
    analogy: {
      title: "El enchufe y el voltaje",
      body: [
        "Cuando viajás no comprás un adaptador por aparato: comprás el kit del país. El kit garantiza que la ficha, el voltaje y la frecuencia sean coherentes entre sí. Elegís la familia una vez y el resto encaja.",
      ],
    },
    diagram: `                 ┌────────────────────────┐
                 │   FabricaAbstracta     │  «interfaz»
                 ├────────────────────────┤
                 │ + crearSilla(): Silla  │
                 │ + crearSofa(): Sofa    │
                 └───────────┬────────────┘
              ┌──────────────┴──────────────┐
    ┌─────────┴─────────┐         ┌─────────┴─────────┐
    │ FabricaModerna    │         │ FabricaVictoriana │
    │ → SillaModerna    │         │ → SillaVictoriana │
    │ → SofaModerno     │         │ → SofaVictoriano  │
    └───────────────────┘         └───────────────────┘
    Cliente ──▶ usa FabricaAbstracta + interfaces Silla/Sofa`,
    applicability: [
      {
        when: "Tu código debe funcionar con varias familias de productos relacionados",
        detail:
          "Y no querés que dependa de las clases concretas, porque no las conocés de antemano o querés poder extenderlas.",
      },
      {
        when: "Necesitás garantizar compatibilidad entre los objetos creados",
        detail:
          "El patrón hace *imposible por construcción* mezclar variantes de familias distintas.",
      },
      {
        when: "Tenés una clase con muchos métodos fábrica que difuminan su responsabilidad",
        detail: "Extraerlos a una fábrica dedicada suele aclarar el diseño.",
      },
    ],
    steps: [
      "Dibujá una matriz: filas = tipos de producto, columnas = variantes. Si la matriz está completa, el patrón encaja.",
      "Declará una interfaz por cada fila (tipo de producto).",
      "Declará la interfaz de fábrica con un método de creación por fila.",
      "Implementá una fábrica concreta por columna (variante).",
      "Creá la fábrica una sola vez, en el arranque de la app, y pasala por inyección de dependencias.",
    ],
    pros: [
      "Garantiza la compatibilidad entre los productos que salen de la misma fábrica.",
      "Desacopla el código cliente de las clases concretas.",
      "Concentra el código de creación en un lugar (responsabilidad única).",
      "Agregar una variante nueva no rompe el código existente (abierto/cerrado).",
    ],
    cons: [
      "Agregar un *tipo* de producto nuevo obliga a tocar la interfaz de fábrica y todas sus implementaciones.",
      "Muchas interfaces y clases para lo que a veces resuelve un diccionario de constructores.",
    ],
    pythonNotes: [
      {
        title: "Un `dataclass` de constructores",
        body:
          "`@dataclass(frozen=True) class Kit: boton: Callable[[], Boton]; casilla: ...`. Sigue garantizando la coherencia de la familia sin una jerarquía de fábricas.",
      },
      {
        title: "Módulos como fábricas",
        body:
          "Cada variante puede ser un módulo (`tema_oscuro.py`, `tema_claro.py`) que expone los mismos nombres. `importlib.import_module` elige la familia en tiempo de ejecución.",
      },
      {
        title: "Elegí la familia una sola vez",
        body:
          "El error típico es resolver la fábrica dentro de cada función. Resolvela en el arranque (composition root) y pasala hacia abajo.",
      },
    ],
    relations: [
      "Suele arrancar como Factory Method y crecer hacia Abstract Factory cuando aparecen familias.",
      "Se puede implementar con Prototype: la fábrica clona prototipos en vez de instanciar clases.",
      "Una fábrica concreta muchas veces se implementa como Singleton.",
      "Builder construye un objeto complejo paso a paso; Abstract Factory devuelve productos terminados de golpe.",
    ],
    related: ["factory-method", "builder", "prototype", "singleton"],
    samples: [
      {
        title: "Ejemplo conceptual",
        path: "src/AbstractFactory/Conceptual/main.py",
        outputPath: "src/AbstractFactory/Conceptual/Output.txt",
        credit: "Refactoring.Guru (CC BY-NC-ND 4.0)",
      },
      {
        title: "Versión Python idiomática",
        description: "La familia como `dataclass` de constructores, sin jerarquía de fábricas.",
        path: "ejemplos/idiomatico/abstract-factory.py",
        outputPath: "ejemplos/idiomatico/abstract-factory.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Cuál es el costo principal de Abstract Factory?",
        options: [
          "Agregar un tipo de producto nuevo obliga a modificar la fábrica y todas sus implementaciones",
          "No permite agregar variantes nuevas",
          "Obliga a usar herencia múltiple",
          "Impide inyectar dependencias",
        ],
        answer: 0,
        why: "El patrón es abierto para variantes (columnas) pero cerrado para tipos (filas): sumar una fila toca toda la jerarquía de fábricas.",
      },
      {
        q: "¿Dónde debería resolverse qué fábrica concreta usar?",
        options: [
          "Una sola vez, en el arranque de la aplicación",
          "En cada función que necesite un producto",
          "Dentro de cada producto concreto",
          "En una variable global mutable",
        ],
        answer: 0,
        why: "Resolver la familia en un único punto (composition root) es lo que evita que las decisiones de configuración se filtren por todo el código.",
      },
    ],
    exercises: [
      "Agregá un `KitDeInterfaz` para Linux al ejemplo idiomático y comprobá que `render_formulario` no cambia.",
      "Sumá un tercer producto (`Ventana`) y anotá cuántos archivos tuviste que tocar: eso es el costo del patrón.",
      "Reescribí la selección de kit para que lea una variable de entorno con `os.environ.get`, con un valor por defecto seguro.",
    ],
    difficulty: 2,
    popularity: 3,
    guruUrl: "https://refactoring.guru/es/design-patterns/abstract-factory",
  },
  {
    slug: "builder",
    name: "Builder",
    aka: ["Constructor"],
    track: "gof",
    family: "creacional",
    tagline: "Construir objetos complejos paso a paso, sin constructores de 15 parámetros.",
    intent:
      "Permite construir objetos complejos paso a paso, produciendo distintos tipos y representaciones con el mismo código de construcción.",
    problem: [
      "Una `Casa` puede tener piscina, jardín, sistema de calefacción, techo de tejas o de chapa. Modelar cada combinación con una subclase da una explosión de clases; modelarla con un constructor gigante da una llamada ilegible llena de `None, None, True, None`.",
      "Además hay construcciones que requieren un orden: no podés poner el techo antes de las paredes.",
    ],
    solution: [
      "Sacá el código de construcción a un objeto `Builder` con un método por paso. No todos los pasos son obligatorios: cada cliente llama a los que necesita.",
      "Opcionalmente, un `Director` encapsula recetas de construcción reutilizables («casa mínima», «casa con pileta») para que el cliente no repita secuencias.",
    ],
    analogy: {
      title: "Armar la pizza",
      body: [
        "El mostrador de la pizzería es un builder: masa, salsa, muzzarella, y después lo que quieras. Nadie te obliga a pedir una pizza con los 12 ingredientes en None. Y «la especial de la casa» es el Director: una secuencia fija que alguien ya definió por vos.",
      ],
    },
    diagram: `  Director            Builder «interfaz»          Producto
 ┌────────┐        ┌──────────────────┐        ┌───────────┐
 │construir│──────▶│ + paredes()      │───────▶│  Casa     │
 │ (b)     │       │ + techo()        │        └───────────┘
 └────────┘        │ + pileta()       │
                   │ + obtener()      │        ┌───────────┐
                   └────────┬─────────┘───────▶│  CasaXML  │
                   ┌────────┴─────────┐        └───────────┘
                   │ BuilderCasa      │
                   │ BuilderXML       │  ← misma receta,
                   └──────────────────┘    distinta representación`,
    applicability: [
      {
        when: "El constructor tiene demasiados parámetros, la mayoría opcionales",
        detail:
          "El «constructor telescópico» (varias sobrecargas encadenadas) es el olor que Builder resuelve.",
      },
      {
        when: "Querés producir distintas representaciones con el mismo proceso",
        detail:
          "La misma secuencia de pasos genera una casa de madera o un documento XML si cambiás el builder.",
      },
      {
        when: "La construcción es por pasos, con validación entre medio",
        detail: "Consultas SQL, requests HTTP, documentos, árboles de configuración.",
      },
    ],
    steps: [
      "Definí los pasos comunes a todas las representaciones. Si no hay pasos comunes, el patrón no aplica.",
      "Declará la interfaz `Builder` con esos pasos.",
      "Implementá un builder concreto por representación, cada uno con su método para recuperar el resultado.",
      "Consideré un `Director` para las secuencias que se repiten.",
      "El cliente crea builder y director, construye y recupera el producto del builder.",
    ],
    pros: [
      "Construcción paso a paso, diferida o recursiva.",
      "Reutiliza el mismo código de construcción para representaciones distintas.",
      "Aísla la lógica de armado compleja del objeto resultante.",
      "Permite entregar un producto inmutable y siempre válido.",
    ],
    cons: [
      "Más clases y más indirección.",
      "En Python, casi siempre innecesario para objetos de datos: `dataclass` con valores por defecto ya resuelve el 80% de los casos.",
    ],
    pythonNotes: [
      {
        title: "Los argumentos por nombre ya son un builder",
        body:
          "`Casa(paredes=4, pileta=True)` con `@dataclass` cubre el caso más común. Reservá el Builder para armado por pasos, validación intermedia o APIs fluidas.",
      },
      {
        title: "Encadenar devolviendo `Self`",
        body:
          "Tipar el retorno como `Self` (PEP 673) hace que el encadenamiento funcione bien con subclases y con el chequeo estático.",
      },
      {
        title: "Producto inmutable, builder mutable",
        body:
          "Que el builder acumule y `construir()` devuelva un `frozen dataclass` evita objetos a medio construir circulando por el sistema.",
      },
    ],
    relations: [
      "Builder se enfoca en construir objetos complejos paso a paso; Abstract Factory se enfoca en familias de productos y los devuelve terminados.",
      "Se combina con Composite para construir árboles.",
      "El Director puede verse como una Strategy de construcción.",
    ],
    related: ["abstract-factory", "composite", "prototype", "factory-method"],
    samples: [
      {
        title: "Ejemplo conceptual",
        path: "src/Builder/Conceptual/main.py",
        outputPath: "src/Builder/Conceptual/Output.txt",
        credit: "Refactoring.Guru (CC BY-NC-ND 4.0)",
      },
      {
        title: "Versión Python idiomática",
        description: "Builder fluido de consultas SQL con producto inmutable y un director.",
        path: "ejemplos/idiomatico/builder.py",
        outputPath: "ejemplos/idiomatico/builder.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Cuándo NO conviene aplicar Builder en Python?",
        options: [
          "Cuando alcanza con un `dataclass` con valores por defecto",
          "Cuando la construcción tiene pasos con validación",
          "Cuando querés varias representaciones del mismo proceso",
          "Cuando el objeto resultante debe ser inmutable",
        ],
        answer: 0,
        why: "Los argumentos por nombre y los defaults de Python cubren el caso del constructor con muchos parámetros opcionales, que es el motivo más común del Builder en otros lenguajes.",
      },
      {
        q: "¿Qué rol cumple el Director?",
        options: [
          "Encapsula secuencias de construcción reutilizables",
          "Crea el builder concreto",
          "Valida el producto final",
          "Es obligatorio en toda implementación del patrón",
        ],
        answer: 0,
        why: "El Director es opcional: solo sirve para no repetir la misma secuencia de llamadas en varios clientes.",
      },
    ],
    exercises: [
      "Agregá `agrupar_por` y `teniendo` al `ConsultaBuilder` y hacé que `sql()` los emita en el orden correcto.",
      "Hacé que `construir()` falle si no se llamó a `seleccionar` y explicá por qué eso es mejor que fallar en la base de datos.",
      "Escribí un segundo builder que produzca la misma consulta como diccionario para Elasticsearch, reutilizando el director.",
    ],
    difficulty: 2,
    popularity: 3,
    guruUrl: "https://refactoring.guru/es/design-patterns/builder",
  },
  {
    slug: "prototype",
    name: "Prototype",
    aka: ["Clon", "Prototipo"],
    track: "gof",
    family: "creacional",
    tagline: "Crear objetos nuevos clonando uno ya configurado.",
    intent:
      "Permite copiar objetos existentes sin que el código dependa de sus clases concretas.",
    problem: [
      "Querés una copia exacta de un objeto. Copiar campo por campo desde afuera falla con los atributos privados y obliga a conocer la clase concreta.",
      "A veces ni siquiera conocés la clase: solo tenés una referencia a una interfaz.",
    ],
    solution: [
      "Que el propio objeto exponga un método `clonar()`. Como se ejecuta adentro, tiene acceso a todo su estado, y como está declarado en la interfaz, el cliente clona sin saber el tipo concreto.",
      "Un registro de prototipos (configuraciones preconstruidas) reemplaza a las subclases: en vez de `InformeMensual`, tenés una plantilla configurada que clonás.",
    ],
    analogy: {
      title: "La fotocopia del formulario",
      body: [
        "En una oficina nadie vuelve a diseñar el formulario cada vez: se saca una fotocopia del original y se completa. Si el original tiene el membrete y los campos ya definidos, la copia arranca con todo eso hecho.",
      ],
    },
    diagram: `  ┌──────────────┐  clonar()   ┌──────────────┐
  │  prototipo   │ ──────────▶ │  copia       │
  │ (configurado)│             │ (mismo estado)│
  └──────────────┘             └──────────────┘
        ▲
        │ registro["informe-mensual"]
  ┌─────┴──────────────────────────────┐
  │ RegistroDePrototipos               │
  │  obtener(clave) → prototipo.clonar()│
  └────────────────────────────────────┘`,
    applicability: [
      {
        when: "Tu código no debe depender de las clases concretas que copia",
        detail: "Típico cuando los objetos llegan de una biblioteca o de un plugin de terceros.",
      },
      {
        when: "Querés reducir subclases que solo difieren en su configuración inicial",
        detail: "En vez de una subclase por preset, guardás instancias preconfiguradas y las clonás.",
      },
      {
        when: "Construir el objeto es caro y copiarlo es barato",
        detail: "Objetos que requieren consultas, parseos o cálculos costosos en su inicialización.",
      },
    ],
    steps: [
      "Declará `clonar()` en la interfaz común (en Python: implementá `__copy__` / `__deepcopy__`).",
      "Implementá la copia teniendo clarísima la diferencia entre superficial y profunda.",
      "Decidí explícitamente qué NO se copia: conexiones, locks, caches, handles de archivo.",
      "Opcional: creá un registro que devuelva clones de prototipos configurados por nombre.",
    ],
    pros: [
      "Clona objetos sin acoplarse a sus clases concretas.",
      "Elimina código de inicialización repetido.",
      "Produce objetos complejos con menos esfuerzo que reconstruirlos.",
      "Alternativa a la herencia para manejar presets de configuración.",
    ],
    cons: [
      "Clonar objetos con referencias circulares es delicado.",
      "Una copia profunda mal pensada duplica recursos que deberían compartirse (o compartir los que deberían duplicarse).",
    ],
    pythonNotes: [
      {
        title: "`copy` está en la biblioteca estándar",
        body:
          "`copy.copy` (superficial) y `copy.deepcopy` (profunda) implementan el patrón. Personalizá con `__copy__`, `__deepcopy__` o `__reduce__`.",
      },
      {
        title: "El `memo` del `deepcopy`",
        body:
          "El diccionario `memo` es lo que hace que `deepcopy` maneje ciclos: si implementás `__deepcopy__`, registrá `memo[id(self)] = clon` antes de copiar los hijos.",
      },
      {
        title: "Cuidado con el default mutable",
        body:
          "El bug clásico de Python (`def f(x=[])`) es un prototipo compartido sin querer. `dataclasses.field(default_factory=list)` es la solución.",
      },
    ],
    relations: [
      "Prototype puede reemplazar a Factory Method cuando lo único que cambia es la configuración inicial.",
      "Abstract Factory puede implementarse clonando prototipos.",
      "Memento es a veces una alternativa más simple cuando solo querés guardar y restaurar estado.",
    ],
    related: ["factory-method", "abstract-factory", "memento", "singleton"],
    samples: [
      {
        title: "Ejemplo conceptual",
        path: "src/Prototype/Conceptual/main.py",
        outputPath: "src/Prototype/Conceptual/Output.txt",
        credit: "Refactoring.Guru (CC BY-NC-ND 4.0)",
      },
      {
        title: "Versión Python idiomática",
        description: "`__deepcopy__` a medida que excluye una caché cara y respeta el `memo`.",
        path: "ejemplos/idiomatico/prototype.py",
        outputPath: "ejemplos/idiomatico/prototype.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Qué diferencia hay entre `copy.copy` y `copy.deepcopy`?",
        options: [
          "La superficial comparte los objetos anidados; la profunda los duplica recursivamente",
          "La profunda es siempre más rápida",
          "La superficial no funciona con dataclasses",
          "Ninguna, son alias",
        ],
        answer: 0,
        why: "`copy.copy` crea un objeto nuevo pero sus atributos siguen apuntando a los mismos objetos; `deepcopy` recorre el grafo y duplica todo (usando `memo` para los ciclos).",
      },
      {
        q: "Al implementar `__deepcopy__`, ¿por qué conviene registrar `memo[id(self)] = clon`?",
        options: [
          "Para que las referencias circulares no provoquen recursión infinita",
          "Para que el clon sea más liviano",
          "Porque lo exige el type checker",
          "Para forzar una copia superficial",
        ],
        answer: 0,
        why: "El `memo` mapea objetos ya copiados; sin registrarse, un ciclo vuelve a entrar en `__deepcopy__` indefinidamente.",
      },
    ],
    exercises: [
      "Agregá un atributo `conexion` al `Documento` y asegurate de que el clon NO lo duplique.",
      "Creá un registro `dict[str, Documento]` de plantillas y una función `crear(nombre)` que devuelva un clon.",
      "Provocá una referencia circular (una capa que apunte a su documento) y verificá que `deepcopy` la maneja.",
    ],
    difficulty: 2,
    popularity: 2,
    guruUrl: "https://refactoring.guru/es/design-patterns/prototype",
  },
  {
    slug: "singleton",
    name: "Singleton",
    aka: ["Instancia única"],
    track: "gof",
    family: "creacional",
    tagline: "Una sola instancia, un punto de acceso global… y muchos problemas de testeo.",
    intent:
      "Garantiza que una clase tenga una única instancia y proporciona un punto de acceso global a ella.",
    problem: [
      "Hay recursos que conviene tener una sola vez: un pool de conexiones, la configuración, un cliente HTTP con su caché.",
      "El patrón resuelve dos problemas a la vez —instancia única y acceso global— y ahí está su trampa: el segundo es, en realidad, una variable global disfrazada.",
    ],
    solution: [
      "Hacé el constructor inaccesible desde afuera y ofrecé un método estático que cree la instancia la primera vez y devuelva siempre la misma.",
      "En entornos con hilos, protegé la creación con un lock (con doble chequeo para no pagar el costo en el camino feliz).",
    ],
    analogy: {
      title: "El gobierno de un país",
      body: [
        "Puede haber muchas personas en el gobierno, pero «el Gobierno de X» es uno solo y se accede a él por su nombre, no por su composición. Y como todo poder centralizado: es cómodo hasta que necesitás reemplazarlo para una prueba.",
      ],
    },
    diagram: `  ┌───────────────────────────┐
  │        Singleton          │
  ├───────────────────────────┤
  │ - instancia: Singleton    │◀─┐
  │ - __init__() (privado)    │  │ devuelve siempre
  │ + obtener(): Singleton ───┼──┘ la misma
  └───────────────────────────┘

  cliente A ──▶ obtener() ─┐
  cliente B ──▶ obtener() ─┴─▶ misma instancia`,
    applicability: [
      {
        when: "Una clase debe tener una única instancia accesible desde todo el programa",
        detail: "Típicamente un recurso compartido: base de datos, archivo de configuración, pool.",
      },
      {
        when: "Necesitás control más estricto sobre variables globales",
        detail:
          "A diferencia de una global, el singleton no se puede reasignar desde afuera y puede inicializarse de forma perezosa.",
      },
    ],
    steps: [
      "Agregá un campo estático privado para la instancia.",
      "Exponé un método estático de creación que devuelva la instancia existente o la cree la primera vez.",
      "Volvé el constructor inaccesible desde el código cliente.",
      "En Python: preferí `functools.lru_cache` sobre una función fábrica, o directamente un módulo.",
      "Preguntate honestamente si no deberías inyectar la dependencia en vez de esconderla.",
    ],
    pros: [
      "Garantiza una única instancia.",
      "Punto de acceso global a esa instancia.",
      "Inicialización perezosa: se crea recién cuando alguien la pide.",
    ],
    cons: [
      "Viola el principio de responsabilidad única: resuelve unicidad Y acceso global.",
      "Esconde dependencias: una función que usa un singleton no lo declara en su firma.",
      "Complica los tests: hay que resetear estado global entre casos.",
      "Requiere cuidado especial con hilos y con procesos (en multiprocessing, hay un singleton por proceso).",
    ],
    pythonNotes: [
      {
        title: "El módulo ya es un singleton",
        body:
          "Python cachea los módulos importados en `sys.modules`. Un módulo con estado a nivel de módulo es la forma más simple y natural del patrón.",
      },
      {
        title: "`functools.lru_cache` como fábrica",
        body:
          "`@lru_cache(maxsize=1)` sobre una función que construye el objeto da un singleton perezoso y seguro entre hilos, en dos líneas y sin metaclases.",
      },
      {
        title: "El olor a testear",
        body:
          "Si tus tests necesitan `cache_clear()` o parchear el módulo, es señal de que la dependencia debería ser un parámetro. Inyección de dependencias > singleton.",
      },
      {
        title: "Trampa del segundo constructor",
        body:
          "`Pool(tamaño=10)` y luego `Pool(tamaño=99)` devuelven lo mismo y el segundo argumento se ignora *en silencio*. Considerá lanzar una excepción si los argumentos difieren.",
      },
    ],
    relations: [
      "Una Facade suele implementarse como Singleton, porque casi siempre alcanza con un objeto sin estado.",
      "Flyweight se parece si solo hay un flyweight, pero Flyweight es inmutable y puede tener muchas instancias.",
      "Abstract Factory, Builder y Prototype se implementan a veces como Singleton.",
    ],
    related: ["facade", "flyweight", "abstract-factory", "prototype"],
    samples: [
      {
        title: "Ejemplo conceptual (no seguro entre hilos)",
        path: "src/Singleton/Conceptual/NonThreadSafe/main.py",
        outputPath: "src/Singleton/Conceptual/NonThreadSafe/Output.txt",
        credit: "Refactoring.Guru (CC BY-NC-ND 4.0)",
      },
      {
        title: "Ejemplo conceptual (seguro entre hilos)",
        path: "src/Singleton/Conceptual/ThreadSafe/main.py",
        outputPath: "src/Singleton/Conceptual/ThreadSafe/Output.txt",
        credit: "Refactoring.Guru (CC BY-NC-ND 4.0)",
      },
      {
        title: "Versión Python idiomática",
        description: "`lru_cache` como singleton perezoso, metaclase con doble chequeo y sus trampas.",
        path: "ejemplos/idiomatico/singleton.py",
        outputPath: "ejemplos/idiomatico/singleton.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Cuál es la crítica más fuerte al Singleton?",
        options: [
          "Esconde dependencias y vuelve frágiles los tests",
          "Consume demasiada memoria",
          "No se puede implementar en Python",
          "Es incompatible con la herencia",
        ],
        answer: 0,
        why: "Al no aparecer en las firmas, una dependencia global puede ser usada desde cualquier lado; los tests terminan compartiendo estado y volviéndose dependientes del orden.",
      },
      {
        q: "En Python, ¿qué le da al `lru_cache(maxsize=1)` la seguridad entre hilos?",
        options: [
          "La propia implementación de la caché, que sincroniza el acceso",
          "El GIL garantiza que nada se ejecute en paralelo, siempre",
          "Nada: hay que agregar un lock igual",
          "El decorador `@staticmethod`",
        ],
        answer: 0,
        why: "`lru_cache` protege su estructura interna; en el peor caso la función podría ejecutarse dos veces, pero el valor devuelto es siempre el mismo objeto cacheado.",
      },
      {
        q: "¿Qué pasa con `PoolDeConexiones(tamano=10)` y después `PoolDeConexiones(tamano=99)` con una metaclase Singleton clásica?",
        options: [
          "Devuelve la primera instancia y el segundo argumento se ignora en silencio",
          "Crea una segunda instancia",
          "Lanza una excepción automáticamente",
          "Actualiza el tamaño a 99",
        ],
        answer: 0,
        why: "Es una de las trampas más comunes del patrón: la llamada parece un constructor pero no lo es, y los argumentos se descartan sin aviso.",
      },
    ],
    exercises: [
      "Hacé que `SingletonMeta` lance `ValueError` si se la invoca con argumentos distintos a los de la primera vez.",
      "Escribí un test con `pytest` que demuestre por qué el singleton complica el aislamiento entre casos, y después reescribí el código con inyección de dependencias.",
      "Investigá qué pasa con un singleton bajo `multiprocessing`: ¿cuántas instancias hay realmente?",
    ],
    difficulty: 1,
    popularity: 2,
    guruUrl: "https://refactoring.guru/es/design-patterns/singleton",
  },
];
