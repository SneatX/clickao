/**
 * Iconos de las mejoras. Vectorial plano, misma paleta que la escena, lienzo de
 * 24 x 24. Cada mejora nombrada tiene el suyo; las escalas procedimentales y lo
 * que no esté en la lista caen al icono de su categoría.
 */
import type { JSX } from 'react'
import type { Categoria } from '../game/types'

const MADERA = '#a9743f'
const MADERA_OSC = '#7a4f28'
const VERDE = '#6e9c5a'
const VERDE_OSC = '#3f6b3f'
const DORADO = '#f2c14e'
const METAL = '#c9cdd2'
const METAL_OSC = '#8f979e'
const FRIO = '#5b6e7a'
const GRANO = '#8b5e34'

function Ico({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" focusable="false">
      {children}
    </svg>
  )
}

/* --------------------------- Herramientas --------------------------- */

const machete = (
  <Ico>
    <path d="M3 18 L14 5 c2 -2 4 -1 4 1 L8 20 z" fill={METAL} stroke={METAL_OSC} strokeWidth="1.1" />
    <path d="M8 20 L4 21 L3 18 z" fill={MADERA} stroke={MADERA_OSC} strokeWidth="1.1" />
    <path d="M13 7 L17 10" stroke="#fff" strokeWidth="1.2" opacity="0.7" />
  </Ico>
)

const podadoraGancho = (
  <Ico>
    <path d="M6 22 L15 8" stroke={MADERA} strokeWidth="2.4" strokeLinecap="round" />
    <path d="M15 8 a5 5 0 1 0 5 3" fill="none" stroke={METAL} strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="15" cy="8" r="1.4" fill={METAL_OSC} />
  </Ico>
)

const canasto = (
  <Ico>
    <path d="M4 10 h16 l-2 10 H6 z" fill={MADERA} stroke={MADERA_OSC} strokeWidth="1.2" />
    <path d="M6 13 h12 M7 16.5 h10" stroke={MADERA_OSC} strokeWidth="1" />
    <path d="M8 10 a4 3 0 0 1 8 0" fill="none" stroke={MADERA_OSC} strokeWidth="1.4" />
    <ellipse cx="10" cy="8" rx="2" ry="2.6" fill={DORADO} />
    <ellipse cx="14" cy="8.5" rx="1.8" ry="2.3" fill="#e07a1f" />
  </Ico>
)

const tijeraAltura = (
  <Ico>
    <path d="M6 22 L12 12" stroke={MADERA} strokeWidth="2.4" strokeLinecap="round" />
    <path d="M12 12 L19 4 M12 12 L18 9" stroke={METAL} strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="12" r="1.6" fill={METAL_OSC} />
  </Ico>
)

const cuadrilla = (
  <Ico>
    {[4, 12, 20].map((x, i) => (
      <g key={x} transform={`translate(${x - 12} ${i === 1 ? -1 : 0})`}>
        <path d="M8 8 h8" stroke={DORADO} strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="7" r="2.2" fill={GRANO} />
        <path d="M12 10 v6 M9 20 l3 -4 l3 4" stroke={VERDE_OSC} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </g>
    ))}
  </Ico>
)

const recorrido = (
  <Ico>
    <path d="M4 20 C8 16 6 12 10 10 C14 8 13 5 18 4" fill="none" stroke={MADERA} strokeWidth="2" strokeDasharray="3 2.4" strokeLinecap="round" />
    <circle cx="4" cy="20" r="2" fill={VERDE_OSC} />
    <circle cx="18" cy="4" r="2" fill={DORADO} />
  </Ico>
)

const ojo = (
  <Ico>
    <path d="M2 12 c4 -6 16 -6 20 0 c-4 6 -16 6 -20 0 z" fill="#fff" stroke={MADERA_OSC} strokeWidth="1.2" />
    <circle cx="12" cy="12" r="3.4" fill={VERDE_OSC} />
    <circle cx="12" cy="12" r="1.4" fill="#1b3a2f" />
  </Ico>
)

const marcado = (
  <Ico>
    <path d="M4 4 h9 l7 8 l-7 8 H4 z" fill={DORADO} stroke="#c99b2b" strokeWidth="1.2" />
    <path d="M7 12 l2.4 2.6 L14 9" stroke="#2a2418" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Ico>
)

const escalonada = (
  <Ico>
    <rect x="3" y="15" width="5" height="6" rx="1" fill={VERDE_OSC} />
    <rect x="9.5" y="10" width="5" height="11" rx="1" fill={VERDE} />
    <rect x="16" y="5" width="5" height="16" rx="1" fill={DORADO} />
  </Ico>
)

/* ------------------------------ Cultivo ------------------------------ */

const jornalero = (
  <Ico>
    <path d="M6 8 h12" stroke={DORADO} strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="12" cy="6.6" r="2.4" fill={GRANO} />
    <path d="M12 10 v6 M8 21 l4 -5 l4 5" stroke={VERDE_OSC} strokeWidth="2.2" strokeLinecap="round" fill="none" />
    <path d="M12 12 h5" stroke={MADERA} strokeWidth="1.8" strokeLinecap="round" />
  </Ico>
)

const platano = (
  <Ico>
    <path d="M12 22 V9" stroke={VERDE_OSC} strokeWidth="2.4" strokeLinecap="round" />
    <path d="M12 10 q-8 -3 -10 3 q6 0 10 -1 z" fill={VERDE} />
    <path d="M12 10 q8 -3 10 3 q-6 0 -10 -1 z" fill={VERDE} />
    <path d="M12 9 q-5 -5 -2 -8 q3 3 2 8 z" fill={VERDE_OSC} />
    <path d="M12 9 q5 -5 2 -8 q-3 3 -2 8 z" fill={VERDE_OSC} />
    <path d="M13 13 q4 1 3.6 5 q-3 -0.6 -3.6 -5 z" fill={DORADO} />
  </Ico>
)

const arbolAlto = (
  <Ico>
    <path d="M12 22 V12" stroke={MADERA_OSC} strokeWidth="2.4" strokeLinecap="round" />
    <ellipse cx="12" cy="9" rx="9" ry="5" fill={VERDE_OSC} />
    <ellipse cx="9" cy="6" rx="6" ry="3.6" fill={VERDE} />
    <ellipse cx="15" cy="6.6" rx="5" ry="3.2" fill={VERDE} />
  </Ico>
)

const injerto = (
  <Ico>
    <path d="M12 22 V13" stroke={MADERA_OSC} strokeWidth="2.6" strokeLinecap="round" />
    <path d="M12 13 L7 6" stroke={VERDE_OSC} strokeWidth="2.2" strokeLinecap="round" />
    <path d="M12 13 L17 5" stroke={VERDE} strokeWidth="2.2" strokeLinecap="round" />
    <rect x="8.4" y="11" width="7.2" height="4" rx="1.6" fill={DORADO} stroke="#c99b2b" strokeWidth="1" />
    <path d="M6.6 5.4 q-3 -1 -3.6 2 q2.6 0.4 3.6 -2 z" fill={VERDE_OSC} />
    <path d="M17.4 4.6 q3 -1 3.6 2 q-2.6 0.4 -3.6 -2 z" fill={VERDE} />
  </Ico>
)

const fertilizacion = (
  <Ico>
    <path d="M6 9 h12 l-1.4 12 H7.4 z" fill={MADERA} stroke={MADERA_OSC} strokeWidth="1.2" />
    <path d="M6 9 q3 -3 6 -3 q3 0 6 3" fill="none" stroke={MADERA_OSC} strokeWidth="1.4" />
    <circle cx="10" cy="14" r="1.2" fill={DORADO} />
    <circle cx="14" cy="16" r="1.2" fill={DORADO} />
    <circle cx="12" cy="19" r="1.2" fill={DORADO} />
    <path d="M4 5 l1.6 1.6 M20 5 l-1.6 1.6" stroke={VERDE} strokeWidth="1.6" strokeLinecap="round" />
  </Ico>
)

const tijerasPoda = (
  <Ico>
    <path d="M5 4 L14 15 M19 4 L10 15" stroke={METAL} strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="9" cy="19" r="3" fill="none" stroke={MADERA} strokeWidth="2.2" />
    <circle cx="16" cy="19" r="3" fill="none" stroke={MADERA} strokeWidth="2.2" />
  </Ico>
)

const agua = (
  <Ico>
    <path d="M12 3 c4 6 6 8 6 11 a6 6 0 0 1 -12 0 c0 -3 2 -5 6 -11 z" fill="#6fa9c4" stroke="#3f7a94" strokeWidth="1.2" />
    <path d="M10 13 c-1 2 -0.4 4 1.4 5" fill="none" stroke="#fff" strokeWidth="1.4" opacity="0.7" strokeLinecap="round" />
  </Ico>
)

const vivero = (
  <Ico>
    <path d="M4 15 h16 l-1.6 6 H5.6 z" fill={MADERA} stroke={MADERA_OSC} strokeWidth="1.2" />
    <path d="M8 15 V10 M12 15 V7 M16 15 V11" stroke={VERDE_OSC} strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="8" cy="9" r="2" fill={VERDE} />
    <circle cx="12" cy="6" r="2.4" fill={VERDE} />
    <circle cx="16" cy="10" r="2" fill={VERDE} />
  </Ico>
)

const hectareas = (
  <Ico>
    <path d="M2 16 L12 10 L22 16 L12 22 z" fill={VERDE_OSC} />
    <path d="M2 16 L12 10 L22 16" fill="none" stroke={VERDE} strokeWidth="1.2" />
    <path d="M6 13.6 L16 19.4 M10 11.2 L20 17" stroke={VERDE} strokeWidth="1.1" />
    <path d="M12 9 V4" stroke={MADERA_OSC} strokeWidth="2" strokeLinecap="round" />
    <ellipse cx="12" cy="4" rx="4" ry="2.6" fill={VERDE} />
  </Ico>
)

const asociacion = (
  <Ico>
    <circle cx="7" cy="7" r="2.6" fill={GRANO} />
    <circle cx="17" cy="7" r="2.6" fill={GRANO} />
    <path d="M2.4 18 c0 -3.4 2 -5.4 4.6 -5.4 s4.6 2 4.6 5.4 z" fill={VERDE_OSC} />
    <path d="M12.4 18 c0 -3.4 2 -5.4 4.6 -5.4 s4.6 2 4.6 5.4 z" fill={VERDE} />
    <path d="M6 21 h12" stroke={DORADO} strokeWidth="2.2" strokeLinecap="round" />
  </Ico>
)

const cacaotal = (
  <Ico>
    {[5, 12, 19].map((x, i) => (
      <g key={x}>
        <path d={`M${x} 21 V${14 - i * 1.2}`} stroke={MADERA_OSC} strokeWidth="1.8" strokeLinecap="round" />
        <ellipse cx={x} cy={12 - i * 1.4} rx="4.2" ry="3.2" fill={i === 1 ? VERDE : VERDE_OSC} />
      </g>
    ))}
  </Ico>
)

const refuerzo = (
  <Ico>
    <circle cx="12" cy="12" r="9.4" fill={DORADO} stroke="#c99b2b" strokeWidth="1.2" />
    <path d="M12 6.6 L18 13 h-3.4 v4.6 h-5.2 V13 H6 z" fill="#2a2418" />
  </Ico>
)

const escudoHoja = (
  <Ico>
    <path d="M12 2.6 L20 5.4 v6 c0 5 -3.6 8.4 -8 10 c-4.4 -1.6 -8 -5 -8 -10 v-6 z" fill={VERDE_OSC} stroke={VERDE} strokeWidth="1.2" />
    <path d="M12 8 c4 0 5 3 5 5 c-4 0.6 -5.6 -1.4 -5 -5 z" fill={DORADO} />
    <path d="M12 17 c0 -4 0 -6 0 -9" stroke={DORADO} strokeWidth="1.2" />
  </Ico>
)

const calendarioTijeras = (
  <Ico>
    <rect x="3" y="5" width="18" height="16" rx="2" fill="#f5efe0" stroke={MADERA_OSC} strokeWidth="1.2" />
    <path d="M3 9 h18" stroke={MADERA_OSC} strokeWidth="1.2" />
    <path d="M7 3 v4 M17 3 v4" stroke={MADERA} strokeWidth="2" strokeLinecap="round" />
    <path d="M8 12 L14 19 M14 12 L8 19" stroke={FRIO} strokeWidth="1.8" strokeLinecap="round" />
  </Ico>
)

const compost = (
  <Ico>
    <path d="M3 20 q9 -7 18 0 z" fill={MADERA_OSC} />
    <path d="M5 20 q7 -5 14 0" fill={MADERA} />
    <path d="M12 12 q-5 -1 -5 -5 q5 0 5 5 z" fill={VERDE_OSC} />
    <path d="M12 12 q5 -2 5 -6 q-5 1 -5 6 z" fill={VERDE} />
    <path d="M12 13 V8" stroke={VERDE_OSC} strokeWidth="1.4" />
  </Ico>
)

/* ----------------------------- Beneficio ----------------------------- */

const cajon = (
  <Ico>
    <path d="M3 7 h18 v12 H3 z" fill={MADERA} stroke={MADERA_OSC} strokeWidth="1.3" />
    <path d="M3 11 h18 M3 15 h18 M9 7 v12 M15 7 v12" stroke={MADERA_OSC} strokeWidth="1" />
    <path d="M6 6 q1 -3 2 0 M11 6 q1 -3.4 2 0 M16 6 q1 -3 2 0" fill="none" stroke="#c3bda9" strokeWidth="1.3" strokeLinecap="round" />
  </Ico>
)

const cajonesEscalera = (
  <Ico>
    <path d="M2 12 h7 v8 H2 z" fill={MADERA} stroke={MADERA_OSC} strokeWidth="1.2" />
    <path d="M8.5 9 h7 v11 h-7 z" fill={MADERA} stroke={MADERA_OSC} strokeWidth="1.2" />
    <path d="M15 6 h7 v14 h-7 z" fill={MADERA} stroke={MADERA_OSC} strokeWidth="1.2" />
    <path d="M4 16 h3 M10.5 13 h3 M17 10 h3" stroke={MADERA_OSC} strokeWidth="1" />
  </Ico>
)

const bateria = (
  <Ico>
    <path d="M2 9 h6 v11 H2 z M9 9 h6 v11 H9 z M16 9 h6 v11 h-6 z" fill={MADERA} stroke={MADERA_OSC} strokeWidth="1.2" />
    <path d="M2 13 h20" stroke={MADERA_OSC} strokeWidth="1" />
    <path d="M4 7.6 q1 -2.6 2 0 M11 7.6 q1 -2.6 2 0 M18 7.6 q1 -2.6 2 0" fill="none" stroke="#c3bda9" strokeWidth="1.2" strokeLinecap="round" />
  </Ico>
)

const cajonModular = (
  <Ico>
    <path d="M3 8 h18 v11 H3 z" fill={MADERA} stroke={MADERA_OSC} strokeWidth="1.3" />
    <path d="M3 8 L12 3 L21 8" fill={MADERA_OSC} />
    <path d="M7 8 v11 M12 8 v11 M17 8 v11" stroke={MADERA_OSC} strokeWidth="1.1" />
    <circle cx="12" cy="13.5" r="2.2" fill={DORADO} />
  </Ico>
)

const ampliacion = (
  <Ico>
    <path d="M6 9 h12 v10 H6 z" fill={MADERA} stroke={MADERA_OSC} strokeWidth="1.3" />
    <path d="M6 13 h12" stroke={MADERA_OSC} strokeWidth="1" />
    <path d="M4 6 H2 v3 M20 6 h2 v3 M4 21 H2 v-3 M20 21 h2 v-3" fill="none" stroke={DORADO} strokeWidth="1.8" strokeLinecap="round" />
  </Ico>
)

const marquesina = (
  <Ico>
    <path d="M2 10 L12 4 L22 10" fill="none" stroke={MADERA_OSC} strokeWidth="2" strokeLinejoin="round" />
    <path d="M4 10 h16 v2 H4 z" fill="#cfe3ee" stroke={MADERA_OSC} strokeWidth="1" />
    <path d="M5 20 h14" stroke={MADERA} strokeWidth="2" strokeLinecap="round" />
    <ellipse cx="8" cy="17" rx="1.8" ry="2.2" fill={GRANO} />
    <ellipse cx="12" cy="17.4" rx="1.8" ry="2.2" fill={GRANO} />
    <ellipse cx="16" cy="17" rx="1.8" ry="2.2" fill={GRANO} />
  </Ico>
)

const pala = (
  <Ico>
    <path d="M11 3 h2 v11 h-2 z" fill={MADERA} stroke={MADERA_OSC} strokeWidth="1" />
    <path d="M7 14 h10 l-1.4 7 h-7.2 z" fill={MADERA} stroke={MADERA_OSC} strokeWidth="1.2" />
    <path d="M12 15 v5" stroke={MADERA_OSC} strokeWidth="1.1" />
  </Ico>
)

const termometro = (
  <Ico>
    <path d="M10 3 a2 2 0 0 1 4 0 v10.4 a4.4 4.4 0 1 1 -4 0 z" fill="#f5efe0" stroke={MADERA_OSC} strokeWidth="1.2" />
    <circle cx="12" cy="17.6" r="2.8" fill="#c0392b" />
    <path d="M12 8 v9" stroke="#c0392b" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M15 6 h2.6 M15 9 h2.6 M15 12 h2.6" stroke={MADERA_OSC} strokeWidth="1.2" strokeLinecap="round" />
  </Ico>
)

const pruebaCorte = (
  <Ico>
    <path d="M11 4 c-4 2 -6 5 -6 8 c0 4 3 8 7 8 V4 z" fill="#7a4d2e" stroke="#5a3721" strokeWidth="1.1" />
    <path d="M13 4 c4 2 6 5 6 8 c0 4 -3 8 -7 8 V4 z" fill={MADERA} stroke="#5a3721" strokeWidth="1.1" />
    <path d="M12 3 v18" stroke={DORADO} strokeWidth="1.6" />
    <path d="M14.4 9 q2 3 0 6" fill="none" stroke="#5a3721" strokeWidth="1" />
  </Ico>
)

const zaranda = (
  <Ico>
    <circle cx="12" cy="12" r="9" fill="none" stroke={MADERA} strokeWidth="2.4" />
    <path d="M5 9 h14 M5 12 h14 M5 15 h14 M9 5 v14 M12 4 v16 M15 5 v14" stroke={METAL_OSC} strokeWidth="1" />
    <ellipse cx="8.4" cy="7.4" rx="1.4" ry="1.8" fill={GRANO} />
    <ellipse cx="15.6" cy="16.4" rx="1.4" ry="1.8" fill={GRANO} />
  </Ico>
)

const secadorTunel = (
  <Ico>
    <path d="M3 19 v-4 a9 6 0 0 1 18 0 v4 z" fill="#cfe3ee" stroke={MADERA_OSC} strokeWidth="1.3" />
    <path d="M7 19 v-4 a5 4 0 0 1 10 0 v4" fill="none" stroke={MADERA_OSC} strokeWidth="1" />
    <circle cx="19.6" cy="4.6" r="2.8" fill={DORADO} />
    <path d="M19.6 0.6 v1.4 M23.4 4.6 h-1.4 M16.6 1.6 l1 1" stroke={DORADO} strokeWidth="1.4" strokeLinecap="round" />
    <path d="M2 21 h20" stroke={MADERA} strokeWidth="2" strokeLinecap="round" />
  </Ico>
)

const sacos = (
  <Ico>
    <path d="M3 12 q2 -4 5 -4 q3 0 5 4 v9 H3 z" fill={MADERA} stroke={MADERA_OSC} strokeWidth="1.2" />
    <path d="M12 14 q2 -4 5 -4 q3 0 4 4 v7 h-9 z" fill="#c69a63" stroke={MADERA_OSC} strokeWidth="1.2" />
    <path d="M6 9 q2 2 4 0 M15 11 q2 2 4 0" fill="none" stroke={MADERA_OSC} strokeWidth="1.1" />
  </Ico>
)

const etiquetaPrecio = (
  <Ico>
    <path d="M11 3 H20 v9 l-9 9 L2 12 z" fill={DORADO} stroke="#c99b2b" strokeWidth="1.2" />
    <circle cx="16.4" cy="7.6" r="1.7" fill="#1b3a2f" />
  </Ico>
)

const sello = (
  <Ico>
    <circle cx="12" cy="10" r="7" fill={DORADO} stroke="#c99b2b" strokeWidth="1.3" />
    <path d="M8.6 10 l2.4 2.6 L15.6 7.6" stroke="#1b3a2f" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 16.4 L7.6 22 L12 20 L16.4 22 L15 16.4" fill="#c0392b" />
  </Ico>
)

const tienda = (
  <Ico>
    <path d="M3 9 L5 4 h14 l2 5 z" fill="#c0392b" stroke="#8e2419" strokeWidth="1.1" />
    <path d="M4 9 h16 v12 H4 z" fill={MADERA} stroke={MADERA_OSC} strokeWidth="1.2" />
    <path d="M9 21 v-7 h6 v7" fill="#f5efe0" stroke={MADERA_OSC} strokeWidth="1.1" />
  </Ico>
)

const taza = (
  <Ico>
    <path d="M4 8 h13 v6 a6.5 6.5 0 0 1 -13 0 z" fill="#f5efe0" stroke={MADERA_OSC} strokeWidth="1.2" />
    <path d="M17 9.4 a3 3 0 0 1 0 5.6" fill="none" stroke={MADERA_OSC} strokeWidth="1.4" />
    <path d="M3 21 h16" stroke={MADERA} strokeWidth="2" strokeLinecap="round" />
    <path d="M8 5.6 q1.4 -2 0 -3.6 M12 5.6 q1.4 -2 0 -3.6" fill="none" stroke={GRANO} strokeWidth="1.3" strokeLinecap="round" />
  </Ico>
)

const origen = (
  <Ico>
    <path d="M12 2 c4 0 7 3 7 7 c0 5 -7 13 -7 13 S5 14 5 9 c0 -4 3 -7 7 -7 z" fill="#c0392b" stroke="#8e2419" strokeWidth="1.2" />
    <ellipse cx="12" cy="9" rx="2.6" ry="3.2" fill={DORADO} />
  </Ico>
)

const trazabilidad = (
  <Ico>
    <rect x="3" y="4" width="18" height="16" rx="2" fill="#f5efe0" stroke={MADERA_OSC} strokeWidth="1.2" />
    <path d="M6 7 v10 M8.4 7 v10 M11 7 v10 M13 7 v10 M15.6 7 v10 M18 7 v10" stroke="#2a2418" strokeWidth="1.2" />
  </Ico>
)

/* --------------------------- Correspondencia -------------------------- */

const POR_ID: Record<string, JSX.Element> = {
  machete,
  podadora_gancho: podadoraGancho,
  canasto_guantes: canasto,
  tijera_altura: tijeraAltura,
  cuadrilla,
  recorrido_cosecha: recorrido,
  ojo_entrenado: ojo,
  marcado_maduras: marcado,
  cosecha_escalonada: escalonada,

  jornalero,
  sombrio_transitorio: platano,
  sombrio_permanente: arbolAlto,
  clones_injertados: injerto,
  fertilizacion,
  podas_mantenimiento: tijerasPoda,
  riego_drenaje: agua,
  vivero_clonal: vivero,
  nuevas_hectareas: hectareas,
  asociacion,
  drenajes_lote: agua,
  clones_tolerantes: escudoHoja,
  podas_sanitarias_mensuales: calendarioTijeras,
  abono_organico: compost,

  cajon_sencillo: cajon,
  cajon_escalera: cajonesEscalera,
  bateria_cajones: bateria,
  cajon_moncoro: cajonModular,
  ampliacion_beneficiadero: ampliacion,
  marquesina,
  pala_madera: pala,
  termometro,
  prueba_corte: pruebaCorte,
  zaranda,
  secador_tunel: secadorTunel,
  cuarto_reposo: sacos,
  mercado_trazabilidad: trazabilidad,
  mercado_organica: sello,
  mercado_directa: tienda,
  mercado_sensorial: taza,
  mercado_origen: origen,
  acuerdo_comercial: etiquetaPrecio,
}

const POR_PREFIJO: [string, JSX.Element][] = [
  ['cuadrilla_ampliada_', cuadrilla],
  ['cacaotal_', cacaotal],
]

const POR_CATEGORIA: Record<Categoria, JSX.Element> = {
  herramientas: machete,
  cultivo: arbolAlto,
  beneficio: cajon,
}

export function IconoMejora({ id, categoria }: { id: string; categoria: Categoria }) {
  if (POR_ID[id]) return POR_ID[id]
  // Los refuerzos de generador comparten insignia: son la misma idea repetida.
  if (/_x[12]$/.test(id)) return refuerzo
  for (const [prefijo, icono] of POR_PREFIJO) if (id.startsWith(prefijo)) return icono
  return POR_CATEGORIA[categoria]
}
