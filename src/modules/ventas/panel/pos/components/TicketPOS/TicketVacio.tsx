import { ShoppingCart } from 'lucide-react'

export function TicketVacio() {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <ShoppingCart
        size={38}
        strokeWidth={1.2}
        style={{ color: 'var(--color-border)' }}
      />
      <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--color-muted)' }}>
        Ticket vacío
      </p>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.6 }}>
        Empezá agregando un producto desde el catálogo.
      </p>
    </div>
  )
}
