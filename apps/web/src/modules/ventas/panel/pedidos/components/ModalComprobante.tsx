// Modal de comprobante — vista previa imprimible de un pedido / devolución / nota.
// Construido sobre el Modal genérico del design system.
//
// (Fase 2 — Alex) Para los PEDIDOS este modal ya trabaja con datos reales:
// carga el pedido del backend, muestra el resumen, y desde acá se abre el
// comprobante completo (el mismo diseño que ve el cliente en la tienda) para
// imprimirlo o guardarlo como PDF desde el diálogo del navegador. También se
// lo puede mandar por email al cliente con un click. Para devoluciones y
// notas de crédito sigue la vista de muestra: esas llegan con la Fase 4.

import { useEffect, useState } from 'react'
import { Eye, Mail, Printer } from 'lucide-react'
import { Modal } from '@/design-system/components/Modal'
import { Button } from '@/design-system/components/Button'
import { fmtMoney } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { ApiError, getOrder, receiptOrder, type ApiOrderDetail } from '@/lib/api'
import { ComprobanteBase, type ComprobanteItem, type ComprobanteTotal } from '@/components/shared/ComprobanteBase'

const ESTADO_TXT: Record<string, string> = {
    PENDING: 'Pendiente', CONFIRMED: 'Confirmado', PREPARING: 'En preparación',
    SHIPPED: 'Enviado', DELIVERED: 'Entregado', COMPLETED: 'Completado', CANCELLED: 'Cancelado',
}

function fmtFechaLarga(iso: string): { fecha: string; hora: string } {
    const d = new Date(iso)
    const m = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
    return {
        fecha: `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()}`,
        hora: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
    }
}

interface ModalComprobanteProps {
    isOpen:  boolean
    onClose: () => void
    tipo?:   string
    id?:     string
    onToast?: (msg: string) => void
}

export function ModalComprobante({ isOpen, onClose, tipo = 'pedido', id, onToast }: ModalComprobanteProps) {
    const { user } = useAuth()
    const esPedido = tipo === 'pedido'

    const [pedido, setPedido]     = useState<ApiOrderDetail | null>(null)
    const [cargando, setCargando] = useState(false)
    const [errorCarga, setErrorCarga] = useState<string | null>(null)
    // La vista grande imprimible; con autoPrint abre solo el diálogo de imprimir.
    const [vista, setVista]       = useState<null | { autoPrint: boolean }>(null)
    const [enviando, setEnviando] = useState(false)

    // Al abrir el modal traigo el pedido real.
    useEffect(() => {
        if (!isOpen || !esPedido || !id) return
        let cancelado = false
        setCargando(true)
        setPedido(null)
        setErrorCarga(null)
        getOrder(id)
            .then(o => { if (!cancelado) setPedido(o) })
            .catch(() => { if (!cancelado) setErrorCarga('No se pudo cargar el pedido.') })
            .finally(() => { if (!cancelado) setCargando(false) })
        return () => { cancelado = true }
    }, [isOpen, esPedido, id])

    if (!isOpen) return null

    const nombreCliente = pedido?.customer
        ? `${pedido.customer.firstName}${pedido.customer.lastName ? ' ' + pedido.customer.lastName : ''}`
        : pedido?.onlineOrderDetails?.buyerName ?? 'Consumidor final'
    const emailCliente = pedido?.customer?.email ?? pedido?.onlineOrderDetails?.buyerEmail ?? null

    const enviarEmail = async () => {
        if (!pedido || !emailCliente || enviando) return
        setEnviando(true)
        try {
            await receiptOrder(pedido.id, emailCliente)
            onToast?.(`Comprobante enviado a ${emailCliente}`)
        } catch (e) {
            onToast?.(e instanceof ApiError ? e.message : 'No se pudo enviar el comprobante.')
        } finally {
            setEnviando(false)
        }
    }

    // ── La vista completa imprimible (tapa toda la pantalla) ──
    if (vista && pedido) {
        const { fecha, hora } = fmtFechaLarga(pedido.createdAt)
        const items: ComprobanteItem[] = pedido.items.map(it => ({
            descripcion: it.productName,
            subtitulo: it.variantLabel ?? undefined,
            qty: it.quantity,
            subtotal: it.quantity * (it.editedPrice ?? it.unitPrice),
        }))
        const totales: ComprobanteTotal[] = [
            { label: 'Subtotal', valor: pedido.subtotal, tipo: 'normal' },
            ...(pedido.discountTotal > 0 ? [{ label: 'Descuento', valor: -pedido.discountTotal, tipo: 'descuento' as const }] : []),
            ...(pedido.onlineOrderDetails?.shippingCost != null && pedido.onlineOrderDetails.shippingCost > 0
                ? [{ label: 'Envío', valor: pedido.onlineOrderDetails.shippingCost, tipo: 'normal' as const }] : []),
            { label: 'Total', valor: pedido.total, tipo: 'total' },
        ]
        const negocio = user?.type === 'member' ? user.business : null

        return (
            <div style={{ position: 'fixed', inset: 0, zIndex: 10000, overflow: 'auto', background: 'var(--color-surface)' }}>
                {/* Al imprimir, que salga SOLO el comprobante (el panel de atrás se esconde) */}
                <style>{`
                    @media print {
                        body * { visibility: hidden !important; }
                        .comp-print-zone, .comp-print-zone * { visibility: visible !important; }
                        .comp-print-zone { position: absolute !important; left: 0; top: 0; width: 100%; }
                    }
                `}</style>
                <div className="comp-print-zone">
                    <ComprobanteBase
                        numero={`#${pedido.orderNumber}`}
                        fecha={fecha}
                        hora={hora}
                        emisor={{ tipo: 'tienda', nombre: negocio?.name ?? 'Mi tienda', subtitulo: negocio ? `${negocio.subdomain}.orbita.site` : '' }}
                        estadoBadge={ESTADO_TXT[pedido.status] ?? pedido.status}
                        metadatos={[
                            ['Canal', pedido.channel === 'ONLINE' ? 'Online' : 'Presencial'],
                            ['Pago', pedido.payments.length ? 'Registrado' : 'A coordinar'],
                        ]}
                        compradorDatos={{
                            Nombre: nombreCliente,
                            ...(emailCliente ? { Email: emailCliente } : {}),
                            ...(pedido.onlineOrderDetails?.buyerPhone ? { ['Teléfono']: pedido.onlineOrderDetails.buyerPhone } : {}),
                        }}
                        items={items}
                        totales={totales}
                        textoFooter="Comprobante de pedido · Sin valor fiscal"
                        onBack={() => setVista(null)}
                        backLabel="Cerrar"
                        autoPrint={vista.autoPrint}
                    />
                </div>
            </div>
        )
    }

    // ── El modal chico con el resumen ──
    const filas: [string, string][] = esPedido && pedido
        ? [
            ['Cliente', nombreCliente],
            ['Fecha', `${fmtFechaLarga(pedido.createdAt).fecha} · ${fmtFechaLarga(pedido.createdAt).hora}`],
            ['Productos', `${pedido.items.reduce((s, it) => s + it.quantity, 0)} ítems`],
            ['Estado', ESTADO_TXT[pedido.status] ?? pedido.status],
        ]
        : [
            // Devoluciones / notas de crédito: siguen con la vista de muestra (Fase 4).
            ['Cliente', 'María Fernández'],
            ['Fecha', '17 may 2026 · 14:32'],
            ['Productos', '2 ítems'],
            ['Método', 'Tarjeta Visa'],
        ]
    const totalMostrar = esPedido && pedido ? pedido.total : 48900
    const numeroMostrar = esPedido && pedido ? `#${pedido.orderNumber}` : `#${id ?? ''}`
    const nombreNegocio = user?.type === 'member' ? user.business.name : 'Mi tienda'

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Comprobante de ${tipo} ${numeroMostrar}`} maxWidth={440}>
            {esPedido && cargando ? (
                <div style={{ padding: '24px 0', textAlign: 'center', fontSize: 13, color: 'var(--color-muted)' }}>Cargando pedido…</div>
            ) : esPedido && errorCarga ? (
                <div style={{ padding: '18px 0', textAlign: 'center', fontSize: 13, color: 'var(--color-error)' }}>{errorCarga}</div>
            ) : (
                <>
                    <div style={{ border: '1px solid var(--color-border)', borderRadius: 12, padding: 20, background: 'var(--color-surface)' }}>
                        {/* Encabezado del comprobante */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 14, borderBottom: '1px dashed var(--color-border)', marginBottom: 14 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#2563EB,#3B82F6)', display: 'grid', placeItems: 'center' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>{nombreNegocio}</div>
                                <div style={{ fontSize: 11, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>Comprobante {numeroMostrar}</div>
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
                            <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{fmtMoney(totalMostrar)}</span>
                        </div>
                    </div>

                    {esPedido && pedido ? (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 16 }}>
                                <Button variant="outline" size="sm" icon={<Eye size={15} />} onClick={() => setVista({ autoPrint: false })}>Ver</Button>
                                <Button variant="outline" size="sm" icon={<Printer size={15} />} onClick={() => setVista({ autoPrint: true })}>Imprimir / PDF</Button>
                                <Button variant="outline" size="sm" icon={<Mail size={15} />} loading={enviando} disabled={!emailCliente} onClick={() => void enviarEmail()}>Email</Button>
                            </div>
                            {!emailCliente && (
                                <div style={{ marginTop: 8, fontSize: 11.5, color: 'var(--color-muted)', textAlign: 'center' }}>Este pedido no tiene email de cliente para enviarle el comprobante.</div>
                            )}
                            <div style={{ marginTop: 8, fontSize: 11.5, color: 'var(--color-muted)', textAlign: 'center' }}>Para guardarlo en PDF: Imprimir → &quot;Guardar como PDF&quot; en el diálogo.</div>
                        </>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 16 }}>
                            <Button variant="outline" size="sm" icon={<Eye size={15} />} onClick={() => onToast?.('Abriendo vista previa…')}>Ver</Button>
                            <Button variant="outline" size="sm" icon={<Printer size={15} />} onClick={() => onToast?.('Enviando a impresora…')}>Imprimir</Button>
                            <Button variant="outline" size="sm" icon={<Mail size={15} />} onClick={() => onToast?.('Enviando email…')}>Email</Button>
                        </div>
                    )}
                </>
            )}
        </Modal>
    )
}
