/**
 * Área de beneficio: los lotes en proceso y la bodega.
 *
 * Va en una franja de ancho completo y no en una pestaña, porque el jugador
 * tiene que ver al mismo tiempo lo que cosecha y lo que se está fermentando.
 * Esa simultaneidad es el argumento del juego.
 */
import { useAgregados, useDispatch, useEstado } from '../context/GameContext'
import { gradoDe, precioBaba, precioKilo } from '../game/selectors'
import { ventanaAbierta } from '../game/reducer'
import * as K from '../game/constants'
import { kg, num, pesos, porcentaje, segundos } from '../game/format'
import { IconoEtapa, IconoGrano } from './Iconos'

export function PanelBeneficio() {
  const s = useEstado()
  const a = useAgregados()
  const dispatch = useDispatch()
  const verCalidadExacta = (s.mejoras.prueba_corte ?? 0) > 0
  const libres = a.lotesMax - s.lotes.length

  return (
    <section className="beneficio" aria-label="Área de beneficio">
      <div className="beneficio-cabecera">
        <h2>Beneficio</h2>
        <span style={{ fontSize: 12, color: 'var(--texto-tenue)' }}>
          {a.lotesMax === 0
            ? 'Sin cajón de fermentación. Mientras tanto solo puedes vender en baba.'
            : `${s.lotes.length} de ${a.lotesMax} cajones ocupados · capacidad ${num(a.capacidadLote, 0)} granos por cajón · calidad base ${porcentaje(a.calidadBase)}`}
        </span>
        <div className="espaciador" style={{ flex: 1 }} />
        <button
          className="boton"
          disabled={libres <= 0 || s.granoBaba < a.capacidadLote * 0.1}
          onClick={() => dispatch({ tipo: 'CARGAR_CAJON' })}
          title="Cargar un cajón con lo que haya, sin esperar a llenarlo"
        >
          Cargar cajón ahora
        </button>
      </div>

      <div className="lotes">
        {s.lotes.map((l) => {
          const abierta = ventanaAbierta(l)
          const grado = gradoDe(l.calidad)
          const p = Math.min(1, l.t / l.duracion)
          return (
            <article key={l.id} className={`lote ${abierta >= 0 ? 'volteo-abierto' : ''}`}>
              <div className="lote-cabecera">
                <span className="lote-etapa">
                  <IconoEtapa etapa={l.etapa} />
                  {l.etapa === 'fermentacion' ? 'Fermentación' : 'Secado'}
                </span>
                <span className="lote-tiempo">
                  {segundos(l.duracion - l.t)} · día {Math.floor(l.t / K.SEGUNDOS_POR_DIA) + 1} de{' '}
                  {Math.round(l.duracion / K.SEGUNDOS_POR_DIA)}
                </span>
              </div>

              <div className={`barra-progreso ${l.etapa === 'secado' ? 'secado' : ''}`}>
                <span style={{ width: `${p * 100}%` }} />
                {l.etapa === 'fermentacion' && (
                  <div className="marcas-volteo">
                    {K.VENTANAS_VOLTEO.map((v, i) => (
                      <i
                        key={i}
                        className={l.volteos.includes(i) ? 'hecho' : undefined}
                        style={{ left: `${(v / l.duracion) * 100}%` }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="lote-calidad">
                <span className="pastilla" style={{ color: grado.color }}>
                  {grado.nombre}
                </span>
                <span style={{ color: 'var(--texto-tenue)' }}>
                  {verCalidadExacta ? `prueba de corte ${porcentaje(l.calidad)}` : `${l.volteos.length} de 4 volteos`}
                </span>
                <span style={{ marginLeft: 'auto', color: 'var(--texto-tenue)' }}>
                  {num(l.granos, 0)} granos
                </span>
              </div>

              {l.etapa === 'fermentacion' ? (
                <button
                  className={`boton ${abierta >= 0 ? 'primario' : ''}`}
                  disabled={abierta < 0}
                  onClick={() => dispatch({ tipo: 'VOLTEAR', loteId: l.id })}
                  title="Voltear la masa (V)"
                >
                  {abierta >= 0
                    ? `Voltear ahora (+${porcentaje(a.bonoVolteo)} de calidad)`
                    : l.volteos.length >= K.VENTANAS_VOLTEO.length
                      ? 'Volteos completos'
                      : 'Fuera de ventana de volteo'}
                </button>
              ) : (
                <span style={{ fontSize: 12, color: 'var(--texto-tenue)' }}>
                  Sale solo a bodega al terminar. La ausencia no cuesta nada aquí.
                </span>
              )}
            </article>
          )
        })}

        {(libres > 0 || a.lotesMax === 0) && (
          <div className="lote-vacio">
            {a.lotesMax === 0
              ? 'Compra el cajón fermentador de cedro en la línea de Beneficio para abrir esta etapa.'
              : `${libres} ${libres === 1 ? 'cajón libre' : 'cajones libres'}. Se cargan solos al juntar ${num(a.capacidadLote, 0)} granos en baba.`}
          </div>
        )}
      </div>

      <div className="bodega">
        {K.GRADOS.map((g) => {
          const cantidad = s.bodega[g.id] ?? 0
          if (cantidad <= 0) return null
          return (
            <div key={g.id} className="bodega-item">
              <span className="pastilla" style={{ color: g.color }}>
                {g.nombre}
              </span>
              <strong>{kg(cantidad)}</strong>
              <span style={{ color: 'var(--texto-tenue)' }}>a {pesos(precioKilo(s, g.id, a))}/kg</span>
              <button className="boton" onClick={() => dispatch({ tipo: 'VENDER', grado: g.id })}>
                Vender {pesos(cantidad * precioKilo(s, g.id, a))}
              </button>
            </div>
          )
        })}

        <button
          className="boton primario"
          disabled={K.GRADOS.every((g) => (s.bodega[g.id] ?? 0) <= 0)}
          onClick={() => dispatch({ tipo: 'VENDER_TODO' })}
        >
          Vender toda la bodega
        </button>

        <div className="espaciador" style={{ flex: 1 }} />

        <div className="bodega-item" title="Siempre disponible y siempre peor: el intermediario paga el 20%">
          <IconoGrano />
          <span style={{ color: 'var(--texto-tenue)' }}>Vender en baba</span>
          <button
            className="boton peligro"
            disabled={s.granoBaba <= 0}
            onClick={() => dispatch({ tipo: 'VENDER_BABA' })}
          >
            {pesos(s.granoBaba * precioBaba(s, a))} por {num(s.granoBaba, 0)} granos
          </button>
        </div>
      </div>
    </section>
  )
}
