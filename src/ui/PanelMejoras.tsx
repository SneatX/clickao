/**
 * Panel de mejoras: tres líneas que no se solapan.
 *
 * Herramientas cambia lo que pasa en el árbol al hacer clic. Cultivo cambia la
 * corriente pasiva. Beneficio cambia capacidad, calidad y precio. Si una mejora
 * nueva no cae limpiamente en una sola, no es una mejora.
 */
import { useMemo } from 'react'
import type { Categoria } from '../game/types'
import { useDispatch, useEstado } from '../context/GameContext'
import { mejorasVisibles } from '../game/selectors'
import { num, pesos } from '../game/format'
import { IconoMejora } from './IconosMejora'

const LINEAS: { id: Categoria; nombre: string; explicacion: string }[] = [
  {
    id: 'herramientas',
    nombre: 'Herramientas',
    explicacion:
      'Todo lo que ocurre en el árbol al cortar: cuánto rinde cada mazorca, cuántas cuelgan y qué tan ancha es la ventana en la que reconoces el punto.',
  },
  {
    id: 'cultivo',
    nombre: 'Cultivo',
    explicacion:
      'La producción que sigue corriendo cuando no estás. Sombrío, clones, fertilización y mano de obra, más lo que reduce la presión de las enfermedades.',
  },
  {
    id: 'beneficio',
    nombre: 'Beneficio',
    explicacion:
      'Capacidad de los cajones, cuántos lotes corren en paralelo y hasta dónde puede llegar la calidad. Es la línea que decide el precio de cada kilo.',
  },
]

interface Props {
  onFicha: (id: string) => void
  linea: Categoria
  onLinea: (c: Categoria) => void
}

export function PanelMejoras({ onFicha, linea, onLinea }: Props) {
  const s = useEstado()
  const dispatch = useDispatch()

  const visibles = useMemo(() => mejorasVisibles(s), [s])
  const porLinea = useMemo(() => {
    const m: Record<Categoria, typeof visibles> = { herramientas: [], cultivo: [], beneficio: [] }
    for (const v of visibles) m[v.mejora.categoria].push(v)
    for (const k of Object.keys(m) as Categoria[]) m[k].sort((a, b) => a.costo - b.costo)
    return m
  }, [visibles])

  const activa = LINEAS.find((l) => l.id === linea)!

  return (
    <aside className="mejoras" aria-label="Mejoras">
      <div className="pestanas" role="tablist">
        {LINEAS.map((l, i) => {
          const disponibles = porLinea[l.id].filter((v) => v.alcanzable).length
          return (
            <button
              key={l.id}
              role="tab"
              className="pestana"
              data-linea={l.id}
              aria-selected={linea === l.id}
              onClick={() => onLinea(l.id)}
              title={`${l.nombre} (tecla ${i + 1})`}
            >
              {l.nombre}
              <span className={`conteo ${disponibles > 0 ? 'hay' : ''}`}>
                {disponibles > 0 ? `${disponibles} al alcance` : `${porLinea[l.id].length} en lista`}
              </span>
            </button>
          )
        })}
      </div>

      <p className="explicacion-linea">{activa.explicacion}</p>

      <div className="lista-mejoras" data-linea={linea} role="tabpanel">
        {porLinea[linea].length === 0 && (
          <p style={{ padding: 16, color: 'var(--texto-tenue)', fontSize: 13, lineHeight: 1.5 }}>
            Todavía no hay nada de esta línea a tu alcance. Sigue cosechando y vendiendo: las mejoras aparecen a
            medida que el bolsillo se acerca a su precio.
          </p>
        )}

        {porLinea[linea].map(({ mejora, nivel, costo, alcanzable }) => (
          <div key={mejora.id} className="mejora">
            <button
              className="mejora-comprar"
              disabled={!alcanzable}
              onClick={() => dispatch({ tipo: 'COMPRAR', mejoraId: mejora.id })}
              title={alcanzable ? `Comprar por ${pesos(costo)}` : `Te faltan ${pesos(costo - s.dinero)}`}
            >
              <span className="icono">
                <IconoMejora id={mejora.id} categoria={mejora.categoria} />
              </span>
              <span className="nombre">{mejora.nombre}</span>
              <span className="costo">{pesos(costo)}</span>
              <span className="desc">{mejora.descripcion}</span>
            </button>
            <div className="mejora-pie">
              {nivel > 0 && (
                <span className="nivel">
                  {mejora.maxNivel === Infinity ? `x${num(nivel, 0)}` : `nivel ${nivel}`}
                  {mejora.maxNivel !== 1 && mejora.maxNivel !== Infinity ? ` de ${mejora.maxNivel}` : ''}
                </span>
              )}
              {mejora.fichaId && (
                <button className="enlace-ficha" onClick={() => onFicha(mejora.fichaId!)}>
                  Ver ficha
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
