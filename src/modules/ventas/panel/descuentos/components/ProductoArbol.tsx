import { useState } from 'react'
import { ChevronRight, ChevronDown, Check, Search } from 'lucide-react'
import { Toggle } from '../../../_shared/components/Toggle'
import { categoriasMock } from '../mock/productos'
import type { Categoria } from '../types'

interface Props {
  productosIds: string[]
  onChange: (ids: string[]) => void
}

function CheckBox({ checked, indeterminate, onChange }: {
  checked: boolean; indeterminate?: boolean; onChange: () => void
}) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onChange() }}
      style={{
        width: 16, height: 16, borderRadius: 4, flexShrink: 0, cursor: 'pointer',
        border: checked || indeterminate ? 'none' : '1.5px solid var(--color-border-strong)',
        background: checked || indeterminate ? 'var(--color-primary)' : 'var(--color-bg)',
        display: 'grid', placeItems: 'center', padding: 0, transition: 'background 150ms ease',
      }}
    >
      {checked && <Check size={10} color="#fff" strokeWidth={3} />}
      {indeterminate && !checked && (
        <div style={{ width: 8, height: 2, borderRadius: 1, background: '#fff' }} />
      )}
    </button>
  )
}

export function ProductoArbol({ productosIds, onChange }: Props) {
  const selected = new Set(productosIds)
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set())
  const [expandedProds, setExpandedProds] = useState<Set<string>>(new Set())
  const [todasVariantes, setTodasVariantes] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()

  // Cuando hay búsqueda: filtrar productos por nombre y auto-expandir categorías con resultados
  const visibleCats: Categoria[] = q
    ? categoriasMock
        .map(cat => ({ ...cat, productos: cat.productos?.filter(p => p.nombre.toLowerCase().includes(q)) }))
        .filter(cat => (cat.productos?.length ?? 0) > 0)
    : categoriasMock

  const effectiveExpanded = q
    ? new Set(visibleCats.map(c => c.id))
    : expandedCats

  const toggleCat = (catId: string) => {
    if (q) return
    setExpandedCats(prev => { const s = new Set(prev); s.has(catId) ? s.delete(catId) : s.add(catId); return s })
  }

  const toggleProd = (prodId: string) =>
    setExpandedProds(prev => { const s = new Set(prev); s.has(prodId) ? s.delete(prodId) : s.add(prodId); return s })

  const catState = (cat: Categoria) => {
    const sel = cat.productos?.filter(p => selected.has(p.id)).length ?? 0
    const total = cat.productos?.length ?? 0
    if (sel === 0) return 'none'
    if (sel === total) return 'all'
    return 'some'
  }

  const toggleCatSelect = (cat: Categoria) => {
    const next = new Set(selected)
    const state = catState(cat)
    cat.productos?.forEach(p => { state === 'all' ? next.delete(p.id) : next.add(p.id) })
    onChange([...next])
  }

  const toggleProdSelect = (prodId: string) => {
    const next = new Set(selected)
    next.has(prodId) ? next.delete(prodId) : next.add(prodId)
    onChange([...next])
  }

  return (
    <div>
      {/* Buscador */}
      <div style={{ position: 'relative', marginBottom: 8 }}>
        <Search size={13} color="var(--color-muted)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar producto…"
          style={{
            width: '100%', height: 34, paddingLeft: 30, paddingRight: 10,
            borderRadius: 8, border: '1px solid var(--color-border)',
            background: 'var(--color-bg)', color: 'var(--color-text)',
            fontSize: 13, outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Árbol */}
      <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden', maxHeight: 280, overflowY: 'auto' }}>
        {visibleCats.length === 0 ? (
          <div style={{ padding: '28px 16px', textAlign: 'center', fontSize: 13, color: 'var(--color-muted)' }}>
            Sin resultados para "{query}"
          </div>
        ) : visibleCats.map(cat => {
          const cState = catState(cat)
          const isExp = effectiveExpanded.has(cat.id)
          return (
            <div key={cat.id}>
              <div
                onClick={() => toggleCat(cat.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
                  background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)',
                  cursor: q ? 'default' : 'pointer',
                }}
              >
                {q
                  ? <span style={{ width: 14 }} />
                  : isExp
                    ? <ChevronDown size={14} color="var(--color-muted)" />
                    : <ChevronRight size={14} color="var(--color-muted)" />
                }
                <CheckBox
                  checked={cState === 'all'}
                  indeterminate={cState === 'some'}
                  onChange={() => toggleCatSelect(cat)}
                />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', flex: 1 }}>{cat.nombre}</span>
                <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>{cat.productos?.length ?? 0} productos</span>
              </div>
              {isExp && cat.productos?.map(prod => {
                const prodSel = selected.has(prod.id)
                const prodExp = expandedProds.has(prod.id)
                const applyAll = !todasVariantes.has(prod.id)
                const hasVars = (prod.variantes?.length ?? 0) > 0
                return (
                  <div key={prod.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px 7px 36px', borderBottom: '1px solid var(--color-border)' }}>
                      {hasVars
                        ? <button type="button" onClick={() => toggleProd(prod.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                            {prodExp ? <ChevronDown size={13} color="var(--color-muted)" /> : <ChevronRight size={13} color="var(--color-muted)" />}
                          </button>
                        : <span style={{ width: 13 }} />
                      }
                      <CheckBox checked={prodSel} onChange={() => toggleProdSelect(prod.id)} />
                      <span style={{ fontSize: 13, color: 'var(--color-body)', flex: 1 }}>{prod.nombre}</span>
                      {hasVars && prodSel && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>Todas</span>
                          <Toggle
                            checked={applyAll}
                            onChange={() => setTodasVariantes(prev => {
                              const s = new Set(prev); applyAll ? s.add(prod.id) : s.delete(prod.id); return s
                            })}
                            size="sm"
                          />
                        </div>
                      )}
                    </div>
                    {hasVars && prodExp && !applyAll && prodSel && (
                      <div style={{ padding: '6px 12px 6px 64px', borderBottom: '1px solid var(--color-border)', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {prod.variantes?.map(v => (
                          <span key={v.id} style={{ height: 24, padding: '0 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', background: 'var(--color-primary-bg)', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}>
                            {v.nombre}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
