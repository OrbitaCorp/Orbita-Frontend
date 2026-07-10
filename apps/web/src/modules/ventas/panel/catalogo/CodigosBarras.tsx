// src/modules/ventas/panel/catalogo/CodigosBarras.tsx — Submodulo Códigos de barras
// Selector de productos + cantidad + previsualización de código de barras + imprimir.

import { useState, useMemo } from 'react'
import { Search, Plus, Minus, Printer, Barcode, Trash2, PackageOpen } from 'lucide-react'
import { Button } from '@/design-system/components/Button'
import { CatalogoTabs } from './components/CatalogoTabs'
import { PRODUCTOS_DB } from './mock/catalogo.mock'
import type { Producto } from './types/catalogo.types'

// ─── Barcode SVG determinístico ────────────────────────────────────────────────

function BarcodeVisual({ value, width = 200, height = 64 }: { value: string; width?: number; height?: number }) {
    const barCount = 60
    const bars = useMemo(() => {
        const arr: boolean[] = []
        let h = 5381
        for (let i = 0; i < value.length; i++) h = ((h << 5) + h) ^ value.charCodeAt(i)
        for (let i = 0; i < barCount; i++) arr.push(((h >> i) & 1) === 1)
        return arr
    }, [value])

    const barW   = width / barCount
    const guardH = height * 0.85
    const dataH  = height * 0.72

    return (
        <svg viewBox={`0 0 ${width} ${height + 16}`} width={width} height={height + 16} xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
            {bars.map((dark, i) => (
                dark ? <rect key={i} x={i * barW} y={0} width={barW * (i % 7 === 0 ? 1.5 : 1)} height={i % 5 === 0 ? guardH : dataH} fill="currentColor" /> : null
            ))}
            <text x={width / 2} y={height + 12} textAnchor="middle" fontSize="9" fontFamily='"Geist Mono", monospace' fill="currentColor">{value}</text>
        </svg>
    )
}

// ─── Item en la cola de impresión ─────────────────────────────────────────────

interface QueueItem { producto: Producto; cantidad: number }

function PrintCard({ item, onChange, onRemove }: { item: QueueItem; onChange: (d: number) => void; onRemove: () => void }) {
    const total = item.producto.codigoBarras ?? item.producto.sku
    return (
        <div className="code-card" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                {/* Miniatura */}
                <div style={{ width: 44, height: 44, borderRadius: 8, background: `hsl(${item.producto.hue},65%,90%)`, display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: 18, color: `hsl(${item.producto.hue},55%,45%)` }}>
                    <Barcode size={20} strokeWidth={1.5} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.producto.nombre}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace', marginTop: 2 }}>{item.producto.sku}</div>
                </div>
                <button onClick={onRemove} style={{ width: 28, height: 28, border: 'none', borderRadius: 7, background: 'transparent', color: 'var(--color-muted)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                    <Trash2 size={13} strokeWidth={1.8} />
                </button>
            </div>

            {/* Código de barras preview */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 8px', background: '#fff', borderRadius: 8, border: '1px solid var(--color-border)', color: '#000' }}>
                <BarcodeVisual value={total} width={180} height={52} />
            </div>

            {/* Cantidad stepper */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>Cantidad a imprimir</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'var(--color-surface)', borderRadius: 8, border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                    <button onClick={() => onChange(-1)} disabled={item.cantidad <= 1} style={{ width: 32, height: 32, border: 'none', background: 'transparent', color: item.cantidad <= 1 ? 'var(--color-border)' : 'var(--color-text)', cursor: item.cantidad <= 1 ? 'not-allowed' : 'pointer', fontSize: 18, display: 'grid', placeItems: 'center' }}>
                        <Minus size={13} strokeWidth={2.2} />
                    </button>
                    <span style={{ minWidth: 36, textAlign: 'center', fontSize: 14, fontWeight: 700, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{item.cantidad}</span>
                    <button onClick={() => onChange(+1)} style={{ width: 32, height: 32, border: 'none', background: 'transparent', color: 'var(--color-text)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                        <Plus size={13} strokeWidth={2.2} />
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Hojas de impresión ocultas ────────────────────────────────────────────────

function PrintSheet({ queue }: { queue: QueueItem[] }) {
    return (
        <div id="print-sheet" style={{ display: 'none' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: 20 }}>
                {queue.flatMap(item =>
                    Array.from({ length: item.cantidad }, (_, i) => (
                        <div key={`${item.producto.id}-${i}`} style={{ border: '1px solid #ccc', borderRadius: 6, padding: '10px 12px', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4, pageBreakInside: 'avoid', background: '#fff', color: '#000' }}>
                            <div style={{ fontSize: 11, fontWeight: 600, maxWidth: 200, textAlign: 'center', fontFamily: 'sans-serif' }}>{item.producto.nombre}</div>
                            <BarcodeVisual value={item.producto.codigoBarras ?? item.producto.sku} width={180} height={52} />
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

// ─── Página principal ──────────────────────────────────────────────────────────

export default function CodigosBarras() {
    const [busqueda, setBusqueda] = useState('')
    const [queue,    setQueue]    = useState<QueueItem[]>([])

    const filtrados = useMemo(() => {
        const q = busqueda.trim().toLowerCase()
        return PRODUCTOS_DB.filter(p => !q || p.nombre.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
    }, [busqueda])

    const agregar = (p: Producto) => {
        setQueue(prev => {
            if (prev.find(x => x.producto.id === p.id)) return prev
            return [...prev, { producto: p, cantidad: 1 }]
        })
    }
    const cambiarCantidad = (id: string, d: number) => {
        setQueue(prev => prev.map(x => x.producto.id === id ? { ...x, cantidad: Math.max(1, x.cantidad + d) } : x))
    }
    const remover = (id: string) => setQueue(prev => prev.filter(x => x.producto.id !== id))
    const totalEtiquetas = queue.reduce((s, x) => s + x.cantidad, 0)

    const imprimir = () => {
        const sheet = document.getElementById('print-sheet')
        if (!sheet) return
        const w = window.open('', '_blank')
        if (!w) return
        w.document.write(`<!DOCTYPE html><html><head><title>Códigos de barras</title><style>
            body { margin: 0; font-family: sans-serif; }
            @media print { @page { margin: 12mm; } }
        </style></head><body>${sheet.innerHTML}</body></html>`)
        w.document.close()
        w.focus()
        setTimeout(() => { w.print(); w.close() }, 300)
    }

    const enQueue = (id: string) => queue.some(x => x.producto.id === id)

    return (
        <div style={{ padding: '24px 32px 64px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
            <style>{`
                @media (max-width: 768px) {
                    .code-layout { grid-template-columns: 1fr !important; }
                    .code-header { padding: 16px 14px 48px !important; }
                }
                .prod-sel-item:hover { background: var(--color-surface) !important; }
            `}</style>

            <CatalogoTabs activo="codigos" />

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text)', margin: 0 }}>Códigos de barras</h1>
                    <p style={{ fontSize: 13, color: 'var(--color-muted)', margin: '4px 0 0' }}>Seleccioná productos y la cantidad de etiquetas a imprimir.</p>
                </div>
                {queue.length > 0 && (
                    <Button variant="primary" icon={<Printer size={14} strokeWidth={1.8} />} onClick={imprimir}>
                        Imprimir {totalEtiquetas} etiqueta{totalEtiquetas !== 1 ? 's' : ''}
                    </Button>
                )}
            </div>

            <div className="code-layout" style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20, alignItems: 'start' }}>
                {/* ── Panel izquierdo: selector ── */}
                <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden', position: 'sticky', top: 80 }}>
                    <div style={{ padding: '14px 14px 12px', borderBottom: '1px solid var(--color-border)' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 10 }}>Productos</div>
                        <div style={{ position: 'relative' }}>
                            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', pointerEvents: 'none' }} />
                            <input
                                value={busqueda}
                                onChange={e => setBusqueda(e.target.value)}
                                placeholder="Buscar por nombre o SKU..."
                                style={{ width: '100%', height: 36, paddingLeft: 32, paddingRight: 10, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 13, color: 'var(--color-text)', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                            />
                        </div>
                    </div>

                    <div style={{ maxHeight: 460, overflowY: 'auto' }}>
                        {filtrados.length === 0 ? (
                            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-muted)', fontSize: 13 }}>
                                Sin resultados
                            </div>
                        ) : filtrados.map(p => {
                            const added = enQueue(p.id)
                            return (
                                <div
                                    key={p.id}
                                    className="prod-sel-item"
                                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: added ? 'var(--color-primary-bg)' : 'transparent', borderBottom: '1px solid var(--color-border)', transition: 'background 120ms' }}
                                >
                                    {/* Mini preview */}
                                    <div style={{ width: 36, height: 36, borderRadius: 8, background: `hsl(${p.hue},60%,90%)`, display: 'grid', placeItems: 'center', flexShrink: 0, color: `hsl(${p.hue},55%,45%)` }}>
                                        <Barcode size={16} strokeWidth={1.5} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.nombre}</div>
                                        <div style={{ fontSize: 11, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace', marginTop: 1 }}>{p.codigoBarras ?? p.sku}</div>
                                    </div>
                                    <button
                                        onClick={() => added ? remover(p.id) : agregar(p)}
                                        style={{ height: 30, padding: '0 10px', borderRadius: 8, border: `1px solid ${added ? 'var(--color-error)' : 'var(--color-primary)'}`, background: added ? 'var(--color-error-bg, #fef2f2)' : 'var(--color-primary-bg)', color: added ? 'var(--color-error)' : 'var(--color-primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 120ms', fontFamily: 'inherit' }}
                                    >
                                        {added ? 'Quitar' : '+ Agregar'}
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* ── Panel derecho: cola de impresión ── */}
                <div>
                    {queue.length === 0 ? (
                        <div style={{ border: '2px dashed var(--color-border)', borderRadius: 12, padding: '64px 24px', textAlign: 'center', color: 'var(--color-muted)' }}>
                            <PackageOpen size={40} strokeWidth={1.2} style={{ opacity: 0.35, margin: '0 auto 14px', display: 'block' }} />
                            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', marginBottom: 6 }}>Cola vacía</div>
                            <div style={{ fontSize: 13 }}>Agregá productos desde el panel izquierdo<br />para configurar y previsualizar sus códigos.</div>
                        </div>
                    ) : (
                        <>
                            {/* Barra de resumen */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, marginBottom: 14 }}>
                                <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>
                                    <strong style={{ color: 'var(--color-text)' }}>{queue.length}</strong> producto{queue.length !== 1 ? 's' : ''} · <strong style={{ color: 'var(--color-text)' }}>{totalEtiquetas}</strong> etiqueta{totalEtiquetas !== 1 ? 's' : ''} en total
                                </div>
                                <button onClick={() => setQueue([])} style={{ fontSize: 12, color: 'var(--color-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Vaciar cola</button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                                {queue.map(item => (
                                    <PrintCard
                                        key={item.producto.id}
                                        item={item}
                                        onChange={d => cambiarCantidad(item.producto.id, d)}
                                        onRemove={() => remover(item.producto.id)}
                                    />
                                ))}
                            </div>

                            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="primary" icon={<Printer size={14} strokeWidth={1.8} />} onClick={imprimir}>
                                    Imprimir {totalEtiquetas} etiqueta{totalEtiquetas !== 1 ? 's' : ''}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Hoja de impresión oculta */}
            <PrintSheet queue={queue} />
        </div>
    )
}
