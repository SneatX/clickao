/**
 * Persistencia en localStorage.
 *
 * Reglas: clave versionada, respaldo antes de cada sobrescritura, serialización
 * de un solo golpe (nunca por partes), validación estructural antes de migrar y
 * captura explícita de la cuota excedida.
 */
import type { GameState } from '../game/types'
import { PERSIST_KEY, PERSIST_BACKUP_KEY, SCHEMA_VERSION, GRADOS } from '../game/constants'
import { estadoInicial } from '../game/reducer'
import { migrar } from './migrations'

export type ResultadoCarga =
  | { estado: 'vacio' }
  | { estado: 'ok'; partida: GameState; ausenciaSeg: number }
  | { estado: 'respaldo'; partida: GameState; ausenciaSeg: number }
  | { estado: 'corrupto'; crudo: string | null }

function validar(x: unknown): x is GameState {
  if (!x || typeof x !== 'object') return false
  const s = x as Record<string, unknown>
  const numeros = ['granoBaba', 'dinero', 'schemaVersion', 'siguienteId', 'ultimoTs', 'semillas']
  for (const k of numeros) {
    if (typeof s[k] !== 'number' || !isFinite(s[k] as number)) return false
  }
  const listas = ['mazorcas', 'lotes', 'focos', 'fichasDesbloqueadas', 'logros']
  for (const k of listas) if (!Array.isArray(s[k])) return false
  for (const k of ['bodega', 'mejoras', 'stats']) {
    if (!s[k] || typeof s[k] !== 'object') return false
  }
  return true
}

/** Rellena lo que falte con los valores por defecto del estado inicial. */
function completar(s: GameState): GameState {
  const base = estadoInicial()
  const bodega = { ...base.bodega, ...s.bodega }
  for (const g of GRADOS) if (typeof bodega[g.id] !== 'number') bodega[g.id] = 0
  return {
    ...base,
    ...s,
    bodega,
    stats: { ...base.stats, ...s.stats },
    dorada: { ...base.dorada, ...s.dorada },
    bonoProduccion: { ...base.bonoProduccion, ...s.bonoProduccion },
    bonoPrecio: { ...base.bonoPrecio, ...s.bonoPrecio },
    bonoLluvia: { ...base.bonoLluvia, ...s.bonoLluvia },
    mejorasPrestigio: { ...base.mejorasPrestigio, ...s.mejorasPrestigio },
    avisos: [],
  }
}

/** Redondea las colas de coma flotante para que el JSON no crezca sin necesidad. */
function limpiar(s: GameState): GameState {
  const r = (n: number) => Math.round(n * 1000) / 1000
  return {
    ...s,
    granoBaba: r(s.granoBaba),
    dinero: r(s.dinero),
    bodega: Object.fromEntries(Object.entries(s.bodega).map(([k, v]) => [k, r(v)])),
    lotes: s.lotes.map((l) => ({ ...l, t: r(l.t), calidad: r(l.calidad), granos: r(l.granos) })),
    mazorcas: s.mazorcas.map((m) => ({ ...m, t: r(m.t) })),
    avisos: [],
  }
}

export function guardar(s: GameState): boolean {
  try {
    const texto = JSON.stringify(limpiar({ ...s, ultimoTs: Date.now(), schemaVersion: SCHEMA_VERSION }))
    const anterior = localStorage.getItem(PERSIST_KEY)
    if (anterior) {
      try {
        localStorage.setItem(PERSIST_BACKUP_KEY, anterior)
      } catch {
        /* si no cabe el respaldo, la partida principal sigue siendo lo prioritario */
      }
    }
    localStorage.setItem(PERSIST_KEY, texto)
    return true
  } catch (e) {
    if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22)) {
      console.error('[clickao] No hay espacio en localStorage para guardar la partida.')
    } else {
      console.error('[clickao] Error al guardar:', e)
    }
    return false
  }
}

function leerClave(clave: string): GameState | null {
  const crudo = localStorage.getItem(clave)
  if (!crudo) return null
  const objeto = JSON.parse(crudo) as Record<string, unknown>
  const migrado = migrar(objeto)
  if (!validar(migrado)) throw new Error('La partida no pasó la validación estructural')
  return completar(migrado)
}

export function cargar(): ResultadoCarga {
  let crudo: string | null = null
  try {
    crudo = localStorage.getItem(PERSIST_KEY)
    if (!crudo) return { estado: 'vacio' }
    const partida = leerClave(PERSIST_KEY)!
    return { estado: 'ok', partida, ausenciaSeg: ausencia(partida) }
  } catch (e) {
    console.warn('[clickao] Partida principal ilegible, intentando el respaldo.', e)
    try {
      const partida = leerClave(PERSIST_BACKUP_KEY)
      if (partida) return { estado: 'respaldo', partida, ausenciaSeg: ausencia(partida) }
    } catch (e2) {
      console.error('[clickao] El respaldo tampoco se pudo leer.', e2)
    }
    return { estado: 'corrupto', crudo }
  }
}

function ausencia(s: GameState): number {
  if (!s.ultimoTs) return 0
  return Math.max(0, (Date.now() - s.ultimoTs) / 1000)
}

export function borrar(): void {
  localStorage.removeItem(PERSIST_KEY)
  localStorage.removeItem(PERSIST_BACKUP_KEY)
}

/* ------------------------------------------------------------------ */
/* Exportar e importar como texto. Vale su peso en oro para depurar.   */
/* ------------------------------------------------------------------ */

function suma32(texto: string): string {
  let h = 0
  for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) >>> 0
  return h.toString(36)
}

function aBase64(texto: string): string {
  const bytes = new TextEncoder().encode(texto)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}

function deBase64(b64: string): string {
  const bin = atob(b64)
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function exportar(s: GameState): string {
  const texto = JSON.stringify(limpiar({ ...s, ultimoTs: Date.now() }))
  return `CLICKAO1.${aBase64(texto)}.${suma32(texto)}`
}

export function importar(entrada: string): GameState | null {
  try {
    const partes = entrada.trim().split('.')
    if (partes.length !== 3 || partes[0] !== 'CLICKAO1') return null
    const texto = deBase64(partes[1])
    if (suma32(texto) !== partes[2]) {
      console.error('[clickao] La firma no coincide: el texto está truncado o alterado.')
      return null
    }
    const migrado = migrar(JSON.parse(texto) as Record<string, unknown>)
    if (!validar(migrado)) return null
    return completar(migrado)
  } catch (e) {
    console.error('[clickao] No se pudo importar la partida.', e)
    return null
  }
}
