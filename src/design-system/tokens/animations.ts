// ─── Duraciones ───────────────────────────────────────────────────────────────

export const duration = {
  fast:   '150ms',  // feedback inmediato (botón hover)
  base:   '200ms',  // transiciones estándar (card hover, modal entrada, page)
  slow:   '300ms',  // transiciones espaciales (sidebar, toast entrada)
  xslow:  '1500ms', // loops de loading (skeleton shimmer)
} as const;

// ─── Easings ──────────────────────────────────────────────────────────────────

export const easing = {
  base:    'ease',
  in:      'ease-in',
  out:     'ease-out',
  inOut:   'ease-in-out',
  spring:  'cubic-bezier(0.34, 1.56, 0.64, 1)', // toast: notificación que llama atención
} as const;

// ─── Micro-interacciones por componente ───────────────────────────────────────

export const transitions = {
  button: {
    property: 'background-color, transform',
    duration: duration.fast,
    easing:   easing.base,
  },
  card: {
    property: 'box-shadow, transform',
    duration: duration.base,
    easing:   easing.base,
    hoverShadowLight: '0 4px 12px rgba(15,23,42,0.10), 0 2px 4px rgba(15,23,42,0.06)',
    hoverShadowDark:  '0 8px 24px rgba(0,0,0,0.40)',
    hoverTransform:   'translateY(-1px)',
  },
  modalIn: {
    property: 'opacity, transform',
    duration: duration.base,
    easing:   easing.out,
    from:     'opacity: 0; transform: scale(0.97)',
    to:       'opacity: 1; transform: scale(1)',
  },
  modalOut: {
    property: 'opacity, transform',
    duration: duration.fast,
    easing:   easing.in,
    from:     'opacity: 1; transform: scale(1)',
    to:       'opacity: 0; transform: scale(0.97)',
  },
  sidebar: {
    property: 'width',
    duration: duration.slow,
    easing:   easing.inOut,
  },
  toast: {
    property: 'transform, opacity',
    duration: duration.slow,
    easing:   easing.spring,
  },
  skeleton: {
    duration: duration.xslow,
    easing:   easing.inOut,
    iterationCount: 'infinite',
  },
  page: {
    property: 'opacity',
    duration: duration.base,
    easing:   easing.base,
  },
  dropdown: {
    property: 'opacity, transform',
    duration: duration.fast,
    easing:   easing.out,
    from:     'opacity: 0; transform: translateY(-4px)',
    to:       'opacity: 1; transform: translateY(0)',
  },
} as const;

// ─── Reglas generales ─────────────────────────────────────────────────────────
// · Rango recomendado: 100–300ms. Fuera de ese rango la UI se siente lenta o nerviosa.
// · No animar propiedades que bloqueen la interacción (height, width en DOM grande).
// · Respetar prefers-reduced-motion: si el usuario lo activó, usar duration: 0ms o skip.
//
//   Ejemplo de uso en componente:
//   const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
//   const cardTransition = prefersReduced ? 'none' : `box-shadow ${transitions.card.duration} ${transitions.card.easing}`;
