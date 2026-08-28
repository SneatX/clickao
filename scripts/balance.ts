/**
 * Simulador de la curva de progresión.
 *
 * Corre el mismo reducer del juego sin React, con deltas sintéticos y una
 * política de compra codiciosa, y mide tiempos hasta hito. Lo que importa no es
 * cuántos recursos se acumulan sino cuánto se espera entre compras: si esa
 * espera crece, el juego se estanca; si se acorta, la progresión se desborda.
 *
 *   npm run balance
 */
import { estadoInicial, reducer } from '../src/game/reducer'
import type { GameState } from '../src/game/types'
import { agregados, faseDe, gradoDe, mejorasVisibles, precioKilo } from '../src/game/selectors'
import * as K from '../src/game/constants'
import { kg, pesos, num } from '../src/game/format'

const PASO = 0.25

interface Perfil {
  nombre: string
  /** Cortes por segundo que intenta el jugador. */
  clicsPorSegundo: number
  /** Fracción de cortes que acierta el punto óptimo. */
  punteria: number
  /** Voltea los lotes cuando hay ventana abierta. */
  voltea: boolean
}

const PERFILES: Perfil[] = [
  { nombre: 'Atento (5 clics/s, buena puntería, voltea)', clicsPorSegundo: 5, punteria: 0.9, voltea: true },
  { nombre: 'Normal (2 clics/s, puntería media, voltea)', clicsPorSegundo: 2, punteria: 0.6, voltea: true },
  { nombre: 'Distraído (0,5 clics/s, sin puntería, no voltea)', clicsPorSegundo: 0.5, punteria: 0.2, voltea: false },
]

/**
 * Ingreso por segundo del estado, en pesos.
 *
 * La clave está en el cuello de botella: la baba que no alcanza a pasar por los
 * cajones solo vale el precio del intermediario. Sin esto el simulador cree que
 * producir más siempre rinde más, y nunca compra infraestructura de beneficio,
 * que es justo el error que el juego quiere enseñar a no cometer.
 */
function ingresoPorSegundo(s: GameState, tasaClic: number): number {
  const a = agregados(s)
  const ritmo = Math.min(tasaClic, a.mazorcasMax / a.cicloMazorca)
  const granos = a.pasivaBase * a.pasivaMult * a.globalMult + a.clicBase * a.clicMult * a.globalMult * ritmo

  const precioBaba = (K.PRECIO_BASE_KILO / K.GRANOS_POR_KILO) * K.FACTOR_VENTA_BABA * a.precioMult
  if (a.lotesMax === 0) return granos * precioBaba

  const capacidad = (a.lotesMax * a.capacidadLote) / (K.FERMENTACION_SEG + a.duracionSecado)
  // Con dos volteos de los cuatro, que es lo que hace un jugador atento normal.
  const grado = gradoDe(Math.min(a.calidadTecho, a.calidadBase + a.bonoVolteo * 2))
  const precioSeco = precioKilo(s, grado.id, a) / K.GRANOS_POR_KILO

  const beneficiados = Math.min(granos, capacidad)
  return beneficiados * precioSeco + Math.max(0, granos - capacidad) * precioBaba
}

/**
 * Siguiente compra. Se elige la que minimiza el tiempo total de esperar a
 * juntar la plata más el tiempo de recuperar la inversión. Es el criterio con
 * el que juega una persona: ni gastar en lo primero que alcanza ni ahorrar para
 * siempre esperando lo mejor.
 */
function mejorCompra(s: GameState, tasaClic: number): { id: string; costo: number } | null {
  const ingreso = ingresoPorSegundo(s, tasaClic)
  let mejor: { id: string; costo: number; puntaje: number } | null = null

  for (const { mejora, nivel, costo } of mejorasVisibles(s)) {
    const futuro: GameState = { ...s, mejoras: { ...s.mejoras, [mejora.id]: nivel + 1 } }
    const ganancia = ingresoPorSegundo(futuro, tasaClic) - ingreso
    if (ganancia <= 0) continue
    const espera = ingreso > 0 ? Math.max(0, (costo - s.dinero) / ingreso) : Infinity
    const repago = costo / ganancia
    const puntaje = espera + repago
    if (!mejor || puntaje < mejor.puntaje) mejor = { id: mejora.id, costo, puntaje }
  }
  return mejor ? { id: mejor.id, costo: mejor.costo } : null
}

function simular(perfil: Perfil, minutos: number) {
  let s = estadoInicial()
  let t = 0
  let deudaClics = 0
  let semilla = 12345
  const rnd = () => (semilla = (semilla * 1664525 + 1013904223) >>> 0)

  const hitos: Record<string, number> = {}
  const marcar = (k: string) => {
    if (hitos[k] === undefined) hitos[k] = t
  }
  const compras: number[] = []
  let ultimaCompra = 0
  const linea: { t: number; prod: number; cap: number; dinero: number; cajones: number }[] = []
  let proximaMarca = 0

  const limite = minutos * 60
  while (t < limite) {
    s = reducer(s, { tipo: 'TICK', dt: PASO, rnd: rnd() })
    t += PASO

    // Cortes del jugador, repartidos en el paso.
    deudaClics += perfil.clicsPorSegundo * PASO
    while (deudaClics >= 1) {
      deudaClics -= 1
      const a = agregados(s)
      const quiereOptimo = (rnd() % 1000) / 1000 < perfil.punteria
      const candidata = s.mazorcas.find((m) => {
        const fase = faseDe(m.t, a.cicloMazorca, a.ventanaOptima)
        return quiereOptimo ? fase === 'optimo' : true
      })
      if (candidata) s = reducer(s, { tipo: 'COSECHAR', mazorcaId: candidata.id, rnd: rnd() })
    }

    if (perfil.voltea) {
      for (const l of s.lotes) s = reducer(s, { tipo: 'VOLTEAR', loteId: l.id })
    }

    // Vende todo lo que tenga en bodega, y en baba solo mientras no haya cajón.
    if (K.GRADOS.some((g) => (s.bodega[g.id] ?? 0) > 0)) {
      s = reducer(s, { tipo: 'VENDER_TODO' })
      marcar('primera venta de grano seco')
    }
    // Se vende en baba solo el excedente que los cajones no van a alcanzar a
    // procesar. Guardar un colchón de dos cargas y soltar el resto es lo que
    // haría alguien que no quiere ver la masa pudrirse en el patio.
    const ag = agregados(s)
    const colchon = ag.lotesMax * ag.capacidadLote * 2
    if (s.granoBaba > colchon) {
      const sobra = s.granoBaba - colchon
      const guardado = s.granoBaba
      s = { ...s, granoBaba: sobra }
      s = reducer(s, { tipo: 'VENDER_BABA' })
      s = { ...s, granoBaba: guardado - sobra }
    }

    // Barrido de lo barato: un jugador real compra sin pensar lo que cuesta una
    // fracción de lo que tiene, y así va abriendo los escalones siguientes.
    let barrido = true
    while (barrido) {
      barrido = false
      for (const v of mejorasVisibles(s)) {
        if (v.costo > s.dinero * 0.02) continue
        const nivel = s.mejoras[v.mejora.id] ?? 0
        s = reducer(s, { tipo: 'COMPRAR', mejoraId: v.mejora.id })
        if ((s.mejoras[v.mejora.id] ?? 0) > nivel) {
          compras.push(t - ultimaCompra)
          ultimaCompra = t
          marcar(`compra: ${v.mejora.id}`)
          if (v.mejora.id === 'cajon_sencillo') marcar('abre el beneficio')
          barrido = true
        }
      }
    }

    let compra = mejorCompra(s, perfil.clicsPorSegundo)
    while (compra && s.dinero >= compra.costo) {
      const nivel = s.mejoras[compra.id] ?? 0
      s = reducer(s, { tipo: 'COMPRAR', mejoraId: compra.id })
      if ((s.mejoras[compra.id] ?? 0) === nivel) break
      compras.push(t - ultimaCompra)
      ultimaCompra = t
      marcar(`compra: ${compra.id}`)
      if (compra.id === 'cajon_sencillo') marcar('abre el beneficio')
      compra = mejorCompra(s, perfil.clicsPorSegundo)
    }
    if (t >= proximaMarca) {
      proximaMarca += 300
      const a = agregados(s)
      const ritmo = Math.min(perfil.clicsPorSegundo, a.mazorcasMax / a.cicloMazorca)
      linea.push({
        t,
        prod: a.pasivaBase * a.pasivaMult * a.globalMult + a.clicBase * a.clicMult * a.globalMult * ritmo,
        cap: (a.lotesMax * a.capacidadLote) / (K.FERMENTACION_SEG + a.duracionSecado),
        dinero: s.stats.dineroGanado,
        cajones: a.lotesMax,
      })
    }
    if (s.lotes.length > 0) marcar('primer lote en fermentación')
    if (s.stats.lotesTerminados > 0) marcar('primer lote terminado')
    if (s.stats.lotesFinos > 0) marcar('primer lote fino de aroma')
  }
  return { s, hitos, compras, linea }
}

function reloj(seg: number) {
  const m = Math.floor(seg / 60)
  return `${m}:${String(Math.floor(seg % 60)).padStart(2, '0')}`
}

const MINUTOS = Number(process.argv[2] ?? 30)
console.log(`\nClickao · simulación de ${MINUTOS} minutos por perfil\n${'='.repeat(72)}`)

for (const perfil of PERFILES) {
  const { s, hitos, compras, linea } = simular(perfil, MINUTOS)
  const a = agregados(s)
  console.log(`\n${perfil.nombre}`)
  console.log('-'.repeat(72))

  const clave = [
    'abre el beneficio',
    'primer lote en fermentación',
    'primer lote terminado',
    'primera venta de grano seco',
    'primer lote fino de aroma',
  ]
  for (const h of clave) {
    console.log(`  ${h.padEnd(34)} ${hitos[h] !== undefined ? reloj(hitos[h]) : 'no alcanzado'}`)
  }

  const primeras = compras.slice(0, 10)
  const ultimas = compras.slice(-10)
  const media = (xs: number[]) => (xs.length ? xs.reduce((x, y) => x + y, 0) / xs.length : 0)
  console.log(`  compras totales                    ${compras.length}`)
  console.log(`  espera media primeras 10           ${media(primeras).toFixed(1)} s`)
  console.log(`  espera media ultimas 10            ${media(ultimas).toFixed(1)} s`)
  console.log(`  espera maxima                      ${Math.max(0, ...compras).toFixed(1)} s`)
  console.log(`  produccion pasiva al final         ${num(a.pasivaBase * a.pasivaMult * a.globalMult, 1)} granos/s`)
  console.log(`  rendimiento por corte en punto     ${num(a.clicBase * a.clicMult * a.globalMult, 0)} granos`)
  console.log(`  cajones                            ${a.lotesMax} de ${num(a.capacidadLote, 0)} granos`)
  console.log(`  grano seco vendido                 ${kg(s.stats.kgVendidos)}`)
  console.log(`  dinero ganado                      ${pesos(s.stats.dineroGanado)}`)
  console.log(`  lotes finos / totales              ${s.stats.lotesFinos} de ${s.stats.lotesTerminados}`)
  console.log('\n  min   produccion      beneficio     cajones   dinero ganado')
  for (const l of linea) {
    console.log(
      `  ${String(Math.round(l.t / 60)).padStart(3)}   ${num(l.prod, 1).padEnd(14)}${num(l.cap, 1).padEnd(14)}${String(l.cajones).padEnd(10)}${pesos(l.dinero)}`,
    )
  }
}
console.log()
