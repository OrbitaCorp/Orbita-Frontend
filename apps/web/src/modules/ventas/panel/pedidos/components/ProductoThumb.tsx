// Thumbnail generado para una línea de producto (sin imagen real todavía).
// Usa un patrón de rayas oklch derivado del `hue` para dar variedad visual.

interface ProductoThumbProps {
    hue:     number
    size?:   number | string
    radius?: number
}

export function ProductoThumb({ hue, size = 40, radius = 6 }: ProductoThumbProps) {
    return (
        <div style={{
            width:        size,
            height:       size,
            borderRadius: radius,
            flexShrink:   0,
            background:   `repeating-linear-gradient(135deg,
                oklch(0.84 0.06 ${hue}) 0px 14px,
                oklch(0.80 0.06 ${hue}) 14px 28px)`,
        }} />
    )
}
