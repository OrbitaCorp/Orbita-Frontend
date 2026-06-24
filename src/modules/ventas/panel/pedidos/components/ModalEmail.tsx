// Modal para enviar un email a un cliente, con plantillas rápidas.
// Construido sobre el Modal genérico del design system.

import { useState } from 'react'
import { Send } from 'lucide-react'
import { Modal } from '@/design-system/components/Modal'
import { Button } from '@/design-system/components/Button'

export interface ClienteEmail {
    nombre: string
    email:  string
}

interface ModalEmailProps {
    isOpen:   boolean
    onClose:  () => void
    cliente:  ClienteEmail
    onToast?: (msg: string) => void
}

type PlantillaKey = 'confirmado' | 'retiro' | 'gracias' | 'libre'

export function ModalEmail({ isOpen, onClose, cliente, onToast }: ModalEmailProps) {
    const plantillas: Record<PlantillaKey, { asunto: string; cuerpo: string }> = {
        confirmado: { asunto: 'Tu pedido fue confirmado', cuerpo: `Hola ${cliente.nombre}! Tu pedido fue confirmado y lo estamos preparando 😊` },
        retiro:     { asunto: 'Listo para retirar',       cuerpo: `Hola ${cliente.nombre}! Tu pedido está listo para retirar en nuestra tienda.` },
        gracias:    { asunto: 'Gracias por tu compra',    cuerpo: `Hola ${cliente.nombre}! Gracias por confiar en Rama Indumentaria 🙏` },
        libre:      { asunto: '',                          cuerpo: '' },
    }

    const [plantilla, setPlantilla] = useState<PlantillaKey>('confirmado')
    const [asunto,    setAsunto]    = useState(plantillas.confirmado.asunto)
    const [cuerpo,    setCuerpo]    = useState(plantillas.confirmado.cuerpo)

    const elegir = (k: PlantillaKey) => {
        setPlantilla(k)
        setAsunto(plantillas[k].asunto)
        setCuerpo(plantillas[k].cuerpo)
    }

    const inputBase: React.CSSProperties = {
        width: '100%', boxSizing: 'border-box',
        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
        borderRadius: 8, color: 'var(--color-text)', fontFamily: 'inherit', outline: 'none',
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Enviar email a ${cliente.nombre}`}
            maxWidth={520}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button variant="primary" icon={<Send size={15} />} onClick={() => { onClose(); onToast?.(`Email enviado a ${cliente.email}`) }}>
                        Enviar email
                    </Button>
                </>
            }
        >
            {/* Destinatario */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>Para:</span>
                <span style={{
                    display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 10px',
                    borderRadius: 9999, background: 'var(--color-surface-alt)', color: 'var(--color-muted)',
                    fontSize: 12, fontFamily: '"Geist Mono", monospace',
                }}>
                    {cliente.email}
                </span>
            </div>

            {/* Plantillas */}
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-body)', marginBottom: 8 }}>Plantilla</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, marginBottom: 16 }}>
                {([['confirmado', 'Pedido confirmado'], ['retiro', 'Listo para retirar'], ['gracias', 'Gracias por tu compra'], ['libre', 'Personalizado']] as [PlantillaKey, string][]).map(([k, l]) => {
                    const a = plantilla === k
                    return (
                        <button
                            key={k}
                            onClick={() => elegir(k)}
                            style={{
                                padding: '10px 12px', borderRadius: 8,
                                border: `1px solid ${a ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                background: a ? 'var(--color-primary-bg)' : 'var(--color-surface)',
                                color: a ? 'var(--color-primary)' : 'var(--color-body)',
                                fontSize: 13, fontWeight: a ? 600 : 500, cursor: 'pointer',
                                fontFamily: 'inherit', textAlign: 'left',
                            }}
                        >
                            {l}
                        </button>
                    )
                })}
            </div>

            {/* Asunto */}
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-body)', marginBottom: 6 }}>Asunto</div>
            <input value={asunto} onChange={e => setAsunto(e.target.value)} style={{ ...inputBase, height: 40, padding: '0 12px', fontSize: 14, marginBottom: 14 }} />

            {/* Mensaje */}
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-body)', marginBottom: 6 }}>Mensaje</div>
            <textarea value={cuerpo} onChange={e => setCuerpo(e.target.value)} rows={5} style={{ ...inputBase, resize: 'vertical', minHeight: 110, padding: '10px 12px', fontSize: 13, lineHeight: 1.6 }} />
        </Modal>
    )
}
