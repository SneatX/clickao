/**
 * Catalogo de mejoras. Contenido puro, sin logica.
 *
 * Regla de oro: cada mejora cae en exactamente una categoria.
 *   herramientas -> todo lo que ocurre en el arbol al hacer clic
 *   cultivo      -> la corriente pasiva de grano en baba
 *   beneficio    -> capacidad, paralelismo, calidad y precio
 *
 * La curva de los generadores reutiliza el esqueleto de Cookie Clicker
 * (crecimiento 1,15 por unidad) escalado x35 en costo y x4 en produccion.
 */
import type { Mejora } from '../game/types'

const CRECIMIENTO_GENERADOR = 1.15

interface DefGenerador {
  id: string
  nombre: string
  descripcion: string
  costo: number
  produccion: number
  ficha: string
}

const GENERADORES: DefGenerador[] = [
  {
    id: 'jornalero',
    nombre: 'Jornalero de cosecha',
    descripcion: 'Una persona mas recorriendo el lote y cortando lo que esta en punto.',
    costo: 500,
    produccion: 0.4,
    ficha: 'mano-de-obra',
  },
  {
    id: 'sombrio_transitorio',
    nombre: 'Sombrio transitorio de platano',
    descripcion: 'Platano y yuca protegen el cacao joven del sol mientras crece.',
    costo: 3_500,
    produccion: 4,
    ficha: 'sombrio-transitorio',
  },
  {
    id: 'sombrio_permanente',
    nombre: 'Sombrio permanente con maderables',
    descripcion: 'Arboles altos que dan sombra estable y madera a largo plazo.',
    costo: 40_000,
    produccion: 32,
    ficha: 'sombrio-permanente',
  },
  {
    id: 'clones_injertados',
    nombre: 'Clones injertados TCS',
    descripcion: 'Material clonal santandereano, seleccionado por rendimiento y por sabor.',
    costo: 420_000,
    produccion: 190,
    ficha: 'clones-injertados',
  },
  {
    id: 'fertilizacion',
    nombre: 'Fertilizacion segun analisis de suelo',
    descripcion: 'Reponer lo que el cultivo extrae, en la cantidad que el suelo pide.',
    costo: 4_500_000,
    produccion: 1_040,
    ficha: 'fertilizacion',
  },
  {
    id: 'podas_mantenimiento',
    nombre: 'Podas de formacion y mantenimiento',
    descripcion: 'Dar forma al arbol y abrir el dosel para que entre luz y aire.',
    costo: 50_000_000,
    produccion: 5_600,
    ficha: 'podas',
  },
  {
    id: 'riego_drenaje',
    nombre: 'Riego y drenaje del lote',
    descripcion: 'Agua cuando falta y salida cuando sobra. El cacao no perdona el encharcamiento.',
    costo: 700_000_000,
    produccion: 31_000,
    ficha: 'riego-drenaje',
  },
  {
    id: 'vivero_clonal',
    nombre: 'Vivero y jardin clonal propio',
    descripcion: 'Producir en la finca las varetas y los patrones en vez de comprarlos.',
    costo: 11_500_000_000,
    produccion: 176_000,
    ficha: 'vivero-clonal',
  },
  {
    id: 'nuevas_hectareas',
    nombre: 'Ampliacion a nuevas hectareas',
    descripcion: 'Mas area sembrada bajo el mismo sistema agroforestal.',
    costo: 180_000_000_000,
    produccion: 1_040_000,
    ficha: 'agroforestal',
  },
  {
    id: 'asociacion',
    nombre: 'Asociacion y asistencia tecnica',
    descripcion: 'Organizarse con los vecinos abre credito, insumos y acompanamiento.',
    costo: 2_600_000_000_000,
    produccion: 6_400_000,
    ficha: 'asociatividad',
  },
]

const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']
const romano = (n: number) => ROMANOS[n - 1] ?? String(n)

function generadores(): Mejora[] {
  const base: Mejora[] = GENERADORES.map((g, i) => ({
    id: g.id,
    categoria: 'cultivo',
    nombre: g.nombre,
    descripcion: g.descripcion,
    costoBase: g.costo,
    crecimiento: CRECIMIENTO_GENERADOR,
    maxNivel: Infinity,
    efectos: [{ tipo: 'pasiva_produccion', valor: g.produccion }],
    fichaId: g.ficha,
    requiere: i === 0 ? undefined : [{ tipo: 'mejora', id: GENERADORES[i - 1].id, nivel: 1 }],
  }))

  // Niveles procedimentales: el cacaotal nunca deja de poder crecer.
  let costo = GENERADORES[GENERADORES.length - 1].costo * 16
  let produccion = GENERADORES[GENERADORES.length - 1].produccion * 6
  for (let n = 1; n <= 20; n++) {
    base.push({
      id: `cacaotal_${n}`,
      categoria: 'cultivo',
      nombre: `Nuevo cacaotal ${romano(n)}`,
      descripcion: 'Otra finca sembrada bajo el mismo modelo, con su propia cuadrilla.',
      costoBase: costo,
      crecimiento: CRECIMIENTO_GENERADOR,
      maxNivel: Infinity,
      efectos: [{ tipo: 'pasiva_produccion', valor: produccion }],
      fichaId: 'agroforestal',
      requiere: [{ tipo: 'mejora', id: n === 1 ? 'asociacion' : `cacaotal_${n - 1}`, nivel: 1 }],
    })
    costo *= 16
    produccion *= 6
  }
  return base
}

/** Cada generador tiene tres refuerzos que duplican su rendimiento. */
function refuerzosDeGenerador(): Mejora[] {
  const sufijos = [
    { nombre: 'mejorado', umbral: 10, factorCosto: 12 },
    { nombre: 'tecnificado', umbral: 25, factorCosto: 140 },
    { nombre: 'certificado', umbral: 50, factorCosto: 1_600 },
  ]
  const out: Mejora[] = []
  for (const g of GENERADORES) {
    sufijos.forEach((s, i) => {
      out.push({
        id: `${g.id}_x${i + 1}`,
        categoria: 'cultivo',
        nombre: `${g.nombre}, ${s.nombre}`,
        descripcion: `Duplica lo que aporta cada ${g.nombre.toLowerCase()}.`,
        costoBase: Math.round(g.costo * s.factorCosto),
        crecimiento: 1,
        maxNivel: 1,
        efectos: [{ tipo: 'pasiva_multiplicador', valor: 2 }],
        fichaId: g.ficha,
        requiere: [{ tipo: 'mejora', id: g.id, nivel: s.umbral }],
      })
    })
  }
  return out
}

const SANIDAD: Mejora[] = [
  {
    id: 'drenajes_lote',
    categoria: 'cultivo',
    nombre: 'Drenajes en el lote',
    descripcion: 'Bajar la humedad ambiental reduce la presion de la monilia.',
    costoBase: 180_000,
    crecimiento: 1,
    maxNivel: 1,
    efectos: [{ tipo: 'riesgo_enfermedad', valor: 0.85 }],
    fichaId: 'monilia',
    requiere: [{ tipo: 'stat', clave: 'podas', valor: 5 }],
  },
  {
    id: 'clones_tolerantes',
    categoria: 'cultivo',
    nombre: 'Clones tolerantes',
    descripcion: 'Material genetico menos susceptible a monilia y escoba de bruja.',
    costoBase: 2_400_000,
    crecimiento: 1,
    maxNivel: 1,
    efectos: [{ tipo: 'riesgo_enfermedad', valor: 0.8 }],
    fichaId: 'escoba-de-bruja',
    requiere: [{ tipo: 'mejora', id: 'clones_injertados', nivel: 10 }],
  },
  {
    id: 'podas_sanitarias_mensuales',
    categoria: 'cultivo',
    nombre: 'Poda sanitaria mensual',
    descripcion: 'Recorrer el lote cada mes retirando frutos enfermos, escobas y residuos.',
    costoBase: 30_000_000,
    crecimiento: 1,
    maxNivel: 1,
    efectos: [{ tipo: 'riesgo_enfermedad', valor: 0.75 }],
    fichaId: 'poda-sanitaria',
    requiere: [{ tipo: 'stat', clave: 'podas', valor: 40 }],
  },
  {
    id: 'abono_organico',
    categoria: 'cultivo',
    nombre: 'Abono organico de la finca',
    descripcion: 'Compostar la cascara de la mazorca y devolverla al lote.',
    costoBase: 900_000,
    crecimiento: 1,
    maxNivel: 1,
    efectos: [{ tipo: 'pasiva_multiplicador', valor: 1.5 }],
    fichaId: 'cascara-mazorca',
    requiere: [{ tipo: 'mejora', id: 'fertilizacion', nivel: 1 }],
  },
]

const HERRAMIENTAS_DOBLES: { id: string; nombre: string; descripcion: string; costo: number; ficha: string }[] = [
  {
    id: 'machete',
    nombre: 'Machete afilado y desinfectado',
    descripcion: 'Un corte limpio en el pedunculo no lastima el cojin floral.',
    costo: 2_000,
    ficha: 'corte-mazorca',
  },
  {
    id: 'podadora_gancho',
    nombre: 'Podadora de gancho, media luna',
    descripcion: 'Alcanza las mazorcas altas sin subirse al arbol.',
    costo: 15_000,
    ficha: 'herramienta-cosecha',
  },
  {
    id: 'canasto_guantes',
    nombre: 'Canasto y guantes',
    descripcion: 'Recoger sin golpear la mazorca ni ensuciar la masa.',
    costo: 100_000,
    ficha: 'herramienta-cosecha',
  },
  {
    id: 'tijera_altura',
    nombre: 'Tijera de altura de dos manos',
    descripcion: 'Corte preciso a cuatro metros, sin desgarrar la corteza.',
    costo: 700_000,
    ficha: 'herramienta-cosecha',
  },
  {
    id: 'cuadrilla',
    nombre: 'Cuadrilla de cosecha entrenada',
    descripcion: 'Gente que sabe leer el punto de corte y no tumba lo verde.',
    costo: 5_000_000,
    ficha: 'punto-de-corte',
  },
]

function herramientas(): Mejora[] {
  const out: Mejora[] = HERRAMIENTAS_DOBLES.map((h, i) => ({
    id: h.id,
    categoria: 'herramientas',
    nombre: h.nombre,
    descripcion: `${h.descripcion} Duplica el rendimiento por mazorca.`,
    costoBase: h.costo,
    crecimiento: 1,
    maxNivel: 1,
    efectos: [{ tipo: 'clic_multiplicador', valor: 2 }],
    fichaId: h.ficha,
    requiere: i === 0 ? undefined : [{ tipo: 'mejora', id: HERRAMIENTAS_DOBLES[i - 1].id, nivel: 1 }],
  }))

  out.push(
    {
      id: 'recorrido_cosecha',
      categoria: 'herramientas',
      nombre: 'Recorrido de cosecha cada 15 dias',
      descripcion: 'Pasar mas seguido por el lote deja mas mazorcas colgando en punto. +2 mazorcas.',
      costoBase: 25_000,
      crecimiento: 6,
      maxNivel: 3,
      efectos: [{ tipo: 'mazorcas_simultaneas', valor: 2 }],
      fichaId: 'frecuencia-cosecha',
      requiere: [{ tipo: 'mejora', id: 'machete', nivel: 1 }],
    },
    {
      id: 'ojo_entrenado',
      categoria: 'herramientas',
      nombre: 'Ojo entrenado para el punto de corte',
      descripcion: 'Reconocer la mazorca en punto con mas margen. Ensancha la ventana optima un segundo.',
      costoBase: 60_000,
      crecimiento: 8,
      maxNivel: 2,
      efectos: [{ tipo: 'ventana_optima', valor: 1 }],
      fichaId: 'punto-de-corte',
      requiere: [{ tipo: 'mejora', id: 'podadora_gancho', nivel: 1 }],
    },
    {
      id: 'marcado_maduras',
      categoria: 'herramientas',
      nombre: 'Marcado de mazorcas maduras',
      descripcion: 'Senalar en el recorrido anterior lo que estara listo. Media ventana mas y aviso en pantalla.',
      costoBase: 30_000,
      crecimiento: 1,
      maxNivel: 1,
      efectos: [{ tipo: 'ventana_optima', valor: 0.5 }],
      fichaId: 'punto-de-corte',
      requiere: [{ tipo: 'mejora', id: 'recorrido_cosecha', nivel: 1 }],
    },
    {
      id: 'cosecha_escalonada',
      categoria: 'herramientas',
      nombre: 'Cosecha escalonada',
      descripcion: 'Organizar el lote por tandas acelera el relevo de mazorcas un 15%.',
      costoBase: 400_000,
      crecimiento: 9,
      maxNivel: 2,
      efectos: [{ tipo: 'ciclo_mazorca', valor: 0.85 }],
      fichaId: 'frecuencia-cosecha',
      requiere: [{ tipo: 'mejora', id: 'canasto_guantes', nivel: 1 }],
    },
  )

  // Escalones procedimentales: la linea de herramientas nunca se agota.
  let costo = 5_000_000 * 7
  for (let n = 1; n <= 35; n++) {
    out.push({
      id: `cuadrilla_ampliada_${n}`,
      categoria: 'herramientas',
      nombre: `Cuadrilla ampliada ${romano(n)}`,
      descripcion: 'Mas manos entrenadas en el recorrido. Duplica el rendimiento por mazorca.',
      costoBase: costo,
      crecimiento: 1,
      maxNivel: 1,
      efectos: [{ tipo: 'clic_multiplicador', valor: 2 }],
      fichaId: 'punto-de-corte',
      requiere: [{ tipo: 'mejora', id: n === 1 ? 'cuadrilla' : `cuadrilla_ampliada_${n - 1}`, nivel: 1 }],
    })
    costo *= 7
  }
  return out
}

function beneficio(): Mejora[] {
  const out: Mejora[] = [
    {
      id: 'cajon_sencillo',
      categoria: 'beneficio',
      nombre: 'Cajon fermentador de cedro',
      descripcion: 'Abre la etapa de beneficio. Un cajon con capacidad para un kilo de grano.',
      costoBase: 8_000,
      crecimiento: 1,
      maxNivel: 1,
      efectos: [{ tipo: 'lotes_paralelos', valor: 1 }],
      fichaId: 'fermentacion',
    },
    {
      id: 'marquesina',
      categoria: 'beneficio',
      nombre: 'Marquesina de secado',
      descripcion: 'Secar bajo techo translucido en vez de sobre el piso. Sube la calidad base.',
      costoBase: 90_000,
      crecimiento: 1,
      maxNivel: 1,
      efectos: [{ tipo: 'calidad_base', valor: 0.08 }],
      fichaId: 'secado',
      requiere: [{ tipo: 'mejora', id: 'cajon_sencillo', nivel: 1 }],
    },
    {
      id: 'pala_madera',
      categoria: 'beneficio',
      nombre: 'Pala de madera para volteo',
      descripcion: 'Remover la masa sin herir el grano. Cada volteo aporta mas calidad.',
      costoBase: 45_000,
      crecimiento: 1,
      maxNivel: 1,
      efectos: [{ tipo: 'calidad_volteo', valor: 0.04 }],
      fichaId: 'volteo',
      requiere: [{ tipo: 'mejora', id: 'cajon_sencillo', nivel: 1 }],
    },
    {
      id: 'cajon_escalera',
      categoria: 'beneficio',
      nombre: 'Cajones en escalera',
      descripcion: 'Trasegar la masa de un cajon a otro por gravedad. Un lote mas en paralelo.',
      costoBase: 60_000,
      crecimiento: 7,
      maxNivel: 3,
      efectos: [{ tipo: 'lotes_paralelos', valor: 1 }],
      fichaId: 'fermentacion',
      requiere: [{ tipo: 'mejora', id: 'cajon_sencillo', nivel: 1 }],
    },
    {
      id: 'termometro',
      categoria: 'beneficio',
      nombre: 'Termometro de masa',
      descripcion: 'Seguir la curva de temperatura, que llega cerca de los 50 grados. Sube el techo de calidad.',
      costoBase: 120_000,
      crecimiento: 1,
      maxNivel: 1,
      efectos: [{ tipo: 'calidad_techo', valor: 0.03 }],
      fichaId: 'temperatura-fermentacion',
      requiere: [{ tipo: 'mejora', id: 'cajon_sencillo', nivel: 1 }],
    },
    {
      id: 'cajon_moncoro',
      categoria: 'beneficio',
      nombre: 'Cajon modular en madera de moncoro',
      descripcion: 'Estructura desarmable con mejor control de calor. Capacidad por dos y medio.',
      costoBase: 250_000,
      crecimiento: 1,
      maxNivel: 1,
      efectos: [{ tipo: 'lotes_capacidad', valor: 2.5 }],
      fichaId: 'cajon-modular',
      requiere: [{ tipo: 'mejora', id: 'cajon_escalera', nivel: 1 }],
    },
    {
      id: 'prueba_corte',
      categoria: 'beneficio',
      nombre: 'Prueba de corte sistematica',
      descripcion: 'Cortar diez granos de cada lote y contar los pardos. Muestra la calidad exacta.',
      costoBase: 300_000,
      crecimiento: 1,
      maxNivel: 1,
      efectos: [{ tipo: 'calidad_techo', valor: 0.02 }],
      fichaId: 'prueba-de-corte',
      requiere: [{ tipo: 'mejora', id: 'termometro', nivel: 1 }],
    },
    {
      id: 'zaranda',
      categoria: 'beneficio',
      nombre: 'Zaranda de clasificacion',
      descripcion: 'Separar por tamano y sacar impurezas. Diez por ciento mas de precio.',
      costoBase: 600_000,
      crecimiento: 1,
      maxNivel: 1,
      efectos: [{ tipo: 'precio_multiplicador', valor: 1.1 }],
      fichaId: 'clasificacion',
      requiere: [{ tipo: 'mejora', id: 'marquesina', nivel: 1 }],
    },
    {
      id: 'secador_tunel',
      categoria: 'beneficio',
      nombre: 'Secador solar tipo tunel',
      descripcion: 'Aire caliente en circulacion. El secado baja de seis a cuatro dias.',
      costoBase: 900_000,
      crecimiento: 1,
      maxNivel: 1,
      efectos: [{ tipo: 'secado_duracion', valor: 4 / 6 }],
      fichaId: 'secado',
      requiere: [{ tipo: 'mejora', id: 'marquesina', nivel: 1 }],
    },
    {
      id: 'cuarto_reposo',
      categoria: 'beneficio',
      nombre: 'Cuarto de reposo con sacos de fique',
      descripcion: 'Almacenar en fresco, sobre estibas y sin olores cerca. Doce por ciento mas de precio.',
      costoBase: 1_500_000,
      crecimiento: 1,
      maxNivel: 1,
      efectos: [{ tipo: 'precio_multiplicador', valor: 1.12 }],
      fichaId: 'almacenamiento',
      requiere: [{ tipo: 'mejora', id: 'secador_tunel', nivel: 1 }],
    },
  ]

  // Capacidad, paralelismo y mercado, en escalones procedimentales.
  let costoCap = 2_000_000
  for (let n = 1; n <= 30; n++) {
    out.push({
      id: `ampliacion_beneficiadero_${n}`,
      categoria: 'beneficio',
      nombre: `Ampliacion del beneficiadero ${romano(n)}`,
      descripcion: 'Cajones mas grandes y mejor distribuidos. Capacidad por uno y medio.',
      costoBase: costoCap,
      crecimiento: 1,
      maxNivel: 1,
      efectos: [{ tipo: 'lotes_capacidad', valor: 1.5 }],
      fichaId: 'cajon-modular',
      requiere: [
        { tipo: 'mejora', id: n === 1 ? 'cajon_moncoro' : `ampliacion_beneficiadero_${n - 1}`, nivel: 1 },
      ],
    })
    costoCap *= 8
  }

  let costoBat = 3_000_000
  for (let n = 1; n <= 20; n++) {
    out.push({
      id: `bateria_cajones_${n}`,
      categoria: 'beneficio',
      nombre: `Bateria de cajones ${romano(n)}`,
      descripcion: 'Otro cajon corriendo en paralelo, porque la fermentacion no se puede apurar.',
      costoBase: costoBat,
      crecimiento: 1,
      maxNivel: 1,
      efectos: [{ tipo: 'lotes_paralelos', valor: 1 }],
      fichaId: 'fermentacion',
      requiere: [
        { tipo: 'mejora', id: n === 1 ? 'cajon_escalera' : `bateria_cajones_${n - 1}`, nivel: n === 1 ? 3 : 1 },
      ],
    })
    costoBat *= 9
  }

  const MERCADO = [
    'Trazabilidad por lote',
    'Certificacion organica',
    'Venta directa a chocolateria',
    'Perfil sensorial documentado',
    'Denominacion de origen',
  ]
  let costoMkt = 5_000_000
  for (let n = 1; n <= 30; n++) {
    const nombre = n <= MERCADO.length ? MERCADO[n - 1] : `Acuerdo comercial ${romano(n - MERCADO.length)}`
    out.push({
      id: `mercado_${n}`,
      categoria: 'beneficio',
      nombre,
      descripcion: 'Mejor acceso a mercado. Quince por ciento mas de precio.',
      costoBase: costoMkt,
      crecimiento: 1,
      maxNivel: 1,
      efectos: [{ tipo: 'precio_multiplicador', valor: 1.15 }],
      fichaId: 'fino-de-aroma',
      requiere: [{ tipo: 'mejora', id: n === 1 ? 'zaranda' : `mercado_${n - 1}`, nivel: 1 }],
    })
    costoMkt *= 9
  }

  return out
}

export const MEJORAS: Mejora[] = [
  ...generadores(),
  ...refuerzosDeGenerador(),
  ...SANIDAD,
  ...herramientas(),
  ...beneficio(),
]

export const MEJORAS_POR_ID: Record<string, Mejora> = Object.fromEntries(
  MEJORAS.map((m) => [m.id, m]),
)

/** Capacidad base de un cajon, en granos en baba. Un kilo de grano seco. */
export const CAPACIDAD_BASE = 1000

export interface MejoraPrestigio {
  id: string
  nombre: string
  descripcion: string
  costo: number
}

export const MEJORAS_PRESTIGIO: MejoraPrestigio[] = [
  {
    id: 'cajon_heredado',
    nombre: 'Cajon heredado',
    descripcion: 'Empiezas cada renovacion con el cajon fermentador ya construido.',
    costo: 1,
  },
  {
    id: 'ahorro_familiar',
    nombre: 'Ahorro familiar',
    descripcion: 'Conservas el diez por ciento del dinero al renovar el cacaotal.',
    costo: 3,
  },
  {
    id: 'jardin_clonal',
    nombre: 'Jardin clonal heredado',
    descripcion: 'Las mazorcas doradas aparecen un treinta por ciento mas seguido.',
    costo: 5,
  },
  {
    id: 'memoria_del_cacaotal',
    nombre: 'Memoria del cacaotal',
    descripcion: 'Empiezas con las cinco primeras herramientas de cosecha.',
    costo: 10,
  },
  {
    id: 'vecinos_organizados',
    nombre: 'Vecinos organizados',
    descripcion: 'Un veinticinco por ciento adicional de produccion pasiva, para siempre.',
    costo: 25,
  },
  {
    id: 'ojo_del_abuelo',
    nombre: 'Ojo del abuelo',
    descripcion: 'Dos segundos mas de ventana optima en toda partida futura.',
    costo: 50,
  },
]

export const MEJORAS_PRESTIGIO_POR_ID: Record<string, MejoraPrestigio> = Object.fromEntries(
  MEJORAS_PRESTIGIO.map((m) => [m.id, m]),
)
