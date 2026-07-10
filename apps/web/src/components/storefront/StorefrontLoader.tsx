type Props = {
  visible: boolean
  nombre:  string
  color?:  string
  logo?:   string | null
}

export function StorefrontLoader({ visible, nombre, color = '#2563EB', logo }: Props) {
  const initial = nombre.charAt(0).toUpperCase()

  return (
    <div
      aria-hidden={!visible}
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         9999,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            16,
        background:     'var(--color-bg)',
        opacity:        visible ? 1 : 0,
        pointerEvents:  visible ? 'auto' : 'none',
        transition:     'opacity 300ms ease',
      }}
    >
      <style>{`
        @keyframes sfLoaderSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes sfLoaderFade {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Logo / inicial de la tienda */}
      {logo ? (
        <img
          src={logo}
          alt={nombre}
          style={{ width: 56, height: 56, borderRadius: 14, objectFit: 'cover', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
        />
      ) : (
        <div style={{
          width: 56, height: 56, borderRadius: 14, flexShrink: 0,
          background: `linear-gradient(135deg, ${color}, ${color}bb)`,
          color: '#fff', fontSize: 22, fontWeight: 800,
          display: 'grid', placeItems: 'center',
          boxShadow: `0 4px 16px ${color}40`,
          animation: 'sfLoaderFade 400ms ease both',
        }}>
          {initial}
        </div>
      )}

      {/* Nombre de la tienda */}
      <span style={{
        fontSize: 15, fontWeight: 700,
        color: 'var(--color-text)', letterSpacing: '-0.01em',
        animation: 'sfLoaderFade 400ms 60ms ease both',
      }}>
        {nombre}
      </span>

      {/* Spinner simple */}
      <div style={{
        width: 22, height: 22, borderRadius: '50%',
        border: '2.5px solid var(--color-border)',
        borderTopColor: color,
        animation: 'sfLoaderSpin 0.75s linear infinite',
      }} />

      {/* Texto */}
      <span style={{
        fontSize: 12, color: 'var(--color-muted)', fontWeight: 500,
        animation: 'sfLoaderFade 400ms 120ms ease both',
      }}>
        Cargando...
      </span>
    </div>
  )
}
