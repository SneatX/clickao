/** Ventanas modales: finca, ajustes y el resumen de lo que pasó mientras no estabas. */
import { useEffect, useState } from 'react'
import { useCarga, useDispatch, useEstado } from '../context/GameContext'
import { semillasDisponibles, semillasLibres } from '../game/selectors'
import { MEJORAS_PRESTIGIO } from '../data/mejoras'
import { LOGROS } from '../data/logros'
import { BONO_POR_LOGRO } from '../data/logros'
import { borrar, exportar, importar } from '../persistence/storage'
import { kg, num, pesos, segundos } from '../game/format'
import { AUSENCIA_MAX_SEG } from '../game/constants'

function Modal({
  titulo,
  onCerrar,
  ancho,
  children,
}: {
  titulo: string
  onCerrar: () => void
  ancho?: 'angosto'
  children: React.ReactNode
}) {
  useEffect(() => {
    const onTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCerrar()
      }
    }
    document.addEventListener('keydown', onTecla)
    return () => document.removeEventListener('keydown', onTecla)
  }, [onCerrar])

  return (
    <div className="velo" onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}>
      <div className={`modal ${ancho ?? ''}`} role="dialog" aria-modal="true" aria-label={titulo}>
        <div className="modal-cabecera">
          <h2>{titulo}</h2>
          <button className="boton" onClick={onCerrar}>
            Cerrar (Esc)
          </button>
        </div>
        <div className="modal-cuerpo bloque">{children}</div>
      </div>
    </div>
  )
}

export function ModalFinca({ onCerrar }: { onCerrar: () => void }) {
  const s = useEstado()
  const dispatch = useDispatch()
  const disponibles = semillasDisponibles(s)
  const ganaria = disponibles - s.semillas
  const libres = semillasLibres(s)

  return (
    <Modal titulo="La finca" onCerrar={onCerrar}>
      <h3 style={{ marginTop: 0 }}>Renovación del cacaotal</h3>
      <p style={{ color: 'var(--texto-tenue)' }}>
        Renovar reinicia la finca y convierte los kilos que has vendido en toda tu historia en semillas
        seleccionadas. Cada semilla da un dos por ciento permanente a toda la producción. Es el mismo intercambio
        que hace quien injerta un cacaotal viejo: pierde la cosecha del corto plazo para subir el techo del largo.
      </p>
      <div className="fila separada" style={{ margin: '14px 0 22px' }}>
        <span>
          Historial: <b>{kg(s.stats.kgHistoricos)}</b> · semillas actuales: <b>{num(s.semillas, 0)}</b> · sin
          gastar: <b>{num(libres, 0)}</b>
        </span>
        <button className="boton primario" disabled={ganaria <= 0} onClick={() => dispatch({ tipo: 'RENOVAR' })}>
          {ganaria > 0 ? `Renovar y ganar ${num(ganaria, 0)} semillas` : 'Aún no hay semillas nuevas'}
        </button>
      </div>

      <h3>Jardín clonal heredado</h3>
      <div className="rejilla-logros" style={{ marginBottom: 24 }}>
        {MEJORAS_PRESTIGIO.map((m) => {
          const tiene = !!s.mejorasPrestigio[m.id]
          return (
            <button
              key={m.id}
              className={`logro ${tiene ? '' : 'pendiente'}`}
              style={{ textAlign: 'left' }}
              disabled={tiene || libres < m.costo}
              onClick={() => dispatch({ tipo: 'COMPRAR_PRESTIGIO', id: m.id })}
            >
              <b>{m.nombre}</b>
              {m.descripcion}
              <div style={{ marginTop: 6, color: 'var(--dorado)', fontWeight: 700 }}>
                {tiene ? 'Adquirida' : `${m.costo} ${m.costo === 1 ? 'semilla' : 'semillas'}`}
              </div>
            </button>
          )
        })}
      </div>

      <h3>Estadísticas</h3>
      <table className="tabla-stats" style={{ marginBottom: 24 }}>
        <tbody>
          <tr><td>Mazorcas cosechadas a mano</td><td>{num(s.stats.clics, 0)}</td></tr>
          <tr><td>Granos cosechados a mano</td><td>{num(s.stats.granosCosechados, 0)}</td></tr>
          <tr><td>Granos producidos por el cultivo</td><td>{num(s.stats.granosPasivos, 0)}</td></tr>
          <tr><td>Lotes terminados</td><td>{num(s.stats.lotesTerminados, 0)}</td></tr>
          <tr><td>Lotes finos de aroma</td><td>{num(s.stats.lotesFinos, 0)}</td></tr>
          <tr><td>Volteos acertados</td><td>{num(s.stats.volteosAcertados, 0)}</td></tr>
          <tr><td>Ventanas de volteo perdidas</td><td>{num(s.stats.volteosPerdidos, 0)}</td></tr>
          <tr><td>Podas sanitarias</td><td>{num(s.stats.podas, 0)}</td></tr>
          <tr><td>Mazorcas doradas</td><td>{num(s.stats.doradas, 0)}</td></tr>
          <tr><td>Grano seco producido</td><td>{kg(s.stats.kgProducidos)}</td></tr>
          <tr><td>Grano seco vendido</td><td>{kg(s.stats.kgVendidos)}</td></tr>
          <tr><td>Dinero ganado</td><td>{pesos(s.stats.dineroGanado)}</td></tr>
          <tr><td>Renovaciones</td><td>{num(s.stats.renovaciones, 0)}</td></tr>
          <tr><td>Tiempo jugado</td><td>{segundos(s.stats.tiempoJugado)}</td></tr>
        </tbody>
      </table>

      <h3>
        Logros{' '}
        <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--texto-tenue)' }}>
          {s.logros.length} de {LOGROS.length} · +{Math.round(s.logros.length * BONO_POR_LOGRO * 100)}% a la
          producción
        </span>
      </h3>
      <div className="rejilla-logros">
        {LOGROS.map((l) => {
          const tiene = s.logros.includes(l.id)
          return (
            <div key={l.id} className={`logro ${tiene ? '' : 'pendiente'}`}>
              <b>{tiene ? l.nombre : '???'}</b>
              {l.descripcion}
            </div>
          )
        })}
      </div>
    </Modal>
  )
}

export function ModalAjustes({ onCerrar }: { onCerrar: () => void }) {
  const s = useEstado()
  const dispatch = useDispatch()
  const { guardarYa } = useCarga()
  const [texto, setTexto] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [confirmando, setConfirmando] = useState(false)

  return (
    <Modal titulo="Ajustes y partida" onCerrar={onCerrar} ancho="angosto">
      <p style={{ marginTop: 0, color: 'var(--texto-tenue)' }}>
        La partida se guarda sola cada pocos segundos y también al cerrar la pestaña. Mientras no estás, el cultivo
        sigue produciendo y los lotes siguen su curso, hasta un tope de {Math.round(AUSENCIA_MAX_SEG / 3600)} horas.
      </p>

      <div className="fila" style={{ marginBottom: 20 }}>
        <button className="boton" onClick={() => { guardarYa(); setMensaje('Partida guardada.') }}>
          Guardar ahora
        </button>
        <button
          className="boton"
          onClick={() => {
            navigator.clipboard?.writeText(exportar(s))
            setTexto(exportar(s))
            setMensaje('Partida exportada y copiada al portapapeles.')
          }}
        >
          Exportar partida
        </button>
      </div>

      <label style={{ fontSize: 12, color: 'var(--texto-tenue)' }} htmlFor="campo-partida">
        Texto de la partida. Sirve para respaldar, para pasarla a otro navegador y para depurar.
      </label>
      <textarea
        id="campo-partida"
        className="partida"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="CLICKAO1..."
      />
      <div className="fila" style={{ marginTop: 10 }}>
        <button
          className="boton primario"
          disabled={!texto.trim()}
          onClick={() => {
            const p = importar(texto)
            if (p) {
              dispatch({ tipo: 'CARGAR_PARTIDA', estado: p })
              setMensaje('Partida importada.')
            } else {
              setMensaje('No se pudo leer ese texto. Revisa que esté completo.')
            }
          }}
        >
          Importar
        </button>
        {/* Confirmación en dos pasos dentro de la interfaz. Un confirm() del
            navegador bloquea la pestaña entera mientras está abierto. */}
        <button
          className="boton peligro"
          onClick={() => {
            if (!confirmando) {
              setConfirmando(true)
              return
            }
            borrar()
            dispatch({ tipo: 'REINICIAR' })
            setConfirmando(false)
            setMensaje('Partida borrada. La finca vuelve a empezar.')
          }}
        >
          {confirmando ? 'Confirmar: esto borra todo' : 'Empezar de cero'}
        </button>
        {confirmando && (
          <button className="boton" onClick={() => setConfirmando(false)}>
            Cancelar
          </button>
        )}
      </div>

      {mensaje && <p style={{ color: 'var(--dorado)', marginBottom: 0 }}>{mensaje}</p>}

      <h3>Atajos de teclado</h3>
      <table className="tabla-stats">
        <tbody>
          <tr><td>Cosechar la mazorca enfocada</td><td>Espacio o Enter</td></tr>
          <tr><td>Voltear el lote con ventana abierta</td><td>V</td></tr>
          <tr><td>Poda sanitaria del primer foco</td><td>P</td></tr>
          <tr><td>Cargar un cajón con lo que haya</td><td>L</td></tr>
          <tr><td>Vender toda la bodega</td><td>S</td></tr>
          <tr><td>Cuaderno de finca</td><td>C</td></tr>
          <tr><td>Cambiar de línea de mejoras</td><td>1, 2, 3</td></tr>
          <tr><td>Cerrar cualquier ventana</td><td>Esc</td></tr>
        </tbody>
      </table>
    </Modal>
  )
}

export function ModalAusencia() {
  const { resumen, cerrarResumen, avisoCarga } = useCarga()
  if (!resumen && !avisoCarga) return null

  return (
    <Modal titulo={avisoCarga?.tipo === 'corrupto' ? 'Partida ilegible' : 'Mientras no estabas'} onCerrar={cerrarResumen} ancho="angosto">
      {avisoCarga?.tipo === 'corrupto' && (
        <>
          <p style={{ marginTop: 0 }}>
            La partida guardada no se pudo leer y el respaldo tampoco. Se empezó una nueva. Abajo está el texto
            crudo de lo que había guardado, por si sirve para recuperar algo.
          </p>
          <textarea className="partida" readOnly value={avisoCarga.crudo ?? ''} />
        </>
      )}
      {avisoCarga?.tipo === 'respaldo' && (
        <p style={{ marginTop: 0, color: 'var(--dorado)' }}>
          La partida principal estaba dañada y se recuperó desde el respaldo automático.
        </p>
      )}
      {resumen && (
        <>
          <p style={{ marginTop: 0 }}>
            Estuviste fuera {segundos(resumen.segundos)}
            {resumen.recortado ? `, y se acreditó el tope de ${Math.round(AUSENCIA_MAX_SEG / 3600)} horas` : ''}.
          </p>
          <table className="tabla-stats">
            <tbody>
              <tr><td>Grano en baba producido por el cultivo</td><td>{num(Math.max(0, resumen.baba), 0)}</td></tr>
              <tr><td>Grano seco que salió a bodega</td><td>{kg(resumen.kilos)}</td></tr>
            </tbody>
          </table>
          <p style={{ color: 'var(--texto-tenue)' }}>
            Los lotes que fermentaron sin ti salieron con la calidad que da el proceso solo. Los volteos, que son
            lo que sube un lote a fino de aroma, solo los puede hacer alguien presente. La ausencia no cuesta: la
            presencia bonifica.
          </p>
        </>
      )}
    </Modal>
  )
}
