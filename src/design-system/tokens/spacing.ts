// ─── Sistema de espaciado · base 4px ─────────────────────────────────────────
// Todos los márgenes, paddings y gaps deben ser múltiplos de 4px.
// Usar estos tokens en lugar de valores arbitrarios.

export const spacing = {
  1:  '0.25rem',   //  4px — separación mínima entre elementos íntimamente relacionados
  2:  '0.5rem',    //  8px — padding interno de badges, gap entre ícono y texto
  3:  '0.75rem',   // 12px — padding de inputs pequeños, gap en listas compactas
  4:  '1rem',      // 16px — padding estándar de inputs, gap entre campos de formulario
  5:  '1.25rem',   // 20px — padding de cards compactas, separación entre secciones menores
  6:  '1.5rem',    // 24px — padding de cards estándar, gap entre componentes de formulario
  8:  '2rem',      // 32px — separación entre secciones de página, padding de modales
  10: '2.5rem',    // 40px — separación entre bloques mayores, padding de header
  12: '3rem',      // 48px — espaciado entre secciones de landing, separación de módulos
  16: '4rem',      // 64px — espaciado de hero, separación de bloques principales
  20: '5rem',      // 80px — secciones de página completa, separación de módulos grandes
} as const;

// ─── Radios de borde ──────────────────────────────────────────────────────────

export const radius = {
  sm:   '4px',    // chips, tooltips
  md:   '8px',    // inputs, botones
  lg:   '12px',   // cards, modales, paneles
  full: '9999px', // badges pill, avatares
} as const;

// ─── Layout fijo ──────────────────────────────────────────────────────────────

export const layout = {
  sidebarExpanded:  '240px',
  sidebarCollapsed: '64px',
  headerHeight:     '64px',
  maxContentWidth:  '1280px',
  contentPaddingX:  '24px',
} as const;

// ─── Breakpoints ──────────────────────────────────────────────────────────────

export const breakpoints = {
  sm: '640px',
  md: '768px',   // mobile: sidebar → drawer
  lg: '1024px',  // tablet: sidebar colapsado por defecto
  xl: '1280px',  // desktop: sidebar expandido por defecto
} as const;

// ─── Z-index ──────────────────────────────────────────────────────────────────

export const zIndex = {
  base:     0,
  dropdown: 100,
  sticky:   200,
  modal:    300,
  toast:    400,
} as const;

// ─── Grid ────────────────────────────────────────────────────────────────────

export const grid = {
  columns: 12,
  gap:     '24px',
} as const;

export type SpacingKey = keyof typeof spacing;
