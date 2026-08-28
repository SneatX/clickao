/**
 * Resolver de efectos y valores derivados.
 *
 * Nada de lo que se calcula aquí se guarda en el estado. Si un valor se puede
 * derivar de las mejoras compradas, se deriva: una sola fuente de verdad.
 */
import type { FaseMadurez, GameState, Mejora, TipoEfecto } from './types'
import { MEJORAS, MEJORAS_POR_ID, CAPACIDAD_BASE, MEJORAS_PRESTIGIO_POR_ID } from '../data/mejoras'
import { LOGROS, BONO_POR_LOGRO } from '../data/logros'
import * as K from './constants'

export interface Agregados {
  clicBase: number
  clicMult: number
  mazorcasMax: number
  ventanaOptima: number
  cicloMazorca: number
  pasivaBase: number
  pasivaMult: number
  riesgo: number
  capacidadLote: number
  lotesMax: number
  calidadBase: number
  bonoVolteo: number
  calidadTecho: number
  duracionSecado: number
  precioMult: number
  /** Multiplicador global de prestigio y logros, aplicado a clic y a pasiva. */
  globalMult: number
}

const ADITIVOS: TipoEfecto[] = [
  'clic_suma',
  'mazorcas_simultaneas',
  'ventana_optima',
  'pasiva_produccion',
  'lotes_paralelos',
  'calidad_base',
  'calidad_volteo',
  'calidad_techo',
]

export function agregados(s: GameState): Agregados {
  const a: Agregados = {
    clicBase: K.GRANOS_POR_MAZORCA,
    clicMult: 1,
    mazorcasMax: K.MAZORCAS_BASE,
    ventanaOptima: K.VENTANA_OPTIMA_BASE,
    cicloMazorca: K.CICLO_MAZORCA_SEG,
    pasivaBase: 0,
    pasivaMult: 1,
    riesgo: 1,
    capacidadLote: CAPACIDAD_BASE,
    lotesMax: 0,
    calidadBase: K.CALIDAD_INICIAL,
    bonoVolteo: K.VOLTEO_BONO_BASE,
    calidadTecho: K.CALIDAD_TECHO_BASE,
    duracionSecado: K.SECADO_SEG,
    precioMult: 1,
    globalMult: 1,
  }

  for (const [id, nivel] of Object.entries(s.mejoras)) {
    if (!nivel) continue
    const m = MEJORAS_POR_ID[id]
    if (!m) continue
    for (const e of m.efectos) {
      const aditivo = ADITIVOS.includes(e.tipo)
      const delta = aditivo ? e.valor * nivel : Math.pow(e.valor, nivel)
      switch (e.tipo) {
        case 'clic_suma': a.clicBase += delta; break
        case 'clic_multiplicador': a.clicMult *= delta; break
        case 'mazorcas_simultaneas': a.mazorcasMax += delta; break
        case 'ventana_optima': a.ventanaOptima += delta; break
        case 'ciclo_mazorca': a.cicloMazorca *= delta; break
        case 'pasiva_produccion': a.pasivaBase += delta; break
        case 'pasiva_multiplicador': a.pasivaMult *= delta; break
        case 'riesgo_enfermedad': a.riesgo *= delta; break
        case 'lotes_capacidad': a.capacidadLote *= delta; break
        case 'lotes_paralelos': a.lotesMax += delta; break
        case 'calidad_base': a.calidadBase += delta; break
        case 'calidad_volteo': a.bonoVolteo += delta; break
        case 'calidad_techo': a.calidadTecho += delta; break
        case 'secado_duracion': a.duracionSecado *= delta; break
        case 'precio_multiplicador': a.precioMult *= delta; break
      }
    }
  }

  // Prestigio: cada semilla seleccionada aporta un bono permanente.
  a.globalMult *= 1 + s.semillas * K.BONO_POR_SEMILLA
  a.globalMult *= 1 + s.logros.length * BONO_POR_LOGRO
  if (s.mejorasPrestigio.vecinos_organizados) a.globalMult *= 1.25
  if (s.mejorasPrestigio.ojo_del_abuelo) a.ventanaOptima += 2

  a.mazorcasMax = Math.min(K.MAZORCAS_MAX, Math.round(a.mazorcasMax))
  a.ventanaOptima = Math.min(a.ventanaOptima, K.SOBREMADURA_DESDE)
  a.calidadTecho = Math.min(a.calidadTecho, 1)
  return a
}

/** Fase de madurez de una mazorca según el segundo de su ciclo. */
export function faseDe(t: number, ciclo: number, ventana: number): FaseMadurez {
  const escala = ciclo / K.CICLO_MAZORCA_SEG
  const sobre = K.SOBREMADURA_DESDE * escala
  const optimoDesde = sobre - ventana * escala
  const pinton = Math.min(K.PINTON_DESDE * escala, optimoDesde)
  if (t >= sobre) return 'sobremadura'
  if (t >= optimoDesde) return 'optimo'
  if (t >= pinton) return 'pinton'
  return 'verde'
}

/** Granos en baba que rinde cortar una mazorca en esa fase. */
export function rendimientoClic(a: Agregados, fase: FaseMadurez): number {
  return a.clicBase * a.clicMult * a.globalMult * K.RENDIMIENTO_MADUREZ[fase]
}

/** Factor de penalización por los focos de enfermedad activos, con piso duro. */
export function factorEnfermedad(s: GameState): number {
  let f = 1
  for (const foco of s.focos) {
    f *= foco.tipo === 'monilia' ? K.PENALIZACION_MONILIA : K.PENALIZACION_ESCOBA
  }
  return Math.max(K.PISO_PRODUCCION_ENFERMA, f)
}

/** Granos en baba por segundo de la producción pasiva, ya con bonos y enfermedad. */
export function produccionPasiva(s: GameState, a = agregados(s)): number {
  const base = a.pasivaBase * a.pasivaMult * a.globalMult
  const bono = s.bonoProduccion.t > 0 ? s.bonoProduccion.mult : 1
  return base * factorEnfermedad(s) * bono
}

/** Producción pasiva sin penalización de enfermedad, para mostrar el contraste. */
export function produccionPasivaNominal(s: GameState, a = agregados(s)): number {
  return a.pasivaBase * a.pasivaMult * a.globalMult
}

export function gradoDe(calidad: number) {
  let grado = K.GRADOS[0]
  for (const g of K.GRADOS) if (calidad >= g.desde) grado = g
  return grado
}

/** Precio de un kilo de grano seco de ese grado, con todos los multiplicadores. */
export function precioKilo(s: GameState, gradoId: string, a = agregados(s)): number {
  const g = K.GRADOS.find((x) => x.id === gradoId) ?? K.GRADOS[0]
  const bono = s.bonoPrecio.t > 0 ? s.bonoPrecio.mult : 1
  return K.PRECIO_BASE_KILO * g.multiplicador * a.precioMult * bono
}

export function precioBaba(s: GameState, a = agregados(s)): number {
  const bono = s.bonoPrecio.t > 0 ? s.bonoPrecio.mult : 1
  return (K.PRECIO_BASE_KILO / K.GRANOS_POR_KILO) * K.FACTOR_VENTA_BABA * a.precioMult * bono
}

export function costoMejora(m: Mejora, nivel: number): number {
  return Math.ceil(m.costoBase * Math.pow(m.crecimiento, nivel))
}

export function nivelDe(s: GameState, id: string): number {
  return s.mejoras[id] ?? 0
}

function cumple(s: GameState, m: Mejora): boolean {
  if (!m.requiere) return true
  return m.requiere.every((r) =>
    r.tipo === 'mejora' ? nivelDe(s, r.id) >= r.nivel : (s.stats[r.clave] as number) >= r.valor,
  )
}

/**
 * Mejoras visibles en el panel. Se muestra lo que ya cumple requisitos y está
 * a tiro: al alcance del bolsillo actual o dentro de un factor razonable, como
 * en cualquier clicker. Nunca se oculta algo ya comprado.
 */
export function mejorasVisibles(s: GameState): { mejora: Mejora; nivel: number; costo: number; alcanzable: boolean }[] {
  const out: { mejora: Mejora; nivel: number; costo: number; alcanzable: boolean }[] = []
  for (const m of MEJORAS) {
    const nivel = nivelDe(s, m.id)
    if (nivel >= m.maxNivel) continue
    if (!cumple(s, m)) continue
    const costo = costoMejora(m, nivel)
    if (nivel === 0 && costo > Math.max(s.dinero, s.stats.dineroGanado) * 3 && costo > 8000) continue
    out.push({ mejora: m, nivel, costo, alcanzable: s.dinero >= costo })
  }
  return out
}

export function logrosPendientes(s: GameState): string[] {
  const nuevos: string[] = []
  for (const l of LOGROS) {
    if (s.logros.includes(l.id)) continue
    try {
      if (l.condicion(s)) nuevos.push(l.id)
    } catch {
      /* una condición mal escrita no puede tumbar el tick */
    }
  }
  return nuevos
}

/** Semillas seleccionadas que otorgaría renovar ahora mismo. */
export function semillasDisponibles(s: GameState): number {
  return Math.floor(Math.cbrt(s.stats.kgHistoricos / K.KG_POR_SEMILLA))
}

export function semillasLibres(s: GameState): number {
  return s.semillas - s.semillasGastadas
}

export function costoPrestigio(id: string): number {
  return MEJORAS_PRESTIGIO_POR_ID[id]?.costo ?? Infinity
}
