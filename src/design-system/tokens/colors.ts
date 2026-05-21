// ─── Colores base · Modo claro ───────────────────────────────────────────────

export const light = {
  // Neutrales / superficies
  background:   '#FFFFFF',   // fondo principal de la app
  surface:      '#F8FAFC',   // cards, paneles, fondos de sección
  surfaceAlt:   '#F1F5F9',   // hover en listas, fondos secundarios
  border:       '#E2E8F0',   // bordes de inputs, cards, divisores
  borderStrong: '#CBD5E1',   // bordes de componentes en foco

  // Texto
  text:         '#0F172A',   // títulos y texto principal
  body:         '#334155',   // párrafos y descripciones
  muted:        '#64748B',   // labels, placeholders, metadata
  subtle:       '#94A3B8',   // texto deshabilitado, hints

  // Primario (azul)
  primary50:    '#EFF6FF',   // fondo de badges, hover suave
  primary100:   '#DBEAFE',   // fondo de estados seleccionados
  primary500:   '#3B82F6',   // botones primarios, links, iconos activos
  primary600:   '#2563EB',   // hover de botón primario
  primary700:   '#1D4ED8',   // active / pressed de botón primario
  primary900:   '#1E3A8A',   // texto sobre fondo primario claro

  // Semánticos
  success:      '#10B981',
  success50:    '#ECFDF5',
  warning:      '#F59E0B',
  warning50:    '#FFFBEB',
  error:        '#EF4444',
  error50:      '#FEF2F2',
  info:         '#3B82F6',
  info50:       '#EFF6FF',
} as const;

// ─── Colores base · Modo oscuro ──────────────────────────────────────────────

export const dark = {
  // Superficies (capas de azul oscuro / slate)
  background:   '#0F172A',   // fondo principal · nivel 0
  surface:      '#1E293B',   // cards y paneles · nivel 1
  surfaceAlt:   '#334155',   // hover, elementos elevados · nivel 2
  surfaceHigh:  '#475569',   // tooltips, popovers · nivel 3
  border:       '#334155',   // bordes sutiles
  borderStrong: '#475569',   // bordes de componentes activos

  // Texto
  text:         '#F1F5F9',
  body:         '#CBD5E1',
  muted:        '#94A3B8',
  subtle:       '#64748B',

  // Primario ajustado para contraste sobre fondos oscuros
  primary:      '#60A5FA',   // blue-400
  primaryHover: '#93C5FD',   // blue-300

  // Semánticos ajustados
  success:      '#34D399',   // emerald-400
  warning:      '#FBBF24',   // amber-400
  error:        '#F87171',   // red-400
} as const;

// ─── Variables CSS (pegar en globals.css) ────────────────────────────────────
//
//  :root {
//    --color-bg:           #FFFFFF;
//    --color-surface:      #F8FAFC;
//    --color-border:       #E2E8F0;
//    --color-text:         #0F172A;
//    --color-text-muted:   #64748B;
//    --color-primary:      #3B82F6;
//    --color-primary-h:    #2563EB;
//    --color-success:      #10B981;
//    --color-warning:      #F59E0B;
//    --color-error:        #EF4444;
//  }
//
//  .dark {
//    --color-bg:           #0F172A;
//    --color-surface:      #1E293B;
//    --color-border:       #334155;
//    --color-text:         #F1F5F9;
//    --color-text-muted:   #94A3B8;
//    --color-primary:      #60A5FA;
//    --color-primary-h:    #93C5FD;
//    --color-success:      #34D399;
//    --color-warning:      #FBBF24;
//    --color-error:        #F87171;
//  }

export type ColorToken = keyof typeof light;
