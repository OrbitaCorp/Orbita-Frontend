// src/modules/ventas/panel/catalogo/ProductoNuevo.tsx — Vista P2
// Wizard de alta de producto en 4 pasos: Info, Imágenes, Precio y stock, Variantes/Publicar.

import { useMemo, useState } from 'react'
import type { ComponentType } from 'react'
import { Package, Eye, Banknote, Tag, Check, ChevronLeft, ChevronRight, Plus, X, Globe, FileText, Edit2, Sparkles } from 'lucide-react'
import { Card } from '@/design-system/components/Card'
import { Button } from '@/design-system/components/Button'
import { fmtMoney } from '@/lib/utils'
import { CatalogoTabs, ProductoEstadoBadge } from './components/CatalogoTabs'
import { ProductoThumb } from '../pedidos/components/ProductoThumb'
import { CATEGORIAS_DB, PRODUCTOS_DB, generarSKU } from './mock/catalogo.mock'
import type { EstadoProducto } from './types/catalogo.types'

interface TipoVariante { id: string; nombre: string; opciones: string[] }
interface ProdForm {
    nombre: string; descripcion: string; categoria: string; tags: string[]; estado: EstadoProducto
    imagenes: number[]; precio: string; precioComparacion: string; costo: string; sku: string; codigoBarras: string
    stock: number; stockMinimo: number; seguirVendiendo: boolean; tieneVariantes: boolean; tiposVariante: TipoVariante[]
}

interface ProductoNuevoProps {
    onVolver: () => void
    onToast:  (m: string) => void
}

export default function ProductoNuevo({ onVolver, onToast }: ProductoNuevoProps) {
    const [step, setStep] = useState(1)
    const [done, setDone] = useState<number[]>([])
    const [orbiGen, setOrbiGen] = useState(false)
    const [tagInput, setTagInput] = useState('')
    const [prod, setProd] = useState<ProdForm>({
        nombre: '', descripcion: '', categoria: '', tags: [], estado: 'publicado', imagenes: [],
        precio: '', precioComparacion: '', costo: '', sku: '', codigoBarras: '',
        stock: 1, stockMinimo: 5, seguirVendiendo: false, tieneVariantes: false,
        tiposVariante: [{ id: 'v1', nombre: 'Talle', opciones: ['XS', 'S', 'M', 'L'] }],
    })
    const set = <K extends keyof ProdForm>(k: K, v: ProdForm[K]) => setProd(p => ({ ...p, [k]: v }))

    const orbiDesc = () => {
        setOrbiGen(true)
        setTimeout(() => {
            const n = prod.nombre.toLowerCase()
            let txt: string
            if (n.includes('remera')) txt = 'Remera de corte oversize en algodón premium 180g. Ideal para looks casuales y urbanos. Lavar a 30°C. Fabricada en Argentina.'
            else if (n.includes('pantal')) txt = 'Pantalón con múltiples bolsillos de material robusto y cómodo. Tiro medio con calce regular. Fabricado en Argentina.'
            else if (n.includes('buzo')) txt = 'Buzo de interior de polar suave con capucha ajustable y bolsillo canguro. Material premium antiprilling. Fabricado en Argentina.'
            else txt = 'Producto de alta calidad diseñado en Argentina. Material premium, acabados de primera. Ideal para el uso diario.'
            set('descripcion', prod.descripcion ? prod.descripcion + '\n\n' + txt : txt)
            setOrbiGen(false)
            onToast('Descripción generada por Orbi')
        }, 1200)
    }

    const combos = useMemo(() => {
        if (!prod.tieneVariantes) return []
        const tipos = prod.tiposVariante.filter(tp => tp.opciones.length)
        if (!tipos.length) return []
        let res: string[][] = [[]]
        tipos.forEach(tp => {
            const next: string[][] = []
            res.forEach(combo => tp.opciones.forEach(op => next.push([...combo, op])))
            res = next
        })
        return res.map(c => ({
            key: c.join(' / '),
            sku: (prod.sku || 'SKU') + '-' + c.map(x => x.slice(0, 2).toUpperCase()).join('-'),
            precio: prod.precio || '0',
            stock: Math.floor((prod.stock || 0) / res.length),
        }))
    }, [prod.tieneVariantes, prod.tiposVariante, prod.precio, prod.stock, prod.sku])

    const req1 = prod.nombre.trim() !== ''
    const req3 = prod.precio !== ''
    const canNext = step === 1 ? req1 : step === 3 ? req3 : true

    const crear = () => {
        PRODUCTOS_DB.push({
            id: 'p' + (PRODUCTOS_DB.length + 1), nombre: prod.nombre || 'Nuevo producto', sku: prod.sku || generarSKU(prod.nombre),
            cat: prod.categoria || 'Remeras', precio: parseInt(prod.precio) || 0, precioAnt: prod.precioComparacion ? parseInt(prod.precioComparacion) : null,
            stock: prod.stock, stockMin: prod.stockMinimo, estado: prod.estado,
            variantes: prod.tieneVariantes ? (prod.tiposVariante[0]?.opciones ?? []) : [], colores: [], imagenes: prod.imagenes.length, hue: Math.floor(Math.random() * 360),
        })
        onToast(prod.estado === 'publicado' ? 'Producto publicado' : 'Producto guardado como borrador')
        onVolver()
    }
    const next = () => { setDone(d => [...new Set([...d, step])]); if (step < 4) setStep(step + 1); else crear() }

    const STEPS: [string, string, ComponentType<{ size?: number; strokeWidth?: number }>][] = [
        ['1', 'Info', Package], ['2', 'Imágenes', Eye], ['3', 'Precio y stock', Banknote], ['4', prod.tieneVariantes ? 'Variantes' : 'Publicar', Tag],
    ]
    const margen = prod.costo && prod.precio ? Math.round((1 - Number(prod.costo) / Number(prod.precio)) * 100) : null

    return (
        <div style={pageWrap}>
            <CatalogoTabs activo="crear" />
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text)', margin: '0 0 20px' }}>Crear producto</h1>

            {/* Stepper */}
            <div style={{ display: 'flex', alignItems: 'center', maxWidth: 720, marginBottom: 28 }}>
                {STEPS.map(([n, l, Icon], i) => {
                    const a = step === Number(n), dn = done.includes(Number(n)) || step > Number(n)
                    return (
                        <div key={n} style={{ display: 'flex', alignItems: 'center', flex: i < 3 ? 1 : 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ width: 30, height: 30, borderRadius: '50%', background: dn ? 'var(--color-success)' : a ? 'var(--color-primary)' : 'var(--color-surface-alt)', color: dn || a ? '#fff' : 'var(--color-muted)', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, fontFamily: '"Geist Mono", monospace' }}>{dn ? <Check size={14} strokeWidth={2.6} /> : n}</span>
                                <span style={{ fontSize: 13, fontWeight: a || dn ? 600 : 500, color: a || dn ? 'var(--color-text)' : 'var(--color-muted)' }}>{l}</span>
                            </div>
                            {i < 3 && <div style={{ flex: 1, height: 2, background: dn ? 'var(--color-success)' : 'var(--color-border)', margin: '0 12px' }} />}
                        </div>
                    )
                })}
            </div>

            <Card style={{ maxWidth: 840 }}>
                {/* PASO 1 — Info */}
                {step === 1 && (
                    <div>
                        <StepHd icon={Package} title="¿Qué estás vendiendo?" sub="Lo básico de tu producto." />
                        <div style={{ marginBottom: 18 }}>
                            <PField label="Nombre del producto" value={prod.nombre} onChange={v => set('nombre', v.slice(0, 80))} placeholder="Ej: Remera oversize negra" h={44} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                                <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>Usá palabras que tus clientes buscarían</span>
                                <span style={{ fontSize: 11, color: 'var(--color-subtle)', fontFamily: '"Geist Mono", monospace' }}>{prod.nombre.length}/80</span>
                            </div>
                        </div>
                        <div style={{ marginBottom: 18 }}>
                            <label style={lbl}>Descripción</label>
                            <textarea value={prod.descripcion} onChange={e => set('descripcion', e.target.value.slice(0, 2000))} rows={5} style={{ ...inputBase, width: '100%', resize: 'vertical', minHeight: 110, padding: '10px 12px', fontSize: 14, lineHeight: 1.6 }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                                <button onClick={orbiDesc} disabled={orbiGen} style={{ background: 'none', border: 'none', color: '#8B5CF6', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    {orbiGen ? <><span style={{ width: 12, height: 12, border: '2px solid #8B5CF6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'orbita-spin 0.7s linear infinite' }} /> Generando…</> : <><Sparkles size={13} /> Generar descripción con Orbi</>}
                                </button>
                                <span style={{ fontSize: 11, color: 'var(--color-subtle)', fontFamily: '"Geist Mono", monospace' }}>{prod.descripcion.length}/2000</span>
                            </div>
                        </div>
                        <div style={{ marginBottom: 18 }}>
                            <label style={lbl}>Categoría</label>
                            <select value={prod.categoria} onChange={e => set('categoria', e.target.value)} style={{ ...inputBase, width: '100%', height: 40, padding: '0 12px', cursor: 'pointer' }}>
                                <option value="">Elegí una categoría</option>
                                {CATEGORIAS_DB.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                            </select>
                        </div>
                        <div style={{ marginBottom: 18 }}>
                            <label style={lbl}>Etiquetas</label>
                            <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && tagInput.trim()) { set('tags', [...new Set([...prod.tags, tagInput.trim()])]); setTagInput('') } }} placeholder="Agregar etiqueta… presioná Enter" style={{ ...inputBase, width: '100%', height: 36, padding: '0 12px', fontSize: 13 }} />
                            {prod.tags.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                                    {prod.tags.map(tg => (
                                        <span key={tg} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 24, padding: '0 10px', borderRadius: 9999, background: 'var(--color-primary-bg)', color: 'var(--color-primary)', fontSize: 12, fontWeight: 500 }}>{tg}<button onClick={() => set('tags', prod.tags.filter(x => x !== tg))} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', display: 'grid', placeItems: 'center', padding: 0 }}><X size={11} strokeWidth={2} /></button></span>
                                    ))}
                                </div>
                            )}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8, alignItems: 'center' }}>
                                <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>Sugeridas:</span>
                                {['algodón', 'oversize', 'premium', 'nuevo', 'verano'].map(s => (
                                    <button key={s} onClick={() => set('tags', [...new Set([...prod.tags, s])])} style={{ height: 22, padding: '0 8px', borderRadius: 9999, border: '1px dashed var(--color-border)', background: 'transparent', color: 'var(--color-muted)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>{s}</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label style={lbl}>Estado</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                {([['publicado', 'Publicado', Eye, 'var(--color-success)'], ['borrador', 'Borrador', Edit2, 'var(--color-muted)']] as [EstadoProducto, string, ComponentType<{ size?: number; strokeWidth?: number }>, string][]).map(([id, l, Icon, col]) => {
                                    const a = prod.estado === id
                                    return <button key={id} onClick={() => set('estado', id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', height: 44, borderRadius: 8, border: `${a ? 2 : 1}px solid ${a ? col : 'var(--color-border)'}`, background: a ? `color-mix(in srgb, ${col} 8%, transparent)` : 'var(--color-bg)', color: a ? col : 'var(--color-body)', fontSize: 13, fontWeight: a ? 600 : 500, cursor: 'pointer', fontFamily: 'inherit' }}><Icon size={16} strokeWidth={1.6} /> {l}</button>
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* PASO 2 — Imágenes */}
                {step === 2 && (
                    <div>
                        <StepHd icon={Eye} title="¿Cómo se ve?" sub="Las fotos son lo que más vende." />
                        <div onClick={() => set('imagenes', [...prod.imagenes, 1])} style={{ border: '1.5px dashed var(--color-border)', borderRadius: 12, height: 180, display: 'grid', placeItems: 'center', background: 'var(--color-surface)', marginBottom: 10, cursor: 'pointer', overflow: 'hidden' }}>
                            {prod.imagenes.length > 0
                                ? <div style={{ position: 'relative', width: '100%', height: '100%' }}><ProductoThumb hue={220} size="100%" radius={12} /><span style={{ position: 'absolute', top: 10, right: 10, height: 20, padding: '0 8px', borderRadius: 9999, background: 'var(--color-primary)', color: '#fff', fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center' }}>Principal</span></div>
                                : <div style={{ textAlign: 'center', color: 'var(--color-muted)' }}><Plus size={32} strokeWidth={1.4} /><div style={{ fontSize: 13, marginTop: 8 }}>Arrastrá la foto principal</div><div style={{ fontSize: 11, color: 'var(--color-primary)' }}>o hacé click para elegir</div><div style={{ fontSize: 11, color: 'var(--color-subtle)', fontFamily: '"Geist Mono", monospace', marginTop: 4 }}>PNG, JPG · máx 5MB</div></div>}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 14 }}>
                            {[0, 1, 2, 3].map(j => {
                                const has = prod.imagenes.length > j + 1
                                return <div key={j} onClick={() => { if (!has) set('imagenes', [...prod.imagenes, 1]) }} style={{ height: 80, borderRadius: 8, border: '1.5px dashed var(--color-border)', background: 'var(--color-surface)', display: 'grid', placeItems: 'center', cursor: 'pointer', overflow: 'hidden' }}>{has ? <ProductoThumb hue={200 + j * 20} size="100%" radius={0} /> : <Plus size={18} style={{ color: 'var(--color-muted)' }} />}</div>
                            })}
                        </div>
                        <div style={{ padding: 14, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10 }}>
                            {['Fondo blanco para que resalte el producto', 'Mínimo 800×800px para buena calidad', 'Mostrá el producto desde distintos ángulos', 'La primera foto aparece en el catálogo'].map(tip => (
                                <div key={tip} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}><Check size={13} strokeWidth={2.2} style={{ color: 'var(--color-success)' }} /><span style={{ fontSize: 12, color: 'var(--color-body)' }}>{tip}</span></div>
                            ))}
                        </div>
                    </div>
                )}

                {/* PASO 3 — Precio y stock */}
                {step === 3 && (
                    <div>
                        <StepHd icon={Banknote} title="¿Cuánto cuesta?" sub="Precio, costo y disponibilidad." />
                        <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 10, padding: 20, marginBottom: 14 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                                <PField label="Precio de venta" value={prod.precio} onChange={v => set('precio', v.replace(/\D/g, ''))} prefix="$" mono big h={44} placeholder="0" />
                                <div><PField label="Precio de comparación" value={prod.precioComparacion} onChange={v => set('precioComparacion', v.replace(/\D/g, ''))} prefix="$" mono h={44} /><div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 4 }}>Si lo completás, aparece tachado con badge de oferta.</div></div>
                            </div>
                            <PField label="Costo del producto" value={prod.costo} onChange={v => set('costo', v.replace(/\D/g, ''))} prefix="$" mono h={40} />
                            <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 4 }}>Solo vos podés verlo. Sirve para calcular el margen.</div>
                            {prod.precio && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: 'var(--color-primary-bg)', border: '1px solid var(--color-primary)', borderRadius: 8, marginTop: 12 }}>
                                    <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>Vista:</span>
                                    <ProductoThumb hue={220} size={40} />
                                    <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{fmtMoney(Number(prod.precio))}</span>
                                    {prod.precioComparacion && <><span style={{ fontSize: 12, color: 'var(--color-subtle)', textDecoration: 'line-through', fontFamily: '"Geist Mono", monospace' }}>{fmtMoney(Number(prod.precioComparacion))}</span><span style={{ height: 20, padding: '0 8px', borderRadius: 9999, background: 'var(--color-error-bg)', color: 'var(--color-error)', fontSize: 10, fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>Oferta</span></>}
                                    <div style={{ flex: 1 }} />
                                    {margen != null && <span style={{ height: 24, padding: '0 10px', borderRadius: 9999, background: 'var(--color-success-bg)', color: 'var(--color-success)', fontSize: 12, fontWeight: 600, fontFamily: '"Geist Mono", monospace', display: 'inline-flex', alignItems: 'center' }}>Margen: {margen}%</span>}
                                </div>
                            )}
                        </div>
                        <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 10, padding: 20, marginBottom: 14 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                                <div><PField label="SKU" value={prod.sku} onChange={v => set('sku', v.toUpperCase())} mono placeholder="RM-OVR-NG" /><button onClick={() => set('sku', generarSKU(prod.nombre))} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', marginTop: 4, padding: 0 }}>Generar automáticamente</button></div>
                                <PField label="Código de barras" value={prod.codigoBarras} onChange={v => set('codigoBarras', v.replace(/\D/g, ''))} mono placeholder="7790001234567" />
                            </div>
                            <label style={lbl}>Cantidad disponible</label>
                            <StockStep value={prod.stock} onChange={v => set('stock', v)} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 14, marginTop: 14, alignItems: 'end' }}>
                                <div><PField label="Stock mínimo de alerta" value={String(prod.stockMinimo)} onChange={v => set('stockMinimo', Number(v.replace(/\D/g, '')) || 0)} mono /><div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 4 }}>Te avisamos cuando baje a este nivel</div></div>
                                <TogRow label="Seguir vendiendo sin stock" help="Los clientes pueden comprar aunque no haya unidades" on={prod.seguirVendiendo} onChange={v => set('seguirVendiendo', v)} />
                            </div>
                        </div>
                        <TogRow label="Este producto tiene variantes (talles, colores, etc.)" help="Configurarás el stock por cada variante en el paso siguiente" on={prod.tieneVariantes} onChange={v => set('tieneVariantes', v)} />
                    </div>
                )}

                {/* PASO 4 — Variantes */}
                {step === 4 && prod.tieneVariantes && (
                    <div>
                        <StepHd icon={Tag} title="Variantes del producto" sub="Configurá las opciones disponibles." />
                        {prod.tiposVariante.map((tp, ti) => (
                            <div key={tp.id} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 10, padding: 16, marginBottom: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                    <input value={tp.nombre} onChange={e => set('tiposVariante', prod.tiposVariante.map((x, j) => j === ti ? { ...x, nombre: e.target.value } : x))} style={{ ...inputBase, height: 36, padding: '0 10px', fontSize: 14, fontWeight: 500, flex: 1 }} />
                                    {prod.tiposVariante.length > 1 && <button onClick={() => set('tiposVariante', prod.tiposVariante.filter((_, j) => j !== ti))} style={iconBtn}><X size={15} strokeWidth={1.8} /></button>}
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                                    {tp.opciones.map(op => (
                                        <span key={op} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 26, padding: '0 10px', borderRadius: 9999, background: 'var(--color-primary-bg)', color: 'var(--color-primary)', border: '1px solid var(--color-primary)', fontSize: 12, fontWeight: 500 }}>{op}<button onClick={() => set('tiposVariante', prod.tiposVariante.map((x, j) => j === ti ? { ...x, opciones: x.opciones.filter(o => o !== op) } : x))} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', display: 'grid', placeItems: 'center', padding: 0 }}><X size={11} strokeWidth={2} /></button></span>
                                    ))}
                                    <OpInput tipo={tp.nombre} onAdd={v => set('tiposVariante', prod.tiposVariante.map((x, j) => j === ti ? { ...x, opciones: [...new Set([...x.opciones, v])] } : x))} />
                                </div>
                            </div>
                        ))}
                        {prod.tiposVariante.length < 3 && <Button variant="outline" size="sm" icon={<Plus size={15} />} onClick={() => set('tiposVariante', [...prod.tiposVariante, { id: 'v' + Date.now(), nombre: 'Color', opciones: [] }])} style={{ width: '100%', justifyContent: 'center' }}>Agregar tipo de variante</Button>}
                        {combos.length > 0 && (
                            <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden', marginTop: 16 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.4fr 100px 80px', alignItems: 'center', gap: 10, padding: '0 14px', height: 40, background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', fontSize: 11, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}><span>Variante</span><span>SKU</span><span>Precio</span><span>Stock</span></div>
                                {combos.slice(0, 8).map((c, i) => (
                                    <div key={c.key} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.4fr 100px 80px', alignItems: 'center', gap: 10, padding: '0 14px', height: 44, borderBottom: i < Math.min(7, combos.length - 1) ? '1px solid var(--color-border)' : 'none' }}>
                                        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{c.key}</span>
                                        <input defaultValue={c.sku} style={{ ...inputBase, height: 28, padding: '0 8px', fontSize: 11, fontFamily: '"Geist Mono", monospace', width: '100%' }} />
                                        <input defaultValue={c.precio} style={{ ...inputBase, height: 28, padding: '0 8px', fontSize: 11, fontFamily: '"Geist Mono", monospace', width: '100%' }} />
                                        <input defaultValue={c.stock} style={{ ...inputBase, height: 28, padding: '0 8px', fontSize: 11, fontFamily: '"Geist Mono", monospace', width: '100%' }} />
                                    </div>
                                ))}
                                {combos.length > 8 && <div style={{ padding: '10px 14px', fontSize: 12, color: 'var(--color-primary)', cursor: 'pointer' }}>Ver todas ({combos.length} combinaciones)</div>}
                            </div>
                        )}
                    </div>
                )}

                {/* PASO 4 — Publicar (sin variantes) */}
                {step === 4 && !prod.tieneVariantes && (
                    <div>
                        <StepHd icon={Tag} title="¡Listo para publicar!" sub="Revisá todo antes de crear." />
                        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20, display: 'grid', gridTemplateColumns: '80px 1fr', gap: 16 }}>
                            <ProductoThumb hue={220} size={80} radius={10} />
                            <div>
                                <div style={{ fontSize: 18, fontWeight: 700, color: prod.nombre ? 'var(--color-text)' : 'var(--color-muted)' }}>{prod.nombre || 'Sin nombre'}</div>
                                {prod.categoria && <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 10px', borderRadius: 9999, background: 'var(--color-surface-alt)', color: 'var(--color-muted)', fontSize: 11, fontWeight: 600, marginTop: 6 }}>{prod.categoria}</span>}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginTop: 12 }}>
                                    <div><div style={{ fontSize: 11, color: 'var(--color-muted)' }}>Precio</div><div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{prod.precio ? fmtMoney(Number(prod.precio)) : '—'}</div></div>
                                    <div><div style={{ fontSize: 11, color: 'var(--color-muted)' }}>Stock</div><div style={{ fontSize: 14, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{prod.stock}</div></div>
                                    <div><div style={{ fontSize: 11, color: 'var(--color-muted)' }}>SKU</div><div style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>{prod.sku || generarSKU(prod.nombre)}</div></div>
                                    <div><div style={{ fontSize: 11, color: 'var(--color-muted)' }}>Estado</div><ProductoEstadoBadge estado={prod.estado} /></div>
                                </div>
                            </div>
                        </div>
                        <button onClick={crear} style={{ width: '100%', height: 52, borderRadius: 10, border: 'none', background: prod.estado === 'publicado' ? 'var(--color-primary)' : 'var(--color-success)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginTop: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>{prod.estado === 'publicado' ? <><Globe size={18} strokeWidth={1.8} /> Publicar producto</> : <><FileText size={18} strokeWidth={1.8} /> Guardar como borrador</>}</button>
                    </div>
                )}

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--color-border)' }}>
                    {step > 1 ? <Button variant="outline" icon={<ChevronLeft size={14} />} onClick={() => setStep(step - 1)}>Volver</Button> : <div />}
                    <span style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>Paso {step} de 4</span>
                    {step < 4
                        ? <Button variant="primary" onClick={next}>Continuar <ChevronRight size={16} strokeWidth={2} /></Button>
                        : (prod.tieneVariantes ? <Button variant="primary" onClick={crear} style={{ background: 'var(--color-success)' }}>Crear producto</Button> : <div />)}
                </div>
            </Card>
        </div>
    )
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function StepHd({ icon: Icon, title, sub }: { icon: ComponentType<{ size?: number; strokeWidth?: number }>; title: string; sub: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--color-primary-bg)', color: 'var(--color-primary)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon size={20} strokeWidth={1.6} /></div>
            <div><h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>{title}</h2><div style={{ fontSize: 13, color: 'var(--color-muted)' }}>{sub}</div></div>
        </div>
    )
}

function PField({ label, value, onChange, placeholder, prefix, mono, h = 40, big }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; prefix?: string; mono?: boolean; h?: number; big?: boolean }) {
    return (
        <div>
            <label style={lbl}>{label}</label>
            <div style={{ display: 'flex', alignItems: 'center', height: h, padding: '0 12px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 8, gap: 6 }}>
                {prefix && <span style={{ color: 'var(--color-muted)', fontSize: big ? 18 : 14, fontFamily: '"Geist Mono", monospace' }}>{prefix}</span>}
                <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ flex: 1, height: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: big ? 18 : 14, fontWeight: big ? 600 : 400, color: 'var(--color-text)', fontFamily: mono ? '"Geist Mono", monospace' : 'inherit' }} />
            </div>
        </div>
    )
}

function StockStep({ value, onChange, h = 48 }: { value: number; onChange: (v: number) => void; h?: number }) {
    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', height: h, background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
            <button onClick={() => onChange(Math.max(0, value - 1))} style={{ width: h, height: '100%', border: 'none', background: 'transparent', color: 'var(--color-body)', cursor: 'pointer', fontSize: 18, fontWeight: 600 }}>−</button>
            <input value={value} onChange={e => onChange(Math.max(0, Number(e.target.value.replace(/\D/g, '')) || 0))} style={{ width: 60, height: '100%', textAlign: 'center', border: 'none', borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)', background: 'transparent', fontSize: 15, fontWeight: 600, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace', outline: 'none' }} />
            <button onClick={() => onChange(value + 1)} style={{ width: h, height: '100%', border: 'none', background: 'transparent', color: 'var(--color-body)', cursor: 'pointer', fontSize: 18, fontWeight: 600 }}>+</button>
        </div>
    )
}

function TogRow({ label, help, on, onChange }: { label: string; help?: string; on: boolean; onChange: (v: boolean) => void }) {
    return (
        <label style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, cursor: 'pointer' }}>
            <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{label}</div>{help && <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>{help}</div>}</div>
            <span onClick={e => { e.preventDefault(); onChange(!on) }} style={{ width: 40, height: 22, borderRadius: 11, background: on ? 'var(--color-success)' : 'var(--color-surface-alt)', border: on ? 'none' : '1px solid var(--color-border)', position: 'relative', flexShrink: 0 }}><span style={{ position: 'absolute', top: on ? 3 : 2, left: on ? 20 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(15,23,42,0.15)', transition: 'left 200ms' }} /></span>
        </label>
    )
}

function OpInput({ tipo, onAdd }: { tipo: string; onAdd: (v: string) => void }) {
    const [v, setV] = useState('')
    const ph = tipo.toLowerCase().includes('talle') ? 'Ej: XL' : tipo.toLowerCase().includes('color') ? 'Ej: Negro' : 'Nueva opción'
    const commit = () => { if (v.trim()) { onAdd(v.trim()); setV('') } }
    return <input value={v} onChange={e => setV(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') commit() }} onBlur={commit} placeholder={ph} style={{ ...inputBase, height: 30, width: 110, padding: '0 10px', fontSize: 12 }} />
}

const pageWrap: React.CSSProperties = { padding: '24px 32px 64px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }
const lbl: React.CSSProperties = { fontSize: 13, fontWeight: 500, color: 'var(--color-body)', marginBottom: 6, display: 'block' }
const inputBase: React.CSSProperties = { boxSizing: 'border-box', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text)', fontFamily: 'inherit', outline: 'none' }
const iconBtn: React.CSSProperties = { width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--color-muted)', cursor: 'pointer', display: 'grid', placeItems: 'center' }
