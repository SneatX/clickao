/**
 * La mazorca colgada: el objetivo de clic.
 *
 * Vive dentro del mismo viewBox que la ilustración del fondo, así que queda
 * clavada sobre el tronco pase lo que pase con el tamaño de la ventana.
 *
 * El estado de madurez se comunica por tres canales a la vez y nunca solo por
 * color: el tono de la cáscara, el tamaño del fruto y un anillo que muestra por
 * dónde va el ciclo y dónde está la ventana de corte. El anillo es la versión
 * geométrica de lo que en la finca se lee mirando y golpeando el fruto.
 */
import { memo } from 'react'
import type { FaseMadurez, Mazorca as TMazorca } from '../game/types'
import { ETIQUETA_MADUREZ, RENDIMIENTO_MADUREZ } from '../game/constants'

const PALETA: Record<FaseMadurez, { claro: string; oscuro: string }> = {
  verde: { claro: '#7ba05b', oscuro: '#587a3f' },
  pinton: { claro: '#c9a227', oscuro: '#9c7a15' },
  optimo: { claro: '#e07a1f', oscuro: '#b25a0f' },
  sobremadura: { claro: '#6e4b2a', oscuro: '#4f351b' },
}

const PALETA_ROJA: Record<FaseMadurez, { claro: string; oscuro: string }> = {
  verde: { claro: '#8b8c56', oscuro: '#666738' },
  pinton: { claro: '#b5562a', oscuro: '#8c3d1c' },
  optimo: { claro: '#c0392b', oscuro: '#8e2419' },
  sobremadura: { claro: '#6b3a2c', oscuro: '#4b271d' },
}

const ESCALA: Record<FaseMadurez, number> = {
  verde: 0.66,
  pinton: 0.84,
  optimo: 1,
  sobremadura: 0.94,
}

const R_ANILLO = 26
const C_ANILLO = 2 * Math.PI * R_ANILLO

interface Props {
  mazorca: TMazorca
  fase: FaseMadurez
  /** Fracción del ciclo recorrida, 0 a 1. */
  avance: number
  /** Inicio y ancho de la ventana óptima, en fracción del ciclo. */
  ventanaInicio: number
  ventanaAncho: number
  marcada: boolean
  cortada: boolean
  onCortar: (m: TMazorca, fase: FaseMadurez, x: number, y: number) => void
}

function MazorcaBase({
  mazorca,
  fase,
  avance,
  ventanaInicio,
  ventanaAncho,
  marcada,
  cortada,
  onCortar,
}: Props) {
  const c = (mazorca.roja ? PALETA_ROJA : PALETA)[fase]
  const s = ESCALA[fase]
  const ang = avance * Math.PI * 2 - Math.PI / 2
  const px = Math.cos(ang) * R_ANILLO
  const py = Math.sin(ang) * R_ANILLO
  const rinde = Math.round(RENDIMIENTO_MADUREZ[fase] * 100)

  const activar = (e: React.MouseEvent | React.KeyboardEvent) => {
    const caja = (e.currentTarget as SVGGElement).getBoundingClientRect()
    onCortar(mazorca, fase, caja.left + caja.width / 2, caja.top + caja.height / 2)
  }

  return (
    <g
      className={`mazorca ${fase} ${cortada ? 'cortada' : ''}`}
      transform={`translate(${mazorca.x} ${mazorca.y})`}
      role="button"
      tabIndex={0}
      onClick={activar}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          activar(e)
        }
      }}
      aria-label={`Mazorca ${ETIQUETA_MADUREZ[fase].toLowerCase()}, rinde el ${rinde} por ciento. Cosechar.`}
    >
      <title>{`${ETIQUETA_MADUREZ[fase]} · ${rinde}% del rendimiento`}</title>
      {/* Área de clic cómoda, más grande que el dibujo */}
      <circle r="30" fill="transparent" />

      {fase === 'optimo' && <circle className="halo" r="25" fill="var(--dorado)" opacity="0.3" />}

      <g transform="rotate(-90)">
        <circle r={R_ANILLO} fill="none" stroke="rgba(42,36,24,0.18)" strokeWidth="2.5" />
        <circle
          r={R_ANILLO}
          fill="none"
          stroke="#f2c14e"
          strokeWidth="3.5"
          strokeDasharray={`${ventanaAncho * C_ANILLO} ${C_ANILLO}`}
          strokeDashoffset={-ventanaInicio * C_ANILLO}
        />
      </g>
      <circle cx={px} cy={py} r="3.6" fill="#2a2418" stroke="#f7efdd" strokeWidth="1.4" />

      <g className="cuerpo" transform={`scale(${s})`}>
        <path d="M0 -25 q3 -6 8 -8" stroke="#5d4423" strokeWidth="3.2" fill="none" strokeLinecap="round" />
        <path
          d="M0 -25 c9 2 15 12 15 24 c0 13 -6 22 -15 22 c-9 0 -15 -9 -15 -22 c0 -12 6 -22 15 -24 z"
          fill={c.claro}
          stroke={c.oscuro}
          strokeWidth="1.8"
        />
        <path d="M0 -23 c-5 8 -6 28 0 43" stroke={c.oscuro} strokeWidth="1.4" fill="none" opacity="0.7" />
        <path d="M8 -20 c4 8 4 25 -1 36" stroke={c.oscuro} strokeWidth="1.4" fill="none" opacity="0.7" />
        <path d="M-8 -20 c-4 8 -4 25 1 36" stroke={c.oscuro} strokeWidth="1.4" fill="none" opacity="0.7" />
        <path d="M0 -25 c9 2 15 12 15 24 c0 5 -1 10 -3 14 c-4 -17 -7 -28 -12 -38 z" fill="#fff" opacity="0.16" />
        {fase === 'sobremadura' && (
          <>
            <circle cx="-7" cy="6" r="3.2" fill="#3e2a16" opacity="0.6" />
            <circle cx="6" cy="14" r="2.4" fill="#3e2a16" opacity="0.6" />
          </>
        )}
      </g>

      {marcada && fase === 'optimo' && (
        <g transform="translate(0 -40)">
          <rect x="-16" y="-8" width="32" height="15" rx="7.5" fill="#f2c14e" stroke="#c99b2b" />
          <text className="marca-punto" y="3" textAnchor="middle">
            punto
          </text>
        </g>
      )}
    </g>
  )
}

export const Mazorca = memo(MazorcaBase)
