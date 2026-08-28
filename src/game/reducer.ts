/**
 * Reducer del juego. Función pura: no lee el reloj, no toca localStorage y no
 * llama a Math.random. El tiempo y la aleatoriedad entran dentro de la acción.
 * Gracias a eso el mismo código sirve para jugar, para calcular el progreso
 * acumulado durante una ausencia y para simular la curva de balanceo.
 */
import type { Accion, Aviso, GameState, Lote, Mazorca } from './types'
import * as K from './constants'
import { prng, entre } from './rng'
import {
  agregados,
  faseDe,
  gradoDe,
  logrosPendientes,
  mejorasVisibles,
  precioBaba,
  precioKilo,
  produccionPasiva,
  rendimientoClic,
  semillasDisponibles,
  semillasLibres,
  costoMejora,
  costoPrestigio,
} from './selectors'
import { MEJORAS_POR_ID, CAPACIDAD_BASE } from '../data/mejoras'
import { LOGROS_POR_ID } from '../data/logros'

export function estadoInicial(heredado?: {
  semillas: number
  semillasGastadas: number
  mejorasPrestigio: Record<string, number>
  logros: string[]
  fichasDesbloqueadas: string[]
  fichasLeidas: string[]
  kgHistoricos: number
  renovaciones: number
  dinero: number
}): GameState {
  const mejoras: Record<string, number> = {}
  if (heredado?.mejorasPrestigio.cajon_heredado) mejoras.cajon_sencillo = 1
  if (heredado?.mejorasPrestigio.memoria_del_cacaotal) {
    for (const id of ['machete', 'podadora_gancho', 'canasto_guantes', 'tijera_altura', 'cuadrilla']) {
      mejoras[id] = 1
    }
  }

  const s: GameState = {
    schemaVersion: K.SCHEMA_VERSION,
    granoBaba: 0,
    bodega: Object.fromEntries(K.GRADOS.map((g) => [g.id, 0])),
    dinero: heredado?.dinero ?? 0,
    mazorcas: [],
    lotes: [],
    focos: [],
    dorada: { activa: false, id: 0, t: 0, x: 50, y: 50, proxima: K.DORADA_MIN_SEG },
    bonoProduccion: { mult: 1, t: 0 },
    bonoPrecio: { mult: 1, t: 0 },
    bonoLluvia: { mult: 1, t: 0 },
    mejoras,
    fichasDesbloqueadas: heredado?.fichasDesbloqueadas ?? ['punto-de-corte', 'reloj-de-la-finca'],
    fichasLeidas: heredado?.fichasLeidas ?? [],
    logros: heredado?.logros ?? [],
    semillas: heredado?.semillas ?? 0,
    semillasGastadas: heredado?.semillasGastadas ?? 0,
    mejorasPrestigio: heredado?.mejorasPrestigio ?? {},
    stats: {
      clics: 0,
      granosCosechados: 0,
      granosPasivos: 0,
      kgProducidos: 0,
      kgVendidos: 0,
      kgHistoricos: heredado?.kgHistoricos ?? 0,
      dineroGanado: 0,
      lotesTerminados: 0,
      lotesFinos: 0,
      volteosAcertados: 0,
      volteosPerdidos: 0,
      podas: 0,
      doradas: 0,
      tiempoJugado: 0,
      renovaciones: heredado?.renovaciones ?? 0,
    },
    proximoBrote: K.BROTE_MAX_SEG,
    siguienteId: 1,
    ultimoTs: 0,
    avisos: [],
  }
  return sembrarMazorcas(s)
}

function sembrarMazorcas(s: GameState): GameState {
  const a = agregados(s)
  const mazorcas: Mazorca[] = []
  for (let i = 0; i < a.mazorcasMax; i++) {
    mazorcas.push({
      id: i + 1,
      t: (i * a.cicloMazorca) / a.mazorcasMax,
      x: K.ANCLAS_MAZORCA[i % K.ANCLAS_MAZORCA.length].x,
      y: K.ANCLAS_MAZORCA[i % K.ANCLAS_MAZORCA.length].y,
      roja: i % 3 === 0,
    })
  }
  return { ...s, mazorcas, siguienteId: s.siguienteId + mazorcas.length }
}

/** Copia superficial con los contenedores que el tick puede modificar ya clonados. */
function borrador(s: GameState): GameState {
  return {
    ...s,
    bodega: { ...s.bodega },
    mazorcas: s.mazorcas.map((m) => ({ ...m })),
    lotes: s.lotes.map((l) => ({ ...l, volteos: [...l.volteos] })),
    focos: s.focos.map((f) => ({ ...f })),
    dorada: { ...s.dorada },
    bonoProduccion: { ...s.bonoProduccion },
    bonoPrecio: { ...s.bonoPrecio },
    bonoLluvia: { ...s.bonoLluvia },
    mejoras: { ...s.mejoras },
    mejorasPrestigio: { ...s.mejorasPrestigio },
    stats: { ...s.stats },
    fichasDesbloqueadas: [...s.fichasDesbloqueadas],
    fichasLeidas: [...s.fichasLeidas],
    logros: [...s.logros],
    avisos: s.avisos.map((v) => ({ ...v })),
  }
}

function avisar(s: GameState, texto: string, tono: Aviso['tono'] = 'neutro') {
  const aviso: Aviso = { id: s.siguienteId++, texto, tono, t: 6 }
  s.avisos = [...s.avisos.slice(-6), aviso]
}

function desbloquear(s: GameState, fichaId?: string) {
  if (!fichaId) return
  if (s.fichasDesbloqueadas.includes(fichaId)) return
  s.fichasDesbloqueadas.push(fichaId)
}

/** Ventana de volteo abierta ahora mismo, o -1 si ninguna. */
export function ventanaAbierta(lote: Lote): number {
  if (lote.etapa !== 'fermentacion') return -1
  for (let i = 0; i < K.VENTANAS_VOLTEO.length; i++) {
    if (lote.volteos.includes(i)) continue
    if (Math.abs(lote.t - K.VENTANAS_VOLTEO[i]) <= K.TOLERANCIA_VOLTEO) return i
  }
  return -1
}

function crearLote(s: GameState, granos: number) {
  const a = agregados(s)
  s.lotes = [
    ...s.lotes,
    {
      id: s.siguienteId++,
      etapa: 'fermentacion',
      granos,
      t: 0,
      duracion: K.FERMENTACION_SEG,
      calidad: Math.min(a.calidadBase, a.calidadTecho),
      volteos: [],
    },
  ]
  s.granoBaba -= granos
  desbloquear(s, 'fermentacion')
  desbloquear(s, 'volteo')
  desbloquear(s, 'reloj-de-la-finca')
}

function tick(s0: GameState, dt: number, semilla: number): GameState {
  const s = borrador(s0)
  const a = agregados(s)
  const r = prng(semilla)

  s.stats.tiempoJugado += dt

  // 1. El árbol. Las mazorcas maduran y se relevan solas.
  if (s.mazorcas.length !== a.mazorcasMax) {
    const faltan = a.mazorcasMax - s.mazorcas.length
    if (faltan > 0) {
      for (let i = 0; i < faltan; i++) {
        const idx = s.mazorcas.length
        s.mazorcas.push({
          id: s.siguienteId++,
          t: r() * a.cicloMazorca,
          x: K.ANCLAS_MAZORCA[idx % K.ANCLAS_MAZORCA.length].x,
          y: K.ANCLAS_MAZORCA[idx % K.ANCLAS_MAZORCA.length].y,
          roja: idx % 3 === 0,
        })
      }
    } else {
      s.mazorcas = s.mazorcas.slice(0, a.mazorcasMax)
    }
  }
  const escala = a.cicloMazorca / K.CICLO_MAZORCA_SEG
  const optimoDesde = (K.SOBREMADURA_DESDE - a.ventanaOptima) * escala
  for (const m of s.mazorcas) {
    if (s.bonoLluvia.t > 0) {
      m.t = optimoDesde + 0.2
    } else {
      m.t = (m.t + dt) % a.cicloMazorca
    }
  }

  // 2. Producción pasiva.
  const pasiva = produccionPasiva(s, a)
  if (pasiva > 0) {
    const producido = pasiva * dt
    s.granoBaba += producido
    s.stats.granosPasivos += producido
  }

  // 3. Bonos temporales.
  for (const b of [s.bonoProduccion, s.bonoPrecio, s.bonoLluvia]) {
    if (b.t > 0) b.t = Math.max(0, b.t - dt)
  }

  // 4. Mazorca dorada.
  if (s.dorada.activa) {
    s.dorada.t += dt
    if (s.dorada.t >= K.DORADA_DURACION) {
      s.dorada = { ...s.dorada, activa: false, t: 0, proxima: proximaDorada(s, r) }
    }
  } else {
    s.dorada.proxima -= dt
    if (s.dorada.proxima <= 0) {
      s.dorada = {
        activa: true,
        id: s.siguienteId++,
        t: 0,
        x: entre(r, 180, 820),
        y: entre(r, 170, 500),
        proxima: 0,
      }
    }
  }

  // 5. Enfermedades. Solo aparecen si hay cultivo que enfermar y nunca
  //    llevan la producción a cero: el factor tiene piso duro.
  if (a.pasivaBase > 0) {
    s.proximoBrote -= dt
    if (s.proximoBrote <= 0) {
      if (s.focos.length < K.FOCOS_MAX && r() < a.riesgo) {
        const tipo = r() < 0.6 ? 'monilia' : 'escoba'
        const libres = K.ANCLAS_FOCO.filter((a) => !s.focos.some((f) => f.x === a.x && f.y === a.y))
        const sitio = libres[Math.floor(r() * libres.length)] ?? K.ANCLAS_FOCO[0]
        s.focos.push({ id: s.siguienteId++, tipo, x: sitio.x, y: sitio.y, t: 0 })
        desbloquear(s, tipo === 'monilia' ? 'monilia' : 'escoba-de-bruja')
        desbloquear(s, 'poda-sanitaria')
        avisar(s, tipo === 'monilia' ? 'Brote de monilia en el lote' : 'Escoba de bruja en el lote', 'alerta')
      }
      s.proximoBrote = entre(r, K.BROTE_MIN_SEG, K.BROTE_MAX_SEG)
    }
  }
  for (const f of s.focos) f.t += dt

  // 6. Lotes en beneficio. La transición de fermentación a secado y la salida
  //    a bodega son automáticas: el jugador ausente no pierde nada.
  const terminados: Lote[] = []
  for (const l of s.lotes) {
    const antes = l.t
    l.t += dt
    if (l.etapa === 'fermentacion') {
      for (let i = 0; i < K.VENTANAS_VOLTEO.length; i++) {
        if (l.volteos.includes(i)) continue
        const cierre = K.VENTANAS_VOLTEO[i] + K.TOLERANCIA_VOLTEO
        if (antes <= cierre && l.t > cierre) s.stats.volteosPerdidos++
      }
      if (l.t >= l.duracion) {
        l.etapa = 'secado'
        l.t -= l.duracion
        l.duracion = a.duracionSecado
        desbloquear(s, 'secado')
      }
    } else if (l.t >= l.duracion) {
      terminados.push(l)
    }
  }
  if (terminados.length) {
    const ids = new Set(terminados.map((l) => l.id))
    s.lotes = s.lotes.filter((l) => !ids.has(l.id))
    for (const l of terminados) {
      const grado = gradoDe(l.calidad)
      const kilos = l.granos / K.GRANOS_POR_KILO
      s.bodega[grado.id] = (s.bodega[grado.id] ?? 0) + kilos
      s.stats.kgProducidos += kilos
      s.stats.lotesTerminados++
      if (grado.id === 'fino') s.stats.lotesFinos++
      desbloquear(s, 'prueba-de-corte')
      desbloquear(s, 'precio-calidad')
      if (grado.id === 'fino') desbloquear(s, 'fino-de-aroma')
      avisar(s, `Lote listo: ${kilos.toFixed(2).replace('.', ',')} kg ${grado.nombre.toLowerCase()}`, 'bueno')
    }
  }

  // 7. Los cajones libres se cargan solos cuando hay masa suficiente.
  let guarda = 0
  while (s.lotes.length < a.lotesMax && s.granoBaba >= a.capacidadLote && guarda++ < 50) {
    crearLote(s, a.capacidadLote)
  }

  // 8. Avisos efímeros.
  if (s.avisos.length) {
    s.avisos = s.avisos.map((v) => ({ ...v, t: v.t - dt })).filter((v) => v.t > 0)
  }

  // 9. Logros.
  const nuevos = logrosPendientes(s)
  if (nuevos.length) {
    s.logros.push(...nuevos)
    for (const id of nuevos) avisar(s, `Logro: ${LOGROS_POR_ID[id].nombre}`, 'bueno')
  }

  return s
}

function proximaDorada(s: GameState, r: () => number): number {
  const factor = s.mejorasPrestigio.jardin_clonal ? 0.7 : 1
  return entre(r, K.DORADA_MIN_SEG, K.DORADA_MAX_SEG) * factor
}

export function reducer(s: GameState, accion: Accion): GameState {
  switch (accion.tipo) {
    case 'TICK':
      return tick(s, accion.dt, accion.rnd)

    case 'AUSENCIA':
      return aplicarAusencia(s, accion.segundos).estado

    case 'COSECHAR': {
      const m = s.mazorcas.find((x) => x.id === accion.mazorcaId)
      if (!m) return s
      const a = agregados(s)
      const fase = faseDe(m.t, a.cicloMazorca, a.ventanaOptima)
      const granos = rendimientoClic(a, fase)
      const n = borrador(s)
      n.granoBaba += granos
      n.stats.granosCosechados += granos
      n.stats.clics++
      const idx = n.mazorcas.findIndex((x) => x.id === accion.mazorcaId)
      // La mazorca cortada se reemplaza por otra recién cuajada en el mismo sitio.
      n.mazorcas[idx] = { ...n.mazorcas[idx], id: n.siguienteId++, t: 0, roja: accion.rnd % 3 === 0 }
      if (fase === 'optimo') desbloquear(n, 'punto-de-corte')
      if (fase === 'verde' || fase === 'sobremadura') desbloquear(n, 'corte-mazorca')
      const nuevos = logrosPendientes(n)
      if (nuevos.length) {
        n.logros.push(...nuevos)
        for (const id of nuevos) avisar(n, `Logro: ${LOGROS_POR_ID[id].nombre}`, 'bueno')
      }
      return n
    }

    case 'COMPRAR': {
      const m = MEJORAS_POR_ID[accion.mejoraId]
      if (!m) return s
      const nivel = s.mejoras[m.id] ?? 0
      if (nivel >= m.maxNivel) return s
      const costo = costoMejora(m, nivel)
      if (s.dinero < costo) return s
      const n = borrador(s)
      n.dinero -= costo
      n.mejoras[m.id] = nivel + 1
      desbloquear(n, m.fichaId)
      avisar(n, `Comprado: ${m.nombre}`, 'bueno')
      if (m.id === 'cajon_sencillo') desbloquear(n, 'fermentacion')
      return n
    }

    case 'CARGAR_CAJON': {
      const a = agregados(s)
      if (s.lotes.length >= a.lotesMax) return s
      const minimo = a.capacidadLote * 0.1
      if (s.granoBaba < minimo) return s
      const n = borrador(s)
      crearLote(n, Math.min(n.granoBaba, a.capacidadLote))
      return n
    }

    case 'VOLTEAR': {
      const lote = s.lotes.find((l) => l.id === accion.loteId)
      if (!lote) return s
      const i = ventanaAbierta(lote)
      if (i < 0) return s
      const a = agregados(s)
      const n = borrador(s)
      const l = n.lotes.find((x) => x.id === accion.loteId)!
      l.volteos = [...l.volteos, i]
      l.calidad = Math.min(a.calidadTecho, l.calidad + a.bonoVolteo)
      n.stats.volteosAcertados++
      desbloquear(n, 'volteo')
      desbloquear(n, 'temperatura-fermentacion')
      return n
    }

    case 'VENDER': {
      const kilos = s.bodega[accion.grado] ?? 0
      if (kilos <= 0) return s
      const n = borrador(s)
      const importe = kilos * precioKilo(s, accion.grado)
      n.bodega[accion.grado] = 0
      n.dinero += importe
      n.stats.dineroGanado += importe
      n.stats.kgVendidos += kilos
      n.stats.kgHistoricos += kilos
      desbloquear(n, 'precio-calidad')
      return n
    }

    case 'VENDER_TODO': {
      const n = borrador(s)
      let kilos = 0
      let importe = 0
      for (const g of K.GRADOS) {
        const k = n.bodega[g.id] ?? 0
        if (k <= 0) continue
        importe += k * precioKilo(s, g.id)
        kilos += k
        n.bodega[g.id] = 0
      }
      if (kilos <= 0) return s
      n.dinero += importe
      n.stats.dineroGanado += importe
      n.stats.kgVendidos += kilos
      n.stats.kgHistoricos += kilos
      desbloquear(n, 'precio-calidad')
      return n
    }

    case 'VENDER_BABA': {
      if (s.granoBaba <= 0) return s
      const n = borrador(s)
      const importe = n.granoBaba * precioBaba(s)
      n.granoBaba = 0
      n.dinero += importe
      n.stats.dineroGanado += importe
      desbloquear(n, 'venta-en-baba')
      avisar(n, 'Vendiste en baba. El intermediario paga el 20%.', 'alerta')
      return n
    }

    case 'PODAR': {
      const foco = s.focos.find((f) => f.id === accion.focoId)
      if (!foco) return s
      const n = borrador(s)
      n.focos = n.focos.filter((f) => f.id !== accion.focoId)
      const bono = Math.max(K.BONO_PODA, produccionPasiva(s) * 10)
      n.granoBaba += bono
      n.stats.podas++
      desbloquear(n, 'poda-sanitaria')
      return n
    }

    case 'CLIC_DORADA': {
      if (!s.dorada.activa) return s
      const n = borrador(s)
      const r = prng(accion.rnd)
      const cual = Math.floor(r() * 4)
      if (cual === 0) {
        n.bonoProduccion = { mult: K.DORADA_BONO_PRODUCCION, t: K.DORADA_BONO_PRODUCCION_SEG }
        avisar(n, `Cosecha extraordinaria: producción x${K.DORADA_BONO_PRODUCCION} por ${K.DORADA_BONO_PRODUCCION_SEG} s`, 'bueno')
      } else if (cual === 1) {
        n.bonoPrecio = { mult: K.DORADA_BONO_PRECIO, t: K.DORADA_BONO_PRECIO_SEG }
        avisar(n, `Buen precio en el punto de compra: venta x${K.DORADA_BONO_PRECIO} por ${K.DORADA_BONO_PRECIO_SEG} s`, 'bueno')
      } else if (cual === 2) {
        n.bonoLluvia = { mult: 1, t: K.DORADA_LLUVIA_SEG }
        avisar(n, 'Lluvia de mazorcas: todo el árbol en punto', 'bueno')
      } else {
        n.focos = []
        avisar(n, 'Visita del técnico: lote limpio de enfermedades', 'bueno')
      }
      n.stats.doradas++
      n.dorada = { ...n.dorada, activa: false, t: 0, proxima: proximaDorada(n, r) }
      desbloquear(n, 'mazorca-dorada')
      return n
    }

    case 'LEER_FICHA': {
      if (s.fichasLeidas.includes(accion.fichaId)) return s
      return { ...s, fichasLeidas: [...s.fichasLeidas, accion.fichaId] }
    }

    case 'COMPRAR_PRESTIGIO': {
      const costo = costoPrestigio(accion.id)
      if (s.mejorasPrestigio[accion.id]) return s
      if (semillasLibres(s) < costo) return s
      return {
        ...s,
        semillasGastadas: s.semillasGastadas + costo,
        mejorasPrestigio: { ...s.mejorasPrestigio, [accion.id]: 1 },
      }
    }

    case 'RENOVAR': {
      const semillas = semillasDisponibles(s)
      if (semillas <= s.semillas) return s
      return estadoInicial({
        semillas,
        semillasGastadas: s.semillasGastadas,
        mejorasPrestigio: { ...s.mejorasPrestigio },
        logros: [...s.logros],
        fichasDesbloqueadas: [...s.fichasDesbloqueadas],
        fichasLeidas: [...s.fichasLeidas],
        kgHistoricos: s.stats.kgHistoricos,
        renovaciones: s.stats.renovaciones + 1,
        dinero: s.mejorasPrestigio.ahorro_familiar ? s.dinero * 0.1 : 0,
      })
    }

    case 'CARGAR_PARTIDA':
      return accion.estado

    case 'REINICIAR':
      return estadoInicial()

    default:
      return s
  }
}

/**
 * Progreso acumulado mientras el jugador estuvo ausente.
 * Reutiliza el mismo tick, en pasos gruesos y con un tope: no hay una segunda
 * implementación de la economía que se pueda desincronizar de la primera.
 * Sin volteos, así que los lotes salen con la calidad corriente que da el proceso solo.
 */
export function aplicarAusencia(s: GameState, segundos: number): { estado: GameState; resumen: ResumenAusencia | null } {
  const efectivos = Math.min(segundos, K.AUSENCIA_MAX_SEG)
  if (efectivos < 30) return { estado: s, resumen: null }
  const antes = { baba: s.granoBaba, kg: s.stats.kgProducidos, dinero: s.dinero }
  let estado = s
  const pasos = Math.floor(efectivos / K.PASO_AUSENCIA)
  for (let i = 0; i < pasos; i++) {
    estado = tick(estado, K.PASO_AUSENCIA, (i * 2654435761) >>> 0)
  }
  estado = { ...estado, avisos: [] }
  return {
    estado,
    resumen: {
      segundos: efectivos,
      recortado: segundos > K.AUSENCIA_MAX_SEG,
      baba: estado.granoBaba - antes.baba,
      kilos: estado.stats.kgProducidos - antes.kg,
    },
  }
}

export interface ResumenAusencia {
  segundos: number
  recortado: boolean
  baba: number
  kilos: number
}

export { mejorasVisibles }
export const CAPACIDAD_INICIAL = CAPACIDAD_BASE
