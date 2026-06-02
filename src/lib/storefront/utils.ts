export function fmt(n: number): string {
  return '$ ' + Number(n).toLocaleString('es-AR')
}

export function openWpp(wpp: string, msg?: string) {
  const url = `https://wa.me/${wpp}` + (msg ? `?text=${encodeURIComponent(msg)}` : '')
  window.open(url, '_blank', 'noopener')
}

export function descuento(precio: number, precioAnt: number): number {
  return Math.round((1 - precio / precioAnt) * 100)
}

// Gradient tile background used as image placeholder
export function thumbGradient(hue: number): string {
  return `repeating-linear-gradient(135deg,
    oklch(0.84 0.06 ${hue}) 0px 28px,
    oklch(0.80 0.06 ${hue}) 28px 56px)`
}
