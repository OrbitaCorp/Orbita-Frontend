import { useState, useMemo } from 'react'
import { useRouter } from 'next/router'
import { Plus, Search, Upload, Tag, Filter, ChevronRight, Edit2, Eye, Trash2, MoreHorizontal, Package } from 'lucide-react'
import { Button } from '@/design-system/components/Button'
import { fmtMoney } from '@/lib/utils'
import { MOCK_PRODUCTOS, MOCK_CATEGORIAS } from './mock/catalogo.mock'
import type { EstadoProducto, Producto } from './types/catalogo.types'
import ProductoNuevo from './ProductoNuevo'
import ProductoEditar from './ProductoEditar'
import ProductoDetalle from './ProductoDetalle'
import ProductoVariantes from './ProductoVariantes'
import ImportarProductos from './ImportarProductos'

// ─── Estado badge ─────────────────────────────────────────────────────────────

const ESTADO_CONFIG: Record<EstadoProducto, { label: string; bg: string; fg: string; dot: string }> = {
  activo:  { label: 'Activo',   bg: 'rgba(52,211,153,0.12)',  fg: '#34D399', dot: '#10B981' },
  borrador:{ label: 'Borrador', bg: 'rgba(251,191,36,0.14)',  fg: '#FBBF24', dot: '#F59E0B' },
  agotado: { label: 'Agotado',  bg: 'rgba(248,113,113,0.12)', fg: '#F87171', dot: '#EF4444' },
  pausado: { label: 'Pausado',  bg: 'rgba(167,139,250,0.14)', fg: '#A78BFA', dot: '#8B5CF6' },
}

function EstadoBadge({ estado }: { estado: EstadoProducto }) {
  const c = ESTADO_CONFIG[estado]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 8px', borderRadius: 9999,
      background: c.bg, color: c.fg, fontSize: 11, fontWeight: 600,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.dot }} />
      {c.label}
    </span>
  )
}

// ─── Lista principal ──────────────────────────────────────────────────────────

function ListaView() {
  const router = useRouter()
  const { negocioId, moduloPadre } = router.query

  const ir = (vista: string, id?: string) => {
    const q: Record<string, string> = { negocioId: negocioId as string, moduloPadre: moduloPadre as string, seccion: 'catalogo', vista }
    if (id) q.id = id
    router.push({ query: q })
  }

  const [busqueda,   setBusqueda]   = useState('')
  const [filtroEst,  setFiltroEst]  = useState<string>('todos')
  const [filtroCat,  setFiltroCat]  = useState<string>('todas')
  const [menuAbierto, setMenuAbierto] = useState<string | null>(null)

  const productos = useMemo(() => {
    return MOCK_PRODUCTOS.filter(p => {
      const matchBusqueda = !busqueda || p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.sku.toLowerCase().includes(busqueda.toLowerCase())
      const matchEst = filtroEst === 'todos' || p.estado === filtroEst
      const matchCat = filtroCat === 'todas' || p.categorias.includes(filtroCat)
      return matchBusqueda && matchEst && matchCat
    })
  }, [busqueda, filtroEst, filtroCat])

  const totales = useMemo(() => ({
    activos:   MOCK_PRODUCTOS.filter(p => p.estado === 'activo').length,
    borradores: MOCK_PRODUCTOS.filter(p => p.estado === 'borrador').length,
    agotados:  MOCK_PRODUCTOS.filter(p => p.estado === 'agotado').length,
  }), [])

  const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--color-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--color-border)', whiteSpace: 'nowrap' }
  const td: React.CSSProperties = { padding: '12px 12px', fontSize: 13, color: 'var(--color-body)', borderBottom: '1px solid var(--color-border)', verticalAlign: 'middle' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Catálogo de productos</h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted)', margin: '2px 0 0' }}>{MOCK_PRODUCTOS.length} productos en total</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="outline" size="sm" icon={<Upload size={14} />} onClick={() => ir('importar')}>Importar</Button>
          <Button variant="outline" size="sm" icon={<Tag size={14} />} onClick={() => router.push({ query: { ...router.query, seccion: 'categorias' } })}>Categorías</Button>
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => ir('nuevo')}>Nuevo producto</Button>
        </div>
      </div>

      {/* Chips de estado */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
          { key: 'todos', label: `Todos (${MOCK_PRODUCTOS.length})` },
          { key: 'activo',   label: `Activos (${totales.activos})`    },
          { key: 'borrador', label: `Borradores (${totales.borradores})` },
          { key: 'agotado',  label: `Agotados (${totales.agotados})`   },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFiltroEst(key)}
            style={{
              padding: '5px 14px', borderRadius: 20, border: 'none',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: filtroEst === key ? 'var(--color-primary)' : 'var(--color-surface)',
              color:      filtroEst === key ? 'white'               : 'var(--color-body)',
              transition: 'all 150ms',
            }}
          >{label}</button>
        ))}
      </div>

      {/* Filtros y búsqueda */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 360 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-subtle)', pointerEvents: 'none' }} />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o SKU..."
            style={{
              width: '100%', boxSizing: 'border-box',
              height: 36, paddingLeft: 32, paddingRight: 12,
              border: '1px solid var(--color-border)', borderRadius: 8,
              background: 'var(--color-surface)', color: 'var(--color-text)',
              fontSize: 13, outline: 'none', fontFamily: 'inherit',
            }}
          />
        </div>

        <select
          value={filtroCat}
          onChange={e => setFiltroCat(e.target.value)}
          style={{
            height: 36, padding: '0 10px',
            border: '1px solid var(--color-border)', borderRadius: 8,
            background: 'var(--color-surface)', color: 'var(--color-body)',
            fontSize: 13, cursor: 'pointer', outline: 'none', fontFamily: 'inherit',
          }}
        >
          <option value="todas">Todas las categorías</option>
          {MOCK_CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div style={{ flex: 1, background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface)' }}>
                <th style={th}>Producto</th>
                <th style={th}>SKU</th>
                <th style={{ ...th, textAlign: 'right' }}>Precio</th>
                <th style={{ ...th, textAlign: 'center' }}>Stock</th>
                <th style={th}>Estado</th>
                <th style={th}>Categoría</th>
                <th style={{ ...th, textAlign: 'right' }}>Vendidos</th>
                <th style={{ ...th, width: 48 }}></th>
              </tr>
            </thead>
            <tbody>
              {productos.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ ...td, textAlign: 'center', padding: 48 }}>
                    <Package size={32} style={{ color: 'var(--color-border)', marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
                    <div style={{ fontSize: 14, color: 'var(--color-muted)' }}>No se encontraron productos</div>
                  </td>
                </tr>
              )}
              {productos.map(p => {
                const catNames = p.categorias.map(cid => MOCK_CATEGORIAS.find(c => c.id === cid)?.nombre).filter(Boolean).join(', ')
                const stockBajo = p.stock > 0 && p.stock <= p.stockMinimo
                return (
                  <tr
                    key={p.id}
                    style={{ cursor: 'pointer', transition: 'background 120ms' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => ir('detalle', p.id)}
                  >
                    <td style={td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                          background: 'var(--color-surface-alt)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 18,
                        }}>
                          {p.categorias.includes('cat-2') ? '👟' : p.categorias.includes('cat-3') ? '🎩' : '👕'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: 13 }}>{p.nombre}</div>
                          {p.variantes.length > 0 && (
                            <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 1 }}>{p.variantes.length} variantes</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ ...td, fontFamily: 'monospace', fontSize: 12, color: 'var(--color-muted)' }}>{p.sku}</td>
                    <td style={{ ...td, textAlign: 'right' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{fmtMoney(p.precio)}</div>
                      {p.precioTachado && <div style={{ fontSize: 11, color: 'var(--color-subtle)', textDecoration: 'line-through' }}>{fmtMoney(p.precioTachado)}</div>}
                    </td>
                    <td style={{ ...td, textAlign: 'center' }}>
                      <span style={{
                        fontWeight: 600, fontSize: 13,
                        color: p.stock === 0 ? '#EF4444' : stockBajo ? '#F59E0B' : 'var(--color-text)',
                      }}>
                        {p.stock}
                      </span>
                      {stockBajo && <div style={{ fontSize: 10, color: '#F59E0B' }}>stock bajo</div>}
                    </td>
                    <td style={td}><EstadoBadge estado={p.estado} /></td>
                    <td style={{ ...td, fontSize: 12, color: 'var(--color-muted)' }}>{catNames || '—'}</td>
                    <td style={{ ...td, textAlign: 'right', fontWeight: 600, color: 'var(--color-text)' }}>{p.vendidos}</td>
                    <td style={{ ...td, textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <button
                          onClick={e => { e.stopPropagation(); setMenuAbierto(menuAbierto === p.id ? null : p.id) }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--color-muted)', display: 'flex', borderRadius: 6 }}
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {menuAbierto === p.id && (
                          <div style={{
                            position: 'absolute', right: 0, top: '100%', zIndex: 50,
                            background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                            borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                            minWidth: 150, overflow: 'hidden',
                          }}>
                            {[
                              { icon: <Eye size={13} />, label: 'Ver detalle', onClick: () => ir('detalle', p.id) },
                              { icon: <Edit2 size={13} />, label: 'Editar',     onClick: () => ir('editar', p.id)  },
                              { icon: <ChevronRight size={13} />, label: 'Variantes', onClick: () => ir('variantes', p.id) },
                            ].map(item => (
                              <button
                                key={item.label}
                                onClick={() => { setMenuAbierto(null); item.onClick() }}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 8,
                                  width: '100%', padding: '8px 12px',
                                  background: 'none', border: 'none', cursor: 'pointer',
                                  fontSize: 13, color: 'var(--color-body)', textAlign: 'left',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-alt)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                              >
                                {item.icon}{item.label}
                              </button>
                            ))}
                            <div style={{ borderTop: '1px solid var(--color-border)' }} />
                            <button
                              style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                width: '100%', padding: '8px 12px',
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: 13, color: '#EF4444', textAlign: 'left',
                              }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                            >
                              <Trash2 size={13} />Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px', borderTop: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          fontSize: 12, color: 'var(--color-muted)',
        }}>
          <span>Mostrando {productos.length} de {MOCK_PRODUCTOS.length} productos</span>
        </div>
      </div>
    </div>
  )
}

// ─── Hub ──────────────────────────────────────────────────────────────────────

export default function ProductoLista() {
  const router = useRouter()
  const { vista, id } = router.query

  const volver = () => {
    const { vista: _v, id: _i, ...rest } = router.query
    router.push({ query: rest })
  }
  const irA = (v: string, pid?: string) => {
    const { vista: _v, id: _i, ...rest } = router.query
    const q: Record<string, string | string[]> = { ...rest, vista: v }
    if (pid) q.id = pid
    router.push({ query: q })
  }

  if (vista === 'nuevo')     return <ProductoNuevo onVolver={volver} />
  if (vista === 'editar')    return <ProductoEditar id={id as string} onVolver={volver} />
  if (vista === 'detalle')   return <ProductoDetalle id={id as string} onVolver={volver} onEditar={() => irA('editar', id as string)} onVariantes={() => irA('variantes', id as string)} />
  if (vista === 'variantes') return <ProductoVariantes id={id as string} onVolver={() => irA('detalle', id as string)} />
  if (vista === 'importar')  return <ImportarProductos onVolver={volver} />

  return <ListaView />
}
