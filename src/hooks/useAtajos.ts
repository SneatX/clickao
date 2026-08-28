/**
 * Atajos de teclado. Ninguna acción del juego depende solo del ratón, y las
 * mazorcas del árbol son botones enfocables con Tab que responden a Espacio.
 */
import { useEffect } from 'react'

export interface Atajos {
  [tecla: string]: () => void
}

export function useAtajos(atajos: Atajos, activo = true) {
  useEffect(() => {
    if (!activo) return
    const onTecla = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const destino = e.target as HTMLElement | null
      if (destino && ['INPUT', 'TEXTAREA', 'SELECT'].includes(destino.tagName)) return
      const accion = atajos[e.key.toLowerCase()]
      if (accion) {
        e.preventDefault()
        accion()
      }
    }
    document.addEventListener('keydown', onTecla)
    return () => document.removeEventListener('keydown', onTecla)
  }, [atajos, activo])
}
