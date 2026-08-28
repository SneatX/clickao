/** Genera una partida de prueba para revisar la interfaz sin jugar hasta ahí. */
import { estadoInicial, reducer } from '../src/game/reducer'
import { agregados } from '../src/game/selectors'

let s = estadoInicial()
s = {
  ...s,
  dinero: 4_500_000,
  granoBaba: 9_000,
  mejoras: {
    machete: 1, podadora_gancho: 1, canasto_guantes: 1, recorrido_cosecha: 2, ojo_entrenado: 1,
    marcado_maduras: 1, jornalero: 22, sombrio_transitorio: 12, sombrio_permanente: 6,
    clones_injertados: 2, cajon_sencillo: 1, cajon_escalera: 2, marquesina: 1, pala_madera: 1,
    termometro: 1, cajon_moncoro: 1, prueba_corte: 1,
  },
  stats: { ...s.stats, clics: 1240, kgVendidos: 34, kgHistoricos: 34, dineroGanado: 900_000, lotesTerminados: 30, lotesFinos: 21, volteosAcertados: 108, podas: 12 },
  bodega: { pasilla: 0, corriente: 2.4, premium: 0, fino: 5.1 },
  focos: [
    { id: 900, tipo: 'monilia' as const, x: 300, y: 250, t: 1 },
    { id: 901, tipo: 'escoba' as const, x: 690, y: 430, t: 1 },
  ],
  fichasDesbloqueadas: [
    'punto-de-corte', 'reloj-de-la-finca', 'fermentacion', 'volteo', 'secado', 'monilia',
    'escoba-de-bruja', 'poda-sanitaria', 'prueba-de-corte', 'precio-calidad', 'fino-de-aroma',
    'clones-injertados', 'sombrio-transitorio', 'corte-mazorca', 'temperatura-fermentacion',
  ],
}
// Un par de lotes ya en marcha, uno en fermentación cerca de una ventana de volteo.
s = { ...s, granoBaba: agregados(s).capacidadLote * 2 + 9_000 }
s = reducer(s, { tipo: 'TICK', dt: 0.1, rnd: 7 })
for (let i = 0; i < 620; i++) s = reducer(s, { tipo: 'TICK', dt: 0.1, rnd: i + 3 })
s = {
  ...s,
  lotes: s.lotes.map((l, i) =>
    i === 0 ? { ...l, etapa: 'secado' as const, t: 96, duracion: 180, calidad: 0.79, volteos: [0, 1, 2, 3] } : l,
  ),
}
console.log(JSON.stringify({ ...s, ultimoTs: Date.now(), avisos: [] }))

// Segunda salida: el mismo estado como texto de partida, para pegarlo en Ajustes.
import { exportar } from '../src/persistence/storage'
console.error(exportar(s))
