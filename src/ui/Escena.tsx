/**
 * La escena de la finca: la zona donde se hace clic.
 *
 * El fondo es un SVG por capas con ids nombrados, y cada capa se enciende
 * cuando el jugador compra la mejora que le corresponde. Comprar sombrío,
 * clones o un cajón fermentador no cambia solo un número: se ve en la finca.
 * Ver crecer el lote es la recompensa visual de la progresión.
 */
import { useCallback, useMemo, useRef, useState } from 'react'
import type { FaseMadurez, Lote, Mazorca as TMazorca } from '../game/types'
import { useAgregados, useDispatch, useEstado } from '../context/GameContext'
import { faseDe, factorEnfermedad, produccionPasiva, rendimientoClic } from '../game/selectors'
import * as K from '../game/constants'
import { Mazorca } from './Mazorca'
import { Corte, type CorteVisual } from './Corte'
import { Poda, Recogida, type PodaVisual, type RecogidaVisual } from './Poda'
import { Particulas, emitirCosecha } from './Particulas'
import { IconoDorada, IconoFoco } from './Iconos'
import { num, segundos } from '../game/format'

export function Escena({ bajoConsumo }: { bajoConsumo: boolean }) {
  const s = useEstado()
  const a = useAgregados()
  const dispatch = useDispatch()
  const [cortes, setCortes] = useState<CorteVisual[]>([])
  const [podas, setPodas] = useState<PodaVisual[]>([])
  const [recogidas, setRecogidas] = useState<RecogidaVisual[]>([])
  const claveEfimera = useRef(0)

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
      const clave = ++claveEfimera.current
      setCortes((c) => [...c, { clave, x: m.x, y: m.y, roja: m.roja, enPunto: fase === 'optimo' }])
      window.setTimeout(() => setCortes((c) => c.filter((x) => x.clave !== clave)), 440)
      dispatch({ tipo: 'COSECHAR', mazorcaId: m.id, rnd: (Math.random() * 2 ** 32) >>> 0 })
    },
    [a, dispatch],
  )

  /**
   * Poda sanitaria. El bono en granos que devuelve retirar el foco a tiempo se
   * ve como cifra flotante: antes se cobraba en silencio.
   */
  const podar = useCallback(
    (foco: { id: number; tipo: 'monilia' | 'escoba'; x: number; y: number }, e: React.SyntheticEvent) => {
      const caja = (e.currentTarget as SVGGElement).getBoundingClientRect()
      emitirCosecha({
        clientX: caja.left + caja.width / 2,
        clientY: caja.top + caja.height / 2,
        cantidad: Math.max(K.BONO_PODA, produccionPasiva(s) * 10),
        granos: 10,
        color: '#2f6b34',
        particulas: ['#7fbd52', '#3f7d45', '#b9a888'],
      })
      const clave = ++claveEfimera.current
      setPodas((p) => [...p, { clave, x: foco.x, y: foco.y, tipo: foco.tipo }])
      window.setTimeout(() => setPodas((p) => p.filter((x) => x.clave !== clave)), 580)
      dispatch({ tipo: 'PODAR', focoId: foco.id })
    },
    [s, dispatch],
  )

  const recogerDorada = useCallback(
    (e: React.SyntheticEvent) => {
      const caja = (e.currentTarget as SVGGElement).getBoundingClientRect()
      emitirCosecha({
        clientX: caja.left + caja.width / 2,
        clientY: caja.top + caja.height / 2,
        cantidad: 0,
        granos: 16,
        color: '#ffc94a',
        sinNumero: true,
        particulas: ['#ffc94a', '#fff0c2', '#cf9a25'],
      })
      const clave = ++claveEfimera.current
      setRecogidas((r) => [...r, { clave, x: s.dorada.x, y: s.dorada.y }])
      window.setTimeout(() => setRecogidas((r) => r.filter((x) => x.clave !== clave)), 580)
      dispatch({ tipo: 'CLIC_DORADA', rnd: (Math.random() * 2 ** 32) >>> 0 })
    },
    [s.dorada.x, s.dorada.y, dispatch],
  )

  return (
    <section className="escena" aria-label="Finca cacaotera">
      <FondoFinca mejoras={s.mejoras} lotes={s.lotes} lotesMax={a.lotesMax} pasiva={a.pasivaBase} />

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
              onCortar={cortar}
            />
          )
        })}

        {cortes.map((c) => (
          <Corte key={c.clave} corte={c} />
        ))}

        {podas.map((p) => (
          <Poda key={p.clave} poda={p} />
        ))}

        {recogidas.map((r) => (
          <Recogida key={r.clave} recogida={r} />
        ))}

        {s.focos.map((f) => (
          <g
            key={f.id}
            className="foco"
            transform={`translate(${f.x} ${f.y})`}
            role="button"
            tabIndex={0}
            onClick={(e) => podar(f, e)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                podar(f, e)
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
            onClick={recogerDorada}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                recogerDorada(e)
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

/* ------------------------------------------------------------------ */
/* Ilustración de fondo. Capas nombradas que se encienden con la compra */
/* ------------------------------------------------------------------ */

interface PropsFondo {
  mejoras: Record<string, number>
  lotes: Lote[]
  lotesMax: number
  pasiva: number
}

function FondoFinca({ mejoras, lotes, lotesMax, pasiva }: PropsFondo) {
  const tiene = (id: string) => (mejoras[id] ?? 0) > 0
  const jornaleros = Math.min(3, mejoras.jornalero ?? 0)
  const platanos = Math.min(4, Math.ceil((mejoras.sombrio_transitorio ?? 0) / 4))
  const maderables = Math.min(4, Math.ceil((mejoras.sombrio_permanente ?? 0) / 2))
  const clones = tiene('clones_injertados')
  const arbolesLote = useMemo(
    () => Math.min(6, Math.floor(Math.log10(Math.max(1, pasiva)) * 1.6)),
    [pasiva],
  )

  return (
    <svg
      className="escena-svg"
      viewBox={`0 0 ${K.ESCENA_ANCHO} ${K.ESCENA_ALTO}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <g id="cielo">
        <circle cx="862" cy="128" r="44" fill="#ffd979" opacity="0.85" />
        <circle cx="862" cy="128" r="62" fill="#ffd979" opacity="0.25" />
        <g fill="#fffaf0" opacity="0.75">
          <ellipse cx="200" cy="140" rx="66" ry="24" />
          <ellipse cx="248" cy="128" rx="46" ry="26" />
          <ellipse cx="640" cy="108" rx="52" ry="20" />
        </g>
      </g>

      <g id="colinas">
        <path d="M0 392 q150 -74 300 -32 q160 44 250 -12 q140 -84 250 -20 v292 H0 z" fill="#8fc06a" opacity="0.55" />
        <path d="M0 436 q180 -52 340 -12 q180 44 300 -6 q160 -40 360 8 v194 H0 z" fill="#62a24c" opacity="0.7" />
      </g>

      {maderables > 0 && (
        <g id="sombrio-permanente">
          {[64, 178, 908, 946].slice(0, maderables).map((x, i) => (
            <g key={x} transform={`translate(${x} ${326 + (i % 2) * 22})`}>
              <path d="M0 132 L0 18" stroke="#6b4f2a" strokeWidth="10" strokeLinecap="round" />
              <ellipse cx="0" cy="8" rx="64" ry="35" fill="#27502f" />
              <ellipse cx="-24" cy="-16" rx="43" ry="27" fill="#3f7d45" />
              <ellipse cx="28" cy="-12" rx="39" ry="25" fill="#3f7d45" />
            </g>
          ))}
        </g>
      )}

      {tiene('nuevas_hectareas') && (
        <g id="lotes-nuevos" opacity="0.42">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <g key={i} transform={`translate(${70 + i * 168} 368)`}>
              <path d="M0 44 L0 8" stroke="#6b4f2a" strokeWidth="5" />
              <ellipse cx="0" cy="0" rx="30" ry="20" fill="#3f7d45" />
            </g>
          ))}
        </g>
      )}

      <g id="suelo">
        <path d="M0 470 q250 -34 500 -6 q250 28 500 -4 v160 H0 z" fill="#5d8a44" />
        <path d="M0 524 q260 -22 520 0 q240 20 480 -6 v106 H0 z" fill="#47702f" />
      </g>

      {Array.from({ length: arbolesLote }).map((_, i) => (
        <g
          key={i}
          transform={`translate(${i < 3 ? 92 + i * 104 : 604 + (i - 3) * 104} ${450 + (i % 3) * 10}) scale(0.34)`}
          opacity="0.5"
        >
          <path d="M0 60 L0 -10" stroke="#6b4f2a" strokeWidth="14" strokeLinecap="round" />
          <ellipse cx="0" cy="-34" rx="70" ry="44" fill="#3f7d45" />
          <ellipse cx="-24" cy="-52" rx="44" ry="28" fill="#62a24c" />
        </g>
      ))}

      {platanos > 0 && (
        <g id="sombrio-transitorio">
          {[122, 268, 742, 890].slice(0, platanos).map((x, i) => (
            <g key={x} transform={`translate(${x} ${478 + (i % 2) * 14})`}>
              <path d="M0 40 L0 -30" stroke="#62a24c" strokeWidth="8" strokeLinecap="round" />
              <g fill="#5d8a44">
                <path d="M0 -28 q-56 -16 -76 22 q46 -6 76 -6 z" />
                <path d="M0 -28 q56 -16 76 22 q-46 -6 -76 -6 z" />
                <path d="M0 -30 q-40 -44 -14 -66 q22 26 14 66 z" />
                <path d="M0 -30 q40 -44 14 -66 q-22 26 -14 66 z" />
              </g>
              <path d="M4 -18 q22 6 20 30 q-16 -4 -20 -30 z" fill="#e0b520" />
            </g>
          ))}
        </g>
      )}

      {tiene('vivero_clonal') && (
        <g id="vivero" transform="translate(150 486)">
          <path d="M-56 0 h112 v14 h-112 z" fill="#8b5424" />
          <path d="M-52 0 h104 v-8 h-104 z" fill="#b57534" />
          {[-40, -20, 0, 20, 40].map((x) => (
            <g key={x} transform={`translate(${x} -8)`}>
              <path d="M0 0 v-14" stroke="#3f7d45" strokeWidth="2.4" />
              <ellipse cx="0" cy="-16" rx="6" ry="5" fill="#62a24c" />
            </g>
          ))}
        </g>
      )}

      {(tiene('abono_organico') || tiene('fertilizacion')) && (
        <g id="compostera" transform="translate(300 500)">
          <path d="M-34 0 q34 -26 68 0 z" fill="#5a3a1c" />
          <path d="M-26 0 q26 -18 52 0 z" fill="#8b5424" />
          <path d="M6 -18 q14 -4 16 -16 q-14 3 -16 16 z" fill="#62a24c" />
        </g>
      )}

      {tiene('riego_drenaje') && (
        <g id="riego" transform="translate(0 512)">
          <path d="M60 0 q120 -14 240 0 q120 14 240 0" fill="none" stroke="#6b4f2a" strokeWidth="9" strokeLinecap="round" />
          <path d="M60 0 q120 -14 240 0 q120 14 240 0" fill="none" stroke="#78b6d0" strokeWidth="4.4" strokeLinecap="round" />
        </g>
      )}

      {tiene('asociacion') && (
        <g id="caseta" transform="translate(118 428)">
          <path d="M-44 0 L0 -30 L44 0 z" fill="#a8421f" />
          <path d="M-36 0 h72 v46 h-72 z" fill="#b57534" stroke="#7a4f28" strokeWidth="2" />
          <path d="M-10 46 v-24 h20 v24" fill="#5a3a1c" />
          <path d="M-28 12 h14 v12 h-14 z" fill="#fff6e0" />
          <path d="M-34 -6 h68 v6 h-68 z" fill="#ffc94a" />
        </g>
      )}

      <g id="arbol-cacao" transform="translate(500 470)">
        <path d="M0 30 C-6 -40 -10 -90 -4 -150" stroke="#6b4f2a" strokeWidth="26" strokeLinecap="round" fill="none" />
        <path d="M-4 -110 C-60 -140 -96 -160 -120 -186" stroke="#6b4f2a" strokeWidth="13" strokeLinecap="round" fill="none" />
        <path d="M-4 -110 C56 -140 96 -156 122 -184" stroke="#6b4f2a" strokeWidth="13" strokeLinecap="round" fill="none" />
        <path d="M-4 -150 C-30 -196 -34 -226 -28 -262" stroke="#6b4f2a" strokeWidth="11" strokeLinecap="round" fill="none" />
        <path d="M-4 -150 C28 -196 40 -222 40 -256" stroke="#6b4f2a" strokeWidth="11" strokeLinecap="round" fill="none" />
        <g fill={clones ? '#27502f' : '#356a3d'}>
          <ellipse cx="-150" cy="-196" rx="96" ry="60" />
          <ellipse cx="150" cy="-192" rx="96" ry="60" />
          <ellipse cx="-40" cy="-286" rx="112" ry="68" />
          <ellipse cx="80" cy="-272" rx="102" ry="62" />
          <ellipse cx="0" cy="-214" rx="150" ry="76" />
        </g>
        <g fill="#4f9350" opacity="0.9">
          <ellipse cx="-120" cy="-224" rx="70" ry="40" />
          <ellipse cx="120" cy="-216" rx="66" ry="38" />
          <ellipse cx="-10" cy="-306" rx="76" ry="42" />
        </g>
        {clones && (
          <g fill="#7fbd52" opacity="0.55">
            <ellipse cx="-64" cy="-256" rx="44" ry="24" />
            <ellipse cx="104" cy="-240" rx="38" ry="20" />
          </g>
        )}
        {/* Cojines florales sobre el tronco: de ahí sale la flor y luego el fruto */}
        <g id="cojines-florales" fill="#fdf3e0" stroke="#e8c9a8" strokeWidth="0.8">
          {[
            [-12, -20], [8, -58], [-14, -96], [10, -128], [-30, -132], [26, -96],
          ].map(([x, y]) => (
            <g key={`${x},${y}`} transform={`translate(${x} ${y})`}>
              <circle r="2.6" />
              <circle cx="5" cy="3" r="2" />
              <circle cx="-4" cy="4" r="1.8" />
            </g>
          ))}
        </g>
        <ellipse cx="0" cy="34" rx="130" ry="18" fill="#3a5a28" opacity="0.4" />
      </g>

      {jornaleros > 0 && (
        <g id="jornaleros">
          {[
            { x: 386, y: 508 },
            { x: 612, y: 500 },
            { x: 470, y: 522 },
          ]
            .slice(0, jornaleros)
            .map((pos, i) => (
              <g key={pos.x} transform={`translate(${pos.x} ${pos.y}) scale(${1 - i * 0.06})`}>
                <path d="M-9 -26 h18" stroke="#ffc94a" strokeWidth="4.5" strokeLinecap="round" />
                <circle cy="-29" r="5.5" fill="#8b5e34" />
                <path d="M0 -23 v14" stroke="#27502f" strokeWidth="6" strokeLinecap="round" />
                <path d="M-7 0 l7 -9 l7 9" stroke="#27502f" strokeWidth="5" fill="none" strokeLinecap="round" />
                <path d="M2 -18 l12 -6" stroke="#b57534" strokeWidth="3.4" strokeLinecap="round" />
              </g>
            ))}
        </g>
      )}

      {lotesMax > 0 && <Beneficiadero lotes={lotes} lotesMax={lotesMax} conMarquesina={tiene('marquesina')} />}
    </svg>
  )
}

/**
 * El beneficiadero. Los cajones que el jugador compra están ahí, se llenan de
 * masa cuando hay un lote fermentando y humean; el grano en secado se ve
 * tendido bajo la marquesina. La etapa del beneficio deja de ser solo una barra
 * de progreso en el panel de abajo.
 */
function Beneficiadero({
  lotes,
  lotesMax,
  conMarquesina,
}: {
  lotes: Lote[]
  lotesMax: number
  conMarquesina: boolean
}) {
  const visibles = Math.min(4, lotesMax)
  const fermentando = lotes.filter((l) => l.etapa === 'fermentacion').length
  const secando = lotes.some((l) => l.etapa === 'secado')

  return (
    <g id="beneficiadero" transform="translate(742 470)">
      <path d="M-72 0 h248 v12 h-248 z" fill="#7a4f28" />

      {Array.from({ length: visibles }).map((_, i) => {
        const ocupado = i < fermentando
        return (
          <g key={i} transform={`translate(${-66 + i * 44} ${-4 - i * 5})`}>
            <path d="M0 0 h40 v-30 h-40 z" fill="#b57534" stroke="#7a4f28" strokeWidth="2" />
            <path d="M0 -15 h40" stroke="#7a4f28" strokeWidth="1.6" />
            <path d="M13 0 v-30 M27 0 v-30" stroke="#7a4f28" strokeWidth="1.2" opacity="0.6" />
            {ocupado && (
              <>
                <path d="M3 -3 h34 v-11 h-34 z" fill="#6b4423" />
                <g className="vapor" stroke="#fff6e0" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.75">
                  <path d="M11 -18 q4 -7 0 -13" />
                  <path d="M22 -18 q5 -8 0 -15" />
                  <path d="M31 -18 q4 -6 0 -11" />
                </g>
              </>
            )}
          </g>
        )
      })}

      {conMarquesina && (
        <g transform="translate(106 -8)">
          {/* Techo translúcido de dos aguas: deja pasar el sol y corta la lluvia */}
          <path d="M-22 2 L30 -34 L82 2 z" fill="#dceaf1" opacity="0.92" stroke="#7a4f28" strokeWidth="4" strokeLinejoin="round" />
          <path d="M-24 2 h108 v6 h-108 z" fill="#7a4f28" />
          <path d="M4 -16 L56 -16" stroke="#b9d3de" strokeWidth="2" opacity="0.9" />
          {/* Postes y mesa de secado */}
          <path d="M-16 8 v18 M76 8 v18" stroke="#7a4f28" strokeWidth="5" strokeLinecap="round" />
          <path d="M-22 24 h104 v6 h-104 z" fill="#b57534" stroke="#7a4f28" strokeWidth="1.6" />
          {secando ? (
            <g fill="#8b5e34">
              {[-12, -1, 10, 21, 32, 43, 54, 65, 76].map((x, i) => (
                <ellipse key={x} cx={x} cy="19" rx="4.4" ry="5.2" transform={`rotate(${(i % 3) * 12 - 12} ${x} 19)`} />
              ))}
            </g>
          ) : (
            <path d="M-10 19 h80" stroke="#c99b6a" strokeWidth="2" strokeDasharray="5 6" strokeLinecap="round" />
          )}
        </g>
      )}
    </g>
  )
}
