import { useState, useCallback, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { useRouter } from 'next/router'
import { RotateCcw, Pause } from 'lucide-react'
import { useCajaStore } from './stores/useCajaStore'
import { usePausadosStore } from './stores/usePausadosStore'
import { POSApertura } from './POSApertura'
import { POSCobro } from './POSCobro'
import { POSCierre } from './POSCierre'
import { POSHistorial } from './POSHistorial'
import { POSReporte } from './POSReporte'
import { DrawerPausados } from './components/Modales/DrawerPausados'
import { ModalDevolucion } from './components/Modales/ModalDevolucion'

const FORMATO = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

function formatHora(iso: string) {
  return new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

function abreviarNombre(nombre: string) {
  const p = nombre.trim().split(' ')
  return p.length === 1 ? p[0] : `${p[0]} ${p[1][0]}.`
}

const btnAccion: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 12px',
  borderRadius: 8,
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg)',
  color: 'var(--color-body)',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'inherit',
  whiteSpace: 'nowrap',
}

export function POSShell() {
  const router = useRouter()
  const vista = (router.query.vista as string) || ''
  const negocioId = (router.query.negocioId as string) ?? 'rama-tienda'

  const { estado, sesion, acumuladoTurno } = useCajaStore()
  const { tickets: pausados } = usePausadosStore()
  const [drawerPausados, setDrawerPausados] = useState(false)
  const [modalDevolucion, setModalDevolucion] = useState(false)

  const cajaAbierta = estado === 'abierta' && sesion
  const esHistorial = vista === 'historial'
  const esApertura = vista === 'apertura'

  const irA = useCallback((v?: string) => {
    const query: Record<string, string> = { negocioId, moduloPadre: 'ventas', seccion: 'pos' }
    if (v) query.vista = v
    router.push({ pathname: '/admin/[negocioId]/[moduloPadre]/[seccion]', query })
  }, [router, negocioId])

  // Redirige a apertura si navegan directamente a rutas que requieren caja sin sesión activa
  useEffect(() => {
    if (!cajaAbierta && !esHistorial && !esApertura) {
      const query: Record<string, string> = { negocioId, moduloPadre: 'ventas', seccion: 'pos', vista: 'apertura' }
      router.replace({ pathname: '/admin/[negocioId]/[moduloPadre]/[seccion]', query })
    }
  }, [cajaAbierta, esHistorial, esApertura, negocioId, router])

  const mostrarBarraSesion = cajaAbierta && !esHistorial && !esApertura

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>

      {/* Barra de sesión — visible solo cuando hay caja abierta, fuera del historial y apertura */}
      {mostrarBarraSesion && sesion && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            height: 52,
            borderBottom: '1px solid var(--color-border)',
            background: 'var(--color-bg)',
            flexShrink: 0,
            gap: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-success)', flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>
              {abreviarNombre(sesion.cajero.nombre)}
            </span>
            <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>
              · desde {formatHora(sesion.fechaApertura)}
            </span>
          </div>

          <div style={{ width: 1, height: 24, background: 'var(--color-border)', margin: '0 20px', flexShrink: 0 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
              Acum.
            </span>
            <span style={{ fontSize: 15, fontWeight: 700, fontFamily: '"Geist Mono", "Fira Code", monospace', color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
              $ {FORMATO.format(acumuladoTurno)}
            </span>
          </div>

          <div style={{ flex: 1 }} />

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => setModalDevolucion(true)} style={btnAccion}>
              <RotateCcw size={14} /> Devolución
            </button>
            <button onClick={() => setDrawerPausados(true)} style={{ ...btnAccion, position: 'relative' }}>
              <Pause size={14} /> Tickets pausados
              {pausados.length > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -6,
                  minWidth: 18, height: 18, borderRadius: 9,
                  background: 'var(--color-primary)', color: '#fff',
                  fontSize: 11, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px', lineHeight: 1,
                }}>
                  {pausados.length}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Contenido */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {esApertura && (
          <POSApertura onConfirm={() => irA()} onCancel={() => irA('apertura')} />
        )}

        {esHistorial && <POSHistorial />}

        {!esApertura && !esHistorial && cajaAbierta && (
          <>
            {vista === '' && <POSCobro />}
            {vista === 'reporte' && <POSReporte />}
            {vista === 'cierre' && (
              <POSCierre
                onVolverAlPOS={() => irA()}
                onCierreConfirmado={() => irA()}
              />
            )}
          </>
        )}
        {/* null cuando !cajaAbierta && !esHistorial && !esApertura — redirect pendiente */}
      </div>

      <DrawerPausados isOpen={drawerPausados} onClose={() => setDrawerPausados(false)} />
      <ModalDevolucion isOpen={modalDevolucion} onClose={() => setModalDevolucion(false)} />
    </div>
  )
}
