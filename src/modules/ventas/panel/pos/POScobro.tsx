import { useState, useRef } from 'react'
import { LockKeyhole, Unlock } from 'lucide-react'
import { useCajaStore } from './stores/useCajaStore'
import { usePausadosStore } from './stores/usePausadosStore'
import { useTicketStore } from './stores/useTicketStore'
import { HeaderTurno } from './components/Caja/HeaderTurno'
import { CatalogoPOS } from './components/CatalogoPOS/CatalogoPOS'
import { TicketPOS } from './components/TicketPOS/TicketPOS'
import { ModalCobro } from './components/Cobro/ModalCobro'
import { ModalPostVenta } from './components/Cobro/ModalPostVenta'
import { DrawerPausados } from './components/Modales/DrawerPausados'
import { ModalEgresoIngreso } from './components/Modales/ModalEgresoIngreso'
import { ModalDevolucion } from './components/Modales/ModalDevolucion'
import { ModalVariante } from './components/Modales/ModalVariante'
import type { ProductoPOS, MetodoPago, ResultadoVenta } from './types'

// ─── Estado: caja cerrada ─────────────────────────────────────────────────────

function CajaCerrada({ onAbrir }: { onAbrir: () => void }) {
  return (
    <div style={{ flex: 1, display: 'grid', placeItems: 'center', background: 'var(--color-surface)', padding: 24 }}>
      <div
        style={{
          maxWidth: 420,
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          background: 'var(--color-bg)',
          borderRadius: 20,
          padding: '48px 40px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,.07), 0 10px 40px -4px rgba(0,0,0,.10)',
        }}
      >
        <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--color-surface)', border: '1px solid var(--color-border)', display: 'grid', placeItems: 'center', color: 'var(--color-muted)' }}>
          <LockKeyhole size={28} strokeWidth={1.5} />
        </div>
        <div>
          <h2 style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 700, fontFamily: 'Sora, Inter, sans-serif', color: 'var(--color-text)' }}>
            La caja está cerrada
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.7 }}>
            Para empezar a cobrar tenés que abrir la caja<br />y registrar el monto inicial del turno.
          </p>
        </div>
        <button
          onClick={onAbrir}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 32px', borderRadius: 12, border: 'none', background: 'var(--color-primary)', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', width: '100%', justifyContent: 'center' }}
        >
          <Unlock size={16} /> Abrir caja
        </button>
      </div>
    </div>
  )
}

// ─── Pantalla principal ───────────────────────────────────────────────────────

interface Props {
  onAbrirCaja: () => void
  onCerrarCaja: () => void
}

export function POSCobro({ onAbrirCaja, onCerrarCaja }: Props) {
  const { estado, sesion, acumuladoTurno, incrementarAcumulado } = useCajaStore()
  const { tickets: pausados } = usePausadosStore()
  const { agregarItem, items, cliente, limpiarTicket } = useTicketStore()

  // Estados de modales
  const [totalACobrar, setTotalACobrar] = useState(0)
  const [modalCobro, setModalCobro] = useState(false)
  const [modalPostVenta, setModalPostVenta] = useState(false)
  const [resultadoVenta, setResultadoVenta] = useState<ResultadoVenta | null>(null)
  const [drawerPausados, setDrawerPausados] = useState(false)
  const [modalMovimiento, setModalMovimiento] = useState(false)
  const [modalDevolucion, setModalDevolucion] = useState(false)
  const [productoVariante, setProductoVariante] = useState<ProductoPOS | null>(null)
  const contadorRef = useRef(888)

  if (estado === 'cerrada' || !sesion) {
    return <CajaCerrada onAbrir={onAbrirCaja} />
  }

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
      <HeaderTurno
        sesion={sesion}
        acumulado={acumuladoTurno}
        pausadosCount={pausados.length}
        onMovimientos={() => setModalMovimiento(true)}
        onDevolucion={() => setModalDevolucion(true)}
        onPausados={() => setDrawerPausados(true)}
        onCerrar={onCerrarCaja}
      />

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

      {/* Modales de cobro */}
      <ModalCobro isOpen={modalCobro} total={totalACobrar} onClose={() => setModalCobro(false)} onConfirmar={handleConfirmarCobro} />
      <ModalPostVenta isOpen={modalPostVenta} resultado={resultadoVenta} onNuevoTicket={() => { setModalPostVenta(false); setResultadoVenta(null) }} onClose={() => setModalPostVenta(false)} />

      {/* Modales 2e-2f */}
      <DrawerPausados isOpen={drawerPausados} onClose={() => setDrawerPausados(false)} />
      <ModalEgresoIngreso isOpen={modalMovimiento} onClose={() => setModalMovimiento(false)} />
      <ModalDevolucion isOpen={modalDevolucion} onClose={() => setModalDevolucion(false)} />
      <ModalVariante isOpen={!!productoVariante} producto={productoVariante} onClose={() => setProductoVariante(null)} />
    </div>
  )
}
