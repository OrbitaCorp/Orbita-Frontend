import { useState, useRef } from 'react'
import { ChevronLeft, ImagePlus, X, Save, AlertCircle } from 'lucide-react'
import { Button } from '@/design-system/components/Button'
import { fmtMoney } from '@/lib/utils'
import { MOCK_CATEGORIAS } from './mock/catalogo.mock'
import type { EstadoProducto } from './types/catalogo.types'

type Props = { onVolver: () => void }

const iS: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', height: 38, padding: '0 12px',
  border: '1px solid var(--color-border)', borderRadius: 8,
  background: 'var(--color-surface)', color: 'var(--color-text)',
  fontSize: 14, outline: 'none', fontFamily: 'inherit',
}

function Lbl({ children, req }: { children: React.ReactNode; req?: boolean }) {
  return (
    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text)', marginBottom: 5 }}>
      {children}{req && <span style={{ color: '#EF4444', marginLeft: 2 }}>*</span>}
    </label>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 16px' }}>{title}</h3>
      {children}
    </div>
  )
}

export default function ProductoNuevo({ onVolver }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [guardando, setGuardando] = useState(false)
  const [guardado,  setGuardado]  = useState(false)
  const [form, setForm] = useState({
    nombre: '', descripcion: '', sku: '', precio: '', precioTachado: '',
    stock: '', stockMinimo: '5', estado: 'borrador' as EstadoProducto,
    categorias: [] as string[], imagenes: [] as string[],
  })

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  function toggleCat(id: string) {
    setForm(p => ({ ...p, categorias: p.categorias.includes(id) ? p.categorias.filter(c => c !== id) : [...p.categorias, id] }))
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

  const descuento = form.precio && form.precioTachado && +form.precioTachado > +form.precio
    ? Math.round((1 - +form.precio / +form.precioTachado) * 100) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 40 }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onVolver} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: 'var(--color-muted)', borderRadius: 6, display: 'flex' }}>
          <ChevronLeft size={18} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', margin: 0, flex: 1 }}>Nuevo producto</h1>
        <Button variant="secondary" size="sm" onClick={onVolver}>Cancelar</Button>
        <Button variant="primary" size="sm" icon={<Save size={14} />} loading={guardando} disabled={!form.nombre.trim() || !form.precio} onClick={guardar}>
          {guardado ? '¡Guardado!' : 'Guardar producto'}
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 288px', gap: 16, alignItems: 'start' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card title="Información básica">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><Lbl req>Nombre del producto</Lbl><input value={form.nombre} onChange={upd('nombre')} placeholder="Ej: Remera Básica Algodón" style={iS} /></div>
              <div>
                <Lbl>Descripción</Lbl>
                <textarea value={form.descripcion} onChange={upd('descripcion')} placeholder="Describí el producto, sus materiales y características..." rows={4}
                  style={{ ...iS, height: 'auto', padding: '9px 12px', resize: 'vertical' }} />
              </div>
              <div>
                <Lbl>SKU</Lbl>
                <input value={form.sku} onChange={upd('sku')} placeholder="Ej: REM-BAS-001 (opcional)" style={iS} />
                <p style={{ fontSize: 11, color: 'var(--color-muted)', margin: '4px 0 0' }}>Se genera automáticamente si lo dejás vacío.</p>
              </div>
            </div>
          </Card>

          <Card title="Precios">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <Lbl req>Precio de venta</Lbl>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', fontSize: 14, pointerEvents: 'none' }}>$</span>
                  <input type="number" value={form.precio} onChange={upd('precio')} placeholder="0" style={{ ...iS, paddingLeft: 22 }} />
                </div>
                {form.precio && <p style={{ fontSize: 11, color: 'var(--color-muted)', margin: '4px 0 0' }}>{fmtMoney(+form.precio)}</p>}
              </div>
              <div>
                <Lbl>Precio tachado</Lbl>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', fontSize: 14, pointerEvents: 'none' }}>$</span>
                  <input type="number" value={form.precioTachado} onChange={upd('precioTachado')} placeholder="0" style={{ ...iS, paddingLeft: 22 }} />
                </div>
              </div>
            </div>
            {descuento > 0 && (
              <div style={{ marginTop: 10, padding: '7px 12px', background: 'rgba(52,211,153,0.1)', borderRadius: 8, fontSize: 12, color: '#34D399', fontWeight: 600 }}>
                {descuento}% de descuento automático
              </div>
            )}
          </Card>

          <Card title="Inventario">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <Lbl>Stock inicial</Lbl>
                <input type="number" value={form.stock} onChange={upd('stock')} placeholder="0" style={iS} />
              </div>
              <div>
                <Lbl>Stock mínimo</Lbl>
                <input type="number" value={form.stockMinimo} onChange={upd('stockMinimo')} style={iS} />
                <p style={{ fontSize: 11, color: 'var(--color-muted)', margin: '4px 0 0' }}>Alerta cuando baje de este número</p>
              </div>
            </div>
          </Card>

          <Card title="Imágenes del producto">
            <p style={{ fontSize: 12, color: 'var(--color-muted)', margin: '0 0 14px' }}>La primera imagen será la principal. Podés reordenar arrastrando.</p>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImg} style={{ display: 'none' }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {form.imagenes.map((src, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={src} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--color-border)', display: 'block' }} />
                  {i === 0 && <span style={{ position: 'absolute', bottom: 3, left: 3, fontSize: 9, fontWeight: 700, background: 'rgba(0,0,0,0.65)', color: 'white', padding: '1px 5px', borderRadius: 4 }}>Principal</span>}
                  <button onClick={() => setForm(p => ({ ...p, imagenes: p.imagenes.filter((_, j) => j !== i) }))}
                    style={{ position: 'absolute', top: -5, right: -5, width: 18, height: 18, borderRadius: '50%', background: '#EF4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={10} color="white" />
                  </button>
                </div>
              ))}
              <button onClick={() => fileRef.current?.click()} style={{
                width: 80, height: 80, borderRadius: 8, border: '1.5px dashed var(--color-border)',
                background: 'var(--color-bg)', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
              }}>
                <ImagePlus size={18} style={{ color: 'var(--color-muted)' }} />
                <span style={{ fontSize: 10, color: 'var(--color-muted)' }}>Agregar</span>
              </button>
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card title="Estado">
            <select value={form.estado} onChange={upd('estado')} style={{ ...iS, cursor: 'pointer' }}>
              <option value="borrador">Borrador</option>
              <option value="activo">Activo</option>
              <option value="pausado">Pausado</option>
            </select>
            <p style={{ fontSize: 11, color: 'var(--color-muted)', margin: '8px 0 0', lineHeight: 1.5 }}>
              {form.estado === 'borrador' ? 'Solo visible para vos. Publicalo cuando esté listo.' :
               form.estado === 'activo'   ? 'Visible en tu tienda y disponible para comprar.' :
               'No visible en tu tienda temporalmente.'}
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

          <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', gap: 8 }}>
            <AlertCircle size={14} style={{ color: '#60A5FA', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 11, color: 'var(--color-body)', margin: 0, lineHeight: 1.5 }}>
              Guardá primero y luego gestioná las variantes desde el detalle del producto.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
