/**
 * Pruebas del reducer. Son posibles porque el reducer es puro: el tiempo y la
 * aleatoriedad entran dentro de la accion, así que una partida se puede
 * reproducir exactamente.
 */
import { describe, expect, it } from 'vitest'
import { aplicarAusencia, estadoInicial, reducer, ventanaAbierta } from '../reducer'
import { agregados, faseDe, gradoDe, produccionPasiva } from '../selectors'
import type { GameState } from '../types'
import * as K from '../constants'

const tick = (s: GameState, dt: number, rnd = 1) => reducer(s, { tipo: 'TICK', dt, rnd })
const con = (s: GameState, mejoras: Record<string, number>): GameState => ({
  ...s,
  mejoras: { ...s.mejoras, ...mejoras },
})

describe('bucle base', () => {
  it('no produce nada pasivo sin mejoras de cultivo', () => {
    const s = tick(estadoInicial(), 10)
    expect(s.granoBaba).toBe(0)
  })

  it('el generador produce grano en baba proporcional al tiempo', () => {
    const s = con(estadoInicial(), { jornalero: 10 })
    const pps = produccionPasiva(s)
    const d = tick(s, 10)
    expect(d.granoBaba).toBeCloseTo(pps * 10, 5)
  })

  it('el mismo delta partido en pasos da el mismo resultado', () => {
    const s = con(estadoInicial(), { jornalero: 7 })
    const entero = tick(s, 6).granoBaba
    let partido = s
    for (let i = 0; i < 60; i++) partido = tick(partido, 0.1)
    expect(partido.granoBaba).toBeCloseTo(entero, 4)
  })
})

describe('cosecha', () => {
  it('la mazorca en punto rinde cuatro veces lo que la verde', () => {
    const s = estadoInicial()
    const a = agregados(s)
    const verde = { ...s, mazorcas: [{ ...s.mazorcas[0], t: 0 }] }
    const punto = { ...s, mazorcas: [{ ...s.mazorcas[0], t: K.SOBREMADURA_DESDE - 0.5 }] }
    expect(faseDe(0, a.cicloMazorca, a.ventanaOptima)).toBe('verde')
    expect(faseDe(K.SOBREMADURA_DESDE - 0.5, a.cicloMazorca, a.ventanaOptima)).toBe('optimo')

    const rv = reducer(verde, { tipo: 'COSECHAR', mazorcaId: verde.mazorcas[0].id, rnd: 1 }).granoBaba
    const rp = reducer(punto, { tipo: 'COSECHAR', mazorcaId: punto.mazorcas[0].id, rnd: 1 }).granoBaba
    expect(rp / rv).toBeCloseTo(4, 5)
  })

  it('las herramientas duplican el rendimiento por mazorca', () => {
    const base = agregados(estadoInicial())
    const conMachete = agregados(con(estadoInicial(), { machete: 1 }))
    expect(conMachete.clicBase * conMachete.clicMult).toBeCloseTo(base.clicBase * base.clicMult * 2, 5)
  })
})

describe('beneficio', () => {
  const conCajon = () => con(estadoInicial(), { cajon_sencillo: 1 })

  it('el cajon libre se carga solo al juntar la masa suficiente', () => {
    let s = conCajon()
    s = { ...s, granoBaba: agregados(s).capacidadLote }
    s = tick(s, 0.1)
    expect(s.lotes).toHaveLength(1)
    expect(s.lotes[0].etapa).toBe('fermentacion')
  })

  it('pasa solo de fermentacion a secado y sale solo a bodega', () => {
    let s = conCajon()
    s = { ...s, granoBaba: agregados(s).capacidadLote }
    s = tick(s, 0.1)
    for (let i = 0; i < K.FERMENTACION_SEG * 10 + 20; i++) s = tick(s, 0.1)
    expect(s.lotes[0].etapa).toBe('secado')
    for (let i = 0; i < K.SECADO_SEG * 10 + 20; i++) s = tick(s, 0.1)
    expect(s.lotes).toHaveLength(0)
    expect(s.bodega.corriente).toBeCloseTo(1, 3)
  })

  it('el volteo solo cuenta dentro de su ventana y sube la calidad', () => {
    let s = conCajon()
    s = { ...s, granoBaba: agregados(s).capacidadLote }
    s = tick(s, 0.1)
    const antes = s.lotes[0].calidad

    // Fuera de ventana no pasa nada y no se castiga.
    const fuera = reducer(s, { tipo: 'VOLTEAR', loteId: s.lotes[0].id })
    expect(fuera.lotes[0].calidad).toBe(antes)

    let t = 0
    while (t < K.VENTANAS_VOLTEO[0]) {
      s = tick(s, 0.5)
      t += 0.5
    }
    expect(ventanaAbierta(s.lotes[0])).toBe(0)
    const dentro = reducer(s, { tipo: 'VOLTEAR', loteId: s.lotes[0].id })
    expect(dentro.lotes[0].calidad).toBeCloseTo(antes + agregados(s).bonoVolteo, 5)
  })

  it('cuatro volteos llevan el lote a fino de sabor y aroma', () => {
    let s = con(estadoInicial(), { cajon_sencillo: 1, pala_madera: 1 })
    s = { ...s, granoBaba: agregados(s).capacidadLote }
    s = tick(s, 0.1)
    for (let i = 0; i < K.FERMENTACION_SEG * 2; i++) {
      s = tick(s, 0.5)
      for (const l of s.lotes) s = reducer(s, { tipo: 'VOLTEAR', loteId: l.id })
    }
    expect(s.stats.volteosAcertados).toBe(4)
  })

  it('sin volteos el lote sale corriente, que es el piso del proceso solo', () => {
    const s = estadoInicial()
    expect(gradoDe(agregados(s).calidadBase).id).toBe('corriente')
  })

  it('el precio del kilo se multiplica por la calidad', () => {
    const fino = K.GRADOS.find((g) => g.id === 'fino')!
    const corriente = K.GRADOS.find((g) => g.id === 'corriente')!
    expect(fino.multiplicador / corriente.multiplicador).toBeCloseTo(2.5, 5)
  })
})

describe('la ausencia nunca castiga', () => {
  it('la produccion pasiva sigue corriendo mientras el jugador no esta', () => {
    const s = con(estadoInicial(), { jornalero: 20 })
    const { estado } = aplicarAusencia(s, 600)
    expect(estado.granoBaba).toBeGreaterThan(0)
  })

  it('el progreso acumulado se recorta al tope', () => {
    const s = con(estadoInicial(), { jornalero: 20 })
    const tope = aplicarAusencia(s, K.AUSENCIA_MAX_SEG).estado.granoBaba
    const exceso = aplicarAusencia(s, K.AUSENCIA_MAX_SEG * 5).estado.granoBaba
    expect(exceso).toBeCloseTo(tope, 0)
  })

  it('las enfermedades reducen la produccion pero nunca la llevan a cero', () => {
    const s = con(estadoInicial(), { jornalero: 50 })
    const enfermo: GameState = {
      ...s,
      focos: Array.from({ length: 20 }, (_, i) => ({ id: i + 1, tipo: 'escoba' as const, x: 0, y: 0, t: 0 })),
    }
    const sano = produccionPasiva(s)
    const conFocos = produccionPasiva(enfermo)
    expect(conFocos).toBeLessThan(sano)
    expect(conFocos).toBeCloseTo(sano * K.PISO_PRODUCCION_ENFERMA, 5)
  })
})

describe('economia y prestigio', () => {
  it('vender en baba paga una fraccion de lo que paga el grano seco', () => {
    const s = estadoInicial()
    const a = agregados(s)
    const porGranoEnBaba = (K.PRECIO_BASE_KILO / K.GRANOS_POR_KILO) * K.FACTOR_VENTA_BABA * a.precioMult
    const porGranoSecoFino = (K.PRECIO_BASE_KILO * 2.5) / K.GRANOS_POR_KILO
    expect(porGranoSecoFino / porGranoEnBaba).toBeGreaterThan(10)
  })

  it('no se puede comprar sin dinero', () => {
    const s = estadoInicial()
    expect(reducer(s, { tipo: 'COMPRAR', mejoraId: 'machete' }).mejoras.machete).toBeUndefined()
  })

  it('renovar conserva el historial y otorga semillas', () => {
    const s: GameState = {
      ...estadoInicial(),
      dinero: 999,
      stats: { ...estadoInicial().stats, kgHistoricos: 27_000 },
    }
    const r = reducer(s, { tipo: 'RENOVAR' })
    expect(r.semillas).toBe(3)
    expect(r.stats.kgHistoricos).toBe(27_000)
    expect(r.stats.renovaciones).toBe(1)
    expect(r.dinero).toBe(0)
  })
})
