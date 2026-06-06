// Modal de comprobante — vista previa imprimible de un pedido / devolución / nota.
// Construido sobre el Modal genérico del design system.

import { Eye, Download, Printer } from 'lucide-react'
import { Modal } from '@/design-system/components/Modal'
import { Button } from '@/design-system/components/Button'
import { fmtMoney } from '@/lib/utils'

interface ModalComprobanteProps {
    isOpen:  boolean
    onClose: () => void
    tipo?:   string
    id?:     string
    onToast?: (msg: string) => void
}

export function ModalComprobante({ isOpen, onClose, tipo = 'pedido', id = '1284', onToast }: ModalComprobanteProps) {
    const filas: [string, string][] = [
        ['Cliente',   'María Fernández'],
        ['Fecha',     '17 may 2026 · 14:32'],
        ['Productos', '2 ítems'],
        ['Método',    'Tarjeta Visa'],
    ]

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Comprobante de ${tipo} #${id}`} maxWidth={440}>
            <div style={{ border: '1px solid var(--color-border)', borderRadius: 12, padding: 20, background: 'var(--color-surface)' }}>
                {/* Encabezado del comprobante */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 14, borderBottom: '1px dashed var(--color-border)', marginBottom: 14 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#2563EB,#3B82F6)', display: 'grid', placeItems: 'center' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>Rama Indumentaria</div>
                        <div style={{ fontSize: 11, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>Comprobante #{id}</div>
                    </div>
                </div>

                {filas.map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0' }}>
                        <span style={{ color: 'var(--color-muted)' }}>{k}</span>
                        <span style={{ color: 'var(--color-text)', fontFamily: k === 'Fecha' ? '"Geist Mono", monospace' : 'inherit' }}>{v}</span>
                    </div>
                ))}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--color-border)' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>Total</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{fmtMoney(48900)}</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 16 }}>
                <Button variant="outline" size="sm" icon={<Eye size={15} />} onClick={() => onToast?.('Abriendo vista previa…')}>Ver</Button>
                <Button variant="outline" size="sm" icon={<Download size={15} />} onClick={() => onToast?.('Descargando PDF…')}>PDF</Button>
                <Button variant="outline" size="sm" icon={<Printer size={15} />} onClick={() => onToast?.('Enviando a impresora…')}>Imprimir</Button>
            </div>
        </Modal>
    )
}
