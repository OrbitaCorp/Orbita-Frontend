import { useState } from 'react'
import { ChevronLeft, Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import { Button } from '@/design-system/components/Button'
import { fmtMoney } from '@/lib/utils'
import { MOCK_PRODUCTOS } from './mock/catalogo.mock'
import type { Variante } from './types/catalogo.types'

type Props = { id: string; onVolver: () => void }

const iS: React.CSSProperties = {
  boxSizing: 'border-box', height: 32, padding: '0 8px',
  border: '1px solid var(--color-border)', borderRadius: 6,
  background: 'var(--color-bg)', color: 'var(--color-text)',
  fontSize: 12, outline: 'none', fontFamily: 'inherit', width: '100%',
}

export default function ProductoVariantes({ id, onVolver }: Props) {
  const producto = MOCK_PRODUCTOS.find(p => p.id === id) ?? MOCK_PRODUCTOS[0]
  const [variantes, setVariantes] = useState<Variante[]>([...producto.variantes])
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{ sku: string; precio: string; stock: string }>({ sku: '', precio: '', stock: '' })
  const [guardando, setGuardando] = useState(false)

  const attrKeys = [...new Set(variantes.flatMap(v => Object.keys(v.atributos)))]

  function startEdit(v: Variante) {
    setEditandoId(v.id)
    setEditForm({ sku: v.sku, precio: String(v.precio), stock: String(v.stock) })
  }

  function cancelEdit() { setEditandoId(null) }

  function saveEdit(vid: string) {
    setVariantes(vs => vs.map(v => v.id === vid
      ? { ...v, sku: editForm.sku, precio: +editForm.precio, stock: +editForm.stock }
      : v
    ))
    setEditandoId(null)
  }

  function addVariante() {
    const newV: Variante = {
      id: `v-new-${Date.now()}`,
      sku: `${producto.sku}-NEW`,
      atributos: Object.fromEntries(attrKeys.map(k => [k, ''])),
      precio: producto.precio,
      stock: 0,
    }
    setVariantes(vs => [...vs, newV])
    setEditandoId(newV.id)
    setEditForm({ sku: newV.sku, precio: String(newV.precio), stock: '0' })
  }

  async function guardar() {
    setGuardando(true)
    await new Promise(r => setTimeout(r, 800))
    setGuardando(false)
    onVolver()
  }

  const th: React.CSSProperties = {
    padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600,
    color: 'var(--color-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em',
    borderBottom: '1px solid var(--color-border)', whiteSpace: 'nowrap',
  }
  const td: React.CSSProperties = {
    padding: '10px 12px', fontSize: 13, color: 'var(--color-body)',
    borderBottom: '1px solid var(--color-border)', verticalAlign: 'middle',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 40 }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onVolver} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: 'var(--color-muted)', borderRadius: 6, display: 'flex' }}>
          <ChevronLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Gestión de variantes</h1>
          <p style={{ fontSize: 12, color: 'var(--color-muted)', margin: '2px 0 0' }}>{producto.nombre} · SKU: {producto.sku}</p>
        </div>
        <Button variant="primary" size="sm" loading={guardando} onClick={guardar}>Guardar cambios</Button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Total variantes', value: variantes.length },
          { label: 'Stock total',     value: variantes.reduce((s, v) => s + v.stock, 0) },
          { label: 'Sin stock',       value: variantes.filter(v => v.stock === 0).length },
          { label: 'Atributos',       value: attrKeys.join(', ') || '—' },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '12px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--color-muted)', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface)' }}>
                {attrKeys.map(k => <th key={k} style={th}>{k}</th>)}
                <th style={th}>SKU</th>
                <th style={{ ...th, textAlign: 'right' }}>Precio</th>
                <th style={{ ...th, textAlign: 'center' }}>Stock</th>
                <th style={{ ...th, width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {variantes.length === 0 && (
                <tr>
                  <td colSpan={attrKeys.length + 4} style={{ ...td, textAlign: 'center', padding: 40, color: 'var(--color-muted)' }}>
                    Este producto no tiene variantes. Agregá la primera.
                  </td>
                </tr>
              )}
              {variantes.map(v => {
                const isEditing = editandoId === v.id
                return (
                  <tr key={v.id} style={{ background: isEditing ? 'var(--color-primary-bg)' : 'transparent' }}>
                    {attrKeys.map(k => (
                      <td key={k} style={td}>
                        <span style={{ padding: '2px 8px', borderRadius: 6, background: 'var(--color-surface-alt)', fontSize: 12, fontWeight: 600, color: 'var(--color-body)' }}>
                          {v.atributos[k] ?? '—'}
                        </span>
                      </td>
                    ))}
                    <td style={{ ...td, fontFamily: 'monospace', fontSize: 11 }}>
                      {isEditing
                        ? <input value={editForm.sku} onChange={e => setEditForm(f => ({ ...f, sku: e.target.value }))} style={iS} />
                        : <span style={{ color: 'var(--color-muted)' }}>{v.sku}</span>}
                    </td>
                    <td style={{ ...td, textAlign: 'right' }}>
                      {isEditing
                        ? <input type="number" value={editForm.precio} onChange={e => setEditForm(f => ({ ...f, precio: e.target.value }))} style={{ ...iS, textAlign: 'right' }} />
                        : <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{fmtMoney(v.precio)}</span>}
                    </td>
                    <td style={{ ...td, textAlign: 'center' }}>
                      {isEditing
                        ? <input type="number" value={editForm.stock} onChange={e => setEditForm(f => ({ ...f, stock: e.target.value }))} style={{ ...iS, width: 70, textAlign: 'center' }} />
                        : <span style={{ fontWeight: 600, color: v.stock === 0 ? '#EF4444' : 'var(--color-text)' }}>{v.stock}</span>}
                    </td>
                    <td style={{ ...td, textAlign: 'right' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <button onClick={() => saveEdit(v.id)} style={{ background: '#34D399', border: 'none', borderRadius: 6, cursor: 'pointer', padding: '4px 7px', display: 'flex', alignItems: 'center' }}>
                            <Check size={13} color="white" />
                          </button>
                          <button onClick={cancelEdit} style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 6, cursor: 'pointer', padding: '4px 7px', display: 'flex', alignItems: 'center' }}>
                            <X size={13} style={{ color: 'var(--color-muted)' }} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                          <button onClick={() => startEdit(v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 5, color: 'var(--color-muted)', display: 'flex', borderRadius: 6 }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-alt)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => setVariantes(vs => vs.filter(x => x.id !== v.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 5, color: '#EF4444', display: 'flex', borderRadius: 6 }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
          <button onClick={addVariante} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--color-primary)', fontWeight: 600, padding: 4 }}>
            <Plus size={14} /> Agregar variante
          </button>
        </div>
      </div>

      <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--color-primary-bg)', border: '1px solid var(--color-primary)', fontSize: 12, color: 'var(--color-primary)' }}>
        Hacé clic en el ícono de editar (✏) para modificar SKU, precio y stock de cada variante individualmente.
      </div>
    </div>
  )
}
