/** Tipos compartidos del juego. Todo el estado vive en un solo objeto plano y serializable. */

export type Categoria = 'herramientas' | 'cultivo' | 'beneficio'

/**
 * Vocabulario cerrado de efectos. Si una mejora nueva necesita un efecto que no
 * esta en esta lista, no es una mejora: es otra mecanica. Ver README.
 */
export type TipoEfecto =
  // Herramientas: todo lo que ocurre en el arbol al hacer clic.
  | 'clic_suma'
  | 'clic_multiplicador'
  | 'mazorcas_simultaneas'
  | 'ventana_optima'
  | 'ciclo_mazorca'
  // Cultivo: la corriente pasiva de grano en baba.
  | 'pasiva_produccion'
  | 'pasiva_multiplicador'
  | 'riesgo_enfermedad'
  // Beneficio: capacidad, paralelismo y calidad.
  | 'lotes_capacidad'
  | 'lotes_paralelos'
  | 'calidad_base'
  | 'calidad_volteo'
  | 'calidad_techo'
  | 'secado_duracion'
  | 'precio_multiplicador'

export interface Efecto {
  tipo: TipoEfecto
  /** Sumando para los efectos aditivos, factor por nivel para los multiplicativos. */
  valor: number
}

export type Requisito =
  | { tipo: 'mejora'; id: string; nivel: number }
  | { tipo: 'stat'; clave: keyof Estadisticas; valor: number }

export interface Mejora {
  id: string
  categoria: Categoria
  nombre: string
  descripcion: string
  costoBase: number
  /** Factor de crecimiento del costo por nivel ya comprado. */
  crecimiento: number
  /** Infinity para los generadores, 1 para las compras unicas. */
  maxNivel: number
  efectos: Efecto[]
  fichaId?: string
  requiere?: Requisito[]
}

export interface Ficha {
  id: string
  titulo: string
  categoria: 'cultivo' | 'cosecha' | 'beneficio' | 'sanidad' | 'mercado'
  queEs: string
  comoSeUsa: string
  porQueImporta: string
  enElJuego?: string
  fuente?: string
}

export interface Logro {
  id: string
  nombre: string
  descripcion: string
  condicion: (s: GameState) => boolean
}

/** Fases visibles de madurez de una mazorca colgada en el arbol. */
export type FaseMadurez = 'verde' | 'pinton' | 'optimo' | 'sobremadura'

export interface Mazorca {
  id: number
  /** Segundos transcurridos dentro del ciclo de maduracion. */
  t: number
  /** Posicion relativa dentro de la escena, en porcentaje del contenedor. */
  x: number
  y: number
  /** Variedad visual: mazorca amarilla o mazorca roja. */
  roja: boolean
}

export type EtapaLote = 'fermentacion' | 'secado'

export interface Lote {
  id: number
  etapa: EtapaLote
  /** Granos en baba que entraron al cajon. */
  granos: number
  /** Segundos acumulados dentro de la etapa actual. */
  t: number
  /** Duracion de la etapa actual en segundos. */
  duracion: number
  calidad: number
  /** Indices de ventanas de volteo ya aprovechadas. */
  volteos: number[]
}

export type TipoEnfermedad = 'monilia' | 'escoba'

export interface Foco {
  id: number
  tipo: TipoEnfermedad
  x: number
  y: number
  /** Segundos que lleva activo, solo para la animacion de entrada. */
  t: number
}

export interface Dorada {
  activa: boolean
  id: number
  t: number
  x: number
  y: number
  /** Segundos que faltan para la proxima aparicion. */
  proxima: number
}

export interface Bono {
  mult: number
  /** Segundos restantes. */
  t: number
}

export interface Estadisticas {
  clics: number
  granosCosechados: number
  granosPasivos: number
  kgProducidos: number
  kgVendidos: number
  /** No se reinicia con la renovacion del cacaotal: alimenta el prestigio. */
  kgHistoricos: number
  dineroGanado: number
  lotesTerminados: number
  lotesFinos: number
  volteosAcertados: number
  volteosPerdidos: number
  podas: number
  doradas: number
  tiempoJugado: number
  renovaciones: number
}

export interface GameState {
  schemaVersion: number
  granoBaba: number
  /** Kilos de grano seco en bodega, separados por grado de calidad. */
  bodega: Record<string, number>
  dinero: number
  mazorcas: Mazorca[]
  lotes: Lote[]
  focos: Foco[]
  dorada: Dorada
  bonoProduccion: Bono
  bonoPrecio: Bono
  bonoLluvia: Bono
  mejoras: Record<string, number>
  fichasDesbloqueadas: string[]
  fichasLeidas: string[]
  logros: string[]
  /** Prestigio. */
  semillas: number
  semillasGastadas: number
  mejorasPrestigio: Record<string, number>
  stats: Estadisticas
  /** Segundos que faltan para el proximo intento de brote de enfermedad. */
  proximoBrote: number
  siguienteId: number
  ultimoTs: number
  /** Mensajes efimeros para la region aria-live y el registro de la finca. */
  avisos: Aviso[]
}

export interface Aviso {
  id: number
  texto: string
  tono: 'neutro' | 'bueno' | 'alerta'
  t: number
}

export type Accion =
  | { tipo: 'TICK'; dt: number; rnd: number }
  | { tipo: 'AUSENCIA'; segundos: number }
  | { tipo: 'COSECHAR'; mazorcaId: number; rnd: number }
  | { tipo: 'COMPRAR'; mejoraId: string }
  | { tipo: 'CARGAR_CAJON' }
  | { tipo: 'VOLTEAR'; loteId: number }
  | { tipo: 'VENDER'; grado: string }
  | { tipo: 'VENDER_TODO' }
  | { tipo: 'VENDER_BABA' }
  | { tipo: 'PODAR'; focoId: number }
  | { tipo: 'CLIC_DORADA'; rnd: number }
  | { tipo: 'LEER_FICHA'; fichaId: string }
  | { tipo: 'COMPRAR_PRESTIGIO'; id: string }
  | { tipo: 'RENOVAR' }
  | { tipo: 'CARGAR_PARTIDA'; estado: GameState }
  | { tipo: 'REINICIAR' }
