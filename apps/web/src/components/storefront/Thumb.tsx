import { thumbGradient } from '@/lib/storefront/utils'

type Props = {
  hue:    number
  size?:  number
  radius?: number
  style?: React.CSSProperties
}

export function Thumb({ hue, size = 80, radius = 10, style }: Props) {
  return (
    <div style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0,
      background: thumbGradient(hue),
      ...style,
    }} />
  )
}

type ProdImageProps = {
  hue:     number
  height?: number
  radius?: number
  style?:  React.CSSProperties
  children?: React.ReactNode
}

export function ProdImage({ hue, height = 280, radius = 14, style, children }: ProdImageProps) {
  return (
    <div style={{
      width: '100%', height, borderRadius: radius, position: 'relative',
      background: thumbGradient(hue),
      ...style,
    }}>
      {children}
    </div>
  )
}
