import { useState } from 'react'
import { CreditCard, UserPlus, X } from 'lucide-react'
import { useTicketStore } from '../../stores/useTicketStore'
import { usePausadosStore } from '../../stores/usePausadosStore'
import { CLIENTES_MOCK } from '../../hooks/useClientes'
import { SelectorCliente } from '../../../../_shared/components/SelectorCliente'
import { TicketVacio } from './TicketVacio'
import { TicketItemRow } from './TicketItem'
import { TicketTotales, type DescuentoDesglose } from './TicketTotales'
import { ZonaDescuentos } from './ZonaDescuentos'
import type { ClienteAsociado } from '../../types'

const FORMATO = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

interface Props {
  onCobrar: (total: number) => void  // Fase 2d: abre modal de cobro
}

export function TicketPOS({ onCobrar }: Props) {
  const {
    items, cliente, cupon, descuentoManual,
    removerItem, actualizarCantidad, quitarCliente, limpiarTicket,
    asociarCliente, aplicarCupon, quitarCupon, aplicarDescuentoManual,
  } = useTicketStore()

  const { pausar } = usePausadosStore()
  const [modalCliente, setModalCliente] = useState(false)

  const tieneItems = items.length > 0

  // ── Cálculo de totales ────────────────────────────────────────────────────
  const subtotal = items.reduce(
    (sum, item) => sum + (item.precioEditado ?? item.precioUnitario) * item.cantidad,
    0
  )
  const valorCupon = cupon
    ? cupon.tipo === 'porcentaje' ? subtotal * cupon.valor / 100 : cupon.valor
    : 0
  const valorManual = descuentoManual
    ? descuentoManual.tipo === 'porcentaje'
      ? (subtotal - valorCupon) * descuentoManual.valor / 100
      : descuentoManual.valor
    : 0
  const total = Math.max(0, subtotal - valorCupon - valorManual)
  const iva = total > 0 ? (total * 21) / 121 : 0

  const descuentos: DescuentoDesglose[] = [
    ...(valorCupon > 0 ? [{ label: `Cupón ${cupon?.codigo ?? ''}`.trim(), valor: valorCupon }] : []),
    ...(valorManual > 0 ? [{ label: 'Desc. manual', valor: valorManual }] : []),
  ]

  const handlePausar = () => {
    if (!tieneItems) return
    pausar({ items, cliente })
    limpiarTicket()
  }

  const handleSeleccionarCliente = (c: { id: string; nombre: string; dni: string; telefono: string; email?: string }) => {
    asociarCliente(c as ClienteAsociado)
    setModalCliente(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-bg)', minHeight: 0 }}>

      {/* ── Cliente ───────────────────────────────────────── */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
        {cliente ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {cliente.nombre[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {cliente.nombre}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--color-muted)' }}>DNI {cliente.dni}</p>
            </div>
            <button onClick={quitarCliente} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--color-muted)', display: 'flex', flexShrink: 0 }}>
              <X size={13} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setModalCliente(true)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '9px 0', borderRadius: 8, border: '1px dashed var(--color-border)', background: 'transparent', color: 'var(--color-muted)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <UserPlus size={14} /> Asociar cliente
          </button>
        )}
      </div>

      {/* ── Items / vacío ─────────────────────────────────── */}
      {tieneItems ? (
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {items.map((item) => (
            <TicketItemRow
              key={item.id}
              item={item}
              onIncrementar={() => actualizarCantidad(item.id, item.cantidad + 1)}
              onDecrementar={() => actualizarCantidad(item.id, item.cantidad - 1)}
              onRemover={() => removerItem(item.id)}
            />
          ))}
        </div>
      ) : (
        <TicketVacio />
      )}

      {/* ── Descuentos (cupón + manual) ───────────────────── */}
      <ZonaDescuentos
        cupon={cupon}
        descuentoManual={descuentoManual}
        onAplicarCupon={aplicarCupon}
        onQuitarCupon={quitarCupon}
        onAplicarDescuentoManual={aplicarDescuentoManual}
        disabled={!tieneItems}
      />

      {/* ── Totales ───────────────────────────────────────── */}
      <TicketTotales subtotal={subtotal} descuentos={descuentos} iva={iva} total={total} />

      {/* ── Cobrar ────────────────────────────────────────── */}
      <div style={{ padding: '0 16px 10px', flexShrink: 0 }}>
        <button
          onClick={tieneItems ? () => onCobrar(total) : undefined}
          disabled={!tieneItems}
          style={{
            width: '100%', padding: '13px 0', borderRadius: 10, border: 'none',
            background: tieneItems ? 'var(--color-primary)' : 'var(--color-border)',
            color: tieneItems ? '#fff' : 'var(--color-muted)',
            fontSize: 15, fontWeight: 600, cursor: tieneItems ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8, transition: 'background 0.15s',
          }}
        >
          <CreditCard size={16} />
          {tieneItems ? `Cobrar $ ${FORMATO.format(total)}` : 'Cobrar'}

        </button>
      </div>

      {/* ── Pausar / Cancelar ─────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 16px 14px', borderTop: '1px solid var(--color-border)', flexShrink: 0 }}>
        <button
          onClick={handlePausar}
          disabled={!tieneItems}
          style={{ background: 'none', border: 'none', cursor: tieneItems ? 'pointer' : 'not-allowed', fontSize: 13, color: tieneItems ? 'var(--color-body)' : 'var(--color-muted)', fontFamily: 'inherit' }}
        >
          Pausar venta
        </button>
        <button
          onClick={limpiarTicket}
          disabled={!tieneItems}
          style={{ background: 'none', border: 'none', cursor: tieneItems ? 'pointer' : 'not-allowed', fontSize: 13, color: tieneItems ? 'var(--color-error)' : 'var(--color-muted)', fontFamily: 'inherit' }}
        >
          × Cancelar
        </button>
      </div>

      {/* ── Modal selector de cliente ─────────────────────── */}
      <SelectorCliente
        isOpen={modalCliente}
        clientes={CLIENTES_MOCK}
        onClose={() => setModalCliente(false)}
        onSeleccionar={handleSeleccionarCliente}
        onCrear={(datos) => {
          const nuevo = { id: `cli-${Date.now()}`, ...datos }
          handleSeleccionarCliente(nuevo)
        }}
      />
    </div>
  )
}
