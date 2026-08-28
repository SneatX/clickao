/** Barra de recursos persistente. Siempre visible, siempre con unidades. */
import { useAgregados, useEstado } from '../context/GameContext'
import { produccionPasiva, produccionPasivaNominal } from '../game/selectors'
import { kg, num, pesos } from '../game/format'
import { GRADOS } from '../game/constants'

interface Props {
  onCuaderno: () => void
  onFinca: () => void
  onAjustes: () => void
  bajoConsumo: boolean
  onBajoConsumo: (v: boolean) => void
}

export function BarraSuperior({ onCuaderno, onFinca, onAjustes, bajoConsumo, onBajoConsumo }: Props) {
  const s = useEstado()
  const a = useAgregados()
  const pps = produccionPasiva(s, a)
  const nominal = produccionPasivaNominal(s, a)
  const enBodega = GRADOS.reduce((t, g) => t + (s.bodega[g.id] ?? 0), 0)
  const fichasNuevas = s.fichasDesbloqueadas.filter((f) => !s.fichasLeidas.includes(f)).length

  return (
    <header className="barra">
      <div className="recurso">
        <span className="etiqueta">Grano en baba</span>
        <span className="valor">{num(s.granoBaba, 0)}</span>
        <span className="pie">
          {num(pps, 1)} por segundo
          {pps < nominal ? ` (nominal ${num(nominal, 1)})` : ''}
        </span>
      </div>
      <div className="recurso">
        <span className="etiqueta">Grano seco en bodega</span>
        <span className="valor">{kg(enBodega)}</span>
        <span className="pie">{s.lotes.length} en proceso</span>
      </div>
      <div className="recurso destacado">
        <span className="etiqueta">Dinero</span>
        <span className="valor">{pesos(s.dinero)}</span>
        <span className="pie">{kg(s.stats.kgVendidos)} vendidos</span>
      </div>
      {s.semillas > 0 && (
        <div className="recurso">
          <span className="etiqueta">Semillas seleccionadas</span>
          <span className="valor">{num(s.semillas, 0)}</span>
          <span className="pie">+{Math.round(s.semillas * 2)}% a toda la producción</span>
        </div>
      )}
      <div className="espaciador" />
      <div className="barra-acciones">
        <label className="fila" style={{ fontSize: 12, gap: 6 }}>
          <input
            type="checkbox"
            checked={bajoConsumo}
            onChange={(e) => onBajoConsumo(e.target.checked)}
          />
          Bajo consumo
        </label>
        <button className="boton" onClick={onFinca} title="Estadísticas y logros">
          Finca
        </button>
        <button className="boton" onClick={onAjustes} title="Guardado, exportar e importar">
          Ajustes
        </button>
        <button className="boton primario" onClick={onCuaderno} title="Cuaderno de finca (C)">
          Cuaderno{fichasNuevas > 0 ? ` · ${fichasNuevas} nuevas` : ''}
        </button>
      </div>
    </header>
  )
}
