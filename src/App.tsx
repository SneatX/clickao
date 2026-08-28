import { useEffect, useMemo, useState } from 'react'
import type { Categoria } from './game/types'
import { useCarga, useDispatch, useEstado } from './context/GameContext'
import { ventanaAbierta } from './game/reducer'
import { BarraSuperior } from './ui/BarraSuperior'
import { Escena } from './ui/Escena'
import { PanelBeneficio } from './ui/PanelBeneficio'
import { PanelMejoras } from './ui/PanelMejoras'
import { Cuaderno } from './ui/Cuaderno'
import { Avisos } from './ui/Avisos'
import { ModalAjustes, ModalAusencia, ModalFinca } from './ui/Modales'
import { useAtajos } from './hooks/useAtajos'

const CLAVE_BAJO_CONSUMO = 'clickao.bajoConsumo'

export default function App() {
  const s = useEstado()
  const dispatch = useDispatch()
  const { resumen, avisoCarga, cerrarResumen } = useCarga()
  const [cuaderno, setCuaderno] = useState<string | null | false>(false)
  const [finca, setFinca] = useState(false)
  const [ajustes, setAjustes] = useState(false)
  const [linea, setLinea] = useState<Categoria>('herramientas')
  const [bajoConsumo, setBajoConsumo] = useState(() => {
    try {
      return localStorage.getItem(CLAVE_BAJO_CONSUMO) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    document.body.classList.toggle('bajo-consumo', bajoConsumo)
    try {
      localStorage.setItem(CLAVE_BAJO_CONSUMO, bajoConsumo ? '1' : '0')
    } catch {
      /* si el navegador bloquea el almacenamiento, la preferencia vale solo por esta sesión */
    }
  }, [bajoConsumo])

  const bienvenida = resumen !== null || avisoCarga !== null
  const hayModal = cuaderno !== false || finca || ajustes || bienvenida

  const atajos = useMemo(
    () => ({
      c: () => setCuaderno((v) => (v === false ? null : false)),
      v: () => {
        const lote = s.lotes.find((l) => ventanaAbierta(l) >= 0)
        if (lote) dispatch({ tipo: 'VOLTEAR', loteId: lote.id })
      },
      p: () => {
        if (s.focos[0]) dispatch({ tipo: 'PODAR', focoId: s.focos[0].id })
      },
      l: () => dispatch({ tipo: 'CARGAR_CAJON' }),
      s: () => dispatch({ tipo: 'VENDER_TODO' }),
      '1': () => setLinea('herramientas'),
      '2': () => setLinea('cultivo'),
      '3': () => setLinea('beneficio'),
      escape: () => {
        setCuaderno(false)
        setFinca(false)
        setAjustes(false)
        cerrarResumen()
      },
    }),
    [s.lotes, s.focos, dispatch, cerrarResumen],
  )
  useAtajos(atajos)

  return (
    <>
      <div className="app">
        <BarraSuperior
          onCuaderno={() => setCuaderno(null)}
          onFinca={() => setFinca(true)}
          onAjustes={() => setAjustes(true)}
          bajoConsumo={bajoConsumo}
          onBajoConsumo={setBajoConsumo}
        />
        <Escena bajoConsumo={bajoConsumo} />
        <PanelBeneficio />
        <PanelMejoras linea={linea} onLinea={setLinea} onFicha={(id) => setCuaderno(id)} />
      </div>

      <p className="aviso-ancho">
        Clickao está pensado para pantalla de escritorio. Necesita al menos 1100 píxeles de ancho para mostrar la
        finca, el beneficiadero y el panel de mejoras al mismo tiempo.
      </p>

      {!hayModal && <Avisos />}
      {!bienvenida && cuaderno !== false && <Cuaderno abierta={cuaderno} onCerrar={() => setCuaderno(false)} />}
      {!bienvenida && finca && <ModalFinca onCerrar={() => setFinca(false)} />}
      {!bienvenida && ajustes && <ModalAjustes onCerrar={() => setAjustes(false)} />}
      <ModalAusencia />
    </>
  )
}
