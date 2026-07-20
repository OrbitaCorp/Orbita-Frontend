// src/modules/ventas/panel/configuracion/ConfigGeneral.tsx — Vista 15 + hub
//
// Punto de entrada del módulo `configuracion` (registrado en el componentMap).
// Hub con tabs: general (V15), apariencia (V16), equipo (V17), notificaciones (V18).
//
//   /admin/[negocioId]/ventas/configuracion              → general (V15)
//   …/configuracion?vista=apariencia                     → Apariencia (V16)
//   …/configuracion?vista=equipo                         → Equipo (V17)
//   …/configuracion?vista=notificaciones                 → Notificaciones (V18)
//
// (Fase 1 — Alex) La vista General está integrada con la API real:
//   carga con GET /business + GET /business/config, y guarda POR CARD (cada sección
//   tiene su propio botón) con PUT /business, PUT /business/config y POST /business/pause.
// Requiere sesión: el token se lee de localStorage vía lib/api.ts — workaround hasta que
// exista el login real del panel (ver apps/api/PENDIENTES.md, Fase 2). Sin token, se
// muestra un aviso en lugar del formulario. "Eliminar espacio" queda deshabilitado
// (DIFERIDO — depende del módulo Subscriptions).

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Card } from '@/design-system/components/Card'
import { Button } from '@/design-system/components/Button'
import { Toast } from '@/design-system/components/Toast'
import { Modal } from '@/design-system/components/Modal'
import {
    ApiError,
    getBusiness, updateBusiness,
    getBusinessConfig, updateBusinessConfig,
    pauseBusiness,
} from '@/lib/api'

import { ConfigTabs, type VistaConfig } from './components/ConfigTabs'
import { CfgField, Toggle } from './components/ConfigControls'
import Apariencia from './Apariencia'
import Equipo from './Equipo'
import Notificaciones from './Notificaciones'

// Métodos de pago que se muestran en la card (mapean 1:1 a business_config).
const PAGOS_META: { key: 'acceptsMercadopago' | 'acceptsCash' | 'acceptsPickup' | 'acceptsTransfer'; label: string; desc: string }[] = [
    { key: 'acceptsMercadopago', label: 'Mercado Pago',    desc: 'Pagos online con tarjeta, débito y cuotas' },
    { key: 'acceptsCash',        label: 'Efectivo',        desc: 'Pago presencial o contra entrega' },
    { key: 'acceptsPickup',      label: 'Retiro en local', desc: 'El cliente retira y paga en el local' },
    { key: 'acceptsTransfer',    label: 'Transferencia',   desc: 'Transferencia bancaria — requiere un alias cargado' },
]

// ─── General (V15) ────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
    return <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', marginBottom: 16 }}>{children}</div>
}

// Mensaje de error de guardado, debajo del botón de cada card.
function ErrorInline({ msg }: { msg?: string | null }) {
    if (!msg) return null
    return <div style={{ fontSize: 13, color: 'var(--color-error)', marginTop: 10 }}>{msg}</div>
}

function GeneralView({ ir, onToast }: { ir: (v: VistaConfig) => void; onToast: (m: string) => void }) {
    // ── Carga inicial ──
    const [cargando, setCargando] = useState(true)
    const [sinSesion, setSinSesion] = useState(false)
    const [errorCarga, setErrorCarga] = useState<string | null>(null)

    // ── Estado por bloque (cada card guarda lo suyo por separado) ──
    const [negocio, setNegocio]   = useState({ name: '', industry: '', description: '' })
    const [contacto, setContacto] = useState({ whatsapp: '', email: '', scheduleText: '' })
    const [pagos, setPagos]       = useState({ acceptsMercadopago: false, acceptsCash: false, acceptsPickup: false, acceptsTransfer: false, transferAlias: '' })
    const [envios, setEnvios]     = useState({ shippingBase: '', freeShippingFrom: '', deliveryZones: '', shippingPolicy: '' })
    const [redes, setRedes]       = useState({ instagram: '', tiktok: '', facebook: '' })
    const [isPaused, setIsPaused] = useState(false)

    const [guardando, setGuardando] = useState<string | null>(null)                // card que está guardando
    const [errores, setErrores]     = useState<Record<string, string | null>>({}) // error por card
    const [modalPausa, setModalPausa] = useState(false)

    useEffect(() => {
        let cancelado = false
        async function cargar() {
            try {
                const [biz, cfg] = await Promise.all([getBusiness(), getBusinessConfig()])
                if (cancelado) return
                setNegocio({ name: biz.name ?? '', industry: biz.industry ?? '', description: biz.description ?? '' })
                setIsPaused(biz.isPaused)
                setContacto({ whatsapp: cfg.whatsapp ?? '', email: cfg.email ?? '', scheduleText: cfg.scheduleText ?? '' })
                setPagos({
                    acceptsMercadopago: cfg.acceptsMercadopago,
                    acceptsCash: cfg.acceptsCash,
                    acceptsPickup: cfg.acceptsPickup,
                    acceptsTransfer: cfg.acceptsTransfer,
                    transferAlias: cfg.transferAlias ?? '',
                })
                setEnvios({
                    // Decimal de Prisma llega serializado como string — se muestra tal cual
                    // y se convierte con Number() recién al guardar.
                    shippingBase: cfg.shippingBase != null ? String(cfg.shippingBase) : '',
                    freeShippingFrom: cfg.freeShippingFrom != null ? String(cfg.freeShippingFrom) : '',
                    deliveryZones: (cfg.deliveryZones ?? []).join(', '),
                    shippingPolicy: cfg.shippingPolicy ?? '',
                })
                setRedes({ instagram: cfg.instagram ?? '', tiktok: cfg.tiktok ?? '', facebook: cfg.facebook ?? '' })
            } catch (e) {
                if (cancelado) return
                if (e instanceof ApiError && e.status === 401) setSinSesion(true)
                else setErrorCarga(e instanceof Error ? e.message : 'No se pudo cargar la configuración')
            } finally {
                if (!cancelado) setCargando(false)
            }
        }
        cargar()
        return () => { cancelado = true }
    }, [])

    // Guardado genérico por card: marca "guardando", limpia el error previo del bloque,
    // ejecuta el PUT y muestra el resultado (toast si salió bien, error inline si no).
    async function guardar(card: string, fn: () => Promise<unknown>, okMsg: string) {
        setGuardando(card)
        setErrores(prev => ({ ...prev, [card]: null }))
        try {
            await fn()
            onToast(okMsg)
        } catch (e) {
            const msg = e instanceof ApiError ? e.message : 'Error inesperado al guardar'
            setErrores(prev => ({ ...prev, [card]: msg }))
        } finally {
            setGuardando(null)
        }
    }

    const guardarNegocio = () => guardar('negocio',
        () => updateBusiness({ name: negocio.name, industry: negocio.industry, description: negocio.description }),
        'Información del negocio guardada')

    const guardarContacto = () => guardar('contacto',
        () => updateBusinessConfig({
            whatsapp: contacto.whatsapp,
            scheduleText: contacto.scheduleText,
            // El email vacío se omite (no "borra"): @IsEmail() del backend rechaza "".
            ...(contacto.email.trim() ? { email: contacto.email.trim() } : {}),
        }),
        'Datos de contacto guardados')

    const guardarPagos = () => guardar('pagos',
        () => updateBusinessConfig({
            acceptsMercadopago: pagos.acceptsMercadopago,
            acceptsCash: pagos.acceptsCash,
            acceptsPickup: pagos.acceptsPickup,
            acceptsTransfer: pagos.acceptsTransfer,
            // El alias vacío se omite; si transferencia está activa sin alias, el backend
            // responde 400 con el motivo — ese mensaje se muestra bajo el botón.
            ...(pagos.transferAlias.trim() ? { transferAlias: pagos.transferAlias.trim() } : {}),
        }),
        'Métodos de pago guardados')

    const guardarEnvios = () => {
        const base = Number(envios.shippingBase)
        const gratis = Number(envios.freeShippingFrom)
        if (envios.shippingBase.trim() !== '' && Number.isNaN(base)) {
            setErrores(prev => ({ ...prev, envios: 'El costo base debe ser un número' })); return
        }
        if (envios.freeShippingFrom.trim() !== '' && Number.isNaN(gratis)) {
            setErrores(prev => ({ ...prev, envios: 'El monto de envío gratis debe ser un número' })); return
        }
        guardar('envios', () => updateBusinessConfig({
            ...(envios.shippingBase.trim() !== '' ? { shippingBase: base } : {}),
            ...(envios.freeShippingFrom.trim() !== '' ? { freeShippingFrom: gratis } : {}),
            deliveryZones: envios.deliveryZones.split(',').map(z => z.trim()).filter(Boolean),
            shippingPolicy: envios.shippingPolicy,
        }), 'Configuración de envíos guardada')
    }

    const guardarRedes = () => guardar('redes',
        () => updateBusinessConfig({ instagram: redes.instagram, tiktok: redes.tiktok, facebook: redes.facebook }),
        'Redes sociales guardadas')

    async function confirmarPausa() {
        setModalPausa(false)
        setGuardando('pausa')
        setErrores(prev => ({ ...prev, pausa: null }))
        try {
            const r = await pauseBusiness(!isPaused)
            setIsPaused(r.isPaused)
            onToast(r.isPaused ? 'Tienda pausada' : 'Tienda reactivada')
        } catch (e) {
            const msg = e instanceof ApiError ? e.message : 'Error inesperado'
            setErrores(prev => ({ ...prev, pausa: msg }))
        } finally {
            setGuardando(null)
        }
    }

    // ── Estados especiales de la vista ──

    if (sinSesion) {
        return (
            <div style={pageWrap}>
                <ConfigTabs activo="general" ir={ir} />
                <h1 style={h1Style}>Configuración general</h1>
                <Card>
                    <SectionTitle>No hay sesión activa</SectionTitle>
                    <div style={{ fontSize: 14, color: 'var(--color-body)', lineHeight: 1.6 }}>
                        Esta pantalla ahora usa datos reales del backend y necesita un usuario logueado.
                        El login del panel todavía no está implementado (tarea de Auth) — mientras tanto,
                        iniciá sesión con el snippet de la consola del navegador (guía del equipo) y recargá
                        esta página.
                    </div>
                </Card>
            </div>
        )
    }

    if (cargando) {
        return (
            <div style={pageWrap}>
                <ConfigTabs activo="general" ir={ir} />
                <h1 style={h1Style}>Configuración general</h1>
                <div style={{ fontSize: 14, color: 'var(--color-muted)' }}>Cargando configuración…</div>
            </div>
        )
    }

    if (errorCarga) {
        return (
            <div style={pageWrap}>
                <ConfigTabs activo="general" ir={ir} />
                <h1 style={h1Style}>Configuración general</h1>
                <Card>
                    <SectionTitle>No se pudo cargar la configuración</SectionTitle>
                    <div style={{ fontSize: 14, color: 'var(--color-error)' }}>{errorCarga}</div>
                    <div style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 8 }}>
                        ¿Está corriendo el backend en el puerto 3000?
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div style={pageWrap}>
            <ConfigTabs activo="general" ir={ir} />
            <h1 style={h1Style}>Configuración general</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 720 }}>

                {/* ── Información del negocio ── */}
                <Card>
                    <SectionTitle>Información del negocio</SectionTitle>
                    <CfgField label="Nombre del negocio" value={negocio.name} onChange={v => setNegocio(p => ({ ...p, name: v }))} />
                    <CfgField label="Rubro" value={negocio.industry} onChange={v => setNegocio(p => ({ ...p, industry: v }))} />
                    <CfgField label="Descripción corta" value={negocio.description} area onChange={v => setNegocio(p => ({ ...p, description: v }))} />
                    <Button variant="primary" loading={guardando === 'negocio'} onClick={guardarNegocio}>Guardar cambios</Button>
                    <ErrorInline msg={errores.negocio} />
                </Card>

                {/* ── Datos de contacto ── */}
                <Card>
                    <SectionTitle>Datos de contacto</SectionTitle>
                    <CfgField label="WhatsApp de atención" value={contacto.whatsapp} onChange={v => setContacto(p => ({ ...p, whatsapp: v }))} />
                    <CfgField label="Email de contacto" value={contacto.email} onChange={v => setContacto(p => ({ ...p, email: v }))} />
                    <CfgField label="Horario de atención" value={contacto.scheduleText} onChange={v => setContacto(p => ({ ...p, scheduleText: v }))} />
                    <Button variant="primary" loading={guardando === 'contacto'} onClick={guardarContacto}>Guardar cambios</Button>
                    <ErrorInline msg={errores.contacto} />
                </Card>

                {/* ── Métodos de pago ── */}
                <Card>
                    <SectionTitle>Métodos de pago</SectionTitle>
                    {PAGOS_META.map(({ key, label, desc }, i) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '12px 0', borderBottom: i < PAGOS_META.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-body)' }}>{label}</div>
                                <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>{desc}</div>
                            </div>
                            <Toggle on={pagos[key]} onChange={v => setPagos(p => ({ ...p, [key]: v }))} />
                        </div>
                    ))}
                    {pagos.acceptsTransfer && (
                        <div style={{ marginTop: 14 }}>
                            <CfgField label="Alias para transferencias" value={pagos.transferAlias} onChange={v => setPagos(p => ({ ...p, transferAlias: v }))} />
                        </div>
                    )}
                    <div style={{ marginTop: 14 }}>
                        <Button variant="primary" loading={guardando === 'pagos'} onClick={guardarPagos}>Guardar cambios</Button>
                    </div>
                    <ErrorInline msg={errores.pagos} />
                </Card>

                {/* ── Envíos ── */}
                <Card>
                    <SectionTitle>Envíos</SectionTitle>
                    <CfgField label="Costo base de envío ($)" value={envios.shippingBase} onChange={v => setEnvios(p => ({ ...p, shippingBase: v }))} />
                    <CfgField label="Envío gratis desde ($)" value={envios.freeShippingFrom} onChange={v => setEnvios(p => ({ ...p, freeShippingFrom: v }))} />
                    <CfgField label="Zonas de entrega (separadas por coma)" value={envios.deliveryZones} onChange={v => setEnvios(p => ({ ...p, deliveryZones: v }))} />
                    <CfgField label="Texto de política de envíos" value={envios.shippingPolicy} area onChange={v => setEnvios(p => ({ ...p, shippingPolicy: v }))} />
                    <Button variant="primary" loading={guardando === 'envios'} onClick={guardarEnvios}>Guardar cambios</Button>
                    <ErrorInline msg={errores.envios} />
                </Card>

                {/* ── Redes sociales ── */}
                <Card>
                    <SectionTitle>Redes sociales</SectionTitle>
                    <CfgField label="Instagram" value={redes.instagram} onChange={v => setRedes(p => ({ ...p, instagram: v }))} />
                    <CfgField label="TikTok" value={redes.tiktok} onChange={v => setRedes(p => ({ ...p, tiktok: v }))} />
                    <CfgField label="Facebook" value={redes.facebook} onChange={v => setRedes(p => ({ ...p, facebook: v }))} />
                    <Button variant="primary" loading={guardando === 'redes'} onClick={guardarRedes}>Guardar cambios</Button>
                    <ErrorInline msg={errores.redes} />
                </Card>

                {/* ── Zona peligrosa ── */}
                <Card>
                    <SectionTitle>Zona peligrosa</SectionTitle>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, paddingBottom: 14, borderBottom: '1px solid var(--color-border)' }}>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-body)' }}>
                                {isPaused ? 'Reactivar tienda' : 'Pausar tienda'}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>
                                {isPaused
                                    ? 'La tienda está pausada: tus clientes no la ven. Reactivala cuando quieras.'
                                    : 'La tienda permanece activa para vos pero oculta para tus clientes.'}
                            </div>
                        </div>
                        <Button variant="outline" loading={guardando === 'pausa'} onClick={() => setModalPausa(true)}>
                            {isPaused ? 'Reactivar tienda' : 'Pausar tienda'}
                        </Button>
                    </div>
                    <ErrorInline msg={errores.pausa} />
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, paddingTop: 14 }}>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-error)' }}>Eliminar espacio</div>
                            <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>
                                Diferido: depende del módulo de suscripciones (ver PENDIENTES.md). Por ahora esta acción no está disponible.
                            </div>
                        </div>
                        <Button variant="danger" disabled>Eliminar espacio</Button>
                    </div>
                </Card>

            </div>

            <Modal
                isOpen={modalPausa}
                onClose={() => setModalPausa(false)}
                title={isPaused ? '¿Reactivar la tienda?' : '¿Pausar la tienda?'}
                variant={isPaused ? 'default' : 'danger'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setModalPausa(false)}>Cancelar</Button>
                        <Button variant={isPaused ? 'primary' : 'danger'} onClick={confirmarPausa}>
                            {isPaused ? 'Sí, reactivar' : 'Sí, pausar'}
                        </Button>
                    </>
                }
            >
                <div style={{ fontSize: 14, color: 'var(--color-body)', lineHeight: 1.6 }}>
                    {isPaused
                        ? 'El storefront vuelve a estar visible para tus clientes.'
                        : 'El storefront deja de verse para tus clientes. Los datos se conservan y podés reactivarla cuando quieras.'}
                </div>
            </Modal>
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
const h1Style: React.CSSProperties = { fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text)', margin: '0 0 20px' }
