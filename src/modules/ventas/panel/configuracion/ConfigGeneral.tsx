// src/modules/ventas/panel/configuracion/ConfigGeneral.tsx — Vista 15 + hub
//
// Punto de entrada del módulo `configuracion` (registrado en el componentMap).
// Hub con tabs: general (V15), apariencia (V16), equipo (V17), notificaciones (V18).
//
//   /admin/[negocioId]/ventas/configuracion              → general (V15)
//   …/configuracion?vista=apariencia                     → Apariencia (V16)
//   …/configuracion?vista=equipo                         → Equipo (V17)
//   …/configuracion?vista=notificaciones                 → Notificaciones (V18)

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Card } from '@/design-system/components/Card'
import { Button } from '@/design-system/components/Button'
import { Toast } from '@/design-system/components/Toast'

import { ConfigTabs, type VistaConfig } from './components/ConfigTabs'
import { CfgField, Toggle } from './components/ConfigControls'
import Apariencia from './Apariencia'
import Equipo from './Equipo'
import Notificaciones from './Notificaciones'

const PAGOS: { label: string; desc: string; on: boolean }[] = [
    { label: 'Mercado Pago', desc: 'Pagos online con tarjeta, débito y cuotas', on: true  },
    { label: 'Efectivo',     desc: 'Pago presencial o contra entrega',            on: true  },
    { label: 'Retiro en local', desc: 'El cliente retira y paga en el local',    on: false },
]

// ─── General (V15) ────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
    return <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', marginBottom: 16 }}>{children}</div>
}
function Divider() {
    return <div style={{ height: 1, background: 'var(--color-border)', margin: '14px 0' }} />
}

function GeneralView({ ir, onToast }: { ir: (v: VistaConfig) => void; onToast: (m: string) => void }) {
    return (
        <div style={pageWrap}>
            <ConfigTabs activo="general" ir={ir} />
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text)', margin: '0 0 20px' }}>Configuración general</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 720 }}>

                {/* ── Información del negocio ── */}
                <Card>
                    <SectionTitle>Información del negocio</SectionTitle>
                    <CfgField label="Nombre del negocio" value="Rama Indumentaria" />
                    <CfgField label="Rubro" value="Indumentaria" select />
                    <CfgField label="Descripción corta" value="Indumentaria contemporánea diseñada en Argentina." area />
                    <Button variant="primary" onClick={() => onToast('Cambios guardados')}>Guardar cambios</Button>
                </Card>

                {/* ── Datos de contacto ── */}
                <Card>
                    <SectionTitle>Datos de contacto</SectionTitle>
                    <CfgField label="WhatsApp de atención" value="+54 9 11 1234-5678" />
                    <CfgField label="Email de contacto" value="hola@ramaindumentaria.com" />
                    <CfgField label="Horario de atención" value="Lunes a sábado, 10 a 20 hs" />
                    <Button variant="primary" onClick={() => onToast('Cambios guardados')}>Guardar cambios</Button>
                </Card>

                {/* ── Métodos de pago ── */}
                <Card>
                    <SectionTitle>Métodos de pago</SectionTitle>
                    {PAGOS.map(({ label, desc, on }, i) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '12px 0', borderBottom: i < PAGOS.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-body)' }}>{label}</div>
                                <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>{desc}</div>
                            </div>
                            <Toggle defaultOn={on} />
                        </div>
                    ))}
                </Card>

                {/* ── Envíos ── */}
                <Card>
                    <SectionTitle>Envíos</SectionTitle>
                    <CfgField label="Costo base de envío ($)" value="2500" />
                    <CfgField label="Envío gratis desde ($)" value="30000" />
                    <CfgField label="Zonas de entrega" value="CABA, GBA, Buenos Aires" />
                    <CfgField label="Texto de política de envíos" value="Envíos coordinados por WhatsApp. Entrega en 24–48 hs." area />
                    <Button variant="primary" onClick={() => onToast('Cambios guardados')}>Guardar cambios</Button>
                </Card>

                {/* ── Redes sociales ── */}
                <Card>
                    <SectionTitle>Redes sociales</SectionTitle>
                    <CfgField label="Instagram" value="@ramaindumentaria" />
                    <CfgField label="TikTok" value="@ramaindumentaria" />
                    <CfgField label="Facebook" value="ramaindumentaria" />
                    <Button variant="primary" onClick={() => onToast('Cambios guardados')}>Guardar cambios</Button>
                </Card>

                {/* ── Zona peligrosa ── */}
                <Card>
                    <SectionTitle>Zona peligrosa</SectionTitle>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, paddingBottom: 14, borderBottom: '1px solid var(--color-border)' }}>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-body)' }}>Pausar tienda</div>
                            <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>La tienda permanece activa para vos pero oculta para tus clientes.</div>
                        </div>
                        <Button variant="outline" onClick={() => onToast('Tienda pausada')}>Pausar tienda</Button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, paddingTop: 14 }}>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-error)' }}>Eliminar espacio</div>
                            <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>Esta acción es irreversible. Todos los datos, productos y pedidos serán eliminados permanentemente.</div>
                        </div>
                        <Button variant="danger">Eliminar espacio</Button>
                    </div>
                </Card>

            </div>
        </div>
    )
}

// ─── Hub ──────────────────────────────────────────────────────────────────────

export default function ConfigGeneral() {
    const router = useRouter()
    const { vista } = router.query
    const [toast, setToast] = useState<string | null>(null)

    useEffect(() => {
        if (!toast) return
        const t = setTimeout(() => setToast(null), 3000)
        return () => clearTimeout(t)
    }, [toast])

    const ir = (v: VistaConfig) => {
        const { vista: _v, ...rest } = router.query
        const q: Record<string, string | string[] | undefined> = { ...rest }
        if (v !== 'general') q.vista = v
        router.push({ query: q })
    }

    const sub = vista as VistaConfig | undefined
    let content
    if (sub === 'apariencia')          content = <Apariencia ir={ir} onToast={setToast} />
    else if (sub === 'equipo')         content = <Equipo ir={ir} onToast={setToast} />
    else if (sub === 'notificaciones') content = <Notificaciones ir={ir} />
    else                               content = <GeneralView ir={ir} onToast={setToast} />

    return (
        <>
            {content}
            {toast && (
                <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9000 }}>
                    <Toast variant="success" title={toast} onClose={() => setToast(null)} />
                </div>
            )}
        </>
    )
}

const pageWrap: React.CSSProperties = { padding: '24px 32px 64px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }
