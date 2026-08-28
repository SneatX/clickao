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
    descripcion: 'Una persona más recorriendo el lote y cortando lo que está en punto.',
    costo: 700,
    produccion: 0.4,
    ficha: 'mano-de-obra',
  },
  {
    id: 'sombrio_transitorio',
    nombre: 'Sombrío transitorio de plátano',
    descripcion: 'Plátano y yuca protegen el cacao joven del sol mientras crece.',
    costo: 4_900,
    produccion: 4,
    ficha: 'sombrio-transitorio',
  },
  {
    id: 'sombrio_permanente',
    nombre: 'Sombrío permanente con maderables',
    descripcion: 'Árboles altos que dan sombra estable y madera a largo plazo.',
    costo: 56_000,
    produccion: 32,
    ficha: 'sombrio-permanente',
  },
  {
    id: 'clones_injertados',
    nombre: 'Clones injertados TCS',
    descripcion: 'Material clonal santandereano, seleccionado por rendimiento y por sabor.',
    costo: 1_180_000,
    produccion: 190,
    ficha: 'clones-injertados',
  },
  {
    id: 'fertilizacion',
    nombre: 'Fertilización segun análisis de suelo',
    descripcion: 'Reponer lo que el cultivo extrae, en la cantidad que el suelo pide.',
    costo: 12_600_000,
    produccion: 1_040,
    ficha: 'fertilizacion',
  },
  {
    id: 'podas_mantenimiento',
    nombre: 'Podas de formación y mantenimiento',
    descripcion: 'Dar forma al árbol y abrir el dosel para que entre luz y aire.',
    costo: 140_000_000,
    produccion: 5_600,
    ficha: 'podas',
  },
  {
    id: 'riego_drenaje',
    nombre: 'Riego y drenaje del lote',
    descripcion: 'Agua cuando falta y salida cuando sobra. El cacao no perdona el encharcamiento.',
    costo: 1_960_000_000,
    produccion: 31_000,
    ficha: 'riego-drenaje',
  },
  {
    id: 'vivero_clonal',
    nombre: 'Vivero y jardín clonal propio',
    descripcion: 'Producir en la finca las varetas y los patrones en vez de comprarlos.',
    costo: 32_200_000_000,
    produccion: 176_000,
    ficha: 'vivero-clonal',
  },
  {
    id: 'nuevas_hectareas',
    nombre: 'Ampliación a nuevas hectáreas',
    descripcion: 'Más área sembrada bajo el mismo sistema agroforestal.',
    costo: 504_000_000_000,
    produccion: 1_040_000,
    ficha: 'agroforestal',
  },
  {
    id: 'asociacion',
    nombre: 'Asociación y asistencia técnica',
    descripcion: 'Organizarse con los vecinos abre crédito, insumos y acompañamiento.',
    costo: 7_280_000_000_000,
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
  // Dos refuerzos por generador y no tres, y caros. Es una segunda escala
  // multiplicativa sobre la misma linea: si sale barata, la curva se desborda.
  const sufijos = [
    { nombre: 'mejorado', umbral: 20, factorCosto: 90 },
    { nombre: 'certificado', umbral: 50, factorCosto: 9_000 },
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
    descripcion: 'Bajar la humedad ambiental reduce la presión de la monilia.',
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
    descripcion: 'Material genético menos susceptible a monilia y escoba de bruja.',
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
    nombre: 'Abono orgánico de la finca',
    descripcion: 'Compostar la cáscara de la mazorca y devolverla al lote.',
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
    descripcion: 'Un corte limpio en el pedúnculo no lastima el cojín floral.',
    costo: 2_000,
    ficha: 'corte-mazorca',
  },
  {
    id: 'podadora_gancho',
    nombre: 'Podadora de gancho, media luna',
    descripcion: 'Alcanza las mazorcas altas sin subirse al árbol.',
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
      nombre: 'Recorrido de cosecha cada 15 días',
      descripcion: 'Pasar más seguido por el lote deja más mazorcas colgando en punto. +2 mazorcas.',
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
      descripcion: 'Reconocer la mazorca en punto con más margen. Ensancha la ventana óptima un segundo.',
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
      descripcion: 'Señalar en el recorrido anterior lo que estará listo. Media ventana más y aviso en pantalla.',
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
  let costo = 5_000_000 * 10
  for (let n = 1; n <= 35; n++) {
    out.push({
      id: `cuadrilla_ampliada_${n}`,
      categoria: 'herramientas',
      nombre: `Cuadrilla ampliada ${romano(n)}`,
      descripcion: 'Más manos entrenadas en el recorrido. Duplica el rendimiento por mazorca.',
      costoBase: costo,
      crecimiento: 1,
      maxNivel: 1,
      efectos: [{ tipo: 'clic_multiplicador', valor: 2 }],
      fichaId: 'punto-de-corte',
      requiere: [{ tipo: 'mejora', id: n === 1 ? 'cuadrilla' : `cuadrilla_ampliada_${n - 1}`, nivel: 1 }],
    })
    costo *= 10
  }
  return out
}

function beneficio(): Mejora[] {
  const out: Mejora[] = [
    {
      id: 'cajon_sencillo',
      categoria: 'beneficio',
      nombre: 'Cajón fermentador de cedro',
      descripcion: 'Abre la etapa de beneficio. Un cajón con capacidad para un kilo de grano.',
      costoBase: 3_500,
      crecimiento: 1,
      maxNivel: 1,
      efectos: [{ tipo: 'lotes_paralelos', valor: 1 }],
      fichaId: 'fermentacion',
    },
    {
      id: 'marquesina',
      categoria: 'beneficio',
      nombre: 'Marquesina de secado',
      descripcion: 'Secar bajo techo translúcido en vez de sobre el piso. Sube la calidad base.',
      costoBase: 25_000,
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
      descripcion: 'Remover la masa sin herir el grano. Cada volteo aporta más calidad.',
      costoBase: 12_000,
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
      descripcion: 'Trasegar la masa de un cajón a otro por gravedad. Un lote más en paralelo.',
      costoBase: 9_000,
      crecimiento: 3,
      maxNivel: 5,
      efectos: [{ tipo: 'lotes_paralelos', valor: 1 }],
      fichaId: 'fermentacion',
      requiere: [{ tipo: 'mejora', id: 'cajon_sencillo', nivel: 1 }],
    },
    {
      id: 'termometro',
      categoria: 'beneficio',
      nombre: 'Termómetro de masa',
      descripcion: 'Seguir la curva de temperatura, que llega cerca de los 50 grados. Sube el techo de calidad.',
      costoBase: 35_000,
      crecimiento: 1,
      maxNivel: 1,
      efectos: [{ tipo: 'calidad_techo', valor: 0.03 }],
      fichaId: 'temperatura-fermentacion',
      requiere: [{ tipo: 'mejora', id: 'cajon_sencillo', nivel: 1 }],
    },
    {
      id: 'cajon_moncoro',
      categoria: 'beneficio',
      nombre: 'Cajón modular en madera de móncoro',
      descripcion: 'Estructura desarmable con mejor control de calor. Capacidad por dos y medio.',
      costoBase: 28_000,
      crecimiento: 1,
      maxNivel: 1,
      efectos: [{ tipo: 'lotes_capacidad', valor: 2.5 }],
      fichaId: 'cajon-modular',
      requiere: [{ tipo: 'mejora', id: 'cajon_escalera', nivel: 1 }],
    },
    {
      id: 'prueba_corte',
      categoria: 'beneficio',
      nombre: 'Prueba de corte sistemática',
      descripcion: 'Cortar diez granos de cada lote y contar los pardos. Muestra la calidad exacta.',
      costoBase: 90_000,
      crecimiento: 1,
      maxNivel: 1,
      efectos: [{ tipo: 'calidad_techo', valor: 0.02 }],
      fichaId: 'prueba-de-corte',
      requiere: [{ tipo: 'mejora', id: 'termometro', nivel: 1 }],
    },
    {
      id: 'zaranda',
      categoria: 'beneficio',
      nombre: 'Zaranda de clasificación',
      descripcion: 'Separar por tamaño y sacar impurezas. Diez por ciento más de precio.',
      costoBase: 150_000,
      crecimiento: 1,
      maxNivel: 1,
      efectos: [{ tipo: 'precio_multiplicador', valor: 1.1 }],
      fichaId: 'clasificacion',
      requiere: [{ tipo: 'mejora', id: 'marquesina', nivel: 1 }],
    },
    {
      id: 'secador_tunel',
      categoria: 'beneficio',
      nombre: 'Secador solar tipo túnel',
      descripcion: 'Aire caliente en circulación. El secado baja de seis a cuatro días.',
      costoBase: 260_000,
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
      descripcion: 'Almacenar en fresco, sobre estibas y sin olores cerca. Doce por ciento más de precio.',
      costoBase: 400_000,
      crecimiento: 1,
      maxNivel: 1,
      efectos: [{ tipo: 'precio_multiplicador', valor: 1.12 }],
      fichaId: 'almacenamiento',
      requiere: [{ tipo: 'mejora', id: 'secador_tunel', nivel: 1 }],
    },
  ]

  // Capacidad, paralelismo y mercado. Son escalas repetibles y no listas de
  // niveles sueltos: así el costo por unidad de capacidad se afina con dos
  // números y se puede mantener a la par de la curva de los generadores. La
  // fermentación no se puede acortar, de modo que crecer aquí es la única forma
  // de procesar más, y tiene que salir a un precio comparable al de producir.
  out.push(
    {
      id: 'ampliacion_beneficiadero',
      categoria: 'beneficio',
      nombre: 'Ampliación del beneficiadero',
      descripcion: 'Cajones más grandes y mejor distribuidos. Duplica la capacidad de cada lote.',
      costoBase: 45_000,
      crecimiento: 3.4,
      maxNivel: Infinity,
      efectos: [{ tipo: 'lotes_capacidad', valor: 2 }],
      fichaId: 'cajon-modular',
      requiere: [{ tipo: 'mejora', id: 'cajon_moncoro', nivel: 1 }],
    },
    {
      id: 'bateria_cajones',
      categoria: 'beneficio',
      nombre: 'Otro cajón en la batería',
      descripcion: 'Un lote más corriendo en paralelo, porque la fermentación no se puede apurar.',
      costoBase: 150_000,
      crecimiento: 1.18,
      maxNivel: Infinity,
      efectos: [{ tipo: 'lotes_paralelos', valor: 1 }],
      fichaId: 'fermentacion',
      requiere: [{ tipo: 'mejora', id: 'cajon_escalera', nivel: 5 }],
    },
  )

  const MERCADO = [
    { id: 'mercado_trazabilidad', nombre: 'Trazabilidad por lote', costo: 1_200_000 },
    { id: 'mercado_organica', nombre: 'Certificación orgánica', costo: 9_000_000 },
    { id: 'mercado_directa', nombre: 'Venta directa a chocolatería', costo: 70_000_000 },
    { id: 'mercado_sensorial', nombre: 'Perfil sensorial documentado', costo: 550_000_000 },
    { id: 'mercado_origen', nombre: 'Denominación de origen', costo: 4_200_000_000 },
  ]
  MERCADO.forEach((m, i) => {
    out.push({
      id: m.id,
      categoria: 'beneficio',
      nombre: m.nombre,
      descripcion: 'Mejor acceso a mercado. Quince por ciento más de precio.',
      costoBase: m.costo,
      crecimiento: 1,
      maxNivel: 1,
      efectos: [{ tipo: 'precio_multiplicador', valor: 1.15 }],
      fichaId: 'fino-de-aroma',
      requiere: [{ tipo: 'mejora', id: i === 0 ? 'zaranda' : MERCADO[i - 1].id, nivel: 1 }],
    })
  })
  out.push({
    id: 'acuerdo_comercial',
    categoria: 'beneficio',
    nombre: 'Acuerdo comercial',
    descripcion: 'Otro comprador que paga la calidad. Quince por ciento más de precio.',
    costoBase: 30_000_000_000,
    crecimiento: 3.2,
    maxNivel: Infinity,
    efectos: [{ tipo: 'precio_multiplicador', valor: 1.15 }],
    fichaId: 'asociatividad',
    requiere: [{ tipo: 'mejora', id: 'mercado_origen', nivel: 1 }],
  })

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
    nombre: 'Cajón heredado',
    descripcion: 'Empiezas cada renovación con el cajón fermentador ya construido.',
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
    nombre: 'Jardín clonal heredado',
    descripcion: 'Las mazorcas doradas aparecen un treinta por ciento más seguido.',
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
    descripcion: 'Un veinticinco por ciento adicional de producción pasiva, para siempre.',
    costo: 25,
  },
  {
    id: 'ojo_del_abuelo',
    nombre: 'Ojo del abuelo',
    descripcion: 'Dos segundos más de ventana óptima en toda partida futura.',
    costo: 50,
  },
]

export const MEJORAS_PRESTIGIO_POR_ID: Record<string, MejoraPrestigio> = Object.fromEntries(
  MEJORAS_PRESTIGIO.map((m) => [m.id, m]),
)
