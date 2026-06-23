import { useState } from 'react'
import type { CSSProperties } from 'react'
import { RotateCcw, Pause } from 'lucide-react'
import { useCajaStore } from './stores/useCajaStore'
import { usePausadosStore } from './stores/usePausadosStore'
import { POSApertura } from './POSApertura'
import { POSCobro } from './POScobro'
import { POSCierre } from './POSCierre'
import { POSHistorial } from './POSHistorial'
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

type Pantalla = 'cobro' | 'apertura' | 'cierre' | 'historial'
type TabId = 'cobro' | 'historial' | 'cierre'

const TABS: { id: TabId; label: string }[] = [
  { id: 'cobro',     label: 'Cobro rápido' },
  { id: 'historial', label: 'Historial'    },
  { id: 'cierre',    label: 'Cierre'       },
]

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
  const { estado, sesion, acumuladoTurno } = useCajaStore()
  const { tickets: pausados } = usePausadosStore()
  const [pantalla, setPantalla] = useState<Pantalla>('cobro')
  const [drawerPausados, setDrawerPausados] = useState(false)
  const [modalDevolucion, setModalDevolucion] = useState(false)

  const tabActivo: TabId = pantalla === 'apertura' ? 'cobro' : (pantalla as TabId)
  const cajaAbierta = estado === 'abierta' && sesion

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>

      {/* ── Barra unificada ── */}
      <div
        style={{
          display: cajaAbierta ? 'flex' : 'none',
          alignItems: 'center',
          padding: '0 24px',
          height: 52,
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-bg)',
          flexShrink: 0,
          gap: 0,
        }}
      >
        {/* Tabs */}
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPantalla(tab.id)}
            style={{
              padding: '0 4px',
              marginRight: 24,
              height: 52,
              border: 'none',
              borderBottom: `2px solid ${tabActivo === tab.id ? 'var(--color-primary)' : 'transparent'}`,
              background: 'transparent',
              color: tabActivo === tab.id ? 'var(--color-primary)' : 'var(--color-muted)',
              fontSize: 14,
              fontWeight: tabActivo === tab.id ? 600 : 400,
              cursor: 'pointer',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
              transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}

        {/* Separador */}
        <div style={{ width: 1, height: 24, background: 'var(--color-border)', margin: '0 20px', flexShrink: 0 }} />

        {/* Estado de caja */}
        {cajaAbierta && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-success)', flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>
              {abreviarNombre(sesion.cajero.nombre)}
            </span>
            <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>
              · desde {formatHora(sesion.fechaApertura)}
            </span>
          </div>
        )}

        {/* Separador */}
        <div style={{ width: 1, height: 24, background: 'var(--color-border)', margin: '0 20px', flexShrink: 0 }} />

        {/* Acumulado */}
        {cajaAbierta && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
              Acum.
            </span>
            <span style={{ fontSize: 15, fontWeight: 700, fontFamily: '"Geist Mono", "Fira Code", monospace', color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
              $ {FORMATO.format(acumuladoTurno)}
            </span>
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Acciones */}
        {cajaAbierta && (
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
        )}
      </div>

      {/* ── Contenido ── */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {pantalla === 'apertura' && (
          <POSApertura
            onConfirm={() => setPantalla('cobro')}
            onCancel={() => setPantalla('cobro')}
          />
        )}
        {pantalla === 'cobro' && (
          <POSCobro
            onAbrirCaja={() => setPantalla('apertura')}
            onCerrarCaja={() => setPantalla('cierre')}
          />
        )}
        {pantalla === 'cierre' && (
          <POSCierre
            onVolverAlPOS={() => setPantalla('cobro')}
            onCierreConfirmado={() => setPantalla('cobro')}
          />
        )}
        {pantalla === 'historial' && <POSHistorial />}
      </div>

      {/* Modales levantados al shell */}
      <DrawerPausados isOpen={drawerPausados} onClose={() => setDrawerPausados(false)} />
      <ModalDevolucion isOpen={modalDevolucion} onClose={() => setModalDevolucion(false)} />
    </div>
  )
}
