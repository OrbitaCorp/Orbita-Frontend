// src/modules/ventas/admin/catalogo/Categorias.tsx — Vista P3
// Árbol jerárquico de categorías con editor lateral y modal de alta/edición.
// Es una sección propia del componentMap admin (`categorias`).

import { useState } from 'react'
import { useRouter } from 'next/router'
import { Plus, Edit2, Trash2, ChevronRight, Tag } from 'lucide-react'
import { Card } from '@/design-system/components/Card'
import { Button } from '@/design-system/components/Button'
import { Modal } from '@/design-system/components/Modal'
import { Toast } from '@/design-system/components/Toast'
import { CatalogoTabs } from './components/CatalogoTabs'
import { CAT_TREE0, CAT_EMOJIS, CAT_COLORS, slugify } from './mock/catalogo.mock'
import type { CatNode } from './types/catalogo.types'

// ─── Helpers inmutables sobre el árbol ────────────────────────────────────────

function treeMap(tree: CatNode[], id: string, fn: (c: CatNode) => CatNode): CatNode[] {
    return tree.map(c => c.id === id ? fn(c) : { ...c, subcategorias: treeMap(c.subcategorias, id, fn) })
}
function treeRemove(tree: CatNode[], id: string): CatNode[] {
    return tree.filter(c => c.id !== id).map(c => ({ ...c, subcategorias: treeRemove(c.subcategorias, id) }))
}
function treeAdd(tree: CatNode[], parentId: string | null, node: CatNode): CatNode[] {
    if (parentId === null) return [...tree, node]
    return tree.map(c => c.id === parentId ? { ...c, subcategorias: [...c.subcategorias, node] } : { ...c, subcategorias: treeAdd(c.subcategorias, parentId, node) })
}
function treeFind(tree: CatNode[], id: string, path: string[] = []): { cat: CatNode; path: string[] } | null {
    for (const c of tree) {
        if (c.id === id) return { cat: c, path: [...path, c.nombre] }
        const r = treeFind(c.subcategorias, id, [...path, c.nombre])
        if (r) return r
    }
    return null
}

interface ModalState { parentId?: string | null; parentNombre?: string; edit?: CatNode }

export default function Categorias() {
    const router = useRouter()
    const [arbol, setArbol] = useState<CatNode[]>(CAT_TREE0)
    const [exp, setExp] = useState<string[]>(['cat1', 'cat2'])
    const [selId, setSelId] = useState<string | null>(null)
    const [modal, setModal] = useState<ModalState | null>(null)
    const [toast, setToast] = useState<string | null>(null)

    const notify = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000) }
    const sel = selId ? treeFind(arbol, selId) : null

    const verProductos = () => {
        const { negocioId, moduloPadre } = router.query
        router.push({ query: { negocioId: negocioId as string, moduloPadre: moduloPadre as string, seccion: 'catalogo' } })
    }

    const renderCat = (c: CatNode, nivel = 0) => {
        const isExp = exp.includes(c.id)
        const hasSub = c.subcategorias.length > 0
        const isSel = selId === c.id
        return (
            <div key={c.id}>
                <div className="cat-row" onClick={() => setSelId(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px', paddingLeft: nivel * 20 + 8, borderRadius: 6, cursor: 'pointer', background: isSel ? 'var(--color-primary-bg)' : 'transparent', borderLeft: nivel > 0 ? '1px dashed var(--color-border)' : 'none', marginLeft: nivel > 0 ? (nivel - 1) * 20 + 6 : 0 }}>
                    {hasSub
                        ? <button onClick={e => { e.stopPropagation(); setExp(x => isExp ? x.filter(i => i !== c.id) : [...x, c.id]) }} style={{ width: 16, height: 16, border: 'none', background: 'transparent', color: 'var(--color-muted)', cursor: 'pointer', display: 'grid', placeItems: 'center', transform: isExp ? 'rotate(90deg)' : 'none', transition: 'transform 200ms' }}><ChevronRight size={14} strokeWidth={1.8} /></button>
                        : <span style={{ width: 16 }} />}
                    <span style={{ fontSize: nivel === 0 ? 16 : 14 }}>{c.icono}</span>
                    <span style={{ fontSize: 14 - nivel, fontWeight: nivel === 0 ? 600 : nivel === 1 ? 500 : 400, color: 'var(--color-text)', flex: 1, opacity: c.activa ? 1 : 0.5 }}>{c.nombre}</span>
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 9999, background: 'var(--color-surface-alt)', color: 'var(--color-muted)', border: '1px solid var(--color-border)', fontFamily: '"Geist Mono", monospace' }}>{c.productos}</span>
                    <div className="cat-actions" style={{ display: 'flex', gap: 2, opacity: 0, transition: 'opacity 150ms' }} onClick={e => e.stopPropagation()}>
                        <button title="Subcategoría" onClick={() => setModal({ parentId: c.id, parentNombre: c.nombre })} style={catBtn}><Plus size={13} strokeWidth={2} /></button>
                        <button title="Editar" onClick={() => setModal({ edit: c })} style={catBtn}><Edit2 size={13} strokeWidth={1.6} /></button>
                        <button title="Eliminar" onClick={() => { setArbol(a => treeRemove(a, c.id)); if (selId === c.id) setSelId(null); notify('Categoría eliminada') }} style={{ ...catBtn, color: 'var(--color-error)' }}><Trash2 size={13} strokeWidth={1.6} /></button>
                    </div>
                </div>
                {isExp && hasSub && <div>{c.subcategorias.map(s => renderCat(s, nivel + 1))}</div>}
            </div>
        )
    }

    return (
        <div style={pageWrap}>
            <CatalogoTabs activo="categorias" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text)', margin: 0 }}>Categorías</h1>
                <span style={{ display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 10px', borderRadius: 9999, background: 'var(--color-surface-alt)', color: 'var(--color-muted)', fontSize: 12, fontWeight: 600 }}>{arbol.length} raíz</span>
            </div>

            <style>{`.cat-row:hover .cat-actions{opacity:1 !important;}`}</style>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,60%) minmax(0,40%)', gap: 24, alignItems: 'start' }}>
                {/* Árbol */}
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>Árbol de categorías</span>
                        <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setModal({ parentId: null })}>Categoría raíz</Button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>{arbol.map(c => renderCat(c))}</div>
                </Card>

                {/* Editor */}
                {sel ? (
                    <Card>
                        <div style={{ fontSize: 11, color: 'var(--color-muted)', marginBottom: 4 }}>{sel.path.join(' › ')}</div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', marginBottom: 16 }}>{sel.cat.nombre}</div>
                        <CatField label="Nombre" value={sel.cat.nombre} onChange={v => setArbol(a => treeMap(a, sel.cat.id, c => ({ ...c, nombre: v })))} />
                        <CatField label="Slug" value={sel.cat.slug} mono onChange={v => setArbol(a => treeMap(a, sel.cat.id, c => ({ ...c, slug: v })))} />
                        <label style={{ ...cl, margin: '12px 0 8px' }}>Ícono</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                            {CAT_EMOJIS.slice(0, 10).map(e => <button key={e} onClick={() => setArbol(a => treeMap(a, sel.cat.id, c => ({ ...c, icono: e })))} style={{ width: 32, height: 32, borderRadius: 7, border: `1.5px solid ${sel.cat.icono === e ? 'var(--color-primary)' : 'var(--color-border)'}`, background: sel.cat.icono === e ? 'var(--color-primary-bg)' : 'var(--color-bg)', cursor: 'pointer', fontSize: 16 }}>{e}</button>)}
                        </div>
                        <label style={cl}>Color</label>
                        <div style={{ display: 'flex', gap: 8, margin: '8px 0 16px' }}>
                            {CAT_COLORS.map(col => <button key={col} onClick={() => setArbol(a => treeMap(a, sel.cat.id, c => ({ ...c, color: col })))} style={{ width: 28, height: 28, borderRadius: '50%', background: col, border: 'none', outline: sel.cat.color === col ? `2px solid ${col}` : 'none', outlineOffset: 2, cursor: 'pointer' }} />)}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--color-border)' }}>
                            <span style={{ fontSize: 13, color: 'var(--color-body)' }}>Visible en la tienda</span>
                            <Toggle34 on={sel.cat.activa} onClick={() => setArbol(a => treeMap(a, sel.cat.id, c => ({ ...c, activa: !c.activa })))} />
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace', marginTop: 6 }}>{sel.cat.productos} productos · <button onClick={verProductos} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>Ver productos →</button></div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                            <Button variant="primary" onClick={() => notify('Categoría actualizada')}>Guardar cambios</Button>
                            <Button variant="outline" onClick={() => setSelId(null)}>Cancelar</Button>
                        </div>
                    </Card>
                ) : (
                    <Card>
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-muted)' }}>
                            <Tag size={28} strokeWidth={1.4} style={{ opacity: 0.5 }} />
                            <div style={{ fontSize: 13, marginTop: 10 }}>Seleccioná una categoría para editarla</div>
                        </div>
                    </Card>
                )}
            </div>

            {modal && (
                <CatModal
                    modal={modal}
                    onClose={() => setModal(null)}
                    onSave={(campos, parentId, editId) => {
                        if (editId) {
                            setArbol(a => treeMap(a, editId, c => ({ ...c, ...campos })))
                            notify('Categoría actualizada')
                        } else {
                            const nuevo: CatNode = { ...campos, id: 'c' + Date.now(), productos: 0, subcategorias: [] }
                            setArbol(a => treeAdd(a, parentId, nuevo))
                            if (parentId) setExp(x => x.includes(parentId) ? x : [...x, parentId])
                            notify('Categoría creada')
                        }
                        setModal(null)
                    }}
                />
            )}

            {toast && (
                <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9000 }}>
                    <Toast variant="success" title={toast} onClose={() => setToast(null)} />
                </div>
            )}
        </div>
    )
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function CatField({ label, value, mono, onChange }: { label: string; value: string; mono?: boolean; onChange: (v: string) => void }) {
    return (
        <div style={{ marginBottom: 12 }}>
            <label style={cl}>{label}</label>
            <input value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%', height: 40, padding: '0 12px', marginTop: 6, background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 14, color: 'var(--color-text)', fontFamily: mono ? '"Geist Mono", monospace' : 'inherit', outline: 'none', boxSizing: 'border-box' }} />
        </div>
    )
}

function Toggle34({ on, onClick }: { on: boolean; onClick: () => void }) {
    return (
        <span onClick={onClick} style={{ width: 40, height: 22, borderRadius: 11, background: on ? 'var(--color-success)' : 'var(--color-surface-alt)', border: on ? 'none' : '1px solid var(--color-border)', position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
            <span style={{ position: 'absolute', top: on ? 3 : 2, left: on ? 21 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(15,23,42,0.15)', transition: 'left 200ms' }} />
        </span>
    )
}

// Campos que se editan en el modal — el nodo completo se arma en el padre.
type CatCampos = Pick<CatNode, 'nombre' | 'slug' | 'icono' | 'color' | 'activa'>

function CatModal({ modal, onClose, onSave }: { modal: ModalState; onClose: () => void; onSave: (campos: CatCampos, parentId: string | null, editId: string | null) => void }) {
    const editing = modal.edit
    const parentId = modal.parentId ?? null
    const [nombre, setNombre] = useState(editing?.nombre ?? '')
    const [icono, setIcono] = useState(editing?.icono ?? '👕')
    const [color, setColor] = useState(editing?.color ?? '#3B82F6')
    const [activa, setActiva] = useState(editing?.activa ?? true)
    const slug = slugify(nombre)

    const submit = () => {
        if (!nombre.trim()) return
        onSave({ nombre, slug, icono, color, activa }, parentId, editing ? editing.id : null)
    }

    return (
        <Modal
            isOpen
            onClose={onClose}
            title={editing ? `Editar: ${editing.nombre}` : 'Nueva categoría'}
            maxWidth={400}
            footer={<><Button variant="outline" onClick={onClose}>Cancelar</Button><Button variant="primary" disabled={!nombre.trim()} onClick={submit}>{editing ? 'Guardar' : 'Crear categoría'}</Button></>}
        >
            {modal.parentNombre && <span style={{ display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 10px', borderRadius: 9999, background: 'var(--color-primary-bg)', color: 'var(--color-primary)', fontSize: 12, fontWeight: 600, marginBottom: 14 }}>Subcategoría de: {modal.parentNombre}</span>}
            <CatField label="Nombre" value={nombre} onChange={setNombre} />
            <div style={{ fontSize: 11, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace', marginBottom: 12 }}>slug: {slug || '—'}</div>
            <label style={cl}>Ícono</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: 6, margin: '8px 0 14px' }}>
                {CAT_EMOJIS.map(e => <button key={e} onClick={() => setIcono(e)} style={{ height: 32, borderRadius: 7, border: `1.5px solid ${icono === e ? 'var(--color-primary)' : 'var(--color-border)'}`, background: icono === e ? 'var(--color-primary-bg)' : 'var(--color-bg)', cursor: 'pointer', fontSize: 16 }}>{e}</button>)}
            </div>
            <label style={cl}>Color</label>
            <div style={{ display: 'flex', gap: 8, margin: '8px 0 16px' }}>
                {CAT_COLORS.map(col => <button key={col} onClick={() => setColor(col)} style={{ width: 28, height: 28, borderRadius: '50%', background: col, border: 'none', outline: color === col ? `2px solid ${col}` : 'none', outlineOffset: 2, cursor: 'pointer' }} />)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--color-body)' }}>Activa</span>
                <Toggle34 on={activa} onClick={() => setActiva(!activa)} />
            </div>
        </Modal>
    )
}

const pageWrap: React.CSSProperties = { padding: '24px 32px 64px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }
const cl: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: 'var(--color-body)', display: 'block' }
const catBtn: React.CSSProperties = { width: 22, height: 22, borderRadius: 5, border: 'none', background: 'transparent', color: 'var(--color-muted)', cursor: 'pointer', display: 'grid', placeItems: 'center' }
