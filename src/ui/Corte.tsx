/**
 * La animación del corte de la mazorca.
 *
 * Va aparte de la mazorca a propósito: al cosechar, el reducer reemplaza el
 * fruto por otro recién cuajado con id nuevo, así que una animación colgada del
 * elemento original nunca llegaba a verse. Estos cortes son objetos visuales
 * efímeros con su propia vida, que se dibujan encima y se retiran solos.
 *
 * Secuencia, 420 ms: destello del filo, las dos mitades se separan girando y
 * dejando ver el grano en baba, y una onda marca el punto donde se cortó.
 */
import { memo } from 'react'

export interface CorteVisual {
  clave: number
  x: number
  y: number
  roja: boolean
  enPunto: boolean
}

const PULPA = '#efe2c9'
const PULPA_OSC = '#d8c5a4'

function CorteBase({ corte }: { corte: CorteVisual }) {
  const claro = corte.roja ? '#c0392b' : '#f4801a'
  const oscuro = corte.roja ? '#8e2419' : '#b25a0f'

  return (
    <g className="corte" transform={`translate(${corte.x} ${corte.y})`} aria-hidden="true">
      {corte.enPunto && <circle className="corte-onda" r="18" fill="none" stroke="#ffc94a" strokeWidth="3" />}

      <g className="corte-mitad-izq">
        <path d="M0 -25 c-9 2 -15 12 -15 24 c0 13 6 22 15 22 z" fill={claro} stroke={oscuro} strokeWidth="1.8" />
        <path d="M0 -22 c-6 2 -10 10 -10 20 c0 10 4 17 10 18 z" fill={PULPA} />
        <g fill={PULPA_OSC}>
          <ellipse cx="-5" cy="-8" rx="2.4" ry="3.2" />
          <ellipse cx="-6" cy="1" rx="2.4" ry="3.2" />
          <ellipse cx="-5" cy="10" rx="2.4" ry="3.2" />
        </g>
      </g>

      <g className="corte-mitad-der">
        <path d="M0 -25 c9 2 15 12 15 24 c0 13 -6 22 -15 22 z" fill={claro} stroke={oscuro} strokeWidth="1.8" />
        <path d="M0 -22 c6 2 10 10 10 20 c0 10 -4 17 -10 18 z" fill={PULPA} />
        <g fill={PULPA_OSC}>
          <ellipse cx="5" cy="-8" rx="2.4" ry="3.2" />
          <ellipse cx="6" cy="1" rx="2.4" ry="3.2" />
          <ellipse cx="5" cy="10" rx="2.4" ry="3.2" />
        </g>
      </g>

      <path className="corte-destello" d="M-22 6 L22 -10" stroke="#fffdf5" strokeWidth="4" strokeLinecap="round" />
    </g>
  )
}

export const Corte = memo(CorteBase)
