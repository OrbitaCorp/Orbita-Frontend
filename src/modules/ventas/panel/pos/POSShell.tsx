import { useState } from 'react'
import { useCajaStore } from './stores/useCajaStore'
import { POSApertura } from './POSApertura'
import { POSCobro } from './POScobro'
import { POSCierre } from './POSCierre'
import { POSHistorial } from './POSHistorial'

type Pantalla = 'cobro' | 'apertura' | 'cierre' | 'historial'
type TabId = 'cobro' | 'historial' | 'cierre'

const TABS: { id: TabId; label: string }[] = [
  { id: 'cobro',     label: 'Cobro rápido' },
  { id: 'historial', label: 'Historial'    },
  { id: 'cierre',    label: 'Cierre'       },
]

export function POSShell() {
  const { estado } = useCajaStore()
  const [pantalla, setPantalla] = useState<Pantalla>('cobro')

  // apertura es sub-flujo de cobro: el tab "Cobro rápido" sigue activo
  const tabActivo: TabId = pantalla === 'apertura' ? 'cobro' : (pantalla as TabId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      {/* ── Barra de tabs ── */}
      <div
        style={{
          display: 'flex',
          padding: '0 24px',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-bg)',
          flexShrink: 0,
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPantalla(tab.id)}
            style={{
              padding: '0 4px',
              marginRight: 24,
              height: 44,
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
    </div>
  )
}
