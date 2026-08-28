/** Logros de finca. Cada uno otorga un uno por ciento permanente de producción. */
import type { Logro } from '../game/types'

export const BONO_POR_LOGRO = 0.01

export const LOGROS: Logro[] = [
  { id: 'primer_corte', nombre: 'Primer corte', descripcion: 'Cosecha tu primera mazorca.', condicion: (s) => s.stats.clics >= 1 },
  { id: 'cien_cortes', nombre: 'Ojo de cosechero', descripcion: 'Cien mazorcas cosechadas.', condicion: (s) => s.stats.clics >= 100 },
  { id: 'mil_cortes', nombre: 'Machete gastado', descripcion: 'Mil mazorcas cosechadas.', condicion: (s) => s.stats.clics >= 1000 },
  { id: 'diez_mil_cortes', nombre: 'Callo en la mano', descripcion: 'Diez mil mazorcas cosechadas.', condicion: (s) => s.stats.clics >= 10000 },
  { id: 'primer_lote', nombre: 'Primer cajón', descripcion: 'Termina tu primer lote de beneficio.', condicion: (s) => s.stats.lotesTerminados >= 1 },
  { id: 'primer_fino', nombre: 'Fino de aroma', descripcion: 'Saca un lote con calidad de fino de sabor y aroma.', condicion: (s) => s.stats.lotesFinos >= 1 },
  { id: 'cien_finos', nombre: 'Reputación de finca', descripcion: 'Cien lotes finos de aroma.', condicion: (s) => s.stats.lotesFinos >= 100 },
  { id: 'primer_kilo', nombre: 'El primer kilo', descripcion: 'Vende un kilo de grano seco.', condicion: (s) => s.stats.kgVendidos >= 1 },
  { id: 'una_tonelada', nombre: 'Una tonelada', descripcion: 'Vende mil kilos de grano seco.', condicion: (s) => s.stats.kgVendidos >= 1000 },
  { id: 'cien_toneladas', nombre: 'Cien toneladas', descripcion: 'Vende cien mil kilos de grano seco.', condicion: (s) => s.stats.kgVendidos >= 100000 },
  { id: 'diez_mil_toneladas', nombre: 'Acopio regional', descripcion: 'Vende diez millones de kilos.', condicion: (s) => s.stats.kgVendidos >= 1e7 },
  { id: 'cien_volteos', nombre: 'Pala de madera', descripcion: 'Cien volteos hechos dentro de su ventana.', condicion: (s) => s.stats.volteosAcertados >= 100 },
  { id: 'mil_volteos', nombre: 'Maestro fermentador', descripcion: 'Mil volteos acertados.', condicion: (s) => s.stats.volteosAcertados >= 1000 },
  { id: 'diez_podas', nombre: 'Recorrido sanitario', descripcion: 'Diez podas sanitarias.', condicion: (s) => s.stats.podas >= 10 },
  { id: 'cien_podas', nombre: 'Lote limpio', descripcion: 'Cien podas sanitarias.', condicion: (s) => s.stats.podas >= 100 },
  { id: 'mil_podas', nombre: 'Sin escobas', descripcion: 'Mil podas sanitarias.', condicion: (s) => s.stats.podas >= 1000 },
  { id: 'diez_doradas', nombre: 'Buena racha', descripcion: 'Atrapa diez mazorcas doradas.', condicion: (s) => s.stats.doradas >= 10 },
  { id: 'cincuenta_doradas', nombre: 'Suerte de cacaotero', descripcion: 'Atrapa cincuenta mazorcas doradas.', condicion: (s) => s.stats.doradas >= 50 },
  { id: 'agroforestal', nombre: 'Sistema agroforestal', descripcion: 'Ten sombrío transitorio y permanente al tiempo.', condicion: (s) => (s.mejoras.sombrio_transitorio ?? 0) > 0 && (s.mejoras.sombrio_permanente ?? 0) > 0 },
  { id: 'beneficiadero', nombre: 'Beneficiadero completo', descripcion: 'Cajón, marquesina, termómetro y secador.', condicion: (s) => ['cajon_sencillo', 'marquesina', 'termometro', 'secador_tunel'].every((id) => (s.mejoras[id] ?? 0) > 0) },
  { id: 'cien_jornaleros', nombre: 'Cuadrilla grande', descripcion: 'Cien jornaleros de cosecha.', condicion: (s) => (s.mejoras.jornalero ?? 0) >= 100 },
  { id: 'primera_renovacion', nombre: 'Renovar el cacaotal', descripcion: 'Renueva la finca por primera vez.', condicion: (s) => s.stats.renovaciones >= 1 },
  { id: 'calidad_maxima', nombre: 'Lote impecable', descripcion: 'Saca un lote con calidad superior a 0,95.', condicion: (s) => s.stats.lotesFinos >= 1 && s.mejoras.prueba_corte > 0 && s.stats.volteosAcertados >= 4 },
]

export const LOGROS_POR_ID: Record<string, Logro> = Object.fromEntries(LOGROS.map((l) => [l.id, l]))
