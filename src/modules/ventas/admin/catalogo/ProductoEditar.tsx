import { useState, useRef } from 'react'
import { ChevronLeft, ImagePlus, X, Save, Clock } from 'lucide-react'
import { Button } from '@/design-system/components/Button'
import { fmtMoney } from '@/lib/utils'
import { MOCK_PRODUCTOS, MOCK_CATEGORIAS } from './mock/catalogo.mock'
import type { EstadoProducto } from './types/catalogo.types'

type Props = { id: string; onVolver: () => void }

const iS: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', height: 38, padding: '0 12px',
  border: '1px solid var(--color-border)', borderRadius: 8,
  background: 'var(--color-surface)', color: 'var(--color-text)',
  fontSize: 14, outline: 'none', fontFamily: 'inherit',
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20 }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>{title}</h3>
        {subtitle && <p style={{ fontSize: 12, color: 'var(--color-muted)', margin: '3px 0 0' }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

export default function ProductoEditar({ id, onVolver }: Props) {
  const producto = MOCK_PRODUCTOS.find(p => p.id === id) ?? MOCK_PRODUCTOS[0]
  const fileRef = useRef<HTMLInputElement>(null)
  const [guardando, setGuardando] = useState(false)
  const [guardado,  setGuardado]  = useState(false)

  const [form, setForm] = useState({
    nombre:       producto.nombre,
    descripcion:  producto.descripcion,
    sku:          producto.sku,
    precio:       String(producto.precio),
    precioTachado: String(producto.precioTachado ?? ''),
    stock:        String(producto.stock),
    stockMinimo:  String(producto.stockMinimo),
    estado:       producto.estado as EstadoProducto,
    categorias:   [...producto.categorias],
    imagenes:     [...producto.imagenes],
  })

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  function toggleCat(catId: string) {
    setForm(p => ({ ...p, categorias: p.categorias.includes(catId) ? p.categorias.filter(c => c !== catId) : [...p.categorias, catId] }))
  }

  function handleImg(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    const r = new FileReader()
    r.onload = () => setForm(p => ({ ...p, imagenes: [...p.imagenes, r.result as string] }))
    r.readAsDataURL(file)
  }

  async function guardar() {
    setGuardando(true); await new Promise(r => setTimeout(r, 800))
    setGuardando(false); setGuardado(true); setTimeout(() => onVolver(), 900)
  }

  const precioActual  = +form.precio
  const precioAnterior = producto.historialPrecios.at(-2)?.precio ?? null
  const cambio = precioAnterior ? precioActual - precioAnterior : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 40 }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onVolver} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: 'var(--color-muted)', borderRadius: 6, display: 'flex' }}>
          <ChevronLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Editar producto</h1>
          <p style={{ fontSize: 12, color: 'var(--color-muted)', margin: '2px 0 0' }}>SKU: {producto.sku}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={onVolver}>Cancelar</Button>
        <Button variant="primary" size="sm" icon={<Save size={14} />} loading={guardando} disabled={!form.nombre.trim() || !form.precio} onClick={guardar}>
          {guardado ? '¡Guardado!' : 'Guardar cambios'}
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 288px', gap: 16, alignItems: 'start' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card title="Información básica">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text)', marginBottom: 5 }}>Nombre <span style={{ color: '#EF4444' }}>*</span></label>
                <input value={form.nombre} onChange={upd('nombre')} style={iS} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text)', marginBottom: 5 }}>Descripción</label>
                <textarea value={form.descripcion} onChange={upd('descripcion')} rows={4} style={{ ...iS, height: 'auto', padding: '9px 12px', resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text)', marginBottom: 5 }}>SKU</label>
                <input value={form.sku} onChange={upd('sku')} style={iS} />
              </div>
            </div>
          </Card>

          {/* Precios con historial */}
          <Card title="Precios" subtitle="El historial se registra automáticamente cada vez que cambiás el precio.">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text)', marginBottom: 5 }}>Precio de venta <span style={{ color: '#EF4444' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', fontSize: 14, pointerEvents: 'none' }}>$</span>
                  <input type="number" value={form.precio} onChange={upd('precio')} style={{ ...iS, paddingLeft: 22 }} />
                </div>
                {cambio !== 0 && (
                  <p style={{ fontSize: 11, margin: '4px 0 0', color: cambio > 0 ? '#F87171' : '#34D399', fontWeight: 600 }}>
                    {cambio > 0 ? '▲' : '▼'} {fmtMoney(Math.abs(cambio))} vs. precio anterior
                  </p>
                )}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text)', marginBottom: 5 }}>Precio tachado</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', fontSize: 14, pointerEvents: 'none' }}>$</span>
                  <input type="number" value={form.precioTachado} onChange={upd('precioTachado')} style={{ ...iS, paddingLeft: 22 }} />
                </div>
              </div>
            </div>

            {/* Historial de precios */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Clock size={13} style={{ color: 'var(--color-muted)' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted)' }}>Historial de precios</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {producto.historialPrecios.slice().reverse().map((hp, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', background: 'var(--color-bg)', borderRadius: 7, fontSize: 13 }}>
                    <span style={{ color: 'var(--color-muted)' }}>{new Date(hp.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    <span style={{ fontWeight: 600, color: i === 0 ? 'var(--color-text)' : 'var(--color-muted)' }}>{fmtMoney(hp.precio)}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card title="Inventario">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text)', marginBottom: 5 }}>Stock actual</label>
                <input type="number" value={form.stock} onChange={upd('stock')} style={iS} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text)', marginBottom: 5 }}>Stock mínimo</label>
                <input type="number" value={form.stockMinimo} onChange={upd('stockMinimo')} style={iS} />
              </div>
            </div>
          </Card>

          <Card title="Imágenes" subtitle="Drag & drop para reordenar. La primera es la imagen principal.">
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImg} style={{ display: 'none' }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {form.imagenes.map((src, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={src} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--color-border)', display: 'block' }} />
                  <button onClick={() => setForm(p => ({ ...p, imagenes: p.imagenes.filter((_, j) => j !== i) }))}
                    style={{ position: 'absolute', top: -5, right: -5, width: 18, height: 18, borderRadius: '50%', background: '#EF4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={10} color="white" />
                  </button>
                </div>
              ))}
              {form.imagenes.length === 0 && (
                <div style={{ width: '100%', padding: '20px', borderRadius: 8, border: '1.5px dashed var(--color-border)', textAlign: 'center', color: 'var(--color-muted)', fontSize: 13, marginBottom: 8 }}>
                  Sin imágenes — el producto usa un ícono por defecto
                </div>
              )}
              <button onClick={() => fileRef.current?.click()} style={{ width: 80, height: 80, borderRadius: 8, border: '1.5px dashed var(--color-border)', background: 'var(--color-bg)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <ImagePlus size={18} style={{ color: 'var(--color-muted)' }} />
                <span style={{ fontSize: 10, color: 'var(--color-muted)' }}>Agregar</span>
              </button>
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card title="Estado">
            <select value={form.estado} onChange={upd('estado')} style={{ ...iS, cursor: 'pointer' }}>
              <option value="activo">Activo</option>
              <option value="borrador">Borrador</option>
              <option value="pausado">Pausado</option>
              <option value="agotado">Agotado</option>
            </select>
            <p style={{ fontSize: 11, color: 'var(--color-muted)', margin: '8px 0 0', lineHeight: 1.5 }}>
              {form.estado === 'activo'   ? 'Visible y disponible en tu tienda.' :
               form.estado === 'borrador' ? 'Solo visible para vos.' :
               form.estado === 'pausado'  ? 'Temporalmente oculto de tu tienda.' :
               'Sin stock — no disponible para comprar.'}
            </p>
          </Card>

          <Card title="Categorías">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {MOCK_CATEGORIAS.map(cat => (
                <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--color-body)' }}>
                  <input type="checkbox" checked={form.categorias.includes(cat.id)} onChange={() => toggleCat(cat.id)}
                    style={{ accentColor: 'var(--color-primary)', cursor: 'pointer', width: 14, height: 14 }} />
                  <span>{cat.nombre}</span>
                  {cat.parentId && <span style={{ fontSize: 10, color: 'var(--color-subtle)', background: 'var(--color-surface-alt)', padding: '1px 5px', borderRadius: 4 }}>sub</span>}
                </label>
              ))}
            </div>
          </Card>

          <Card title="Info del producto">
            {[
              { label: 'Creado',       value: new Date(producto.creadoEn).toLocaleDateString('es-AR') },
              { label: 'Actualizado',  value: new Date(producto.actualizadoEn).toLocaleDateString('es-AR') },
              { label: 'Unidades vendidas', value: String(producto.vendidos) },
              { label: 'Vistas totales',    value: String(producto.vistas) },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-border)', fontSize: 12 }}>
                <span style={{ color: 'var(--color-muted)' }}>{label}</span>
                <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  )
}
