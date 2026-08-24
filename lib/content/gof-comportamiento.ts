import type { Pattern } from "@/lib/types";

export const COMPORTAMIENTO: Pattern[] = [
  {
    slug: "chain-of-responsibility",
    name: "Chain of Responsibility",
    aka: ["Cadena de responsabilidad", "CoR"],
    track: "gof",
    family: "comportamiento",
    tagline: "Pasar la petición por una cadena de manejadores hasta que alguien la resuelva.",
    intent:
      "Permite pasar solicitudes a lo largo de una cadena de manejadores. Al recibir una solicitud, cada manejador decide si la procesa o si la pasa al siguiente.",
    problem: [
      "Un endpoint tiene que verificar límite de tasa, autenticación, permisos, caché y sanitización antes de hacer su trabajo. Todo eso empieza como cuatro `if` anidados y termina como una función de 300 líneas.",
      "Peor: el mismo bloque se copia y pega en cada endpoint, y con el tiempo cada copia diverge.",
    ],
    solution: [
      "Convertí cada verificación en un manejador independiente con la misma interfaz. Encadenalos: cada uno procesa o delega en el siguiente.",
      "Un manejador puede cortar la cadena (rechazar), transformar la petición o simplemente dejarla pasar. El orden es configuración, no código.",
    ],
    analogy: {
      title: "El soporte técnico por niveles",
      body: [
        "Llamás al 0800: primero atiende un bot, después el nivel 1, después un especialista. Cada nivel resuelve lo que puede y escala lo que no. Vos hacés una sola llamada y no sabés cuántos niveles hay.",
      ],
    },
    diagram: `  petición
     │
     ▼
 ┌─────────┐   pasa   ┌─────────┐   pasa   ┌──────────┐   pasa  ┌────────┐
 │ límite  │─────────▶│  auth   │─────────▶│ permisos │────────▶│ manejo │
 └────┬────┘          └────┬────┘          └────┬─────┘         └────────┘
   corta 429           corta 401            corta 403
      ▼                    ▼                     ▼
   respuesta            respuesta             respuesta`,
    applicability: [
      {
        when: "Tu programa procesa distintos tipos de petición de varias maneras, y no sabés de antemano el orden",
        detail: "Middlewares HTTP, validaciones, filtros de eventos.",
      },
      {
        when: "Es esencial ejecutar varios manejadores en un orden determinado",
        detail: "El orden se expresa como una lista, y cambiarlo no requiere tocar los manejadores.",
      },
      {
        when: "El conjunto de manejadores y su orden deben cambiar en tiempo de ejecución",
        detail: "Por configuración, por tipo de usuario o por entorno.",
      },
    ],
    steps: [
      "Declará la interfaz del manejador: un método que recibe la petición (y opcionalmente la referencia al siguiente).",
      "Considerá una clase base abstracta con el reenvío ya implementado.",
      "Implementá cada manejador concreto: decide si procesa y si sigue.",
      "El cliente arma la cadena (o cada manejador la construye sobre la marcha).",
      "Definí qué pasa si nadie maneja la petición: ¿error, valor por defecto, silencio? Escribilo explícitamente.",
    ],
    pros: [
      "Controlás el orden de manejo.",
      "Responsabilidad única: cada verificación en su clase o función.",
      "Abierto/cerrado: sumás manejadores sin tocar el código existente.",
    ],
    cons: [
      "Una petición puede quedar sin manejar si la cadena está mal armada.",
      "Depurar una cadena larga cuesta: hay que seguir el recorrido paso a paso.",
      "Rendimiento: cada eslabón agrega una llamada.",
    ],
    pythonNotes: [
      {
        title: "Una lista de funciones suele bastar",
        body:
          "No hace falta `set_next` ni una clase base: iterar una tupla de callables y cortar en el primero que devuelva algo distinto de `None` es más simple y más fácil de testear.",
      },
      {
        title: "Es el patrón de los middlewares",
        body:
          "WSGI/ASGI, Django, Flask, FastAPI: todos exponen esta idea. Entenderla acá se traduce directo a cualquiera de esos frameworks.",
      },
      {
        title: "Cuidado con el estado mutable compartido",
        body:
          "Si los eslabones mutan la petición, el orden pasa a importar de formas sutiles. Preferí devolver una versión nueva o documentar las mutaciones.",
      },
    ],
    relations: [
      "Chain of Responsibility, Command, Mediator y Observer atacan distintas formas de conectar emisores con receptores.",
      "Se implementa muchas veces junto con Composite: un componente puede pasar la petición a su padre.",
      "A diferencia del Decorator, cualquier eslabón puede cortar el flujo.",
    ],
    related: ["command", "mediator", "observer", "decorator", "composite"],
    samples: [
      {
        title: "Ejemplo conceptual",
        path: "src/ChainOfResponsibility/Conceptual/main.py",
        outputPath: "src/ChainOfResponsibility/Conceptual/Output.txt",
        credit: "Refactoring.Guru (CC BY-NC-ND 4.0)",
      },
      {
        title: "Versión Python idiomática",
        description: "Cadena de middlewares con funciones puras y corte temprano.",
        path: "ejemplos/idiomatico/chain-of-responsibility.py",
        outputPath: "ejemplos/idiomatico/chain-of-responsibility.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Qué diferencia a Chain of Responsibility de Decorator?",
        options: [
          "En CoR cualquier eslabón puede cortar el flujo; en Decorator todos ejecutan",
          "CoR no puede tener más de tres eslabones",
          "Decorator cambia la interfaz",
          "Ninguna: son el mismo patrón",
        ],
        answer: 0,
        why: "Estructuralmente son parientes, pero la CoR está pensada para que alguien resuelva y corte; el Decorator, para que todos aporten.",
      },
      {
        q: "¿Qué hay que definir explícitamente al armar una cadena?",
        options: [
          "Qué ocurre si ningún manejador procesa la petición",
          "El color de cada manejador",
          "Que todos los manejadores hereden de la misma clase concreta",
          "Que la cadena tenga exactamente cinco eslabones",
        ],
        answer: 0,
        why: "El caso «nadie la manejó» es la fuente de bugs silenciosos más común del patrón.",
      },
    ],
    exercises: [
      "Agregá un eslabón de caché que corte la cadena devolviendo una respuesta previa.",
      "Hacé que la cadena registre en una lista qué eslabón cortó y por qué.",
      "Reordená los eslabones y explicá qué cambia si autenticás después de autorizar.",
    ],
    difficulty: 2,
    popularity: 2,
    guruUrl: "https://refactoring.guru/es/design-patterns/chain-of-responsibility",
  },
  {
    slug: "command",
    name: "Command",
    aka: ["Comando", "Acción", "Transacción"],
    track: "gof",
    family: "comportamiento",
    tagline: "Convertir una acción en un objeto que se puede guardar, encolar y deshacer.",
    intent:
      "Convierte una solicitud en un objeto independiente que contiene toda la información sobre la solicitud.",
    problem: [
      "Un editor tiene botones, atajos de teclado y menú contextual que hacen lo mismo. Si cada control implementa la acción, el código se duplica y cambiarla implica tocar tres lugares.",
      "Además querés deshacer. Sin objetos que representen lo que se hizo, no hay forma de dar marcha atrás.",
    ],
    solution: [
      "Reificá la acción: un objeto con `ejecutar()` que contiene todo lo necesario (receptor, parámetros). Los controles solo disparan comandos.",
      "Si además guarda el estado previo, `deshacer()` es posible. Y como es un objeto, se puede encolar, serializar, reintentar y auditar.",
    ],
    analogy: {
      title: "La comanda del restaurante",
      body: [
        "El mozo no cocina: escribe un pedido en un papel y lo cuelga en la cocina. Ese papel tiene todo lo necesario, se puede encolar, se puede repetir y queda como registro de lo que se pidió.",
      ],
    },
    diagram: `  Invocador          Comando «interfaz»        Receptor
 ┌──────────┐      ┌──────────────────┐      ┌─────────────┐
 │ Boton    │─────▶│ + ejecutar()     │─────▶│  Documento  │
 │ Atajo    │      │ + deshacer()     │      │  texto      │
 │ Historial│      └────────┬─────────┘      └─────────────┘
 └──────────┘        Escribir / Reemplazar
   guarda la pila       (guardan lo necesario
   para deshacer         para revertirse)`,
    applicability: [
      {
        when: "Querés parametrizar objetos con operaciones",
        detail: "Pasar «qué hacer» como si fuera un dato: botones, menús, tareas.",
      },
      {
        when: "Querés encolar, programar o ejecutar operaciones de forma remota",
        detail: "Un comando serializable es un mensaje de cola de trabajos.",
      },
      {
        when: "Necesitás deshacer/rehacer",
        detail: "Cada comando guarda lo mínimo para revertirse; la pila hace el resto.",
      },
    ],
    steps: [
      "Declará la interfaz del comando con `ejecutar()` (y `deshacer()` si aplica).",
      "Extraé las solicitudes a clases de comando: cada una recibe por constructor su receptor y sus parámetros.",
      "Identificá los invocadores: guardan comandos y los disparan, sin conocer el receptor.",
      "Los invocadores se asocian a comandos concretos en el arranque, no en cada uso.",
      "Para deshacer: guardá el estado necesario dentro del comando antes de ejecutar.",
    ],
    pros: [
      "Responsabilidad única: separa lo que invoca de lo que hace.",
      "Abierto/cerrado: comandos nuevos sin tocar los invocadores.",
      "Habilita deshacer/rehacer, colas, reintentos y auditoría.",
      "Permite componer comandos simples en macros (con Composite).",
    ],
    cons: [
      "Una capa más entre emisor y receptor.",
      "Guardar el estado para deshacer puede ser costoso en memoria.",
    ],
    pythonNotes: [
      {
        title: "Una función ya es un comando",
        body:
          "`functools.partial(guardar, doc, ruta)` es un comando sin clase. Si no necesitás deshacer ni metadatos, no crees una clase.",
      },
      {
        title: "`dataclass` para el estado de reversión",
        body:
          "Un `dataclass` deja explícito qué guarda el comando para poder revertirse, y hace que se pueda imprimir y comparar en los tests.",
      },
      {
        title: "Comando ≠ mensaje de cola… hasta que lo serializás",
        body:
          "Si el comando debe viajar (Celery, RQ, SQS), guardá identificadores, no objetos vivos: el receptor se resuelve al ejecutar, del otro lado.",
      },
    ],
    relations: [
      "Command y Memento se combinan para deshacer: el comando ejecuta, el memento guarda el estado.",
      "Con Composite se arman macro-comandos.",
      "Chain of Responsibility puede transportar comandos por la cadena.",
      "Strategy y Command se parecen: Strategy cambia *cómo* se hace algo; Command reifica *qué* se hace.",
    ],
    related: ["memento", "composite", "chain-of-responsibility", "strategy"],
    samples: [
      {
        title: "Ejemplo conceptual",
        path: "src/Command/Conceptual/main.py",
        outputPath: "src/Command/Conceptual/Output.txt",
        credit: "Refactoring.Guru (CC BY-NC-ND 4.0)",
      },
      {
        title: "Versión Python idiomática",
        description: "Editor con historial de deshacer usando `dataclass`.",
        path: "ejemplos/idiomatico/command.py",
        outputPath: "ejemplos/idiomatico/command.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Qué necesita guardar un comando para poder deshacerse?",
        options: [
          "El estado mínimo previo que le permita revertir su efecto",
          "Una copia completa de toda la aplicación",
          "Nada: el receptor sabe volver atrás solo",
          "El stacktrace de la ejecución",
        ],
        answer: 0,
        why: "Guardar de más cuesta memoria; guardar de menos hace imposible revertir. Ese equilibrio es la decisión de diseño del patrón.",
      },
      {
        q: "En Python, ¿cuándo alcanza con `functools.partial` en lugar de una clase Comando?",
        options: [
          "Cuando no necesitás deshacer, metadatos ni serialización",
          "Nunca: siempre hace falta la clase",
          "Solo si el comando no tiene argumentos",
          "Cuando el comando se ejecuta en otro hilo",
        ],
        answer: 0,
        why: "Una `partial` encapsula función + argumentos, que es el 80% del patrón. La clase aporta cuando hace falta más que ejecutar.",
      },
    ],
    exercises: [
      "Agregá `rehacer()` al historial con una segunda pila.",
      "Implementá un `MacroComando` que agrupe varios comandos y los deshaga en orden inverso.",
      "Hacé que `Escribir` sea serializable a JSON y reconstruible del otro lado.",
    ],
    difficulty: 2,
    popularity: 3,
    guruUrl: "https://refactoring.guru/es/design-patterns/command",
  },
  {
    slug: "iterator",
    name: "Iterator",
    aka: ["Iterador"],
    track: "gof",
    family: "comportamiento",
    tagline: "Recorrer una colección sin exponer cómo está hecha por dentro.",
    intent:
      "Permite recorrer elementos de una colección sin exponer su representación subyacente (lista, pila, árbol, etc.).",
    problem: [
      "Una lista se recorre con un índice, un árbol en profundidad o en anchura, un resultado paginado pidiendo la próxima página. Si el cliente conoce esos detalles, queda atado a la estructura.",
      "Y si la colección soporta varios recorridos, meterlos todos en la misma clase la infla.",
    ],
    solution: [
      "Extraé el recorrido a un objeto iterador con dos operaciones: dar el próximo elemento y saber si quedan. La colección solo sabe crear iteradores.",
      "El cliente escribe el mismo bucle sin importar qué haya atrás, y se pueden tener varios recorridos simultáneos e independientes.",
    ],
    analogy: {
      title: "El audioguía del museo",
      body: [
        "El museo (la colección) ofrece varios recorridos: exprés, completo, temático. Cada visitante lleva su audioguía con su propia posición. El museo no lleva la cuenta de dónde está cada uno.",
      ],
    },
    diagram: `  Colección            Iterador
 ┌──────────┐        ┌────────────────┐
 │ __iter__ │───────▶│ __next__()     │──▶ elemento
 └──────────┘        │ (estado propio)│──▶ elemento
                     │                │──▶ StopIteration
                     └────────────────┘

  for x in coleccion:   ← el cliente nunca ve el iterador`,
    applicability: [
      {
        when: "La colección tiene una estructura compleja que querés ocultar",
        detail: "Árboles, grafos, datos paginados, streams.",
      },
      {
        when: "Querés reducir la duplicación de código de recorrido",
        detail: "Un iterador reutilizable en vez del mismo bucle copiado.",
      },
      {
        when: "Querés recorrer estructuras distintas con el mismo código",
        detail: "El cliente depende de la interfaz de iteración, no del tipo.",
      },
    ],
    steps: [
      "Declará la interfaz del iterador: obtener el siguiente y saber cuándo terminó.",
      "Declará en la colección el método que devuelve un iterador nuevo.",
      "Implementá los iteradores concretos: cada uno con su propio estado de recorrido.",
      "En Python: implementá `__iter__` (y `__next__` solo si escribís el iterador a mano).",
      "Preferí un generador: te da el protocolo completo gratis.",
    ],
    pros: [
      "Responsabilidad única: separa recorrido de almacenamiento.",
      "Abierto/cerrado: nuevas colecciones y nuevos recorridos sin romper nada.",
      "Recorridos paralelos e independientes sobre la misma colección.",
      "Recorrido perezoso: podés parar a la mitad sin pagar el resto.",
    ],
    cons: [
      "Es exagerado para colecciones simples que ya se recorren directo.",
      "Un iterador puede ser menos eficiente que recorrer la estructura concreta.",
    ],
    pythonNotes: [
      {
        title: "El patrón está en el lenguaje",
        body:
          "`for`, comprensiones, `zip`, `enumerate`, desempaquetado: todo se apoya en `__iter__`/`__next__`. Implementar el patrón «a mano» en Python casi siempre es una señal de que faltaba un generador.",
      },
      {
        title: "Iterable ≠ iterador",
        body:
          "Un iterable sabe crear iteradores (`__iter__`); un iterador es de un solo uso y avanza (`__next__`). Confundirlos produce el bug de «la segunda vez el bucle no hace nada».",
      },
      {
        title: "`itertools` es la caja de herramientas",
        body:
          "`islice`, `chain`, `groupby`, `tee` y `count` componen iteradores sin materializar listas. Vale la pena leer el módulo entero una vez.",
      },
    ],
    relations: [
      "Se usa con Composite para recorrer árboles.",
      "Con Factory Method: cada colección crea sus iteradores compatibles.",
      "Con Memento: capturar el estado de un recorrido para retomarlo.",
      "Con Visitor: recorrer una estructura compleja y ejecutar una operación en cada nodo.",
    ],
    related: ["composite", "factory-method", "memento", "visitor"],
    samples: [
      {
        title: "Ejemplo conceptual",
        path: "src/Iterator/Conceptual/main.py",
        outputPath: "src/Iterator/Conceptual/Output.txt",
        credit: "Refactoring.Guru (CC BY-NC-ND 4.0)",
      },
      {
        title: "Versión Python idiomática",
        description: "Colección paginada con generador perezoso y un iterador escrito a mano.",
        path: "ejemplos/idiomatico/iterator.py",
        outputPath: "ejemplos/idiomatico/iterator.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Cuál es la diferencia entre un iterable y un iterador en Python?",
        options: [
          "El iterable crea iteradores nuevos; el iterador tiene estado y se agota",
          "Son sinónimos",
          "El iterador siempre es una lista",
          "El iterable no puede usarse en un `for`",
        ],
        answer: 0,
        why: "Por eso se puede recorrer una lista muchas veces (crea un iterador nuevo cada vez), pero un generador ya consumido devuelve vacío.",
      },
      {
        q: "¿Qué ventaja concreta da el recorrido perezoso?",
        options: [
          "No pagás por los elementos que no consumís",
          "Ocupa más memoria pero es más rápido",
          "Permite modificar la colección mientras se recorre",
          "Garantiza el orden alfabético",
        ],
        answer: 0,
        why: "En el ejemplo, cortar el bucle en el tercer elemento evita pedir las páginas siguientes: un ahorro real de red y de memoria.",
      },
    ],
    exercises: [
      "Convertí `Paginado` para que acepte una función que traiga páginas de una API.",
      "Escribí un iterador que recorra un árbol en anchura y otro en profundidad, sobre la misma estructura.",
      "Usá `itertools.islice` para tomar los primeros 3 elementos sin materializar la colección.",
    ],
    difficulty: 1,
    popularity: 3,
    guruUrl: "https://refactoring.guru/es/design-patterns/iterator",
  },
  {
    slug: "mediator",
    name: "Mediator",
    aka: ["Mediador", "Intermediario", "Controlador"],
    track: "gof",
    family: "comportamiento",
    tagline: "Que los componentes hablen con un intermediario en vez de entre sí.",
    intent:
      "Permite reducir las dependencias caóticas entre objetos, restringiendo las comunicaciones directas y forzándolas a colaborar únicamente a través de un objeto mediador.",
    problem: [
      "En un formulario, la casilla «soy empresa» habilita el campo CUIT, que a su vez habilita el botón de envío, que consulta la lista de resultados… Cada control termina conociendo a los otros.",
      "Con N componentes que se conocen entre sí hay hasta N² relaciones. Reutilizar un control en otra pantalla se vuelve imposible.",
    ],
    solution: [
      "Los componentes dejan de referenciarse: notifican al mediador y él decide a quién avisar. Las reglas de interacción viven en un solo lugar.",
      "Cada componente pasa a depender de una sola cosa (el mediador) y se vuelve reutilizable.",
    ],
    analogy: {
      title: "La torre de control",
      body: [
        "Los pilotos no negocian entre ellos quién aterriza primero: hablan con la torre. La torre no vuela los aviones, pero es la única que tiene la foto completa. Sin ella, cada piloto necesitaría conocer a todos los demás.",
      ],
    },
    diagram: `   sin mediador (N²)              con mediador (N)
   A ─── B                          A   B
   │ ╳   │                           ╲ ╱
   C ─── D                        ┌───────────┐
                                  │ Mediador  │
                                  └───────────┘
                                       ╱ ╲
                                      C   D`,
    applicability: [
      {
        when: "Cambiar unas clases se vuelve difícil porque están fuertemente acopladas a otras",
        detail: "El síntoma clásico: tocar un componente rompe tres.",
      },
      {
        when: "No podés reutilizar un componente porque depende de demasiados otros",
        detail: "El mediador corta esas dependencias.",
      },
      {
        when: "Estás creando subclases solo para reutilizar comportamiento en contextos distintos",
        detail: "Si la diferencia es con quién habla, extraé el mediador.",
      },
    ],
    steps: [
      "Identificá el grupo de clases fuertemente acopladas.",
      "Declará la interfaz del mediador: normalmente un método `notificar(emisor, evento)`.",
      "Implementá el mediador concreto; suele beneficiarse de conocer a todos los componentes.",
      "Los componentes guardan una referencia al mediador y le notifican en lugar de llamarse entre sí.",
      "Mové las reglas de interacción al mediador.",
    ],
    pros: [
      "Responsabilidad única: las comunicaciones quedan en un solo lugar.",
      "Abierto/cerrado: cambiás la interacción sin tocar los componentes.",
      "Reduce el acoplamiento y hace reutilizables a los componentes.",
    ],
    cons: [
      "El mediador puede convertirse en un objeto dios con toda la lógica del sistema.",
      "Puede ocultar el flujo: leer un componente ya no alcanza para saber qué pasa.",
    ],
    pythonNotes: [
      {
        title: "Un bus de eventos con `defaultdict(list)`",
        body:
          "El mediador más pythónico es un diccionario de evento → lista de callables. Suscribir es hacer `append`.",
      },
      {
        title: "Nombres de evento como constantes",
        body:
          "Usar cadenas sueltas para los eventos invita a errores de tipeo silenciosos. Un `Enum` o constantes de módulo lo evitan.",
      },
      {
        title: "Mediador vs. Observer",
        body:
          "En Observer el sujeto emite y no le interesa quién escucha. En Mediator hay reglas: «si pasa esto, entonces hacé aquello». Cuando el bus empieza a decidir, ya es un mediador.",
      },
    ],
    relations: [
      "Facade y Mediator se parecen: la Facade es unidireccional y el subsistema no la conoce; el Mediator es bidireccional.",
      "Se implementa a menudo sobre Observer.",
      "Chain of Responsibility, Command, Mediator y Observer son cuatro formas distintas de conectar emisores y receptores.",
    ],
    related: ["observer", "facade", "command", "chain-of-responsibility"],
    samples: [
      {
        title: "Ejemplo conceptual",
        path: "src/Mediator/Conceptual/main.py",
        outputPath: "src/Mediator/Conceptual/Output.txt",
        credit: "Refactoring.Guru (CC BY-NC-ND 4.0)",
      },
      {
        title: "Versión Python idiomática",
        description: "Bus de eventos mínimo coordinando controles de una interfaz.",
        path: "ejemplos/idiomatico/mediator.py",
        outputPath: "ejemplos/idiomatico/mediator.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Cuál es el principal riesgo del Mediator?",
        options: [
          "Que se convierta en un objeto dios con toda la lógica del sistema",
          "Que aumente el acoplamiento entre componentes",
          "Que impida reutilizar componentes",
          "Que solo funcione con interfaces gráficas",
        ],
        answer: 0,
        why: "Al centralizar las reglas, el mediador crece. La contramedida es dividirlo por contexto en varios mediadores más chicos.",
      },
      {
        q: "¿Cuándo un bus de eventos deja de ser Observer y pasa a ser Mediator?",
        options: [
          "Cuando empieza a contener reglas de interacción entre componentes",
          "Cuando tiene más de tres suscriptores",
          "Cuando usa un `dict`",
          "Cuando los eventos son asíncronos",
        ],
        answer: 0,
        why: "La diferencia es de intención: notificar cambios (Observer) vs. coordinar comportamiento (Mediator).",
      },
    ],
    exercises: [
      "Agregá un componente `ContadorDeResultados` sin tocar los existentes.",
      "Reemplazá las cadenas de evento por un `Enum` y observá qué errores empieza a detectar el type checker.",
      "Agregá al mediador la regla «si la búsqueda tiene menos de 3 caracteres, no recargues la lista».",
    ],
    difficulty: 2,
    popularity: 2,
    guruUrl: "https://refactoring.guru/es/design-patterns/mediator",
  },
  {
    slug: "memento",
    name: "Memento",
    aka: ["Recuerdo", "Instantánea", "Snapshot"],
    track: "gof",
    family: "comportamiento",
    tagline: "Guardar y restaurar el estado de un objeto sin abrirlo.",
    intent:
      "Permite guardar y restaurar el estado previo de un objeto sin revelar los detalles de su implementación.",
    problem: [
      "Querés implementar «deshacer». La solución obvia es que alguien más lea el estado del objeto y lo guarde, pero eso obliga a exponer todos sus campos.",
      "Y si mañana cambia la estructura interna, se rompe todo el código que guardaba copias.",
    ],
    solution: [
      "Que el propio objeto (originador) produzca la instantánea. El resultado —el memento— es opaco para los demás: lo pueden guardar y devolver, pero no leer.",
      "El cuidador (`Caretaker`) administra la pila de mementos sin conocer su contenido.",
    ],
    analogy: {
      title: "El sobre lacrado",
      body: [
        "Guardás un secreto en un sobre y se lo das a alguien para que lo custodie. Esa persona puede archivarlo y devolvértelo, pero no abrirlo. Solo vos sabés leer lo que hay adentro.",
      ],
    },
    diagram: `  Originador                    Cuidador
 ┌────────────────┐            ┌──────────────────┐
 │ guardar() ─────┼───────────▶│ pila: [Memento]  │
 │ restaurar(m) ◀─┼────────────┤  (opacos)        │
 │ estado privado │            └──────────────────┘
 └────────────────┘
   solo él sabe leer el memento`,
    applicability: [
      {
        when: "Querés instantáneas del estado para poder restaurarlo",
        detail: "Deshacer/rehacer, checkpoints, transacciones con rollback.",
      },
      {
        when: "El acceso directo a los campos violaría el encapsulamiento",
        detail: "El memento es la única forma de sacar el estado sin abrir la clase.",
      },
    ],
    steps: [
      "Determiná qué clase es el originador (la del estado a guardar).",
      "Creá la clase memento con los campos que reflejan ese estado, e inmutable.",
      "Agregá al originador un método para crear mementos y otro para restaurarse desde uno.",
      "El cuidador guarda los mementos sin inspeccionarlos.",
      "Definí la política: cuántos guardar, cada cuánto, y qué se descarta.",
    ],
    pros: [
      "Produce instantáneas sin violar el encapsulamiento.",
      "Simplifica el originador: no tiene que administrar el historial.",
    ],
    cons: [
      "Consume mucha RAM si se crean mementos muy seguido o muy grandes.",
      "El cuidador debe destruir los mementos obsoletos: si no, es una fuga.",
      "En lenguajes dinámicos es difícil garantizar que nadie lea el memento.",
    ],
    pythonNotes: [
      {
        title: "`dataclass(frozen=True)` como memento",
        body:
          "Inmutable, comparable e imprimible. Perfecto para representar una foto del estado.",
      },
      {
        title: "El encapsulamiento en Python es una convención",
        body:
          "El guion bajo (`_texto`) dice «no toques», pero no lo impide. El patrón sigue valiendo como disciplina de diseño, no como barrera técnica.",
      },
      {
        title: "`copy.deepcopy` es el atajo",
        body:
          "Para estados complejos, un `deepcopy` es un memento válido. Es más caro, pero mucho más corto; medí antes de optimizar.",
      },
    ],
    relations: [
      "Command + Memento: el comando hace la acción y el memento guarda cómo revertirla.",
      "Memento y Prototype se pisan a veces: si el objeto es simple, un clon alcanza.",
      "Con Iterator: capturar el estado de un recorrido.",
    ],
    related: ["command", "prototype", "iterator", "state"],
    samples: [
      {
        title: "Ejemplo conceptual",
        path: "src/Memento/Conceptual/main.py",
        outputPath: "src/Memento/Conceptual/Output.txt",
        credit: "Refactoring.Guru (CC BY-NC-ND 4.0)",
      },
      {
        title: "Versión Python idiomática",
        description: "Editor con cursor, memento inmutable y un cuidador que no mira adentro.",
        path: "ejemplos/idiomatico/memento.py",
        outputPath: "ejemplos/idiomatico/memento.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Quién puede leer el contenido de un memento?",
        options: [
          "Solo el originador que lo creó",
          "Cualquiera: es un objeto público",
          "Solo el cuidador",
          "Nadie, ni siquiera el originador",
        ],
        answer: 0,
        why: "Esa restricción es justamente lo que permite guardar estado sin romper el encapsulamiento. El cuidador solo apila y devuelve.",
      },
      {
        q: "¿Cuál es el costo típico del patrón?",
        options: [
          "El consumo de memoria si se guardan muchas instantáneas grandes",
          "La imposibilidad de deshacer",
          "Que obliga a exponer los campos",
          "Que solo funciona en editores de texto",
        ],
        answer: 0,
        why: "Por eso las implementaciones reales limitan la profundidad del historial o guardan diferencias en vez de estados completos.",
      },
    ],
    exercises: [
      "Limitá el historial a 5 mementos y descartá el más viejo.",
      "Guardá diferencias en vez del texto completo y compará el consumo de memoria.",
      "Agregá `rehacer()` y explicá qué pasa con la pila de rehacer al escribir algo nuevo.",
    ],
    difficulty: 2,
    popularity: 2,
    guruUrl: "https://refactoring.guru/es/design-patterns/memento",
  },
  {
    slug: "observer",
    name: "Observer",
    aka: ["Observador", "Publicación-Suscripción", "Listener"],
    track: "gof",
    family: "comportamiento",
    tagline: "Avisar a varios objetos cuando algo cambia, sin que el emisor los conozca.",
    intent:
      "Permite definir un mecanismo de suscripción para notificar a varios objetos sobre cualquier evento que le suceda al objeto que están observando.",
    problem: [
      "Una tienda recibe un producto nuevo. Algunos clientes quieren enterarse; otros no. Mandarle un mail a todos molesta a la mayoría; que cada cliente consulte todos los días desperdicia recursos.",
      "Y si la tienda conoce a cada interesado por su nombre, agregar un tipo de interesado nuevo obliga a modificarla.",
    ],
    solution: [
      "El sujeto mantiene una lista de suscriptores y expone métodos para agregarse y quitarse. Cuando pasa algo, recorre la lista y notifica.",
      "Los suscriptores implementan una interfaz común (o son simples funciones). El sujeto no sabe qué hacen: solo avisa.",
    ],
    analogy: {
      title: "La suscripción a la revista",
      body: [
        "Te suscribís y te llega cada número a tu casa; te das de baja y deja de llegarte. La editorial no te conoce personalmente: mantiene una lista. Y vos no tenés que pasar por el kiosco todos los días a preguntar.",
      ],
    },
    diagram: `  ┌──────────────────┐  notificar(evento)  ┌────────────────┐
  │     Sujeto       │────────────────────▶│  Observador 1  │
  │ suscriptores[]   │────────────────────▶│  Observador 2  │
  │ + suscribir(fn)  │────────────────────▶│  Observador 3  │
  │ + notificar(ev)  │                     └────────────────┘
  └──────────────────┘   no sabe qué hacen, solo que existen`,
    applicability: [
      {
        when: "Un cambio en un objeto requiere cambiar otros, y no sabés cuáles de antemano",
        detail: "O el conjunto cambia en tiempo de ejecución.",
      },
      {
        when: "Algunos objetos deben observar a otros, pero solo por tiempo limitado",
        detail: "La suscripción y la baja son dinámicas.",
      },
    ],
    steps: [
      "Dividí la lógica en dos: el núcleo que emite (sujeto) y el resto que reacciona (observadores).",
      "Declará la interfaz del observador: al menos un método de notificación.",
      "Agregá al sujeto la lista de suscriptores y los métodos para suscribirse y darse de baja.",
      "Implementá la notificación: recorrer y llamar.",
      "Decidí qué se envía: solo el evento (pull) o el dato completo (push).",
    ],
    pros: [
      "Abierto/cerrado: agregás suscriptores sin tocar al sujeto.",
      "Relaciones que se establecen en tiempo de ejecución.",
      "Desacopla emisor de receptores.",
    ],
    cons: [
      "El orden de notificación es arbitrario (salvo que lo definas explícitamente).",
      "Fugas de memoria: un observador que no se da de baja mantiene vivo al objeto.",
      "Un observador que lanza una excepción puede tumbar la notificación de los demás si no lo aislás.",
      "Cascadas de eventos difíciles de seguir.",
    ],
    pythonNotes: [
      {
        title: "Los callables son observadores",
        body:
          "No hace falta una interfaz: una lista de funciones (o de métodos ligados) alcanza. Devolver una función de baja al suscribir es un patrón cómodo, prestado de JS.",
      },
      {
        title: "`weakref` contra las fugas",
        body:
          "`weakref.WeakMethod` permite que el observador muera cuando muere su dueño, sin necesitar una baja explícita.",
      },
      {
        title: "Aislá los errores",
        body:
          "Envolver cada notificación en `try/except` evita que un suscriptor roto impida que los demás se enteren.",
      },
    ],
    relations: [
      "Chain of Responsibility, Command, Mediator y Observer resuelven de distintas formas la conexión emisor-receptor.",
      "Mediator se implementa muchas veces sobre Observer.",
      "La diferencia con Mediator: el Observer notifica cambios; el Mediator coordina comportamiento.",
    ],
    related: ["mediator", "command", "chain-of-responsibility", "state"],
    samples: [
      {
        title: "Ejemplo conceptual",
        path: "src/Observer/Conceptual/main.py",
        outputPath: "src/Observer/Conceptual/Output.txt",
        credit: "Refactoring.Guru (CC BY-NC-ND 4.0)",
      },
      {
        title: "Versión Python idiomática",
        description: "Suscripción con función de baja, aislamiento de errores y `weakref`.",
        path: "ejemplos/idiomatico/observer.py",
        outputPath: "ejemplos/idiomatico/observer.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Por qué conviene envolver cada notificación en un `try/except`?",
        options: [
          "Para que un observador que falle no impida que los demás se enteren",
          "Para que el sujeto sea más rápido",
          "Porque lo exige el protocolo de iteración",
          "Para poder usar `weakref`",
        ],
        answer: 0,
        why: "Sin aislamiento, el primer suscriptor que lance una excepción corta el recorrido y deja al resto sin notificar.",
      },
      {
        q: "¿Cuál es la fuga de memoria típica de Observer?",
        options: [
          "Un observador que nunca se da de baja mantiene viva la referencia",
          "El sujeto se copia en cada notificación",
          "Las excepciones acumulan stacktraces",
          "La lista de suscriptores no se puede vaciar",
        ],
        answer: 0,
        why: "La lista del sujeto es una referencia fuerte: el observador no se libera aunque nadie más lo use. `weakref` o una baja explícita lo resuelven.",
      },
    ],
    exercises: [
      "Agregá prioridad a los observadores para controlar el orden de notificación.",
      "Convertí la lista a `weakref.WeakSet` de métodos y comprobá que el observador muere con su dueño.",
      "Hacé que `notificar` acumule los errores y los devuelva en vez de imprimirlos.",
    ],
    difficulty: 1,
    popularity: 3,
    guruUrl: "https://refactoring.guru/es/design-patterns/observer",
  },
  {
    slug: "state",
    name: "State",
    aka: ["Estado"],
    track: "gof",
    family: "comportamiento",
    tagline: "Cambiar el comportamiento del objeto cuando cambia su estado interno.",
    intent:
      "Permite a un objeto alterar su comportamiento cuando su estado interno cambia. Aparenta cambiar de clase.",
    problem: [
      "Un documento puede estar en borrador, en revisión o publicado, y cada acción se comporta distinto según el estado. El código termina siendo un `if estado == ...` gigante repetido en cada método.",
      "Agregar un estado nuevo obliga a revisar todos esos condicionales, y siempre queda uno olvidado.",
    ],
    solution: [
      "Creá una clase por estado, con los métodos de la interfaz común. El objeto de contexto guarda una referencia al estado actual y delega en él.",
      "Las transiciones son responsabilidad de los estados (o de una tabla explícita), y agregar un estado es agregar una clase.",
    ],
    analogy: {
      title: "El semáforo",
      body: [
        "El semáforo hace lo mismo siempre: «pasar al siguiente». Pero lo que eso significa depende de en qué luz está. Nadie escribe un `if` gigante para un semáforo: hay un ciclo de estados con transiciones claras.",
      ],
    },
    diagram: `  Contexto                        Estado «interfaz»
 ┌─────────────┐   delega      ┌──────────────────┐
 │ estado ─────┼──────────────▶│ + publicar(ctx)  │
 │ publicar()  │               │ + rechazar(ctx)  │
 └─────────────┘               └────────┬─────────┘
       ▲                    ┌───────────┼───────────┐
       └─ transicionar() ── Borrador  EnRevisión  Publicado
          (lo dispara el estado)`,
    applicability: [
      {
        when: "Un objeto se comporta distinto según su estado y los estados son muchos",
        detail: "Y el código de cada estado cambia con frecuencia.",
      },
      {
        when: "Una clase está llena de condicionales enormes sobre el valor de un campo",
        detail: "Y esos condicionales se repiten en varios métodos.",
      },
      {
        when: "Hay mucho código duplicado entre estados similares",
        detail: "Las clases de estado permiten factorizarlo con una base común.",
      },
    ],
    steps: [
      "Decidí cuál es la clase de contexto.",
      "Declará la interfaz de estado con los métodos que dependen del estado.",
      "Creá una clase por estado y mové ahí el código correspondiente.",
      "Agregá al contexto una referencia al estado actual y un método para reemplazarla.",
      "Reemplazá los condicionales por delegación.",
      "Dibujá el diagrama de transiciones y verificá que ninguna quede sin definir.",
    ],
    pros: [
      "Responsabilidad única: cada estado en su clase.",
      "Abierto/cerrado: estados nuevos sin tocar los existentes.",
      "Simplifica el contexto eliminando condicionales.",
    ],
    cons: [
      "Es exagerado si hay pocos estados y cambian poco.",
      "Las transiciones distribuidas entre estados pueden ser difíciles de ver en conjunto.",
    ],
    pythonNotes: [
      {
        title: "`Enum` + tabla de transiciones",
        body:
          "Si el comportamiento por estado es poco, una tabla `dict[(estado, evento)] -> estado` es más legible que una clase por estado (y se puede validar entera de una).",
      },
      {
        title: "`match` para el despacho",
        body:
          "El pattern matching de Python 3.10+ hace legible el despacho por estado cuando no querés clases.",
      },
      {
        title: "State vs. Strategy",
        body:
          "Misma estructura, distinta intención: en Strategy el cliente elige el algoritmo y las estrategias no se conocen; en State los estados se conocen entre sí y disparan las transiciones.",
      },
    ],
    relations: [
      "State puede verse como una extensión de Strategy: los objetos intercambiables se conocen entre sí y pueden reemplazarse solos.",
      "Con Memento: guardar el estado actual para poder volver atrás.",
      "Bridge, State, Strategy y Adapter comparten estructura de delegación.",
    ],
    related: ["strategy", "memento", "bridge", "observer"],
    samples: [
      {
        title: "Ejemplo conceptual",
        path: "src/State/Conceptual/main.py",
        outputPath: "src/State/Conceptual/Output.txt",
        credit: "Refactoring.Guru (CC BY-NC-ND 4.0)",
      },
      {
        title: "Versión Python idiomática",
        description: "Flujo editorial de un documento con una clase por estado y transiciones explícitas.",
        path: "ejemplos/idiomatico/state.py",
        outputPath: "ejemplos/idiomatico/state.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Cuál es la diferencia conceptual entre State y Strategy?",
        options: [
          "En State los objetos se conocen y disparan las transiciones; en Strategy son independientes y las elige el cliente",
          "State es más rápido",
          "Strategy no puede cambiarse en tiempo de ejecución",
          "State solo se usa con interfaces gráficas",
        ],
        answer: 0,
        why: "La estructura es la misma; la intención y el acoplamiento entre las piezas es lo que las distingue.",
      },
      {
        q: "¿Qué olor de código anticipa la necesidad de State?",
        options: [
          "Condicionales grandes sobre el mismo campo repetidos en varios métodos",
          "Un constructor con muchos parámetros",
          "Demasiadas interfaces",
          "Un bucle anidado",
        ],
        answer: 0,
        why: "Cuando el mismo `if` sobre el estado se repite en cada método, cada estado nuevo obliga a tocarlos todos.",
      },
    ],
    exercises: [
      "Agregá un estado `Archivado` del que no se pueda salir y verificá qué clases tuviste que tocar.",
      "Reescribí el mismo flujo con una tabla de transiciones y compará legibilidad.",
      "Hacé que el contexto registre el historial de transiciones y muestre el recorrido completo.",
    ],
    difficulty: 2,
    popularity: 2,
    guruUrl: "https://refactoring.guru/es/design-patterns/state",
  },
  {
    slug: "strategy",
    name: "Strategy",
    aka: ["Estrategia"],
    track: "gof",
    family: "comportamiento",
    tagline: "Una familia de algoritmos intercambiables, elegidos en tiempo de ejecución.",
    intent:
      "Permite definir una familia de algoritmos, colocar cada uno de ellos en una clase separada y hacer sus objetos intercambiables.",
    problem: [
      "Una app de navegación calcula rutas en auto. Después piden a pie, en bici, en transporte público. Cada algoritmo nuevo duplica el tamaño de la clase principal y cualquier cambio arriesga romper los otros.",
      "El código de cálculo y el de la interfaz quedan mezclados en la misma clase.",
    ],
    solution: [
      "Extraé cada algoritmo a su propia clase (o función) con una interfaz común. El contexto guarda una referencia a la estrategia actual y le delega el trabajo.",
      "El cliente elige la estrategia y se la pasa al contexto. Agregar un algoritmo no toca nada existente.",
    ],
    analogy: {
      title: "Cómo llegar al aeropuerto",
      body: [
        "Podés ir en colectivo, en taxi o en bici. El objetivo es el mismo y la decisión depende del presupuesto y del tiempo. Elegís al salir, no cuando naciste.",
      ],
    },
    diagram: `  Contexto                     Estrategia «interfaz»
 ┌───────────────┐  delega    ┌──────────────────────┐
 │ estrategia ───┼───────────▶│  calcular(total)     │
 │ total()       │            └──────────┬───────────┘
 └───────────────┘        ┌──────────────┼─────────────┐
   el cliente elige   sin_descuento  porcentaje     dos_por_uno
   cuál inyectar      (en Python: funciones, no clases)`,
    applicability: [
      {
        when: "Querés usar variantes de un algoritmo y poder cambiarlas en tiempo de ejecución",
        detail: "Ordenamiento, compresión, precios, validación, ruteo.",
      },
      {
        when: "Tenés muchas clases parecidas que solo difieren en cómo ejecutan algo",
        detail: "La diferencia se extrae a la estrategia y las clases se unifican.",
      },
      {
        when: "Querés aislar la lógica de negocio de los detalles del algoritmo",
        detail: "El contexto no necesita conocer el algoritmo, solo su interfaz.",
      },
      {
        when: "Una clase tiene un condicional enorme que elige entre variantes del mismo comportamiento",
        detail: "Cada rama se convierte en una estrategia.",
      },
    ],
    steps: [
      "Identificá el algoritmo que cambia con frecuencia (o el condicional que elige entre variantes).",
      "Declará la interfaz común a todas las variantes.",
      "Extraé cada variante a su clase o función.",
      "En el contexto, agregá un campo para la estrategia y un setter; el contexto trabaja solo contra la interfaz.",
      "El cliente elige y asocia la estrategia.",
    ],
    pros: [
      "Cambiás algoritmos en tiempo de ejecución.",
      "Aislás la implementación del algoritmo del código que lo usa.",
      "Reemplaza la herencia por composición.",
      "Abierto/cerrado: agregás estrategias sin tocar el contexto.",
    ],
    cons: [
      "Si los algoritmos cambian poco, agrega complejidad innecesaria.",
      "El cliente tiene que conocer las diferencias para elegir bien.",
      "En muchos lenguajes, muchas clases con un solo método (en Python esto casi no aplica).",
    ],
    pythonNotes: [
      {
        title: "Una estrategia es una función",
        body:
          "Es el caso donde la versión pythónica es radicalmente más corta: `Callable[[float], float]` reemplaza la interfaz y las clases concretas.",
      },
      {
        title: "`functools.partial` para estrategias con configuración",
        body:
          "`partial(porcentaje, pct=15)` produce una estrategia parametrizada sin escribir una clase.",
      },
      {
        title: "Objetos invocables cuando hay estado",
        body:
          "Si la estrategia necesita estado o composición, un `dataclass` con `__call__` sigue siendo intercambiable con una función.",
      },
    ],
    relations: [
      "Command y Strategy se parecen: Command reifica una acción; Strategy, una forma de hacer algo.",
      "Decorator cambia la piel del objeto; Strategy, sus tripas.",
      "Template Method usa herencia y actúa a nivel de clase; Strategy usa composición y actúa a nivel de objeto.",
      "State es Strategy con estados que se conocen entre sí.",
    ],
    related: ["state", "template-method", "command", "bridge", "decorator"],
    samples: [
      {
        title: "Ejemplo conceptual",
        path: "src/Strategy/Conceptual/main.py",
        outputPath: "src/Strategy/Conceptual/Output.txt",
        credit: "Refactoring.Guru (CC BY-NC-ND 4.0)",
      },
      {
        title: "Versión Python idiomática",
        description: "Estrategias de descuento como funciones, `partial` y un objeto invocable.",
        path: "ejemplos/idiomatico/strategy.py",
        outputPath: "ejemplos/idiomatico/strategy.salida.txt",
      },
    ],
    quiz: [
      {
        q: "En Python, ¿qué reemplaza normalmente a una clase de estrategia con un solo método?",
        options: [
          "Una función (opcionalmente con `functools.partial`)",
          "Una metaclase",
          "Una clase abstracta con `@abstractmethod`",
          "Un `Enum`",
        ],
        answer: 0,
        why: "Las funciones son objetos de primera clase: cumplen la interfaz `Callable` sin ceremonia y se testean por separado igual de bien.",
      },
      {
        q: "¿Cuál es la diferencia entre Strategy y Template Method?",
        options: [
          "Strategy compone objetos en tiempo de ejecución; Template Method usa herencia y se fija al definir la clase",
          "Template Method no permite variantes",
          "Strategy no puede tener estado",
          "Son sinónimos",
        ],
        answer: 0,
        why: "Template Method deja «huecos» en un algoritmo fijo mediante subclases; Strategy reemplaza el algoritmo completo mediante composición.",
      },
    ],
    exercises: [
      "Agregá una estrategia de «envío gratis a partir de X» y combinala con el tope usando `TopeDeDescuento`.",
      "Escribí una estrategia que lea el porcentaje de una variable de entorno.",
      "Hacé un test parametrizado con `pytest.mark.parametrize` que cubra las cuatro estrategias.",
    ],
    difficulty: 1,
    popularity: 3,
    guruUrl: "https://refactoring.guru/es/design-patterns/strategy",
  },
  {
    slug: "template-method",
    name: "Template Method",
    aka: ["Método plantilla", "Patrón plantilla"],
    track: "gof",
    family: "comportamiento",
    tagline: "Fijar el esqueleto del algoritmo en la base y dejar huecos para las subclases.",
    intent:
      "Define el esqueleto de un algoritmo en la superclase pero permite que las subclases sobrescriban pasos del algoritmo sin cambiar su estructura.",
    problem: [
      "Tenés tres importadores de datos (CSV, JSON, base de datos). Los tres hacen lo mismo: extraer, parsear, filtrar, cargar. Solo cambian dos pasos.",
      "Copiar y pegar la secuencia en cada clase significa que un cambio en el orden hay que replicarlo tres veces, y en la tercera alguien se olvida.",
    ],
    solution: [
      "Poné la secuencia en un método de la clase base —el *template method*— y declará los pasos variables como abstractos.",
      "Agregá *hooks*: pasos con implementación vacía o por defecto que la subclase puede sobrescribir opcionalmente.",
    ],
    analogy: {
      title: "El plano de la casa tipo",
      body: [
        "Una constructora usa el mismo plano para todo el barrio. El esqueleto —cimientos, paredes, techo— no se toca; cada dueño elige los materiales del piso y el color de las paredes. La estructura garantiza que todas las casas se levanten igual de bien.",
      ],
    },
    diagram: `  ┌───────────────────────────────────┐
  │  ClaseBase                        │
  │  ejecutar():          ← template  │
  │    extraer()          ← abstracto │
  │    parsear()          ← abstracto │
  │    es_valida()        ← hook      │
  │    cargar()           ← default   │
  └────────────────┬──────────────────┘
        ┌──────────┴──────────┐
   ImportadorCSV        ImportadorJSONL
   (sobrescribe 3)      (sobrescribe 2)`,
    applicability: [
      {
        when: "Querés que los clientes extiendan solo pasos concretos de un algoritmo",
        detail: "No toda su estructura.",
      },
      {
        when: "Tenés varias clases con algoritmos casi idénticos y diferencias menores",
        detail: "Al cambiar el algoritmo tendrías que tocar todas: extraé el esqueleto.",
      },
    ],
    steps: [
      "Dividí el algoritmo en pasos y analizá cuáles son comunes y cuáles varían.",
      "Creá la clase base con el template method (idealmente marcado como no sobrescribible).",
      "Declará abstractos los pasos que toda subclase debe implementar.",
      "Agregá hooks con implementación por defecto para los pasos opcionales.",
      "Escribí las subclases: implementan los abstractos y, si hace falta, los hooks.",
    ],
    pros: [
      "Los clientes sobrescriben solo partes del algoritmo, con menos riesgo de romperlo.",
      "Elimina duplicación llevando el código repetido a la superclase.",
    ],
    cons: [
      "Limita la flexibilidad al esqueleto provisto.",
      "Se puede violar el principio de sustitución de Liskov si una subclase suprime un paso base.",
      "Cuantos más pasos, más difícil de mantener; y la herencia es un acoplamiento fuerte.",
    ],
    pythonNotes: [
      {
        title: "`abc.ABC` + `@abstractmethod`",
        body:
          "Hace que instanciar una subclase incompleta falle al construir, no en producción, en el peor momento.",
      },
      {
        title: "La alternativa sin herencia",
        body:
          "Pasar los pasos como funciones al constructor convierte el Template Method en Strategy. Suele envejecer mejor: composición > herencia.",
      },
      {
        title: "Hooks vacíos, no `pass` silencioso",
        body:
          "Un hook debe tener un valor por defecto que documente qué significa no sobrescribirlo (por ejemplo, `return True` en un filtro).",
      },
    ],
    relations: [
      "Factory Method es una especialización de Template Method: un paso del algoritmo es la creación.",
      "Template Method usa herencia (nivel de clase); Strategy usa composición (nivel de objeto).",
    ],
    related: ["strategy", "factory-method", "state"],
    samples: [
      {
        title: "Ejemplo conceptual",
        path: "src/TemplateMethod/Conceptual/main.py",
        outputPath: "src/TemplateMethod/Conceptual/Output.txt",
        credit: "Refactoring.Guru (CC BY-NC-ND 4.0)",
      },
      {
        title: "Versión Python idiomática",
        description: "Importadores CSV/JSONL con pasos abstractos y un hook de validación.",
        path: "ejemplos/idiomatico/template-method.py",
        outputPath: "ejemplos/idiomatico/template-method.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Qué es un hook en este patrón?",
        options: [
          "Un paso opcional con implementación por defecto que la subclase puede sobrescribir",
          "Un método abstracto obligatorio",
          "Un decorador de Python",
          "Un evento del sistema operativo",
        ],
        answer: 0,
        why: "Los hooks permiten personalizar el algoritmo sin obligar a cada subclase a implementar todo.",
      },
      {
        q: "¿Cuál es la principal desventaja frente a Strategy?",
        options: [
          "La herencia es un acoplamiento fuerte y se fija al definir la clase",
          "No permite reutilizar código",
          "No funciona con más de dos subclases",
          "Obliga a duplicar el algoritmo",
        ],
        answer: 0,
        why: "Con Strategy podés cambiar el comportamiento por objeto y en tiempo de ejecución; con Template Method, la variante queda determinada por el tipo.",
      },
    ],
    exercises: [
      "Agregá un `ImportadorAPI` que sobrescriba `cargar` para mandar los datos a un servicio.",
      "Convertí el ejemplo a la versión con funciones inyectadas y compará los dos diseños.",
      "Agregá un hook `al_terminar` y usalo para registrar métricas.",
    ],
    difficulty: 1,
    popularity: 2,
    guruUrl: "https://refactoring.guru/es/design-patterns/template-method",
  },
  {
    slug: "visitor",
    name: "Visitor",
    aka: ["Visitante"],
    track: "gof",
    family: "comportamiento",
    tagline: "Agregar operaciones nuevas a una jerarquía sin tocar sus clases.",
    intent:
      "Permite separar algoritmos de los objetos sobre los que operan.",
    problem: [
      "Tenés un árbol de nodos (una expresión, un documento, un grafo de ciudades) y te piden exportarlo a XML. Después a JSON. Después calcular estadísticas.",
      "Cada operación nueva obliga a agregar un método a todas las clases de nodo, que quedan cargadas de responsabilidades ajenas a su dominio.",
    ],
    solution: [
      "Poné cada operación en un objeto visitante con un método por tipo de nodo. Los nodos solo aceptan visitantes y les dicen qué tipo son (doble despacho).",
      "Agregar una operación nueva es agregar una clase visitante, sin tocar ningún nodo.",
    ],
    analogy: {
      title: "El inspector municipal",
      body: [
        "Un inspector recorre casas, fábricas y comercios. Cada tipo de edificio no aprende a inspeccionarse: solo abre la puerta y dice qué es. El inspector sabe qué mirar en cada caso, y mañana puede venir otro inspector con otro criterio.",
      ],
    },
    diagram: `  Estructura de nodos            Visitantes
  ┌──────────┐                  ┌──────────────┐
  │ Numero   │ ──accept(v)────▶ │  evaluar     │
  │ Suma     │ ──accept(v)────▶ │  formatear   │
  │ Producto │ ──accept(v)────▶ │  optimizar   │
  └──────────┘                  └──────────────┘
   fáciles de recorrer,          fáciles de agregar
   difíciles de extender         (esa es la contra)`,
    applicability: [
      {
        when: "Necesitás ejecutar operaciones sobre todos los elementos de una estructura compleja",
        detail: "Árboles de sintaxis, documentos, escenas, grafos.",
      },
      {
        when: "Querés limpiar la lógica de negocio de clases auxiliares",
        detail: "Los nodos se quedan solo con su modelo de datos.",
      },
      {
        when: "Un comportamiento tiene sentido solo para algunas clases de la jerarquía",
        detail: "En vez de métodos vacíos en la base, el visitante lo maneja.",
      },
    ],
    steps: [
      "Declará la interfaz del visitante con un método por cada tipo concreto de nodo.",
      "Declará el método `accept(visitante)` en la interfaz de nodo.",
      "Implementá `accept` en cada nodo: llama al método del visitante que le corresponde.",
      "Escribí un visitante concreto por operación.",
      "El cliente crea el visitante y lo pasa por la estructura (a veces con ayuda de un Iterator).",
    ],
    pros: [
      "Abierto/cerrado para operaciones: se agregan sin tocar los nodos.",
      "Responsabilidad única: cada operación en una clase.",
      "El visitante puede acumular estado mientras recorre la estructura.",
    ],
    cons: [
      "Agregar un tipo de nodo obliga a actualizar TODOS los visitantes: el patrón es cerrado en esa dirección.",
      "El visitante puede necesitar acceso a datos privados de los nodos.",
      "Es de los patrones más difíciles de leer para quien no lo conoce.",
    ],
    pythonNotes: [
      {
        title: "`functools.singledispatch` elimina el doble despacho",
        body:
          "Registrás una implementación por tipo y Python elige según el primer argumento. Los nodos no necesitan `accept` y quedan como puros datos.",
      },
      {
        title: "`match` con captura por posición",
        body:
          "El pattern matching estructural cubre muchos casos de Visitor con menos ceremonia, sobre todo si los nodos son `dataclass`.",
      },
      {
        title: "El clásico en la vida real: `ast`",
        body:
          "El módulo `ast` de la biblioteca estándar trae `NodeVisitor` y `NodeTransformer`: es el patrón puro, y sirve para escribir linters propios.",
      },
    ],
    relations: [
      "Visitor es una versión potente de Command: opera sobre objetos de clases distintas.",
      "Con Composite: ejecutar una operación sobre todo el árbol.",
      "Con Iterator: recorrer estructuras complejas visitando cada elemento.",
    ],
    related: ["composite", "iterator", "command", "strategy"],
    samples: [
      {
        title: "Ejemplo conceptual",
        path: "src/Visitor/Conceptual/main.py",
        outputPath: "src/Visitor/Conceptual/Output.txt",
        credit: "Refactoring.Guru (CC BY-NC-ND 4.0)",
      },
      {
        title: "Versión Python idiomática",
        description: "Evaluar y formatear una expresión con `singledispatch` y `match`.",
        path: "ejemplos/idiomatico/visitor.py",
        outputPath: "ejemplos/idiomatico/visitor.salida.txt",
      },
    ],
    quiz: [
      {
        q: "¿Qué es lo que Visitor hace difícil?",
        options: [
          "Agregar un tipo de nodo nuevo: hay que tocar todos los visitantes",
          "Agregar operaciones nuevas",
          "Recorrer estructuras en árbol",
          "Mantener el estado durante el recorrido",
        ],
        answer: 0,
        why: "Es el «problema de la expresión»: Visitor optimiza para operaciones nuevas a costa de hacer caro agregar tipos.",
      },
      {
        q: "¿Qué herramienta de Python reemplaza el doble despacho de Visitor?",
        options: [
          "`functools.singledispatch`",
          "`itertools.chain`",
          "`abc.ABCMeta`",
          "`contextlib.suppress`",
        ],
        answer: 0,
        why: "Despacha según el tipo del primer argumento, lo que evita tener que escribir `accept` en cada clase de nodo.",
      },
    ],
    exercises: [
      "Agregá un visitante `optimizar` que simplifique `x * 1` y `x + 0`.",
      "Agregá un nodo `Resta` y anotá cuántos visitantes tuviste que tocar.",
      "Escribí un visitante con `ast.NodeVisitor` que cuente cuántas funciones tiene un archivo Python.",
    ],
    difficulty: 3,
    popularity: 1,
    guruUrl: "https://refactoring.guru/es/design-patterns/visitor",
  },
];
