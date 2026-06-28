import { useState, useRef, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { useCajaStore } from './stores/useCajaStore'
import { useTicketStore } from './stores/useTicketStore'
import { CatalogoPOS } from './components/CatalogoPOS/CatalogoPOS'
import { TicketPOS } from './components/TicketPOS/TicketPOS'
import { ModalCobro } from './components/Cobro/ModalCobro'
import { ModalPostVenta } from './components/Cobro/ModalPostVenta'
import { ModalVariante } from './components/Modales/ModalVariante'
import type { ProductoPOS, MetodoPago, ResultadoVenta } from './types'

const SK: CSSProperties = { background: 'var(--color-surface-alt)', borderRadius: 8 }

function CobroSkeleton() {
  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
      {/* Catálogo */}
      <div style={{ flex: '0 0 60%', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12, borderRight: '1px solid var(--color-border)', overflow: 'hidden' }}>
        <div style={{ ...SK, height: 36 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          {[72, 92, 80, 72, 96].map((w, i) => (
            <div key={i} style={{ ...SK, height: 28, width: w, borderRadius: 9999 }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, flex: 1, alignContent: 'start' }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ ...SK, height: 116, borderRadius: 12 }} />
          ))}
        </div>
      </div>
      {/* Ticket */}
      <div style={{ flex: '0 0 40%', display: 'flex', flexDirection: 'column', gap: 12, padding: 20, overflow: 'hidden' }}>
        <div style={{ ...SK, height: 40, borderRadius: 10 }} />
        <div style={{ ...SK, flex: 1, borderRadius: 12 }} />
        <div style={{ ...SK, height: 88, borderRadius: 12 }} />
      </div>
    </div>
  )
}

export function POSCobro() {
  const [loading, setLoading] = useState(true)
  const { incrementarAcumulado } = useCajaStore()
  const { agregarItem, items, cliente, limpiarTicket } = useTicketStore()

  const [totalACobrar, setTotalACobrar] = useState(0)
  const [modalCobro, setModalCobro] = useState(false)
  const [modalPostVenta, setModalPostVenta] = useState(false)
  const [resultadoVenta, setResultadoVenta] = useState<ResultadoVenta | null>(null)
  const [productoVariante, setProductoVariante] = useState<ProductoPOS | null>(null)
  const contadorRef = useRef(888)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700)
    return () => clearTimeout(t)
  }, [])

  if (loading) return <CobroSkeleton />

  const handleAgregarProducto = (producto: ProductoPOS) => {
    if (producto.tieneVariantes) {
      setProductoVariante(producto)
    } else {
      agregarItem({ productoId: producto.id, nombre: producto.nombre, cantidad: 1, precioUnitario: producto.precio })
    }
  }

  const handleConfirmarCobro = (metodos: MetodoPago[], vuelto?: number) => {
    contadorRef.current += 1
    const resultado: ResultadoVenta = {
      id: `venta-${Date.now()}`,
      numeroComprobante: `#${String(contadorRef.current).padStart(6, '0')}`,
      fecha: new Date().toISOString(),
      items: [...items],
      cliente,
      metodosPago: metodos,
      total: totalACobrar,
      vuelto,
    }
    incrementarAcumulado(totalACobrar)
    limpiarTicket()
    setModalCobro(false)
    setResultadoVenta(resultado)
    setModalPostVenta(true)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <div style={{ flex: '0 0 60%', minWidth: 0, padding: '16px 20px', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--color-border)', overflow: 'hidden' }}>
          <CatalogoPOS
            onAgregarProducto={handleAgregarProducto}
            onItemLibre={() => {/* TODO ítem libre */}}
          />
        </div>
        <div style={{ flex: '0 0 40%', minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <TicketPOS onCobrar={(total) => { setTotalACobrar(total); setModalCobro(true) }} />
        </div>
      </div>

      <ModalCobro isOpen={modalCobro} total={totalACobrar} onClose={() => setModalCobro(false)} onConfirmar={handleConfirmarCobro} />
      <ModalPostVenta isOpen={modalPostVenta} resultado={resultadoVenta} onNuevoTicket={() => { setModalPostVenta(false); setResultadoVenta(null) }} onClose={() => setModalPostVenta(false)} />
      <ModalVariante isOpen={!!productoVariante} producto={productoVariante} onClose={() => setProductoVariante(null)} />
    </div>
  )
}
