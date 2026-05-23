import { useState } from 'react'
import { Plus, Edit2, Trash2, ChevronRight, ChevronDown, FolderOpen, Folder, Check, X } from 'lucide-react'
import { Button } from '@/design-system/components/Button'
import { MOCK_CATEGORIAS } from './mock/catalogo.mock'
import type { Categoria } from './types/catalogo.types'

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

type Modo =
  | { tipo: 'idle' }
  | { tipo: 'nuevo-top' }
  | { tipo: 'nuevo-sub'; parentId: string }
  | { tipo: 'editar'; id: string }

export default function Categorias() {
  const [cats, setCats] = useState<Categoria[]>([...MOCK_CATEGORIAS])
  const [expandidas, setExpandidas] = useState<Set<string>>(new Set(['cat-1']))
  const [modo, setModo] = useState<Modo>({ tipo: 'idle' })
  const [form, setForm] = useState({ nombre: '', slug: '' })

  const padres = cats.filter(c => !c.parentId)
  const hijos = (parentId: string) => cats.filter(c => c.parentId === parentId)

  function toggleExpand(id: string) {
    setExpandidas(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  function iniciarNuevo(parentId?: string) {
    setModo(parentId ? { tipo: 'nuevo-sub', parentId } : { tipo: 'nuevo-top' })
    setForm({ nombre: '', slug: '' })
  }

  function iniciarEditar(cat: Categoria) {
    setModo({ tipo: 'editar', id: cat.id })
    setForm({ nombre: cat.nombre, slug: cat.slug })
  }

  function cancelar() { setModo({ tipo: 'idle' }); setForm({ nombre: '', slug: '' }) }

  function guardar() {
    if (!form.nombre.trim()) return
    const slug = form.slug.trim() || slugify(form.nombre)
    if (modo.tipo === 'editar') {
      setCats(cs => cs.map(c => c.id === modo.id ? { ...c, nombre: form.nombre.trim(), slug } : c))
    } else {
      const parentId = modo.tipo === 'nuevo-sub' ? modo.parentId : undefined
      const id = `cat-${Date.now()}`
      setCats(cs => [...cs, { id, nombre: form.nombre.trim(), slug, parentId, conteoProductos: 0 }])
      if (parentId) setExpandidas(s => new Set([...s, parentId]))
    }
    cancelar()
  }

  function eliminar(id: string) {
    setCats(cs => cs.filter(c => c.id !== id && c.parentId !== id))
  }

  const iS: React.CSSProperties = {
    boxSizing: 'border-box', height: 34, padding: '0 10px',
    border: '1px solid var(--color-border)', borderRadius: 7,
    background: 'var(--color-surface)', color: 'var(--color-text)',
    fontSize: 13, outline: 'none', fontFamily: 'inherit',
  }

  function FormInline({ depth = 0 }: { depth?: number }) {
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: `8px 12px 8px ${depth * 24 + 12}px`, borderBottom: '1px solid var(--color-border)', background: 'var(--color-primary-bg)' }}>
        <input
          autoFocus
          value={form.nombre}
          onChange={e => setForm(f => ({ ...f, nombre: e.target.value, slug: slugify(e.target.value) }))}
          placeholder="Nombre de la categoría"
          style={{ ...iS, flex: 2 }}
          onKeyDown={e => { if (e.key === 'Enter') guardar(); if (e.key === 'Escape') cancelar() }}
        />
        <input
          value={form.slug}
          onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
          placeholder="slug-url"
          style={{ ...iS, flex: 1, fontFamily: 'monospace', fontSize: 12 }}
        />
        <button
          onClick={guardar}
          style={{ height: 34, padding: '0 12px', background: 'var(--color-primary)', border: 'none', borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, color: 'white', fontWeight: 600, fontSize: 13, flexShrink: 0 }}
        >
          <Check size={14} /> Guardar
        </button>
        <button
          onClick={cancelar}
          style={{ height: 34, width: 34, background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          <X size={14} style={{ color: 'var(--color-muted)' }} />
        </button>
      </div>
    )
  }

  function CatRow({ cat, depth = 0 }: { cat: Categoria; depth?: number }) {
    const children = hijos(cat.id)
    const isOpen = expandidas.has(cat.id)
    const isEditing = modo.tipo === 'editar' && modo.id === cat.id

    if (isEditing) {
      return <FormInline depth={depth} />
    }

    return (
      <div>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: `10px 12px 10px ${depth * 24 + 4}px`, borderBottom: '1px solid var(--color-border)', transition: 'background 120ms' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-alt)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <button
            onClick={() => children.length > 0 && toggleExpand(cat.id)}
            style={{ background: 'none', border: 'none', padding: 4, cursor: children.length > 0 ? 'pointer' : 'default', display: 'flex', color: 'var(--color-muted)', borderRadius: 4, flexShrink: 0 }}
          >
            {children.length > 0
              ? (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />)
              : <span style={{ display: 'inline-block', width: 14 }} />}
          </button>

          {isOpen && children.length > 0
            ? <FolderOpen size={15} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
            : <Folder size={15} style={{ color: depth > 0 ? 'var(--color-muted)' : 'var(--color-muted)', flexShrink: 0 }} />}

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text)' }}>{cat.nombre}</span>
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--color-subtle)' }}>/{cat.slug}</span>
            {depth > 0 && (
              <span style={{ fontSize: 10, color: 'var(--color-subtle)', background: 'var(--color-surface-alt)', padding: '1px 5px', borderRadius: 4 }}>sub</span>
            )}
          </div>

          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-muted)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '2px 8px', flexShrink: 0 }}>
            {cat.conteoProductos} productos
          </span>

          <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
            {depth === 0 && (
              <button
                onClick={() => iniciarNuevo(cat.id)}
                title="Agregar subcategoría"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 5, color: 'var(--color-primary)', display: 'flex', borderRadius: 5 }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-primary-bg)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <Plus size={13} />
              </button>
            )}
            <button
              onClick={() => iniciarEditar(cat)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 5, color: 'var(--color-muted)', display: 'flex', borderRadius: 5 }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-alt)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={() => eliminar(cat.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 5, color: '#EF4444', display: 'flex', borderRadius: 5 }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Children */}
        {isOpen && children.map(child => <CatRow key={child.id} cat={child} depth={depth + 1} />)}

        {/* New sub-category form */}
        {modo.tipo === 'nuevo-sub' && modo.parentId === cat.id && isOpen && (
          <FormInline depth={depth + 1} />
        )}
        {modo.tipo === 'nuevo-sub' && modo.parentId === cat.id && !isOpen && (
          <FormInline depth={depth + 1} />
        )}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 40 }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Categorías</h1>
          <p style={{ fontSize: 13, color: 'var(--color-muted)', margin: '2px 0 0' }}>{cats.filter(c => !c.parentId).length} categorías principales · {cats.filter(c => !!c.parentId).length} subcategorías</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => iniciarNuevo()}>Nueva categoría</Button>
      </div>

      <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px 8px 52px', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ flex: 1, fontSize: 11, fontWeight: 600, color: 'var(--color-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nombre</div>
          <div style={{ width: 120, fontSize: 11, fontWeight: 600, color: 'var(--color-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right', paddingRight: 8 }}>Productos</div>
          <div style={{ width: 88 }} />
        </div>

        {/* Top-level new form */}
        {modo.tipo === 'nuevo-top' && <FormInline depth={0} />}

        {padres.map(cat => <CatRow key={cat.id} cat={cat} />)}

        {padres.length === 0 && modo.tipo === 'idle' && (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <Folder size={32} style={{ color: 'var(--color-border)', display: 'block', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, color: 'var(--color-muted)', margin: '0 0 16px' }}>No hay categorías aún</p>
            <button onClick={() => iniciarNuevo()} style={{ background: 'var(--color-primary)', border: 'none', borderRadius: 8, cursor: 'pointer', color: 'white', fontWeight: 600, fontSize: 13, padding: '8px 16px' }}>
              Crear primera categoría
            </button>
          </div>
        )}
      </div>

      <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', fontSize: 12, color: 'var(--color-body)' }}>
        Hacé clic en <strong>+</strong> junto a una categoría para agregar una subcategoría. Eliminar una categoría también elimina sus subcategorías.
      </div>
    </div>
  )
}
