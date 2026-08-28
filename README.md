# Clickao

Videojuego web incremental sobre la cadena productiva del cacao santandereano.
El jugador administra una finca cacaotera: cosecha mazorcas haciendo clic sobre
el árbol, el grano en baba pasa a fermentación y a secado, y solo entonces se
vende. **El precio depende de la calidad lograda durante el beneficio, no de la
cantidad cosechada.** Ese es el mensaje del juego y todo lo demás cuelga de él.

React + TypeScript + Vite. Sin backend. La partida vive en `localStorage`.
Pensado para escritorio, ancho mínimo 1100 px.

```bash
npm install
npm run dev        # servidor de desarrollo
npm run build      # compila y empaqueta
npm test           # pruebas del reducer y de las migraciones
npm run balance    # simulador de la curva de progresión
```

## El bucle económico

Uno solo, y ninguna mecánica nueva puede romperlo:

```
clic sobre la mazorca ─┐
                       ├─► grano en baba ─► fermentación ─► secado ─► grano seco
producción pasiva  ────┘                        │                        │
                                            volteos                  × calidad
                                                │                        ▼
mejoras ◄──────────────────────────────── dinero ◄──────────────────── venta
```

### Regla de diseño: la ausencia nunca castiga

Es un clicker, así que el juego tiene que seguir funcionando cuando el jugador
no está. La fermentación avanza sola y produce calidad corriente; los volteos
que hace el jugador presente la suben a fino de aroma. Las enfermedades reducen
la producción pasiva hasta un tope duro del 50% y nunca la llevan a cero. El
lote pasa solo de fermentación a secado y sale solo a bodega. La interacción
activa es siempre bonificación, nunca requisito.

### Tres líneas de mejora que no se solapan

| Línea | Qué toca |
|---|---|
| **Herramientas** | Todo lo que ocurre en el árbol al hacer clic: rendimiento por mazorca, cuántas cuelgan, qué tan ancha es la ventana de corte |
| **Cultivo** | La corriente pasiva de grano en baba, y lo que reduce la presión de las enfermedades |
| **Beneficio** | Capacidad del lote, lotes en paralelo, multiplicador de calidad y precio |

Al diseñar una mejora nueva, verifica que caiga limpiamente en una sola. Si no
cae, no es una mejora: es otra mecánica.

## De la finca real a las unidades del juego

La constante fundacional sale de dos datos agronómicos multiplicados: el índice
de mazorca estándar es de 25 mazorcas por kilo de grano seco, y una mazorca
tiene entre 30 y 40 granos. **Mil granos en baba son un kilo de grano seco.**

El reloj de la finca corre a **un día real igual a 30 segundos de juego**.

| Proceso | Valor real | En el juego |
|---|---|---|
| Fermentación en cajón | 3 a 10 días según el material; 6 para los trinitarios | 180 s, y **ninguna mejora la acorta** |
| Primer volteo | a las 48 h | a los 60 s |
| Volteos siguientes | cada 24 h | cada 30 s, tres ventanas más |
| Secado hasta 7% de humedad | 5 a 7 días | 180 s, o 120 con secador de túnel |
| Ciclo completo | 12 días | 6 minutos |
| Maduración de la mazorca | 5 a 6 meses | ciclo de interacción de 12 s (declarado en el cuaderno) |

Los cuatro grados de calidad cortan donde corta la prueba de corte real: menos
del 40% de granos pardos es pasilla, 60% es el índice óptimo de fermentación y
70% es el mínimo para dar la prueba por exitosa.

Que la fermentación no se pueda acortar con ninguna mejora es deliberado: para
producir más no se apura el cajón, se compran más cajones.

## Arquitectura

```
src/
  game/          motor. reducer puro, selectores, constantes de balanceo
  data/          contenido: mejoras, fichas del cuaderno, logros
  persistence/   localStorage versionado, migraciones, exportar e importar
  context/       contextos de estado y de dispatch, separados
  hooks/         bucle de tick y atajos de teclado
  ui/            componentes de presentación
scripts/         simulador de balanceo y generadores de partidas de prueba
```

**El reducer es puro.** No lee el reloj, no toca `localStorage` y no llama a
`Math.random`: el tiempo y la aleatoriedad entran dentro de la acción
(`{ tipo: 'TICK', dt, rnd }`). Gracias a eso el mismo código sirve para jugar,
para calcular el progreso de una ausencia y para simular la curva de balanceo,
y no existe una segunda implementación de la economía que se pueda
desincronizar de la primera.

**Nada derivado se guarda en el estado.** El rendimiento por clic, la producción
pasiva, la capacidad y el multiplicador de calidad se calculan con selectores a
partir de las mejoras compradas. Una sola fuente de verdad.

**El bucle no despacha por frame.** Corre sobre `requestAnimationFrame` para
leer el delta real del reloj, acumula, y despacha la economía a 10 Hz. React
renderizando el árbol completo sesenta veces por segundo es la causa número uno
de que un clicker vaya a tirones; la fluidez la ponen las animaciones, que
corren fuera de React. Si el delta se dispara porque la pestaña perdió el foco,
ese salto no se simula como un tick: se deriva al camino de progreso ausente.

**Estado y dispatch viajan en contextos separados**, para que los componentes
que solo emiten acciones no se rendericen en cada tick.

## Contenido separado de la lógica

Todo el texto y todos los datos de mejoras viven en `src/data`. Se pueden
corregir sin tocar una línea de lógica.

- `mejoras.ts` declara efectos de un **vocabulario cerrado** (`clic_multiplicador`,
  `pasiva_produccion`, `lotes_capacidad`, `calidad_volteo`, …) que un resolver de
  pocas líneas compone en `selectors.ts`. Si una mejora necesita un efecto que no
  está en la lista, esa es la señal de alarma.
- `fichas.ts` es el cuaderno de finca. Cada ficha responde qué es, cómo se usa y
  por qué importa, y cuando el juego comprime o exagera algo lo dice en el campo
  `enElJuego`.
- `logros.ts` son las metas de largo plazo, con un 1% permanente de producción
  cada una.

## Persistencia

Clave versionada `clickao.save.v1` más un número de esquema interno. Respaldo
antes de cada sobrescritura, validación estructural antes de migrar, captura
explícita de cuota excedida, guardado con rebote de 1,5 s y forzado en
`pagehide` y al ocultar la pestaña.

`migrations.ts` existe desde el primer día y ya tiene un paso real (esquema 1 a
2). **Cada migración va acompañada de una partida real congelada en
`src/persistence/__tests__`.** El fallo que más duele no es el archivo corrupto
sino la migración mal escrita que destruye partidas buenas.

El progreso ausente reutiliza el mismo tick en pasos de un segundo, con tope de
8 horas y sin volteos: quien no está cobra corriente, quien está cobra fino.

Exportar e importar la partida como texto (`CLICKAO1.<base64>.<firma>`) está en
Ajustes y vale su peso en oro para depurar.

## Balanceo

`npm run balance [minutos]` corre el reducer sin React con tres perfiles de
jugador y una política de compra que minimiza *tiempo de espera + tiempo de
repago*, que es como decide una persona: ni gasta en lo primero que alcanza ni
ahorra para siempre. Modela el cuello de botella del beneficio, porque la baba
que no alcanza a pasar por los cajones solo vale el precio del intermediario.

Lo que se mide no son recursos acumulados sino **tiempos hasta hito** y la
**espera entre compras**: si esa espera crece, el juego se estanca; si se
acorta demasiado, la progresión se desborda.

Medición actual a 60 minutos, perfil atento: beneficio abierto en 1:15, primera
venta de grano seco en 7:32, espera entre compras de 93 s al principio y 16 s al
final con máximo de 233 s, y producción y capacidad de beneficio creciendo a la
par. El perfil distraído que nunca voltea llega igual a vender grano seco, pero
nunca saca un lote fino: exactamente la lección.

El simulador ya pagó su costo: destapó que la línea de beneficio estaba mal
tarifada frente a la de cultivo (salía más rentable botar la baba que
beneficiarla) y que la curva se desbordaba a los cincuenta minutos por tener
demasiadas escalas multiplicativas baratas sobre la misma línea.

## Dirección de arte

Vectorial plano con sombreado en dos tonos, SVG por capas con ids nombrados.
Las capas de sombrío y los árboles del lote se encienden con la progresión, de
modo que ver crecer la finca sea la recompensa visual.

El reparto de la paleta (en `src/styles/tokens.css`) está fijado y no se
renegocia: los verdes del dosel ocupan la mayor superficie y son los más
desaturados; la saturación máxima está reservada al rango cálido de la madurez
de la mazorca, que es el objetivo de clic; **todo lo frío significa problema**,
el gris azulado es enfermedad y nunca decoración.

Cada línea de mejora tiene además su propio acento, para distinguirlas de un
vistazo sin leer: oro para Herramientas, verde vivo para Cultivo y terracota
para Beneficio. Cada mejora tiene su icono en `IconosMejora.tsx`; las escalas
procedimentales caen al icono de su categoría.

Las mazorcas cuelgan del tronco y de las ramas gruesas porque el cacao es
caulifloro, y viven dentro del mismo `viewBox` que el fondo para no despegarse
al cambiar el tamaño de la ventana. Al cosechar, la mazorca se parte en dos
mitades que giran y dejan ver el grano en baba; esa animación es un objeto
visual con vida propia (`Corte.tsx`) y no una clase sobre la mazorca, porque el
reducer reemplaza el fruto cortado por otro recién cuajado con id nuevo.

Comprar no cambia solo un número. El sombrío transitorio siembra plátanos, el
permanente levanta maderables, los clones oscurecen y densifican el dosel, el
vivero y la compostera aparecen en el lote, los jornaleros se ven trabajando al
pie del árbol, y el cajón fermentador levanta un beneficiadero donde las cajas
humean mientras hay masa fermentando y el grano se ve tendido bajo la
marquesina durante el secado.

Partículas y números flotantes van en **un solo canvas fuera de React**, con
objetos reutilizados, tope de partículas vivas y agregación de clics seguidos en
un solo número que suma y crece. Hay soporte de `prefers-reduced-motion` y un
modo de bajo consumo que apaga partículas y animaciones.

**Ningún estado del juego se comunica solo por color.** La madurez se lee por
tono, tamaño y un anillo de ciclo; la enfermedad por color frío, textura de
manchas e icono; la calidad por etiqueta de texto además del color; y las
penalizaciones activas se anuncian en texto en la barra superior y en una región
`aria-live`.

## Accesibilidad

Las mazorcas y los focos son botones enfocables con Tab que responden a Espacio
y Enter. Los modales atrapan el foco y cierran con Escape. Atajos: `V` voltear,
`P` podar, `L` cargar cajón, `S` vender, `C` cuaderno, `1`/`2`/`3` líneas de
mejora.

## Fuentes de los valores agronómicos

Índice de mazorca y granos por mazorca (Poscosecha Cacao; Agrosavia TCS 06),
duración y volteos de la fermentación (Poscosecha Cacao, con la recomendación de
Fedecacao de primer volteo a las 48 h y luego cada 24 h), temperatura de la masa
(Universidad Nacional), secado y humedad final (Scielo), prueba de corte
(Perfect Daily Grind), monilia y escoba de bruja (Croper; Agrosavia), clones y
rendimientos de Santander (Agrosavia; Vanguardia), cacao fino de sabor y aroma
(ICCO 2019; MinAgricultura) y precio de referencia del grano.

El multiplicador de precio del grado fino (2,5) es una **exageración deliberada**
y el juego lo dice en su ficha: el sobreprecio real existe pero es más modesto.
Se amplifica para que la lección se sienta en el bolsillo dentro de una partida
corta.
