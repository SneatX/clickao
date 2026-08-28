/**
 * Avisos efímeros. Se duplican en una región aria-live para que lo que ocurre
 * en la finca llegue también a quien no está mirando la escena.
 */
import { useEstado } from '../context/GameContext'

export function Avisos() {
  const s = useEstado()
  return (
    <>
      <div className="avisos">
        {s.avisos.slice(-3).map((v) => (
          <div key={v.id} className={`aviso ${v.tono}`}>
            {v.texto}
          </div>
        ))}
      </div>
      <div className="solo-lectores" aria-live="polite" role="status">
        {s.avisos.slice(-1).map((v) => (
          <p key={v.id}>{v.texto}</p>
        ))}
      </div>
    </>
  )
}
