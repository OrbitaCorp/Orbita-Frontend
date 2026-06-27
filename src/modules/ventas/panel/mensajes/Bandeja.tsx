import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { MsgTabs, type VistaMensaje } from './components/MsgTabs'
import { BandejaLista } from './components/BandejaLista'
import { ChatPanel } from './components/ChatPanel'
import { CONVERSACIONES, PLANTILLAS, type Conversacion, type Plantilla } from './mock/mensajes.mock'

// ─── Vista Bandeja (split panel) ─────────────────────────────────────────────

interface BandejaProps {
  ir:       (v: VistaMensaje) => void
  onToast:  (m: string) => void
  onPerfil: () => void
}

function BandejaMensajes({ ir, onToast, onPerfil }: BandejaProps) {
  const [conversaciones, setConversaciones] = useState<Conversacion[]>(CONVERSACIONES)
  const [plantillas] = useState<Plantilla[]>(PLANTILLAS)
  const [activaId, setActivaId] = useState<string | null>(null)

  const activaCV = conversaciones.find((cv) => cv.id === activaId) ?? null

  const handleSelect = (id: string) => {
    setActivaId(id)
    setConversaciones((prev) =>
      prev.map((cv) => (cv.id === id ? { ...cv, unread: false } : cv)),
    )
  }

  const handleArchivar = (id: string) => {
    const cv = conversaciones.find((c) => c.id === id)
    setConversaciones((prev) =>
      prev.map((c) => (c.id === id ? { ...c, archivado: !c.archivado } : c)),
    )
    if (activaId === id) setActivaId(null)
    onToast(cv?.archivado ? 'Conversación desarchivada' : 'Conversación archivada')
  }

  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 178px)',
      minHeight: 480,
      border: '1px solid var(--color-border)',
      borderRadius: 12,
      overflow: 'hidden',
      background: 'var(--color-bg)',
    }}>
      {/* Sidebar: lista de conversaciones */}
      <div style={{ width: 296, flexShrink: 0 }}>
        <BandejaLista
          conversaciones={conversaciones}
          activaId={activaId}
          onSelect={handleSelect}
          onArchivar={handleArchivar}
        />
      </div>

      {/* Panel de chat */}
      <ChatPanel
        cv={activaCV}
        onToast={onToast}
        onPerfil={onPerfil}
        onArchivar={handleArchivar}
        plantillas={plantillas}
        onIrAPlantillas={() => ir('plantillas')}
      />
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
    router.push({
      query: { negocioId: negocioId as string, moduloPadre: moduloPadre as string, seccion: 'clientes', vista: 'detalle', id: 'c1' },
    })
  }

  const sub = vista as VistaMensaje | undefined
  const tab = sub === 'plantillas' ? 'plantillas' : 'bandeja'

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
      <MsgTabs activo={tab} ir={ir} />

      {tab === 'bandeja'
        ? <BandejaMensajes ir={ir} onToast={setToast} onPerfil={irPerfil} />
        : <PlantillasInline onToast={setToast} />
      }

      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9000, background: 'var(--color-text)', color: '#fff',
          padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500,
          boxShadow: '0 4px 16px rgba(0,0,0,.2)', whiteSpace: 'nowrap',
        }}>
          {toast}
        </div>
      )}
    </div>
  )
}

// Lazy import para no crear ciclo — Plantillas se renderiza inline desde el hub
import { PlantillasMensajes as PlantillasInline } from './Plantillas'

export default MensajesHub
