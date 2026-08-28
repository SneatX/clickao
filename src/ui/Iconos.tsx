/** Iconos e ilustraciones pequeñas. Vectorial plano, sombreado en dos tonos. */

export function IconoFoco({ tipo }: { tipo: 'monilia' | 'escoba' }) {
  // Grupos, no <svg>: viven dentro del viewBox de la escena y se centran en el origen.
  if (tipo === 'monilia') {
    return (
      <g transform="translate(-27 -31)">
        <path
          d="M27 8 c9 2 15 12 15 24 c0 13 -6 22 -15 22 c-9 0 -15 -9 -15 -22 c0 -12 6 -22 15 -24 z"
          fill="#5b6e7a"
          stroke="#3e5561"
          strokeWidth="2"
        />
        {/* Textura de manchas: la enfermedad no se comunica solo por color */}
        <circle cx="22" cy="24" r="5" fill="#3e5561" />
        <circle cx="33" cy="33" r="6.5" fill="#3e5561" />
        <circle cx="24" cy="42" r="4" fill="#3e5561" />
        <circle cx="34" cy="18" r="3" fill="#3e5561" />
        <circle cx="27" cy="33" r="14" fill="none" stroke="#e8edf0" strokeWidth="1.5" opacity="0.5" />
      </g>
    )
  }
  return (
    <g transform="translate(-29 -29)">
      <path d="M29 52 L29 26" stroke="#3e5561" strokeWidth="4" strokeLinecap="round" />
      <g stroke="#5b6e7a" strokeWidth="3.4" strokeLinecap="round" fill="none">
        <path d="M29 26 L14 10" />
        <path d="M29 26 L29 6" />
        <path d="M29 26 L44 10" />
        <path d="M29 26 L8 20" />
        <path d="M29 26 L50 20" />
      </g>
      <g fill="#3e5561">
        <circle cx="14" cy="10" r="3.4" />
        <circle cx="29" cy="6" r="3.4" />
        <circle cx="44" cy="10" r="3.4" />
        <circle cx="8" cy="20" r="3" />
        <circle cx="50" cy="20" r="3" />
      </g>
    </g>
  )
}

export function IconoDorada() {
  return (
    <g transform="translate(-33 -39)">
      <path d="M33 14 q3 -6 7 -8" stroke="#8a6a1c" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <path
        d="M33 13 c10 2 17 14 17 27 c0 15 -7 25 -17 25 c-10 0 -17 -10 -17 -25 c0 -13 7 -25 17 -27 z"
        fill="#f2c14e"
        stroke="#c99b2b"
        strokeWidth="2"
      />
      <path d="M33 15 c-5 9 -6 32 0 48" stroke="#c99b2b" strokeWidth="1.8" fill="none" />
      <path d="M42 19 c4 10 4 29 -1 41" stroke="#c99b2b" strokeWidth="1.8" fill="none" />
      <path d="M24 19 c-4 10 -4 29 1 41" stroke="#c99b2b" strokeWidth="1.8" fill="none" />
      <path d="M33 13 c10 2 17 14 17 27 c0 6 -1 12 -3 16 c-4 -19 -8 -32 -14 -43 z" fill="#fff" opacity="0.3" />
    </g>
  )
}

export function IconoGrano({ color = '#8b5e34', tam = 14 }: { color?: string; tam?: number }) {
  return (
    <svg width={tam} height={tam} viewBox="0 0 16 16" role="presentation">
      <ellipse cx="8" cy="8" rx="5" ry="6.6" fill={color} />
      <path d="M8 2 Q5 8 8 14" stroke="#00000033" strokeWidth="1.2" fill="none" />
    </svg>
  )
}

export function IconoEtapa({ etapa }: { etapa: 'fermentacion' | 'secado' }) {
  if (etapa === 'fermentacion') {
    return (
      <svg width="18" height="18" viewBox="0 0 20 20" role="presentation">
        <rect x="2" y="6" width="16" height="11" rx="1.5" fill="#8b5e34" stroke="#5d4423" strokeWidth="1.4" />
        <path d="M2 9 h16" stroke="#5d4423" strokeWidth="1" />
        <path d="M6 6 q1 -3 2 0 M11 6 q1 -4 2 0" stroke="#c3bda9" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" role="presentation">
      <circle cx="10" cy="7" r="4" fill="#f2c14e" />
      <g stroke="#f2c14e" strokeWidth="1.5" strokeLinecap="round">
        <path d="M10 1 v1.6M10 11.4 v1.6M4 7 h1.6M14.4 7 h1.6M5.8 2.8 l1.1 1.1M13.1 10.1 l1.1 1.1M14.2 2.8 l-1.1 1.1M6.9 10.1 l-1.1 1.1" />
      </g>
      <path d="M2 17 h16" stroke="#a9743f" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}
