// ─── Familias tipográficas ────────────────────────────────────────────────────

export const fontFamily = {
  sans: '"Geist", "Inter", system-ui, -apple-system, sans-serif',
  mono: '"Geist Mono", "Fira Code", "Fira Mono", monospace',
} as const;

// ─── Escala tipográfica ───────────────────────────────────────────────────────
// Fuente: Geist Sans salvo donde se indique Mono
// Uso: importar el token completo o solo fontSize / fontWeight según convenga

export const textStyles = {
  displayXL: {
    fontFamily: fontFamily.sans,
    fontSize:   '3rem',       // 48px
    fontWeight: 800,
    lineHeight: 1.2,
    use: 'Hero de landing page, títulos de onboarding',
  },
  displayL: {
    fontFamily: fontFamily.sans,
    fontSize:   '2.25rem',    // 36px
    fontWeight: 700,
    lineHeight: 1.2,
    use: 'Títulos de módulo, páginas principales',
  },
  h1: {
    fontFamily: fontFamily.sans,
    fontSize:   '1.875rem',   // 30px
    fontWeight: 700,
    lineHeight: 1.2,
    use: 'Título de sección principal dentro de un módulo',
  },
  h2: {
    fontFamily: fontFamily.sans,
    fontSize:   '1.5rem',     // 24px
    fontWeight: 600,
    lineHeight: 1.2,
    use: 'Subtítulos de sección, nombres de tarjeta',
  },
  h3: {
    fontFamily: fontFamily.sans,
    fontSize:   '1.25rem',    // 20px
    fontWeight: 600,
    lineHeight: 1.2,
    use: 'Subsección, nombres de panel, acordeones',
  },
  bodyLarge: {
    fontFamily: fontFamily.sans,
    fontSize:   '1.125rem',   // 18px
    fontWeight: 400,
    lineHeight: 1.6,
    use: 'Descripción de emprendimiento, intro de módulo',
  },
  body: {
    fontFamily: fontFamily.sans,
    fontSize:   '1rem',       // 16px
    fontWeight: 400,
    lineHeight: 1.6,
    use: 'Texto de párrafo estándar, contenido general',
  },
  bodySmall: {
    fontFamily: fontFamily.sans,
    fontSize:   '0.875rem',   // 14px
    fontWeight: 400,
    lineHeight: 1.6,
    use: 'Labels de formulario, metadata',
  },
  caption: {
    fontFamily: fontFamily.sans,
    fontSize:   '0.75rem',    // 12px
    fontWeight: 400,
    lineHeight: 1.6,
    use: 'Timestamps, versiones, texto legal',
  },
  mono: {
    fontFamily: fontFamily.mono,
    fontSize:   '0.875rem',   // 14px
    fontWeight: 400,
    lineHeight: 1.6,
    use: 'Código, IDs de pedido, precios, tokens',
  },
} as const;

// ─── Interlineado y espaciado tipográfico ─────────────────────────────────────

export const lineHeight = {
  body:    1.6,     // lectura cómoda en párrafos
  heading: 1.2,     // títulos compactos y elegantes
} as const;

export const letterSpacing = {
  body: '0',        // sin tracking adicional para texto base
  caps: '0.05em',   // para textos en mayúsculas (labels, badges)
} as const;

export const prose = {
  paragraphSpacing: '1em',
  maxWidth:         '65ch', // longitud máxima de línea de lectura óptima
} as const;

export type TextStyleKey = keyof typeof textStyles;
