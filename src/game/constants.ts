/**
 * Constantes de balanceo.
 *
 * Todo numero de este archivo sale de una de dos fuentes:
 *   (a) un dato agronomico real, convertido con el reloj de la finca, o
 *   (b) el esqueleto de curva de Cookie Clicker, escalado.
 * Los comentarios dicen cual es cual. No se toca nada de aqui sin correr el
 * simulador de `npm run balance`.
 */

/** Reloj de la finca: un dia real equivale a 30 segundos de juego. */
export const SEGUNDOS_POR_DIA = 30

/**
 * Constante fundacional del juego.
 * Indice de mazorca estandar: 25 mazorcas por kilo de grano seco.
 * Granos por mazorca: 40 en promedio. 25 x 40 = 1000.
 */
export const GRANOS_POR_KILO = 1000
export const GRANOS_POR_MAZORCA = 40

/** Fermentacion: 6 dias para los clones trinitarios de Santander. */
export const FERMENTACION_SEG = 6 * SEGUNDOS_POR_DIA
/** Secado al sol en marquesina: 6 dias hasta 7% de humedad. */
export const SECADO_SEG = 6 * SEGUNDOS_POR_DIA

/**
 * Ventanas de volteo. El primer volteo real va a las 48 horas y los siguientes
 * cada 24. Con el reloj de la finca eso cae en 60, 90, 120 y 150 segundos.
 */
export const VENTANAS_VOLTEO = [2, 3, 4, 5].map((d) => d * SEGUNDOS_POR_DIA)
export const TOLERANCIA_VOLTEO = 12

/** Ciclo de maduracion de una mazorca colgada. Ritmo de interaccion, no calendario. */
export const CICLO_MAZORCA_SEG = 12
export const SOBREMADURA_DESDE = 10.5
export const PINTON_DESDE = 4.5
export const VENTANA_OPTIMA_BASE = 3
export const MAZORCAS_BASE = 6
export const MAZORCAS_MAX = 12

/** Rendimiento relativo segun el grado de madurez al momento del corte. */
export const RENDIMIENTO_MADUREZ: Record<string, number> = {
  verde: 0.25,
  pinton: 0.6,
  optimo: 1.0,
  sobremadura: 0.5,
}

export const ETIQUETA_MADUREZ: Record<string, string> = {
  verde: 'Verde',
  pinton: 'Pintona',
  optimo: 'En punto',
  sobremadura: 'Sobremadura',
}

/** Calidad. Los umbrales son los de la prueba de corte real. */
export const CALIDAD_INICIAL = 0.45
export const CALIDAD_TECHO_BASE = 0.95
export const VOLTEO_BONO_BASE = 0.08

export interface Grado {
  id: string
  nombre: string
  desde: number
  multiplicador: number
  color: string
}

/**
 * Grados de calidad. Los cortes vienen de la prueba de corte: menos del 40% de
 * granos pardos es pasilla, 60% es el indice optimo de fermentacion y 70% es el
 * minimo para dar la prueba por exitosa.
 */
export const GRADOS: Grado[] = [
  { id: 'pasilla', nombre: 'Pasilla', desde: 0, multiplicador: 0.6, color: '#5B6E7A' },
  { id: 'corriente', nombre: 'Corriente', desde: 0.4, multiplicador: 1.0, color: '#A9743F' },
  { id: 'premium', nombre: 'Premium', desde: 0.6, multiplicador: 1.6, color: '#C9A227' },
  { id: 'fino', nombre: 'Fino de aroma', desde: 0.7, multiplicador: 2.5, color: '#E07A1F' },
]

/** Precio mayorista de referencia por kilo de grano seco corriente. */
export const PRECIO_BASE_KILO = 10000
/** Venta de grano en baba al intermediario. Siempre disponible, siempre peor. */
export const FACTOR_VENTA_BABA = 0.2

/** Enfermedades. Nunca llevan la produccion a cero. */
export const PENALIZACION_MONILIA = 0.85
export const PENALIZACION_ESCOBA = 0.75
export const PISO_PRODUCCION_ENFERMA = 0.5
export const BROTE_MIN_SEG = 90
export const BROTE_MAX_SEG = 180
export const FOCOS_MAX = 6
/** Granos que devuelve retirar un foco a tiempo. */
export const BONO_PODA = 60

/** Mazorca dorada. */
export const DORADA_MIN_SEG = 60
export const DORADA_MAX_SEG = 180
export const DORADA_DURACION = 13
export const DORADA_BONO_PRODUCCION = 7
export const DORADA_BONO_PRODUCCION_SEG = 77
export const DORADA_BONO_PRECIO = 3
export const DORADA_BONO_PRECIO_SEG = 60
export const DORADA_LLUVIA_SEG = 20

/** Bucle. La economia se simula a 10 Hz; las animaciones corren aparte. */
export const PASO_SIMULACION = 0.1
export const DT_MAXIMO = 0.5
/** Tope de progreso acumulado mientras el jugador estuvo ausente. */
export const AUSENCIA_MAX_SEG = 8 * 60 * 60
/** Paso grueso con el que se recorre la ausencia al volver. */
export const PASO_AUSENCIA = 1

/** Prestigio: raiz cubica de los kilos historicos, igual que las galletas doradas. */
export const KG_POR_SEMILLA = 1000
export const BONO_POR_SEMILLA = 0.02

export const PERSIST_KEY = 'clickao.save.v1'
export const PERSIST_BACKUP_KEY = 'clickao.save.v1.bak'
export const SCHEMA_VERSION = 1

/**
 * Anclas de las mazorcas sobre la escena, en porcentaje del contenedor.
 * Son puntos de la ilustracion del arbol, no datos de juego.
 */
export const ANCLAS_MAZORCA: { x: number; y: number }[] = [
  { x: 30, y: 44 }, { x: 63, y: 40 }, { x: 46, y: 58 }, { x: 22, y: 62 },
  { x: 72, y: 60 }, { x: 55, y: 30 }, { x: 38, y: 33 }, { x: 68, y: 74 },
  { x: 27, y: 76 }, { x: 50, y: 72 }, { x: 78, y: 48 }, { x: 17, y: 50 },
]
