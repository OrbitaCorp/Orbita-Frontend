// src/modules/ventas/admin/pos/POSCierre.tsx — Vista 21
// Cierre de caja: resumen del turno, efectivo esperado y recuento.

import { useState } from 'react'
import { Card } from '@/design-system/components/Card'
import { fmtMoney } from '@/lib/utils'
import { POSTabs, type VistaPOS } from './components/POSTabs'
import { CfgField } from '../configuracion/components/ConfigControls'
import { ProductoThumb } from '../pedidos/components/ProductoThumb'
import { ModalComprobante } from '../pedidos/components/ModalComprobante'
import { TOP_PRODUCTOS } from '../reportes/mock/reportes.mock'

export default function POSCierre({ ir, onToast }: { ir: (v: VistaPOS) => void; onToast: (m: string) => void }) {
    const [comprobante, setComprobante] = useState(false)

    return (
        <div style={pageWrap}>
            <POSTabs activo="cierre" ir={ir} />
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text)', margin: '0 0 20px' }}>Cierre de caja</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 16, alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Card>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 14 }}>Ventas del turno</div>
                        <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace', marginBottom: 4 }}>{fmtMoney(248900)}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 16 }}>12 transacciones</div>
                        {([['Efectivo', 102400], ['Transferencia', 89000], ['Mercado Pago', 57500]] as [string, number][]).map(([l, v]) => (
                            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderTop: '1px solid var(--color-border)', fontSize: 13 }}>
                                <span style={{ color: 'var(--color-muted)' }}>{l}</span>
                                <span style={{ color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{fmtMoney(v)}</span>
                            </div>
                        ))}
                    </Card>
                    <Card>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 14 }}>Más vendidos</div>
                        {TOP_PRODUCTOS.slice(0, 4).map(p => (
                            <div key={p.sku} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                                <ProductoThumb hue={p.hue} size={32} />
                                <span style={{ flex: 1, fontSize: 13, color: 'var(--color-body)' }}>{p.nombre}</span>
                                <span style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>{p.unidades}u</span>
                            </div>
                        ))}
                    </Card>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Card>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 12 }}>Efectivo esperado</div>
                        {([['Apertura', 5000], ['Ventas efectivo', 102400]] as [string, number][]).map(([l, v]) => (
                            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}>
                                <span style={{ color: 'var(--color-muted)' }}>{l}</span>
                                <span style={{ color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{fmtMoney(v)}</span>
                            </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--color-border)', fontSize: 14, fontWeight: 600 }}>
                            <span style={{ color: 'var(--color-text)' }}>Total esperado</span>
                            <span style={{ color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{fmtMoney(107400)}</span>
                        </div>
                    </Card>
                    <Card>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 12 }}>Recuento manual</div>
                        <CfgField label="Total contado" value="$ 107.200" />
                        <div style={{ fontSize: 13, color: 'var(--color-warning)', fontFamily: '"Geist Mono", monospace' }}>Diferencia: −$200</div>
                    </Card>
                    <button onClick={() => { onToast('Caja cerrada · Comprobante generado'); setComprobante(true) }} style={{ width: '100%', height: 48, borderRadius: 10, border: 'none', background: '#EF4444', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cerrar caja</button>
                </div>
            </div>

            <ModalComprobante isOpen={comprobante} onClose={() => setComprobante(false)} tipo="cierre de caja" id="C-0042" />
        </div>
    )
}

const pageWrap: React.CSSProperties = { padding: '24px 32px 64px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }
