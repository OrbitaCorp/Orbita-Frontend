import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import type { VistaMensaje } from './components/MsgTabs'
import { BandejaLista } from './components/BandejaLista'
import { ChatPanel } from './components/ChatPanel'
import { CONVERSACIONES, PLANTILLAS, type Conversacion, type Plantilla } from './mock/mensajes.mock'

const SK: React.CSSProperties = { background: 'var(--color-surface-alt)', borderRadius: 8 }

function BandejaSkeleton() {
  const panelH = 'calc(100vh - 138px)'
  return (
    <div style={{ display: 'flex', height: panelH, minHeight: 480, border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden', background: 'var(--color-bg)' }}>
      {/* Lista skeleton */}
      <div style={{ width: 296, flexShrink: 0, borderRight: '1px solid var(--color-border)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Título */}
        <div style={{ ...SK, height: 14, width: 90 }} />
        {/* Buscador */}
        <div style={{ ...SK, height: 34, borderRadius: 8 }} />
        {/* Pills */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[56, 70, 84].map((w, i) => <div key={i} style={{ ...SK, height: 26, width: w, borderRadius: 9999 }} />)}
        </div>
        {/* Conversaciones */}
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', paddingTop: 6 }}>
            <div style={{ ...SK, width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ ...SK, height: 11, width: '65%' }} />
              <div style={{ ...SK, height: 10, width: '90%' }} />
            </div>
          </div>
        ))}
      </div>
      {/* Chat panel skeleton */}
      <div style={{ flex: 1, background: 'var(--color-surface)', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ height: 57, borderBottom: '1px solid var(--color-border)', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ ...SK, width: 36, height: 36, borderRadius: '50%' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ ...SK, height: 12, width: 120 }} />
            <div style={{ ...SK, height: 10, width: 80 }} />
          </div>
        </div>
        {/* Mensajes */}
        <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[180, 220, 140, 200, 160].map((w, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: i % 2 === 0 ? 'flex-start' : 'flex-end' }}>
              <div style={{ ...SK, height: 40, width: w, borderRadius: 12 }} />
            </div>
          ))}
        </div>
        {/* Composer */}
        <div style={{ height: 60, borderTop: '1px solid var(--color-border)', margin: '0 16px 12px', borderRadius: 10, ...SK }} />
      </div>
    </div>
  )
}

// ─── Vista Bandeja (split panel) ─────────────────────────────────────────────

interface BandejaProps {
  ir:       (v: VistaMensaje) => void
  onToast:  (m: string) => void
  onPerfil: () => void
}

function BandejaMensajes({ ir, onToast, onPerfil }: BandejaProps) {
  const [loading, setLoading] = useState(true)
  const [conversaciones, setConversaciones] = useState<Conversacion[]>(CONVERSACIONES)
  const [plantillas] = useState<Plantilla[]>(PLANTILLAS)
  const [activaId, setActivaId] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700)
    return () => clearTimeout(t)
  }, [])

  if (loading) return <BandejaSkeleton />

  const activaCV = conversaciones.find((cv) => cv.id === activaId) ?? null

  const handleSelect = (id: string) => {
    setActivaId(id)
    setConversaciones((prev) => prev.map((cv) => (cv.id === id ? { ...cv, unread: false } : cv)))
  }

  const handleArchivar = (id: string) => {
    const cv = conversaciones.find((c) => c.id === id)
    setConversaciones((prev) => prev.map((c) => (c.id === id ? { ...c, archivado: !c.archivado } : c)))
    if (activaId === id) setActivaId(null)
    onToast(cv?.archivado ? 'Conversación desarchivada' : 'Conversación archivada')
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 138px)', minHeight: 480, border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden', background: 'var(--color-bg)' }}>
      <div style={{ width: 296, flexShrink: 0 }}>
        <BandejaLista conversaciones={conversaciones} activaId={activaId} onSelect={handleSelect} onArchivar={handleArchivar} />
      </div>
      <ChatPanel cv={activaCV} onToast={onToast} onPerfil={onPerfil} onArchivar={handleArchivar} plantillas={plantillas} onIrAPlantillas={() => ir('plantillas')} />
    </div>
  )
}

// ─── Hub ─────────────────────────────────────────────────────────────────────

export function MensajesHub() {
  const router  = useRouter()
  const { vista } = router.query
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  const ir = (v: VistaMensaje) => {
    const { vista: _v, ...rest } = router.query
    const q: Record<string, string | string[] | undefined> = { ...rest }
    if (v !== 'bandeja') q.vista = v
    router.push({ query: q })
  }

  const irPerfil = () => {
    const { negocioId, moduloPadre } = router.query
    router.push({ query: { negocioId: negocioId as string, moduloPadre: moduloPadre as string, seccion: 'clientes', vista: 'detalle', id: 'c1' } })
  }

  const esPlantillas = vista === 'plantillas'

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
      {esPlantillas
        ? <PlantillasInline onToast={setToast} />
        : <BandejaMensajes ir={ir} onToast={setToast} onPerfil={irPerfil} />
      }
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9000, background: 'var(--color-text)', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, boxShadow: '0 4px 16px rgba(0,0,0,.2)', whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}
    </div>
  )
}

import { PlantillasMensajes as PlantillasInline } from './Plantillas'

export default MensajesHub
