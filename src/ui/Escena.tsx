/**
 * La escena de la finca: la zona donde se hace clic.
 *
 * El fondo es un SVG por capas con ids nombrados. Las capas de sombrío y los
 * árboles del fondo aparecen cuando el jugador compra la mejora que les
 * corresponde, de modo que ver crecer la finca sea la recompensa visual de la
 * progresión y no un adorno fijo.
 */
import { useCallback, useMemo, useState } from 'react'
import type { FaseMadurez, Mazorca as TMazorca } from '../game/types'
import { useAgregados, useDispatch, useEstado } from '../context/GameContext'
import { faseDe, factorEnfermedad, rendimientoClic } from '../game/selectors'
import * as K from '../game/constants'
import { Mazorca } from './Mazorca'
import { Particulas, emitirCosecha } from './Particulas'
import { IconoDorada, IconoFoco } from './Iconos'
import { num, segundos } from '../game/format'

export function Escena({ bajoConsumo }: { bajoConsumo: boolean }) {
  const s = useEstado()
  const a = useAgregados()
  const dispatch = useDispatch()
  const [cortadas, setCortadas] = useState<number[]>([])

  const escala = a.cicloMazorca / K.CICLO_MAZORCA_SEG
  const ventanaInicio = ((K.SOBREMADURA_DESDE - a.ventanaOptima) * escala) / a.cicloMazorca
  const ventanaAncho = (a.ventanaOptima * escala) / a.cicloMazorca
  const marcada = (s.mejoras.marcado_maduras ?? 0) > 0

  const cortar = useCallback(
    (m: TMazorca, fase: FaseMadurez, clientX: number, clientY: number) => {
      const granos = rendimientoClic(a, fase)
      emitirCosecha({
        clientX,
        clientY,
        cantidad: granos,
        granos: fase === 'optimo' ? 16 : 8,
        color: fase === 'optimo' ? '#b25a0f' : '#2a2418',
      })
      setCortadas((c) => [...c, m.id])
      window.setTimeout(() => setCortadas((c) => c.filter((id) => id !== m.id)), 300)
      dispatch({ tipo: 'COSECHAR', mazorcaId: m.id, rnd: (Math.random() * 2 ** 32) >>> 0 })
    },
    [a, dispatch],
  )

  const nivelCultivo = useMemo(() => {
    return ['sombrio_transitorio', 'sombrio_permanente', 'clones_injertados', 'nuevas_hectareas'].map(
      (id) => (s.mejoras[id] ?? 0) > 0,
    )
  }, [s.mejoras])

  const arbolesExtra = Math.min(6, Math.floor(Math.log10(Math.max(1, a.pasivaBase)) * 1.6))

  return (
    <section className="escena" aria-label="Finca cacaotera">
      <FondoFinca capas={nivelCultivo} arbolesExtra={arbolesExtra} />

      <svg
        className="capa-clic"
        viewBox={`0 0 ${K.ESCENA_ANCHO} ${K.ESCENA_ALTO}`}
        preserveAspectRatio="xMidYMid slice"
        aria-label="Árbol de cacao. Cada mazorca es un botón."
      >
        {s.mazorcas.map((m) => {
          const fase = faseDe(m.t, a.cicloMazorca, a.ventanaOptima)
          return (
            <Mazorca
              key={m.id}
              mazorca={m}
              fase={fase}
              avance={m.t / a.cicloMazorca}
              ventanaInicio={ventanaInicio}
              ventanaAncho={ventanaAncho}
              marcada={marcada}
              cortada={cortadas.includes(m.id)}
              onCortar={cortar}
            />
          )
        })}

        {s.focos.map((f) => (
          <g
            key={f.id}
            className="foco"
            transform={`translate(${f.x} ${f.y})`}
            role="button"
            tabIndex={0}
            onClick={() => dispatch({ tipo: 'PODAR', focoId: f.id })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                dispatch({ tipo: 'PODAR', focoId: f.id })
              }
            }}
            aria-label={`Foco de ${f.tipo === 'monilia' ? 'monilia' : 'escoba de bruja'}. Hacer poda sanitaria.`}
          >
            <title>{`${f.tipo === 'monilia' ? 'Monilia' : 'Escoba de bruja'}: clic para poda sanitaria`}</title>
            <IconoFoco tipo={f.tipo} />
          </g>
        ))}

        {s.dorada.activa && (
          <g
            className="dorada"
            transform={`translate(${s.dorada.x} ${s.dorada.y})`}
            role="button"
            tabIndex={0}
            onClick={() => dispatch({ tipo: 'CLIC_DORADA', rnd: (Math.random() * 2 ** 32) >>> 0 })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                dispatch({ tipo: 'CLIC_DORADA', rnd: (Math.random() * 2 ** 32) >>> 0 })
              }
            }}
            aria-label="Mazorca dorada. Recogerla da una racha de suerte."
          >
            <title>Mazorca dorada</title>
            <IconoDorada />
          </g>
        )}
      </svg>

      <Particulas activo={!bajoConsumo} />

      <div className="escena-bonos">
        {s.bonoProduccion.t > 0 && (
          <span className="chip bueno">
            Cosecha extraordinaria x{s.bonoProduccion.mult} · {segundos(s.bonoProduccion.t)}
          </span>
        )}
        {s.bonoPrecio.t > 0 && (
          <span className="chip bueno">
            Buen precio x{s.bonoPrecio.mult} · {segundos(s.bonoPrecio.t)}
          </span>
        )}
        {s.bonoLluvia.t > 0 && <span className="chip bueno">Lluvia de mazorcas · {segundos(s.bonoLluvia.t)}</span>}
        {s.focos.length > 0 && (
          <span className="chip alerta">
            {s.focos.length} {s.focos.length === 1 ? 'foco activo' : 'focos activos'} · producción al{' '}
            {Math.round(factorEnfermedad(s) * 100)}%
          </span>
        )}
      </div>

      <div className="escena-pie">
        <span>
          {s.mazorcas.length} mazorcas en el árbol · ventana de corte {a.ventanaOptima.toFixed(1).replace('.', ',')} s
          de {a.cicloMazorca.toFixed(1).replace('.', ',')} s
        </span>
        <span>·</span>
        <span>Cortar en punto rinde {num(rendimientoClic(a, 'optimo'), 0)} granos</span>
      </div>
    </section>
  )
}

/** Ilustración de fondo. Capas nombradas que se encienden con la progresión. */
function FondoFinca({ capas, arbolesExtra }: { capas: boolean[]; arbolesExtra: number }) {
  const [transitorio, permanente, clones, hectareas] = capas
  return (
    <svg className="escena-svg" viewBox={`0 0 ${K.ESCENA_ANCHO} ${K.ESCENA_ALTO}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true">
      <g id="colinas">
        <path d="M0 400 q150 -70 300 -30 q160 42 250 -10 q140 -80 250 -20 v280 H0 z" fill="#6e9c5a" opacity="0.45" />
        <path d="M0 440 q180 -50 340 -12 q180 42 300 -6 q160 -38 360 8 v190 H0 z" fill="#4a7c4e" opacity="0.55" />
      </g>

      {permanente && (
        <g id="sombrio-permanente">
          {[80, 210, 800, 930].map((x, i) => (
            <g key={x} transform={`translate(${x} ${330 + (i % 2) * 22})`}>
              <path d="M0 130 L0 20" stroke="#5d4423" strokeWidth="9" strokeLinecap="round" />
              <ellipse cx="0" cy="8" rx="62" ry="34" fill="#2f5d3a" />
              <ellipse cx="-22" cy="-14" rx="42" ry="26" fill="#3b6b44" />
              <ellipse cx="26" cy="-10" rx="38" ry="24" fill="#3b6b44" />
            </g>
          ))}
        </g>
      )}

      {hectareas && (
        <g id="lotes-nuevos" opacity="0.5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <g key={i} transform={`translate(${60 + i * 165} 372)`}>
              <path d="M0 44 L0 8" stroke="#5d4423" strokeWidth="5" />
              <ellipse cx="0" cy="0" rx="30" ry="20" fill="#4a7c4e" />
            </g>
          ))}
        </g>
      )}

      <g id="suelo">
        <path d="M0 470 q250 -34 500 -6 q250 28 500 -4 v160 H0 z" fill="#5d8046" />
        <path d="M0 520 q260 -22 520 0 q240 20 480 -6 v106 H0 z" fill="#4a6b39" />
      </g>

      {transitorio && (
        <g id="sombrio-transitorio">
          {[130, 880].map((x, i) => (
            <g key={x} transform={`translate(${x} ${470 + i * 14})`}>
              <path d="M0 40 L0 -30" stroke="#6e9c5a" strokeWidth="8" strokeLinecap="round" />
              <g fill="#5d8046">
                <path d="M0 -28 q-56 -16 -76 22 q46 -6 76 -6 z" />
                <path d="M0 -28 q56 -16 76 22 q-46 -6 -76 -6 z" />
                <path d="M0 -30 q-40 -44 -14 -66 q22 26 14 66 z" />
                <path d="M0 -30 q40 -44 14 -66 q-22 26 -14 66 z" />
              </g>
              <path d="M4 -18 q22 6 20 30 q-16 -4 -20 -30 z" fill="#c9a227" />
            </g>
          ))}
        </g>
      )}

      {Array.from({ length: arbolesExtra }).map((_, i) => (
        <g
          key={i}
          transform={`translate(${i < 3 ? 90 + i * 105 : 700 + (i - 3) * 105} ${452 + (i % 3) * 10}) scale(0.34)`}
          opacity="0.45"
        >
          <path d="M0 60 L0 -10" stroke="#6b4f2a" strokeWidth="14" strokeLinecap="round" />
          <ellipse cx="0" cy="-34" rx="70" ry="44" fill="#3b6b44" />
          <ellipse cx="-24" cy="-52" rx="44" ry="28" fill="#4a7c4e" />
        </g>
      ))}

      <g id="arbol-cacao" transform="translate(500 470)">
        <path d="M0 30 C-6 -40 -10 -90 -4 -150" stroke="#6b4f2a" strokeWidth="26" strokeLinecap="round" fill="none" />
        <path d="M-4 -110 C-60 -140 -96 -160 -120 -186" stroke="#6b4f2a" strokeWidth="13" strokeLinecap="round" fill="none" />
        <path d="M-4 -110 C56 -140 96 -156 122 -184" stroke="#6b4f2a" strokeWidth="13" strokeLinecap="round" fill="none" />
        <path d="M-4 -150 C-30 -196 -34 -226 -28 -262" stroke="#6b4f2a" strokeWidth="11" strokeLinecap="round" fill="none" />
        <path d="M-4 -150 C28 -196 40 -222 40 -256" stroke="#6b4f2a" strokeWidth="11" strokeLinecap="round" fill="none" />
        <g fill={clones ? '#2f5d3a' : '#3b6b44'}>
          <ellipse cx="-150" cy="-196" rx="96" ry="60" />
          <ellipse cx="150" cy="-192" rx="96" ry="60" />
          <ellipse cx="-40" cy="-286" rx="112" ry="68" />
          <ellipse cx="80" cy="-272" rx="102" ry="62" />
          <ellipse cx="0" cy="-214" rx="150" ry="76" />
        </g>
        <g fill="#4a7c4e" opacity="0.85">
          <ellipse cx="-120" cy="-224" rx="70" ry="40" />
          <ellipse cx="120" cy="-216" rx="66" ry="38" />
          <ellipse cx="-10" cy="-306" rx="76" ry="42" />
        </g>
        <ellipse cx="0" cy="34" rx="130" ry="18" fill="#3f5c31" opacity="0.45" />
      </g>
    </svg>
  )
}
