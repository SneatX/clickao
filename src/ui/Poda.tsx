/**
 * Animaciones efímeras de la poda sanitaria y de la mazorca dorada.
 *
 * Van aparte del estado por la misma razón que el corte: al podar, el reducer
 * saca el foco del lote en el acto, así que cualquier animación colgada del
 * elemento original se queda sin elemento antes de empezar. Estos son objetos
 * visuales con vida propia, que se dibujan encima y se retiran solos.
 */
import { memo } from 'react'
import type { TipoEnfermedad } from '../game/types'
import { IconoFoco } from './Iconos'

export interface PodaVisual {
  clave: number
  x: number
  y: number
  tipo: TipoEnfermedad
}

export interface RecogidaVisual {
  clave: number
  x: number
  y: number
}

/**
 * Poda sanitaria, 560 ms: pasa el filo, el foco se desprende y cae fuera del
 * lote girando, y queda un anillo verde donde el árbol se recupera. El verde
 * cerrando la secuencia es deliberado: el frío entra con la enfermedad y sale
 * con ella.
 */
function PodaBase({ poda }: { poda: PodaVisual }) {
  return (
    <g className="poda" transform={`translate(${poda.x} ${poda.y})`} aria-hidden="true">
      <circle className="poda-sano" r="30" fill="none" stroke="#7fbd52" strokeWidth="4" />

      <g className="poda-cuerpo">
        <IconoFoco tipo={poda.tipo} />
      </g>

      <g className="poda-polvo" fill="#b9a888">
        <circle cx="-14" cy="4" r="3" />
        <circle cx="12" cy="-2" r="2.4" />
        <circle cx="2" cy="14" r="2.6" />
      </g>

      <path className="poda-filo" d="M-24 10 L24 -12" stroke="#fffdf5" strokeWidth="4" strokeLinecap="round" />
    </g>
  )
}

/** Mazorca dorada recogida: dos anillos de oro y unas chispas. */
function RecogidaBase({ recogida }: { recogida: RecogidaVisual }) {
  return (
    <g className="recogida" transform={`translate(${recogida.x} ${recogida.y})`} aria-hidden="true">
      <circle className="recogida-anillo" r="26" fill="none" stroke="#ffc94a" strokeWidth="4.5" />
      <circle className="recogida-anillo dos" r="26" fill="none" stroke="#fff0c2" strokeWidth="3" />
      <g className="recogida-chispas" fill="#ffc94a">
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 26} cy={Math.sin((a * Math.PI) / 180) * 26} r="3.4" />
        ))}
      </g>
    </g>
  )
}

export const Poda = memo(PodaBase)
export const Recogida = memo(RecogidaBase)
