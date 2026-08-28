/**
 * Formateo de números. Aislado en un solo archivo a propósito: el día que haga
 * falta cambiar el número nativo por una librería de precisión arbitraria, se
 * cambia aquí y no en doscientos sitios.
 */
const SUFIJOS = ['', ' mil', ' M', ' MM', ' B', ' MB', ' MMB', ' Tr', ' MTr']

export function num(n: number, decimales = 1): string {
  if (!isFinite(n)) return '∞'
  if (n < 0) return '-' + num(-n, decimales)
  if (n < 1000) return n < 10 && n % 1 !== 0 ? n.toFixed(decimales) : Math.floor(n).toLocaleString('es-CO')
  let i = 0
  let v = n
  while (v >= 1000 && i < SUFIJOS.length - 1) {
    v /= 1000
    i++
  }
  const s = v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2)
  return s.replace('.', ',') + SUFIJOS[i]
}

export function pesos(n: number): string {
  return '$' + num(n, 0)
}

export function kg(n: number): string {
  if (n >= 1000) return num(n / 1000, 2) + ' t'
  if (n < 10) return n.toFixed(2).replace('.', ',') + ' kg'
  return num(n, 1) + ' kg'
}

export function segundos(n: number): string {
  const s = Math.max(0, Math.ceil(n))
  if (s < 60) return `${s} s`
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

export function porcentaje(n: number): string {
  return (n * 100).toFixed(0) + '%'
}

/** Días de finca que representa una duración del juego. Para el cuaderno. */
export function dias(seg: number, segundosPorDia: number): string {
  const d = seg / segundosPorDia
  return d === 1 ? '1 día' : `${d % 1 === 0 ? d : d.toFixed(1).replace('.', ',')} días`
}
