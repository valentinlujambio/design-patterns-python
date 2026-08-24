# Patrones de diseño en Python

Una app para aprender patrones de diseño en Python: los **22 patrones clásicos (GoF)** y
**25 patrones de IA** —modelos de lenguaje, agentes, aprendizaje automático y visión por
computadora—, en español, con ejemplos que se ejecutan de verdad.

- 47 patrones con problema, solución, diagrama, aplicabilidad, pros y contras
- 71 ejemplos Python ejecutables, sin dependencias ni API keys
- 9 textos de fundamentos, 116 preguntas de autoevaluación y una ruta de 8 semanas
- Progreso de estudio guardado en el navegador; sin cuentas ni analítica

Este repositorio es un fork del de [Refactoring.Guru](https://refactoring.guru/es/design-patterns):
los ejemplos conceptuales de `src/` son suyos y se incluyen sin modificar. Todo lo demás
—textos, ejemplos idiomáticos, patrones de IA, la app— es original de este proyecto.
Ver [licencias](#licencias).

## Estructura

```
app/, components/, lib/     La app (Next.js, App Router, TypeScript, Tailwind)
lib/content/                Todo el contenido didáctico, tipado
src/                        Ejemplos conceptuales GoF (Refactoring.Guru, sin modificar)
ejemplos/idiomatico/        Los 22 patrones GoF en Python moderno (originales)
ejemplos/ia/                25 patrones de IA/ML/visión (originales)
scripts/                    Verificación de contenido, salidas de ejemplos y scraper
```

## Desarrollo

```sh
npm install
npm run dev                 # http://localhost:3000
npm run build               # compila las 60+ páginas estáticas
```

Verificaciones:

```sh
npx tsc --noEmit                                        # tipos
node --experimental-strip-types scripts/verificar-contenido.mts   # integridad del contenido
python3 scripts/generar_salidas.py --check              # todos los ejemplos corren
make codestyle-check                                    # pycodestyle
```

## Los ejemplos

Son archivos sueltos, sin dependencias. Los de IA usan un modelo de lenguaje simulado y
determinista (`ejemplos/ia/_llm_falso.py`) cuya interfaz imita la de los SDK reales: no hace
falta API key ni conexión, y la misma entrada devuelve siempre la misma salida.

```sh
python3 ejemplos/idiomatico/strategy.py
python3 ejemplos/ia/rag.py
python3 src/Observer/Conceptual/main.py

python3 scripts/generar_salidas.py    # regenera los archivos .salida.txt versionados
```

## El scraper

`scripts/scrape-refactoring-guru.mjs` descarga, **para consulta local**, las páginas de
fundamentos y de patrones del sitio en español:

```sh
npm run scrape                    # a .cache/refactoring-guru/ (ignorado por git)
npm run scrape -- --demora 2000   # más lento y más cortés
npm run scrape -- --solo-indice   # solo el índice de enlaces
npm run scrape -- --help
```

Respeta `robots.txt`, descarga de a una página por vez y se detiene si no puede leer las
reglas. Lo descargado **no se versiona ni se publica**: el contenido de refactoring.guru
tiene licencia CC BY-NC-ND (se puede leer y citar, no republicar), así que la app enlaza a
cada artículo original en lugar de copiarlo. `content/indice-guru.json` guarda solo títulos
y URLs.

## Agregar un patrón

1. Escribí el ejemplo en `ejemplos/ia/<slug>.py` (que corra con `python3 <archivo>`).
2. Generá su salida: `python3 scripts/generar_salidas.py`.
3. Agregá la entrada en el archivo de `lib/content/` que corresponda.
4. Sumá el slug a `lib/content/ruta.ts`.
5. Verificá: `node --experimental-strip-types scripts/verificar-contenido.mts`.

## Despliegue

Next.js en la raíz del repositorio, sin configuración: importás el repo en Vercel, lo detecta
y publica. Todas las páginas son estáticas —el código Python se lee y se resalta en tiempo de
compilación—, así que no hay servidor ni base de datos en producción, ni variables de entorno
que configurar.

## Licencias

- **`src/`** — © Refactoring.Guru (Alexander Shvets, Alexey Pyltsyn).
  [CC BY-NC-ND 4.0](http://creativecommons.org/licenses/by-nc-nd/4.0/), incluidos sin modificar.
- **Todo lo demás** — contenido y código originales de este proyecto.

Autores originales del repositorio base: Alexey Pyltsyn ([@lex111](https://github.com/lex111))
y Alexander Shvets ([@neochief](https://github.com/neochief)).
