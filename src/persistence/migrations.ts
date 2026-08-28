/**
 * Migraciones de la partida guardada.
 *
 * Existe desde el primer día, cuando todavía hay una sola versión y parece
 * innecesaria. El día que cambie la forma del estado, aquí se agrega un paso y
 * las partidas viejas siguen abriendo. Cada paso debe llevar su prueba con una
 * partida real congelada en tests/partidas.
 */
import { ANCLAS_MAZORCA, SCHEMA_VERSION } from '../game/constants'

type Guardado = Record<string, unknown>

/** De la versión N a la N+1. La clave es la versión de origen. */
export const MIGRACIONES: Record<number, (s: Guardado) => Guardado> = {
  /**
   * 1 -> 2. Las mazorcas guardaban su posición en porcentaje del contenedor.
   * Ahora la capa de clic comparte el viewBox de la ilustración, así que las
   * posiciones se vuelven a sembrar desde las anclas del tronco.
   */
  1: (s) => ({
    ...s,
    schemaVersion: 2,
    mazorcas: (Array.isArray(s.mazorcas) ? s.mazorcas : []).map((m, i) => ({
      ...(m as Record<string, unknown>),
      x: ANCLAS_MAZORCA[i % ANCLAS_MAZORCA.length].x,
      y: ANCLAS_MAZORCA[i % ANCLAS_MAZORCA.length].y,
    })),
    focos: [],
    dorada: { activa: false, id: 0, t: 0, x: 500, y: 320, proxima: 60 },
  }),
}

export function migrar(guardado: Guardado): Guardado {
  let s = guardado
  let vueltas = 0
  while (typeof s.schemaVersion === 'number' && s.schemaVersion < SCHEMA_VERSION) {
    const paso = MIGRACIONES[s.schemaVersion]
    if (!paso) throw new Error(`No hay migración desde el esquema ${s.schemaVersion}`)
    s = paso(s)
    if (vueltas++ > 50) throw new Error('Cadena de migraciones sin fin')
  }
  return s
}
