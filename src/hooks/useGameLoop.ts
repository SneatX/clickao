/**
 * Bucle de juego.
 *
 * Corre sobre requestAnimationFrame para leer el delta real del reloj, pero no
 * despacha una acción por frame: acumula y despacha la economía a 10 Hz. React
 * renderizando el árbol completo sesenta veces por segundo es la causa número
 * uno de que un clicker vaya a tirones; la fluidez visual la ponen las
 * animaciones, que corren fuera de React.
 *
 * Si el delta se dispara porque la pestaña perdió el foco, no se simula ese
 * salto como si fuera un tick: se deriva al camino de progreso ausente.
 */
import { useEffect, useRef } from 'react'
import type { Accion } from '../game/types'
import { DT_MAXIMO, PASO_SIMULACION } from '../game/constants'

export function useGameLoop(dispatch: React.Dispatch<Accion>, activo: boolean) {
  const acumulado = useRef(0)
  const anterior = useRef(0)

  useEffect(() => {
    if (!activo) return
    let frame = 0
    anterior.current = performance.now()

    const paso = (ahora: number) => {
      const dt = (ahora - anterior.current) / 1000
      anterior.current = ahora
      if (dt > 0 && dt < DT_MAXIMO) {
        acumulado.current += dt
        if (acumulado.current >= PASO_SIMULACION) {
          dispatch({ tipo: 'TICK', dt: acumulado.current, rnd: (Math.random() * 2 ** 32) >>> 0 })
          acumulado.current = 0
        }
      }
      frame = requestAnimationFrame(paso)
    }
    frame = requestAnimationFrame(paso)

    // La pestaña oculta congela el rAF. Al volver se acredita el intervalo
    // completo por la vía de la ausencia, no como un tick gigante.
    let ocultaDesde = 0
    const onVisibilidad = () => {
      if (document.hidden) {
        ocultaDesde = Date.now()
      } else {
        const fuera = (Date.now() - ocultaDesde) / 1000
        anterior.current = performance.now()
        acumulado.current = 0
        if (ocultaDesde && fuera > 5) dispatch({ tipo: 'AUSENCIA', segundos: fuera })
        ocultaDesde = 0
      }
    }
    document.addEventListener('visibilitychange', onVisibilidad)

    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('visibilitychange', onVisibilidad)
    }
  }, [dispatch, activo])
}
