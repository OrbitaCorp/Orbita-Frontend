import { useState } from 'react'
import { X, Check, Search, RotateCcw } from 'lucide-react'

const FMT = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
const MONO = '"Geist Mono", "Fira Code", monospace'

// ─── Tipos locales ─────────────────────────────────────────────────────────

type MetodoReembolso = 'mismo_metodo' | 'efectivo' | 'nota_credito'
type MotivoDevolucion = 'defectuoso' | 'no_gusto' | 'error_cobro' | 'otro'

interface ItemHistorial {
  id: string; nombre: string; variante?: string
  cantidad: number; precioUnitario: number; maxADevolver: number
}

interface TicketHistorial {
  id: string; numeroComprobante: string; fecha: string
  items: ItemHistorial[]; metodoPagoLabel: string
  cliente: { nombre: string; dni: string } | null
}

// ─── Mock de tickets históricos ────────────────────────────────────────────

const MOCK: TicketHistorial[] = [
  {
    id: 'th-1', numeroComprobante: '#000889',
    fecha: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    items: [
      { id: 'i1', nombre: 'Remera oversize', variante: 'Talle M · Negro', cantidad: 2, precioUnitario: 12500, maxADevolver: 2 },
      { id: 'i2', nombre: 'Gorra trucker', variante: undefined, cantidad: 2, precioUnitario: 7400, maxADevolver: 1 },
    ],
    metodoPagoLabel: 'Tarjeta crédito',
    cliente: { nombre: 'Lucía Fernández', dni: '34221898' },
  },
  {
    id: 'th-2', numeroComprobante: '#000001',
    fecha: new Date(Date.now() - 5 * 86_400_000).toISOString(),
    items: [{ id: 'i3', nombre: 'Zapatillas urbanas', variante: 'Talle 40', cantidad: 1, precioUnitario: 32000, maxADevolver: 1 }],
    metodoPagoLabel: 'Efectivo', cliente: null,
  },
]

const MOTIVOS: { key: MotivoDevolucion; label: string }[] = [
  { key: 'defectuoso', label: 'Producto defectuoso' },
  { key: 'no_gusto', label: 'No le gustó' },
  { key: 'error_cobro', label: 'Error en el cobro' },
  { key: 'otro', label: 'Otro' },
]

// ─── Header de pasos ───────────────────────────────────────────────────────

const PASOS = ['Buscar', 'Items', 'Reembolso', 'Confirmar']

function PasoHeader({ actual }: { actual: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 20 }}>
      {PASOS.map((label, i) => {
        const num = i + 1
        const hecho = num < actual
        const activo = num === actual
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < 3 ? 1 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: hecho ? 'var(--color-success)' : activo ? 'var(--color-primary)' : 'var(--color-surface)', border: hecho || activo ? 'none' : '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: hecho || activo ? '#fff' : 'var(--color-muted)' }}>
                {hecho ? <Check size={12} /> : num}
              </div>
              <span style={{ fontSize: 12, fontWeight: activo ? 600 : 400, color: activo ? 'var(--color-text)' : 'var(--color-muted)' }}>{label}</span>
            </div>
            {i < 3 && <div style={{ flex: 1, height: 1, background: 'var(--color-border)', margin: '0 8px' }} />}
          </div>
        )
      })}
    </div>
  )
}

// ─── Modal ─────────────────────────────────────────────────────────────────

interface Props { isOpen: boolean; onClose: () => void }

function ModalDevolucionContent({ onClose }: { onClose: () => void }) {
  const [paso, setPaso] = useState(1)
  const [busqueda, setBusqueda] = useState('')
  const [ticketEncontrado, setTicketEncontrado] = useState<TicketHistorial | null>(null)
  const [errBusqueda, setErrBusqueda] = useState<string | null>(null)
  const [seleccionados, setSeleccionados] = useState<Record<string, number>>({})
  const [motivo, setMotivo] = useState<MotivoDevolucion | null>(null)
  const [intercambio, setIntercambio] = useState(false)
  const [metodoReembolso, setMetodoReembolso] = useState<MetodoReembolso>('mismo_metodo')

  const buscar = () => {
    const q = busqueda.trim()
    const found = MOCK.find(t => t.numeroComprobante === q || t.cliente?.dni === q)
    if (found) { setTicketEncontrado(found); setErrBusqueda(null) }
    else setErrBusqueda('No se encontró un ticket con ese comprobante o DNI.')
  }

  const toggleItem = (id: string, max: number) =>
    setSeleccionados(prev => prev[id] ? { ...prev, [id]: undefined as unknown as number } : { ...prev, [id]: Math.min(1, max) })

  const ajustarCantidad = (id: string, delta: number, max: number) =>
    setSeleccionados(prev => ({ ...prev, [id]: Math.max(1, Math.min(max, (prev[id] ?? 1) + delta)) }))

  const itemsADevolver = ticketEncontrado?.items.filter(i => !!seleccionados[i.id]) ?? []
  const montoReembolso = itemsADevolver.reduce((s, i) => s + i.precioUnitario * (seleccionados[i.id] ?? 0), 0)
  const stockReingresado = itemsADevolver.reduce((s, i) => s + (seleccionados[i.id] ?? 0), 0)

  const labelReembolso: Record<MetodoReembolso, string> = {
    mismo_metodo: `Mismo método (${ticketEncontrado?.metodoPagoLabel ?? ''})`,
    efectivo: 'Efectivo',
    nota_credito: 'Nota de crédito interna',
  }

  const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--color-bg)', borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.22)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 0' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, fontFamily: 'Sora, Inter, sans-serif', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <RotateCcw size={18} /> Devolución / Intercambio
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', display: 'flex', padding: 4 }}><X size={18} /></button>
        </div>

        <div style={{ padding: '16px 24px 24px' }}>
          <PasoHeader actual={paso} />

          {/* ── Paso 1: Buscar ─────────────────────────────── */}
          {paso === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={busqueda} onChange={e => { setBusqueda(e.target.value); setErrBusqueda(null) }} onKeyDown={e => e.key === 'Enter' && buscar()} placeholder="Buscar por Nº comprobante, DNI o teléfono…" autoFocus style={{ ...inputStyle, flex: 1 }} />
                <button onClick={buscar} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, border: 'none', background: 'var(--color-primary)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  <Search size={14} /> Buscar
                </button>
              </div>
              {errBusqueda && <p style={{ margin: 0, fontSize: 13, color: 'var(--color-error)' }}>{errBusqueda}</p>}
              {ticketEncontrado && (
                <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--color-surface)', border: '1px solid var(--color-border)', fontSize: 13 }}>
                  <p style={{ margin: '0 0 2px', fontWeight: 600, color: 'var(--color-text)' }}>{ticketEncontrado.numeroComprobante}</p>
                  <p style={{ margin: 0, color: 'var(--color-muted)' }}>{ticketEncontrado.cliente?.nombre ?? 'Sin cliente'} · {new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(new Date(ticketEncontrado.fecha))} · {ticketEncontrado.metodoPagoLabel}</p>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => ticketEncontrado && setPaso(2)} disabled={!ticketEncontrado} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: ticketEncontrado ? 'var(--color-primary)' : 'var(--color-border)', color: ticketEncontrado ? '#fff' : 'var(--color-muted)', fontSize: 14, fontWeight: 600, cursor: ticketEncontrado ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* ── Paso 2: Items ──────────────────────────────── */}
          {paso === 2 && ticketEncontrado && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ticketEncontrado.items.map(item => {
                  const sel = !!seleccionados[item.id]
                  return (
                    <div key={item.id} onClick={() => toggleItem(item.id, item.maxADevolver)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, border: `1.5px solid ${sel ? 'var(--color-primary)' : 'var(--color-border)'}`, background: sel ? 'rgba(59,130,246,.04)' : 'var(--color-bg)', cursor: item.maxADevolver > 0 ? 'pointer' : 'not-allowed', opacity: item.maxADevolver === 0 ? 0.5 : 1 }}>
                      <div style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${sel ? 'var(--color-primary)' : 'var(--color-border)'}`, background: sel ? 'var(--color-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {sel && <Check size={10} color="#fff" />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{item.nombre}</p>
                        <p style={{ margin: 0, fontSize: 12, color: 'var(--color-muted)' }}>{item.variante ? `${item.variante} · ` : ''}máx {item.maxADevolver}{item.maxADevolver < item.cantidad ? ` (${item.cantidad - item.maxADevolver} ya devuelto)` : ''}</p>
                      </div>
                      {sel && item.maxADevolver > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
                          <button onClick={() => ajustarCantidad(item.id, -1, item.maxADevolver)} style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                          <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{seleccionados[item.id]}</span>
                          <button onClick={() => ajustarCantidad(item.id, 1, item.maxADevolver)} style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              {/* Motivo */}
              <div>
                <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: 'var(--color-body)', letterSpacing: '0.04em' }}>Motivo de la devolución *</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {MOTIVOS.map(m => (
                    <button key={m.key} onClick={() => setMotivo(m.key)} style={{ padding: '6px 12px', borderRadius: 20, fontSize: 13, border: `1px solid ${motivo === m.key ? 'var(--color-primary)' : 'var(--color-border)'}`, background: motivo === m.key ? 'rgba(59,130,246,.08)' : 'transparent', color: motivo === m.key ? 'var(--color-primary)' : 'var(--color-body)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: motivo === m.key ? 600 : 400 }}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Intercambio */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 8, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>Cambio / intercambio</p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--color-muted)' }}>Agregar un producto de reemplazo</p>
                </div>
                <div onClick={() => setIntercambio(v => !v)} style={{ width: 40, height: 22, borderRadius: 11, background: intercambio ? 'var(--color-primary)' : 'var(--color-border)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 3, left: intercambio ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setPaso(1)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-body)', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Atrás</button>
                <button onClick={() => setPaso(3)} disabled={itemsADevolver.length === 0 || !motivo} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: itemsADevolver.length > 0 && motivo ? 'var(--color-primary)' : 'var(--color-border)', color: itemsADevolver.length > 0 && motivo ? '#fff' : 'var(--color-muted)', fontSize: 14, fontWeight: 600, cursor: itemsADevolver.length > 0 && motivo ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>Continuar</button>
              </div>
            </div>
          )}

          {/* ── Paso 3: Reembolso ──────────────────────────── */}
          {paso === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: 'var(--color-body)' }}>Método de reembolso</p>
              {(['mismo_metodo', 'efectivo', 'nota_credito'] as MetodoReembolso[]).map(m => (
                <div key={m} onClick={() => setMetodoReembolso(m)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 8, border: `1.5px solid ${metodoReembolso === m ? 'var(--color-primary)' : 'var(--color-border)'}`, cursor: 'pointer', background: metodoReembolso === m ? 'rgba(59,130,246,.04)' : 'var(--color-bg)' }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${metodoReembolso === m ? 'var(--color-primary)' : 'var(--color-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {metodoReembolso === m && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)' }} />}
                  </div>
                  <span style={{ fontSize: 14, color: 'var(--color-text)', fontWeight: metodoReembolso === m ? 600 : 400 }}>{labelReembolso[m]}</span>
                </div>
              ))}
              {metodoReembolso === 'mismo_metodo' && ticketEncontrado?.metodoPagoLabel.toLowerCase().includes('tarjeta') && (
                <p style={{ margin: 0, fontSize: 12, color: 'var(--color-warning)', display: 'flex', gap: 6, padding: '8px 12px', background: 'rgba(245,158,11,.08)', borderRadius: 8 }}>
                  ⚠ El reembolso a tarjeta puede demorar 5-10 días hábiles.
                </p>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <button onClick={() => setPaso(2)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-body)', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Atrás</button>
                <button onClick={() => setPaso(4)} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'var(--color-primary)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Continuar</button>
              </div>
            </div>
          )}

          {/* ── Paso 4: Confirmar ──────────────────────────── */}
          {paso === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '14px 16px', borderRadius: 10, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                {[
                  ['Items devueltos', `${stockReingresado} u.`],
                  ['Monto a reembolsar', `$ ${FMT.format(montoReembolso)}`],
                  ['Método de reembolso', labelReembolso[metodoReembolso]],
                  ['Stock reingresado', `${stockReingresado} u.`],
                  ['Motivo', MOTIVOS.find(m => m.key === motivo)?.label ?? ''],
                ].map(([label, valor]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--color-muted)' }}>{label}</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-text)', fontFamily: label === 'Monto a reembolsar' ? MONO : 'inherit' }}>{valor}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setPaso(3)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-body)', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Atrás</button>
                <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 10, border: 'none', background: 'var(--color-primary)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  <Check size={15} /> Confirmar devolución
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function ModalDevolucion({ isOpen, onClose }: Props) {
  if (!isOpen) return null
  return <ModalDevolucionContent onClose={onClose} />
}
