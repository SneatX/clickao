/**
 * Cuaderno de finca. Contenido editorial puro: se puede corregir sin tocar una
 * sola línea de lógica. Cada ficha responde tres preguntas y, cuando el juego
 * comprime o exagera algo, lo dice en el campo `enElJuego`.
 */
import type { Ficha } from '../game/types'

export const FICHAS: Ficha[] = [
  {
    id: 'reloj-de-la-finca',
    titulo: 'El reloj de la finca',
    categoria: 'cultivo',
    queEs:
      'La equivalencia entre el tiempo de la finca real y el tiempo de esta partida. Un día de finca equivale a treinta segundos de juego.',
    comoSeUsa:
      'Con esa regla, la fermentación de seis días dura tres minutos, el secado de seis días dura otros tres, y el ciclo completo del grano en baba hasta el grano seco vendible toma seis minutos.',
    porQueImporta:
      'Un juego que hiciera esperar los tiempos reales sería injugable, pero un juego que los oculta enseña mal. Aquí la compresión es explícita y siempre reversible: lo que ves en pantalla se puede volver a traducir a días.',
    enElJuego:
      'La única duración que no respeta este reloj es la maduración de la mazorca colgada, que en el juego dura doce segundos porque es un ritmo de interacción. En la finca real pasan de cinco a seis meses entre la flor polinizada y la mazorca en punto.',
  },
  {
    id: 'punto-de-corte',
    titulo: 'El punto de corte',
    categoria: 'cosecha',
    queEs:
      'El momento en que la mazorca alcanza la madurez fisiológica y debe cortarse. Se reconoce por el color uniforme de la cáscara, la textura y el sonido hueco al golpearla.',
    comoSeUsa:
      'Se corta solo lo que está en punto. Las mazorcas verdes dan granos pequeños y mal formados; las sobremaduras empiezan a germinar por dentro y a fermentar mal.',
    porQueImporta:
      'Cosechar en punto es la primera decisión de calidad de toda la cadena, y no cuesta un peso. Es criterio, no inversión.',
    enElJuego:
      'La mazorca en punto rinde el doble que la pintona y cuatro veces más que la verde. Las herramientas de la línea de cosecha ensanchan la ventana en la que reconoces ese punto.',
    fuente: 'Anecacao, floración, fructificación y cosecha del cacao.',
  },
  {
    id: 'frecuencia-cosecha',
    titulo: 'Cada cuánto se recorre el lote',
    categoria: 'cosecha',
    queEs:
      'La cosecha del cacao no es un evento anual sino un recorrido periódico. Se pasa por el lote cada quince a veinte días cortando únicamente lo que alcanzó el punto óptimo.',
    comoSeUsa:
      'En cada recorrido se aprovecha para marcar lo que estará listo en el siguiente y para retirar frutos enfermos.',
    porQueImporta:
      'Alargar el intervalo deja mazorcas pasarse en el árbol, y eso es pérdida directa de peso y de calidad.',
    enElJuego: 'Cada nivel de recorrido agrega dos mazorcas simultáneas al árbol.',
    fuente: 'Anecacao.',
  },
  {
    id: 'corte-mazorca',
    titulo: 'Cómo se corta la mazorca',
    categoria: 'cosecha',
    queEs:
      'El corte se hace en el pedúnculo, el tallito que une la mazorca al tronco, con herramienta limpia y bien afilada.',
    comoSeUsa:
      'Nunca se arranca a mano ni se tuerce. El corte debe dejar el cojín floral intacto sobre el tronco.',
    porQueImporta:
      'El cojín floral es donde el árbol vuelve a florecer. Dañarlo al cosechar es sacrificar las cosechas siguientes por ahorrarse un segundo en esta.',
    enElJuego: 'El machete afilado duplica el rendimiento por mazorca.',
  },
  {
    id: 'herramienta-cosecha',
    titulo: 'Herramienta de cosecha',
    categoria: 'cosecha',
    queEs:
      'Machete corto para lo que está al alcance, podadora de gancho o media luna montada en vara para lo alto, y canasto para recoger.',
    comoSeUsa:
      'La herramienta se desinfecta entre árboles cuando hay enfermedad en el lote, para no ir sembrando el inóculo de planta en planta.',
    porQueImporta:
      'La herramienta sucia es uno de los vehículos de dispersión de las enfermedades del cacao dentro de una misma finca.',
  },
  {
    id: 'fermentacion',
    titulo: 'Fermentación en cajón',
    categoria: 'beneficio',
    queEs:
      'El grano recién sacado de la mazorca viene envuelto en una pulpa dulce llamada baba. La fermentación es el proceso en que los microorganismos consumen esa pulpa y desencadenan dentro del grano las reacciones que forman los precursores del sabor a chocolate.',
    comoSeUsa:
      'La masa se deposita en cajones de madera, tradicionalmente cedro o móncoro. Dura entre tres y diez días según el material genético: los criollos de dos a tres días, los trinitarios de cinco a seis y los forasteros de seis a ocho.',
    porQueImporta:
      'Sin fermentación no hay chocolate, solo una semilla amarga. Este es el paso donde un lote excelente de campo se puede arruinar por completo, y donde un lote corriente no se puede volver excelente. La fermentación no crea calidad que el campo no puso, pero sí la destruye.',
    enElJuego:
      'Dura ciento ochenta segundos y ninguna mejora la acorta, a propósito. Para producir más no se apura el cajón: se compran más cajones.',
    fuente: 'Poscosecha Cacao, beneficio del cacao y métodos de fermentación.',
  },
  {
    id: 'volteo',
    titulo: 'El volteo de la masa',
    categoria: 'beneficio',
    queEs:
      'Remover la masa en fermentación pasándola de un cajón a otro con pala de madera.',
    comoSeUsa:
      'Fedecacao recomienda esperar cuarenta y ocho horas hasta el primer volteo y de ahí en adelante remover cada veinticuatro horas.',
    porQueImporta:
      'La fermentación tiene dos fases. La primera es anaerobia, sin aire, donde levaduras y bacterias lácticas consumen los azúcares del mucílago. El volteo introduce oxígeno y abre la segunda fase, la aerobia, donde las bacterias acéticas hacen el trabajo que define el perfil final. Sin volteo, la masa fermenta desigual: por fuera se pasa y por dentro queda pizarrosa.',
    enElJuego:
      'Hay cuatro ventanas de volteo, a los sesenta, noventa, ciento veinte y ciento cincuenta segundos, que corresponden al día dos, tres, cuatro y cinco. Cada volteo acertado sube la calidad. Perder uno no castiga: simplemente no suma.',
    fuente: 'Poscosecha Cacao; recomendación de Fedecacao sobre frecuencia de volteo.',
  },
  {
    id: 'temperatura-fermentacion',
    titulo: 'La temperatura de la masa',
    categoria: 'beneficio',
    queEs:
      'La fermentación es fuertemente exotérmica: la masa se calienta sola y puede llegar a cincuenta grados o más.',
    comoSeUsa:
      'Se mide con termómetro de vástago largo clavado en el centro de la masa. La curva de temperatura es el mejor indicador de que el proceso va bien.',
    porQueImporta:
      'Ese calor es lo que mata el embrión del grano y permite que las enzimas internas trabajen. Una masa que no sube de temperatura es una masa que no está fermentando, y ninguna cantidad de tiempo lo va a arreglar.',
    fuente: 'Estandarización del proceso de fermentación de cacao, Universidad Nacional.',
  },
  {
    id: 'cajon-modular',
    titulo: 'Cajón modular',
    categoria: 'beneficio',
    queEs:
      'Una estructura desarmable en madera de cedro o móncoro, diseñada para reemplazar el cajón fijo tradicional.',
    comoSeUsa:
      'Se arma en escalera para que la masa baje de un nivel al siguiente por gravedad durante el volteo.',
    porQueImporta:
      'Da mejor control del calor, permite voltear de forma homogénea y reduce el esfuerzo físico del volteo, que hecho con pala sobre un cajón fijo es una tarea dura y repetitiva.',
    fuente: 'Agrosavia, módulo de beneficio de cacao.',
  },
  {
    id: 'secado',
    titulo: 'Secado',
    categoria: 'beneficio',
    queEs:
      'Bajar la humedad del grano fermentado hasta un siete por ciento aproximado, que es la humedad a la que el grano se puede almacenar y transportar sin enmohecerse.',
    comoSeUsa:
      'Al sol, extendido en capa delgada sobre marquesina o patio, removiendo con pala de madera cada veinticuatro horas. Toma entre cinco y siete días.',
    porQueImporta:
      'El secado demasiado rápido deja el grano ácido porque no alcanza a evaporar el ácido acético que generó la fermentación. El secado demasiado lento deja que entre el moho. Y el grano que gana humedad de noche, como pasa en marquesina sin buen cierre, retrocede lo ganado en el día.',
    enElJuego:
      'Dura ciento ochenta segundos, seis días. El secador solar tipo túnel lo baja a ciento veinte, cuatro días.',
    fuente: 'Efecto del secado al sol sobre la calidad del grano fermentado, Scielo.',
  },
  {
    id: 'prueba-de-corte',
    titulo: 'La prueba de corte',
    categoria: 'beneficio',
    queEs:
      'El examen que decide si un lote quedó bien beneficiado. Se cortan longitudinalmente al menos diez granos de una muestra y se mira el interior.',
    comoSeUsa:
      'Se cuenta qué proporción de granos perdió el color violeta y tomó tono pardo, con la estructura interna agrietada o abierta.',
    porQueImporta:
      'Es el lenguaje común entre el productor y el comprador. Un índice de fermentación se considera óptimo con un sesenta por ciento o más de granos pardos, y la prueba se da por exitosa con setenta por ciento. Los granos pizarrosos, grises y compactos, delatan falta de fermentación; el pardo apagado con olor a moho o amoníaco delata sobrefermentación.',
    enElJuego:
      'La barra de calidad de cada lote es exactamente esta prueba. Los cuatro grados del juego, pasilla, corriente, premium y fino de aroma, cortan en cuarenta, sesenta y setenta por ciento.',
    fuente: 'Perfect Daily Grind, qué es la prueba de corte del cacao.',
  },
  {
    id: 'clasificacion',
    titulo: 'Clasificación del grano',
    categoria: 'beneficio',
    queEs:
      'Separar el grano seco por tamaño y retirar impurezas, granos partidos, pegados o planos.',
    comoSeUsa: 'Con zaranda manual o mecánica, antes de empacar.',
    porQueImporta:
      'La uniformidad de tamaño importa porque el tostado es un proceso térmico: granos de tamaños distintos en la misma tanda se tuestan desigual, y unos quedan crudos mientras otros se queman.',
  },
  {
    id: 'almacenamiento',
    titulo: 'Almacenamiento',
    categoria: 'beneficio',
    queEs: 'Guardar el grano seco en sacos de fique, sobre estibas, en lugar fresco, seco y sin olores.',
    comoSeUsa:
      'Nunca directamente sobre el piso ni contra la pared, y nunca cerca de combustibles, agroquímicos o cebollas.',
    porQueImporta:
      'El grano de cacao absorbe olores con una facilidad enorme. Un lote fino de aroma guardado junto a un galón de gasolina deja de ser fino de aroma.',
  },
  {
    id: 'fino-de-aroma',
    titulo: 'Cacao fino de sabor y aroma',
    categoria: 'mercado',
    queEs:
      'Una categoría que reconoce la Organización Internacional del Cacao para los cacaos con perfiles sensoriales distintivos, frente al cacao corriente o al granel.',
    comoSeUsa:
      'Se sustenta con material genético apropiado, beneficio bien hecho y un perfil sensorial documentado por catación.',
    porQueImporta:
      'En el comité de la ICCO de 2019 Colombia fue ratificada como productora de cacao fino de sabor y aroma en un noventa y cinco por ciento de su producción. Esa es la ventaja competitiva del país frente a los grandes productores de África Occidental, que compiten por volumen. Pero la categoría se pierde en el cajón de fermentación, no en el mercado.',
    enElJuego:
      'El multiplicador de precio del grado fino, dos y medio, es una exageración deliberada. El sobreprecio real existe pero es más modesto. Aquí se amplifica para que la lección se sienta en el bolsillo dentro de una partida corta.',
    fuente: 'ICCO 2019; cifras sectoriales de la cadena de cacao, MinAgricultura.',
  },
  {
    id: 'precio-calidad',
    titulo: 'Por qué el precio no depende de cuánto cosechaste',
    categoria: 'mercado',
    queEs:
      'El precio de compra del grano se fija por kilo, pero el kilo no vale lo mismo según cómo haya quedado.',
    comoSeUsa:
      'El comprador evalúa humedad, uniformidad, impurezas y prueba de corte, y sobre esa evaluación aplica premios o castigos al precio de referencia.',
    porQueImporta:
      'Este es el mensaje entero del juego. Un lote excelente de campo, beneficiado mal, se paga como corriente. Duplicar la cosecha duplica los kilos; mejorar el beneficio multiplica lo que vale cada kilo. Las dos cosas suman, pero solo la segunda cambia la categoría del producto.',
  },
  {
    id: 'venta-en-baba',
    titulo: 'Vender en baba',
    categoria: 'mercado',
    queEs: 'Vender el grano recién sacado de la mazorca, húmedo y sin fermentar, a un intermediario.',
    comoSeUsa:
      'Es una salida a la que recurre el productor que necesita liquidez inmediata o que no tiene infraestructura de beneficio.',
    porQueImporta:
      'Resuelve el problema de caja de hoy y regala el valor de mañana. Todo lo que hace valioso al cacao colombiano ocurre después de ese punto de la cadena, así que quien vende en baba está entregando el margen completo del beneficio.',
    enElJuego:
      'Siempre está disponible y siempre paga el veinte por ciento. Nunca se bloquea, porque el juego no prohíbe la mala decisión: la deja verse en el marcador.',
  },
  {
    id: 'mano-de-obra',
    titulo: 'Mano de obra',
    categoria: 'cultivo',
    queEs: 'El jornal, que es el principal costo de una finca cacaotera pequeña.',
    comoSeUsa:
      'Se concentra en cosecha, poda y control sanitario, y su disponibilidad marca el ritmo real de la finca.',
    porQueImporta:
      'El cacao es un cultivo intensivo en trabajo y poco mecanizable. La diferencia entre una finca bien manejada y una abandonada casi nunca es el clima ni el material genético: es cuántas veces al mes alguien entra al lote.',
  },
  {
    id: 'sombrio-transitorio',
    titulo: 'Sombrío transitorio',
    categoria: 'cultivo',
    queEs:
      'Especies de ciclo corto, típicamente plátano y yuca, sembradas al mismo tiempo que el cacao para darle sombra los primeros años.',
    comoSeUsa:
      'Se establecen antes o junto con el cacao y se van retirando o raleando a medida que el sombrío permanente toma altura.',
    porQueImporta:
      'El cacao joven no soporta sol directo pleno. Y mientras tanto el plátano da cosecha y entrada de dinero durante los años en que el cacao todavía no produce nada, que es el problema económico central de establecer un cacaotal.',
  },
  {
    id: 'sombrio-permanente',
    titulo: 'Sombrío permanente',
    categoria: 'cultivo',
    queEs:
      'Árboles de porte alto y raíz profunda que acompañan al cacao durante toda la vida del cultivo.',
    comoSeUsa:
      'Se manejan con poda para regular el porcentaje de sombra, que debe bajar a medida que el cacao madura.',
    porQueImporta:
      'Regulan temperatura y humedad, aportan hojarasca al suelo y protegen del viento. Demasiada sombra baja la producción y favorece la monilia; muy poca estresa el árbol. El manejo del sombrío es una decisión permanente, no una siembra que se hace y se olvida.',
  },
  {
    id: 'agroforestal',
    titulo: 'Sistema agroforestal',
    categoria: 'cultivo',
    queEs:
      'La disposición del cacao junto con sombrío transitorio, sombrío permanente y a veces maderables o frutales, en un mismo lote.',
    comoSeUsa:
      'Los árboles de cacao se ubican de manera que quepan acompañados, con densidades del orden de mil árboles por hectárea cuando se usa material clonal injertado.',
    porQueImporta:
      'No es un adorno ecológico: el arreglo agroforestal es lo que hace que el cacao produzca de forma sostenida en el trópico, y además diversifica el ingreso de la finca con plátano, madera o frutales.',
    fuente: 'Modelo productivo para el cultivo de cacao en Santander, Agrosavia.',
  },
  {
    id: 'clones-injertados',
    titulo: 'Clones injertados',
    categoria: 'cultivo',
    queEs:
      'Material vegetal reproducido asexualmente por injerto sobre un patrón, de modo que cada árbol es genéticamente idéntico al clon seleccionado.',
    comoSeUsa:
      'Se injertan varetas tomadas de un jardín clonal sobre patrones de semilla híbrida, en vivero o directamente en campo sobre árboles viejos para renovarlos.',
    porQueImporta:
      'Los clones santandereanos promovidos por Fedecacao y los materiales seleccionados en el centro de investigación La Suiza, en Rionegro, están clasificados como finos en sabor y aroma. El rendimiento nacional supera los mil quinientos kilos por hectárea con buen paquete tecnológico, frente a los rendimientos muy inferiores de las plantaciones viejas de semilla.',
    fuente: 'Vanguardia, clones de cacao de Santander; Agrosavia, variedad TCS 19.',
  },
  {
    id: 'fertilizacion',
    titulo: 'Fertilización',
    categoria: 'cultivo',
    queEs: 'Reponer al suelo los nutrientes que el cultivo extrae con cada cosecha.',
    comoSeUsa:
      'Siempre sobre análisis de suelo. Sin análisis se fertiliza a ciegas, y lo más común es aplicar de más lo barato y de menos lo que hace falta.',
    porQueImporta:
      'Es la inversión con retorno más directo en producción, y también la más fácil de desperdiciar. Fertilizar sin analizar es tirar plata a un suelo que quizá no necesitaba eso.',
  },
  {
    id: 'podas',
    titulo: 'Podas de formación y mantenimiento',
    categoria: 'cultivo',
    queEs:
      'La poda de formación define la arquitectura del árbol joven; la de mantenimiento la conserva y regula la entrada de luz.',
    comoSeUsa:
      'Se retiran chupones, ramas cruzadas y ramas bajas, buscando una copa aireada y una altura que permita cosechar sin escalera.',
    porQueImporta:
      'Un árbol aireado se seca rápido después de la lluvia, y la humedad estancada dentro de la copa es exactamente lo que la monilia necesita. La poda es control de enfermedades disfrazado de labor de cultivo.',
  },
  {
    id: 'riego-drenaje',
    titulo: 'Riego y drenaje',
    categoria: 'cultivo',
    queEs: 'Las dos caras del manejo del agua en el lote.',
    comoSeUsa:
      'Riego en época seca prolongada, y zanjas de drenaje donde el terreno se encharca.',
    porQueImporta:
      'El cacao necesita humedad constante pero no tolera el encharcamiento: la raíz se asfixia. Y el exceso de humedad ambiental sostenida es el factor que más favorece a la monilia.',
  },
  {
    id: 'vivero-clonal',
    titulo: 'Vivero y jardín clonal',
    categoria: 'cultivo',
    queEs:
      'El vivero produce los patrones; el jardín clonal es la colección de árboles madre de donde se toman las varetas para injertar.',
    comoSeUsa:
      'Tener ambos en la finca permite renovar y ampliar sin depender de compras externas ni de la calidad del material de terceros.',
    porQueImporta:
      'La trazabilidad del material genético es la base de un perfil sensorial consistente. Si no sabes qué clones tienes, no puedes explicar a qué sabe tu cacao.',
  },
  {
    id: 'cascara-mazorca',
    titulo: 'La cáscara de la mazorca',
    categoria: 'cultivo',
    queEs:
      'Lo que queda después de sacar el grano, y que representa la mayor parte del peso de la mazorca.',
    comoSeUsa:
      'Se pica y se composta, o se deja descomponer en el lote lejos de los árboles productivos.',
    porQueImporta:
      'Devuelve materia orgánica y potasio al suelo. Pero si se deja amontonada junto a los árboles se convierte en foco de inóculo de monilia, así que es una buena práctica que mal hecha es una mala práctica.',
  },
  {
    id: 'asociatividad',
    titulo: 'Asociatividad',
    categoria: 'mercado',
    queEs: 'Organizarse con otros productores en asociación o cooperativa.',
    comoSeUsa:
      'Permite comprar insumos en volumen, compartir infraestructura de beneficio, acceder a asistencia técnica y negociar el precio como grupo.',
    porQueImporta:
      'Un productor solo con media tonelada no negocia nada. Cincuenta productores con veinticinco toneladas homogéneas y trazables entran a otro mercado. La calidad se logra en la finca, pero el precio se negocia en grupo.',
  },
  {
    id: 'monilia',
    titulo: 'Monilia',
    categoria: 'sanidad',
    queEs:
      'Enfermedad causada por el hongo Moniliophthora roreri que ataca exclusivamente el fruto. La mazorca se mancha, se deforma y por dentro se pudre por completo.',
    comoSeUsa:
      'El control es cultural y se basa en retirar los frutos enfermos antes de que esporulen, junto con poda para airear y manejo del sombrío.',
    porQueImporta:
      'Puede afectar hasta el noventa por ciento de las mazorcas de una planta cuando no hay prevención ni manejo. Y lo más duro es que el daño es invisible desde afuera hasta que ya es tarde: el hongo entra en el fruto joven y solo se manifiesta semanas después.',
    enElJuego:
      'Un foco de monilia reduce la producción pasiva un quince por ciento. Nunca la lleva a cero: por muchos focos que se acumulen hay un piso duro en la mitad de la producción nominal.',
    fuente: 'Croper, manejo de monilia y escoba de bruja en cacao.',
  },
  {
    id: 'escoba-de-bruja',
    titulo: 'Escoba de bruja',
    categoria: 'sanidad',
    queEs:
      'Enfermedad causada por Moniliophthora perniciosa. Deforma brotes, cojines florales y frutos, y produce esas ramas hipertrofiadas con aspecto de escoba que le dan el nombre.',
    comoSeUsa:
      'Se controla cortando las escobas por debajo del punto de infección y retirándolas del lote, en recorridos periódicos.',
    porQueImporta:
      'Las pérdidas documentadas van del cincuenta al noventa por ciento de la producción cuando no se maneja. En estudios colombianos con manejo sostenido, el índice bajó de ciento tres escobas por árbol al año a cuatro.',
    enElJuego: 'Un foco de escoba reduce la producción pasiva un veinticinco por ciento.',
    fuente: 'Agrosavia, control cultural de escoba de bruja y moniliasis en cacao.',
  },
  {
    id: 'poda-sanitaria',
    titulo: 'Poda sanitaria',
    categoria: 'sanidad',
    queEs:
      'El recorrido periódico en que se retiran del lote los frutos enfermos, las escobas y los residuos del suelo.',
    comoSeUsa:
      'La práctica recomendada es mensual, e intensificarla en la época de mayor incidencia. Lo retirado se saca del lote o se entierra, nunca se deja al pie del árbol.',
    porQueImporta:
      'No mata el hongo, lo que hace es cortar el ciclo: sin fruto enfermo esporulando no hay inóculo para la siguiente ronda de infección. En Colombia se ha documentado bajar la incidencia de monilia del sesenta y ocho al quince por ciento solo con manejo cultural sostenido.',
    enElJuego:
      'Cada foco se retira con un clic. Nunca es obligatorio, porque la producción tiene piso, pero es siempre rentable.',
    fuente: 'Agrosavia; estudios de frecuencias de remoción en Colombia.',
  },
  {
    id: 'mazorca-dorada',
    titulo: 'La mazorca dorada',
    categoria: 'cosecha',
    queEs:
      'Un guiño al género, no un fenómeno agronómico. Es la mazorca excepcional que aparece de vez en cuando y trae una racha de suerte.',
    comoSeUsa: 'Se le hace clic mientras está visible, trece segundos.',
    porQueImporta:
      'En la finca real el equivalente son las cosas que no se controlan: un buen precio esa semana, una lluvia oportuna, un comprador que apareció. El juego las incluye porque existen, pero nunca en contra del jugador: ninguna de las cuatro rachas posibles es negativa.',
  },
  {
    id: 'renovacion',
    titulo: 'Renovación del cacaotal',
    categoria: 'cultivo',
    queEs:
      'La práctica de renovar plantaciones viejas e improductivas, generalmente injertando material clonal seleccionado sobre los troncos existentes o sembrando de nuevo.',
    comoSeUsa:
      'Se hace por etapas para no quedarse sin ingreso, y la finca tarda unos años en volver a plena producción.',
    porQueImporta:
      'Buena parte del cacao colombiano está en plantaciones viejas de semilla, con rendimientos bajos. Renovar duele en el corto plazo y es lo único que cambia el techo de la finca en el largo.',
    enElJuego:
      'Renovar reinicia la partida y convierte los kilos vendidos históricos en semillas seleccionadas, que dan un bono permanente. Es exactamente ese intercambio: perder el corto plazo para subir el techo.',
  },
]

export const FICHAS_POR_ID: Record<string, Ficha> = Object.fromEntries(FICHAS.map((f) => [f.id, f]))

export const CATEGORIAS_FICHA: { id: string; nombre: string }[] = [
  { id: 'cultivo', nombre: 'Cultivo' },
  { id: 'cosecha', nombre: 'Cosecha' },
  { id: 'beneficio', nombre: 'Beneficio' },
  { id: 'sanidad', nombre: 'Sanidad' },
  { id: 'mercado', nombre: 'Mercado' },
]
