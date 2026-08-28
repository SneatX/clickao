/**
 * Cada migracion va acompañada de una partida real congelada. El fallo que mas
 * duele no es el archivo corrupto sino la migracion mal escrita que destruye
 * partidas buenas, asi que ningun cambio de esquema se publica sin su prueba.
 */
import { describe, expect, it } from 'vitest'
import { migrar } from '../migrations'
import { exportar, importar } from '../storage'
import { estadoInicial } from '../../game/reducer'
import { ANCLAS_MAZORCA, SCHEMA_VERSION } from '../../game/constants'
import partidaV1 from './partida-v1.json'

describe('migraciones', () => {
  it('lleva una partida de esquema 1 al esquema actual', () => {
    const m = migrar(structuredClone(partidaV1) as Record<string, unknown>)
    expect(m.schemaVersion).toBe(SCHEMA_VERSION)
  })

  it('resiembra las posiciones de las mazorcas en coordenadas de la escena', () => {
    const m = migrar(structuredClone(partidaV1) as Record<string, unknown>) as Record<string, unknown>
    const mazorcas = m.mazorcas as { x: number; y: number }[]
    expect(mazorcas[0].x).toBe(ANCLAS_MAZORCA[0].x)
    expect(mazorcas[0].y).toBe(ANCLAS_MAZORCA[0].y)
  })

  it('conserva el progreso del jugador', () => {
    const m = migrar(structuredClone(partidaV1) as Record<string, unknown>)
    expect(m.dinero).toBe(partidaV1.dinero)
    expect(m.mejoras).toEqual(partidaV1.mejoras)
  })

  it('falla en vez de adivinar si no hay camino desde ese esquema', () => {
    expect(() => migrar({ schemaVersion: -3 })).toThrow()
  })
})

describe('exportar e importar', () => {
  it('da la vuelta completa sin perder el estado', () => {
    const s = { ...estadoInicial(), dinero: 12_345, granoBaba: 678 }
    const vuelta = importar(exportar(s))
    expect(vuelta).not.toBeNull()
    expect(vuelta!.dinero).toBe(12_345)
    expect(vuelta!.granoBaba).toBe(678)
  })

  it('rechaza un texto truncado en vez de cargar basura', () => {
    const texto = exportar(estadoInicial())
    expect(importar(texto.slice(0, texto.length - 12))).toBeNull()
    expect(importar('cualquier cosa')).toBeNull()
  })
})
