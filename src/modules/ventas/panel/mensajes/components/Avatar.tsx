interface Props {
  name: string
  size?: number
}

export function Avatar({ name, size = 36 }: Props) {
  const initials = name.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase()
  const hue = Math.abs(name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 360
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        background: `hsl(${hue}, 42%, 52%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: Math.round(size * 0.37),
        fontWeight: 700,
        color: '#fff',
        letterSpacing: '-0.01em',
        userSelect: 'none',
      }}
    >
      {initials}
    </div>
  )
}
