/**
 * Generador pseudoaleatorio determinista (mulberry32).
 *
 * El reducer no puede llamar a Math.random porque dejaría de ser puro y no se
 * podría simular ni testear. En su lugar recibe una semilla dentro de la acción
 * y crea con ella su propia secuencia.
 */
export function prng(semilla: number): () => number {
  let a = semilla >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Entero en [min, max]. */
export function entre(r: () => number, min: number, max: number): number {
  return min + r() * (max - min)
}
