/**
 * Cuaderno de finca. Ventana modal con índice por categorías y marcas de leído.
 * Cada elemento que el jugador desbloquea archiva aquí su ficha.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { CATEGORIAS_FICHA, FICHAS, FICHAS_POR_ID } from '../data/fichas'
import { useDispatch, useEstado } from '../context/GameContext'

export function Cuaderno({ abierta, onCerrar }: { abierta: string | null; onCerrar: () => void }) {
  const s = useEstado()
  const dispatch = useDispatch()
  const [elegida, setElegida] = useState<string | null>(abierta)
  const contenedor = useRef<HTMLDivElement>(null)

  const disponibles = useMemo(
    () => FICHAS.filter((f) => s.fichasDesbloqueadas.includes(f.id)),
    [s.fichasDesbloqueadas],
  )

  /**
   * La ficha visible se deriva, no se sincroniza con un efecto. Antes se
   * reponía desde un useEffect y, como el estado del juego cambia diez veces
   * por segundo, el cuaderno se devolvía solo a la primera ficha en cuanto uno
   * abría otra.
   */
  const sel =
    elegida && s.fichasDesbloqueadas.includes(elegida) ? elegida : (disponibles[0]?.id ?? null)

  // Al abrir el cuaderno desde una mejora concreta, se muestra esa ficha.
  useEffect(() => {
    if (abierta) setElegida(abierta)
  }, [abierta])

  useEffect(() => {
    if (sel && !s.fichasLeidas.includes(sel)) dispatch({ tipo: 'LEER_FICHA', fichaId: sel })
  }, [sel, s.fichasLeidas, dispatch])

  useEffect(() => {
    contenedor.current?.focus()
  }, [])

  const ficha = sel ? FICHAS_POR_ID[sel] : null

  return (
    <div className="velo" onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Cuaderno de finca" ref={contenedor} tabIndex={-1}>
        <div className="modal-cabecera">
          <h2>Cuaderno de finca</h2>
          <span style={{ fontSize: 12, color: 'var(--texto-tenue)' }}>
            {disponibles.length} de {FICHAS.length} fichas archivadas
          </span>
          <button className="boton" onClick={onCerrar}>
            Cerrar (Esc)
          </button>
        </div>

        <div className="modal-cuerpo">
          <nav className="indice-cuaderno" aria-label="Índice del cuaderno">
            {CATEGORIAS_FICHA.map((c) => {
              const items = disponibles.filter((f) => f.categoria === c.id)
              if (!items.length) return null
              return (
                <div key={c.id}>
                  <h3>{c.nombre}</h3>
                  {items.map((f) => (
                    <button
                      key={f.id}
                      className="indice-item"
                      aria-current={sel === f.id}
                      onClick={() => setElegida(f.id)}
                    >
                      <span className={`punto-nuevo ${s.fichasLeidas.includes(f.id) ? 'leido' : ''}`} />
                      {f.titulo}
                    </button>
                  ))}
                </div>
              )
            })}
            {disponibles.length === 0 && (
              <p style={{ padding: 12, fontSize: 13, color: 'var(--texto-tenue)', lineHeight: 1.5 }}>
                El cuaderno se llena solo: cada mejora que compras y cada cosa que te pasa en la finca archiva su
                ficha aquí.
              </p>
            )}
          </nav>

          {ficha && (
            <article className="ficha">
              <h3>{ficha.titulo}</h3>
              <p className="categoria">{CATEGORIAS_FICHA.find((c) => c.id === ficha.categoria)?.nombre}</p>

              <section>
                <h4>Qué es</h4>
                <p>{ficha.queEs}</p>
              </section>
              <section>
                <h4>Cómo se usa</h4>
                <p>{ficha.comoSeUsa}</p>
              </section>
              <section>
                <h4>Por qué importa</h4>
                <p>{ficha.porQueImporta}</p>
              </section>
              {ficha.enElJuego && (
                <section className="en-el-juego">
                  <h4>En el juego</h4>
                  <p>{ficha.enElJuego}</p>
                </section>
              )}
              {ficha.fuente && <p className="fuente">Fuente: {ficha.fuente}</p>}
            </article>
          )}
        </div>
      </div>
    </div>
  )
}
