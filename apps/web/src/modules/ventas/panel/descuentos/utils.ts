const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export function generarCodigoCupon(): string {
  let codigo = 'PROMO-'
  for (let i = 0; i < 4; i++) {
    codigo += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return codigo
}

export function isoADisplay(iso: string | null): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function displayAIso(display: string): string | null {
  if (!display || display.length < 10) return null
  const [d, m, y] = display.split('/')
  if (!d || !m || !y) return null
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}
