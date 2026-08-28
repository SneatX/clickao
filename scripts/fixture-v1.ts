/** Genera la partida congelada de esquema 1 que usa la prueba de migración. */
import { estadoInicial } from '../src/game/reducer'

const s = estadoInicial()
const v1 = {
  ...s,
  schemaVersion: 1,
  dinero: 48250,
  granoBaba: 1730,
  mejoras: { machete: 1, jornalero: 6, cajon_sencillo: 1, pala_madera: 1 },
  mazorcas: s.mazorcas.map((m, i) => ({
    ...m,
    x: [30, 63, 46, 22, 72, 55][i] ?? 50,
    y: [44, 40, 58, 62, 60, 30][i] ?? 50,
  })),
  stats: { ...s.stats, clics: 412, kgVendidos: 3, kgHistoricos: 3, dineroGanado: 61000 },
}
console.log(JSON.stringify(v1, null, 2))
