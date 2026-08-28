/**
 * Partículas de grano y números flotantes.
 *
 * Deliberadamente fuera de React: son un solo canvas superpuesto con un sistema
 * de partículas propio y objetos reutilizados. Cien elementos de React animados
 * a sesenta cuadros por segundo se notan en el perfilador; cien partículas
 * dibujadas en un canvas no.
 *
 * Los números se agregan: ocho clics en un segundo no sacan ocho números, sacan
 * uno que suma y crece. Además de rendir mejor, se lee mejor.
 */
import { useEffect, useRef } from 'react'

export interface EventoParticula {
  /** Coordenadas de viewport: el lienzo las convierte a las suyas. */
  clientX: number
  clientY: number
  cantidad: number
  color?: string
  granos?: number
}

type Escucha = (e: EventoParticula) => void
const escuchas = new Set<Escucha>()

export function emitirCosecha(e: EventoParticula) {
  for (const f of escuchas) f(e)
}

interface Grano {
  vivo: boolean
  x: number
  y: number
  vx: number
  vy: number
  vida: number
  color: string
}

interface Numero {
  vivo: boolean
  x: number
  y: number
  valor: number
  vida: number
  color: string
}

const MAX_GRANOS = 220
const MAX_NUMEROS = 14
const VIDA_GRANO = 0.9
const VIDA_NUMERO = 1.1

export function Particulas({ activo = true }: { activo?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const lienzo = ref.current
    if (!lienzo || !activo) return
    const ctx = lienzo.getContext('2d')
    if (!ctx) return

    const granos: Grano[] = Array.from({ length: MAX_GRANOS }, () => ({
      vivo: false, x: 0, y: 0, vx: 0, vy: 0, vida: 0, color: '#8b5e34',
    }))
    const numeros: Numero[] = Array.from({ length: MAX_NUMEROS }, () => ({
      vivo: false, x: 0, y: 0, valor: 0, vida: 0, color: '#2a2418',
    }))

    const ajustar = () => {
      const r = lienzo.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      lienzo.width = Math.round(r.width * dpr)
      lienzo.height = Math.round(r.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    ajustar()
    const ro = new ResizeObserver(ajustar)
    ro.observe(lienzo)

    const alCosechar = (e: EventoParticula) => {
      const rect = lienzo.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Agrega el número si ya hay uno reciente cerca, en vez de apilar otro.
      const cerca = numeros.find(
        (n) => n.vivo && n.vida > VIDA_NUMERO * 0.45 && Math.hypot(n.x - x, n.y - y) < 70,
      )
      if (cerca) {
        cerca.valor += e.cantidad
        cerca.vida = VIDA_NUMERO
      } else {
        const libre = numeros.find((n) => !n.vivo) ?? numeros[0]
        libre.vivo = true
        libre.x = x
        libre.y = y
        libre.valor = e.cantidad
        libre.vida = VIDA_NUMERO
        libre.color = e.color ?? '#2a2418'
      }

      const cuantos = Math.min(e.granos ?? 10, 18)
      let puestos = 0
      for (const g of granos) {
        if (puestos >= cuantos) break
        if (g.vivo) continue
        g.vivo = true
        g.x = x
        g.y = y
        const ang = Math.random() * Math.PI * 2
        const vel = 60 + Math.random() * 120
        g.vx = Math.cos(ang) * vel
        g.vy = Math.sin(ang) * vel - 60
        g.vida = VIDA_GRANO
        g.color = Math.random() < 0.5 ? '#8b5e34' : '#a9743f'
        puestos++
      }
    }
    escuchas.add(alCosechar)

    let frame = 0
    let anterior = performance.now()
    const dibujar = (ahora: number) => {
      const dt = Math.min((ahora - anterior) / 1000, 0.05)
      anterior = ahora
      const r = lienzo.getBoundingClientRect()
      ctx.clearRect(0, 0, r.width, r.height)

      for (const g of granos) {
        if (!g.vivo) continue
        g.vida -= dt
        if (g.vida <= 0) {
          g.vivo = false
          continue
        }
        g.vy += 520 * dt
        g.x += g.vx * dt
        g.y += g.vy * dt
        ctx.globalAlpha = Math.min(1, g.vida / VIDA_GRANO)
        ctx.fillStyle = g.color
        ctx.beginPath()
        ctx.ellipse(g.x, g.y, 3.2, 4.4, 0, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.textAlign = 'center'
      for (const n of numeros) {
        if (!n.vivo) continue
        n.vida -= dt
        if (n.vida <= 0) {
          n.vivo = false
          continue
        }
        const p = 1 - n.vida / VIDA_NUMERO
        ctx.globalAlpha = Math.min(1, n.vida / (VIDA_NUMERO * 0.6))
        const tam = 15 + Math.min(9, Math.log10(Math.max(1, n.valor)) * 3)
        ctx.font = `700 ${tam}px "Segoe UI", system-ui, sans-serif`
        ctx.lineWidth = 3
        ctx.strokeStyle = 'rgba(255,255,255,0.85)'
        const texto = `+${Math.round(n.valor).toLocaleString('es-CO')}`
        ctx.strokeText(texto, n.x, n.y - 18 - p * 46)
        ctx.fillStyle = n.color
        ctx.fillText(texto, n.x, n.y - 18 - p * 46)
      }
      ctx.globalAlpha = 1
      frame = requestAnimationFrame(dibujar)
    }
    frame = requestAnimationFrame(dibujar)

    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
      escuchas.delete(alCosechar)
    }
  }, [activo])

  return <canvas ref={ref} className="lienzo-particulas" aria-hidden="true" />
}
