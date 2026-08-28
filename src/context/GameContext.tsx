/**
 * Contextos del juego.
 *
 * El estado y el dispatch viajan por contextos separados: el de dispatch es
 * estable y no provoca renders, así que los componentes que solo emiten
 * acciones (los botones de compra, por ejemplo) no se vuelven a renderizar en
 * cada tick.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
} from 'react'
import type { Accion, GameState } from '../game/types'
import { estadoInicial, reducer, aplicarAusencia, type ResumenAusencia } from '../game/reducer'
import { agregados as calcularAgregados, type Agregados } from '../game/selectors'
import { cargar, guardar } from '../persistence/storage'
import { useGameLoop } from '../hooks/useGameLoop'

const EstadoCtx = createContext<GameState | null>(null)
const DispatchCtx = createContext<Dispatch<Accion> | null>(null)
const AgregadosCtx = createContext<Agregados | null>(null)

export interface AvisoCarga {
  tipo: 'respaldo' | 'corrupto'
  crudo?: string | null
}

const CargaCtx = createContext<{
  resumen: ResumenAusencia | null
  avisoCarga: AvisoCarga | null
  cerrarResumen: () => void
  guardarYa: () => void
}>({ resumen: null, avisoCarga: null, cerrarResumen: () => {}, guardarYa: () => {} })

export function GameProvider({ children }: { children: ReactNode }) {
  const [estado, dispatch] = useReducer(reducer, undefined, () => estadoInicial())
  const [listo, setListo] = useState(false)
  const [resumen, setResumen] = useState<ResumenAusencia | null>(null)
  const [avisoCarga, setAvisoCarga] = useState<AvisoCarga | null>(null)
  const cargado = useRef(false)
  const estadoRef = useRef(estado)
  estadoRef.current = estado

  // Carga inicial. Va en un efecto con guarda y no en el inicializador del
  // reducer, porque en modo estricto el inicializador puede correr dos veces y
  // el progreso ausente se acreditaría doble.
  useEffect(() => {
    if (cargado.current) return
    cargado.current = true
    const r = cargar()
    if (r.estado === 'ok' || r.estado === 'respaldo') {
      const { estado: conAusencia, resumen: res } = aplicarAusencia(r.partida, r.ausenciaSeg)
      dispatch({ tipo: 'CARGAR_PARTIDA', estado: conAusencia })
      setResumen(res)
      if (r.estado === 'respaldo') setAvisoCarga({ tipo: 'respaldo' })
    } else if (r.estado === 'corrupto') {
      setAvisoCarga({ tipo: 'corrupto', crudo: r.crudo })
    }
    setListo(true)
  }, [])

  useGameLoop(dispatch, listo)

  // Guardado con rebote, más un guardado forzado al ocultar o cerrar la pestaña.
  const guardarYa = useCallback(() => {
    guardar(estadoRef.current)
  }, [])

  useEffect(() => {
    if (!listo) return
    const t = setTimeout(() => guardar(estadoRef.current), 1500)
    return () => clearTimeout(t)
  }, [estado, listo])

  useEffect(() => {
    if (!listo) return
    const alSalir = () => guardar(estadoRef.current)
    const alOcultar = () => {
      if (document.hidden) guardar(estadoRef.current)
    }
    window.addEventListener('pagehide', alSalir)
    document.addEventListener('visibilitychange', alOcultar)
    return () => {
      window.removeEventListener('pagehide', alSalir)
      document.removeEventListener('visibilitychange', alOcultar)
    }
  }, [listo])

  const agregados = useMemo(() => calcularAgregados(estado), [estado])
  const carga = useMemo(
    () => ({ resumen, avisoCarga, cerrarResumen: () => setResumen(null), guardarYa }),
    [resumen, avisoCarga, guardarYa],
  )

  return (
    <DispatchCtx.Provider value={dispatch}>
      <EstadoCtx.Provider value={estado}>
        <AgregadosCtx.Provider value={agregados}>
          <CargaCtx.Provider value={carga}>{children}</CargaCtx.Provider>
        </AgregadosCtx.Provider>
      </EstadoCtx.Provider>
    </DispatchCtx.Provider>
  )
}

export function useEstado(): GameState {
  const s = useContext(EstadoCtx)
  if (!s) throw new Error('useEstado fuera de GameProvider')
  return s
}

export function useDispatch(): Dispatch<Accion> {
  const d = useContext(DispatchCtx)
  if (!d) throw new Error('useDispatch fuera de GameProvider')
  return d
}

export function useAgregados(): Agregados {
  const a = useContext(AgregadosCtx)
  if (!a) throw new Error('useAgregados fuera de GameProvider')
  return a
}

export function useCarga() {
  return useContext(CargaCtx)
}
