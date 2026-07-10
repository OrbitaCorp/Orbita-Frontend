import { ChevronRight } from 'lucide-react'
import { MsgTabs, type VistaMensaje } from './components/MsgTabs'
import { ChatPanel } from './components/ChatPanel'
import { CONVERSACIONES, PLANTILLAS } from './mock/mensajes.mock'

interface Props {
  ir:       (v: VistaMensaje) => void
  onToast:  (m: string) => void
  onPerfil: () => void
}

export function ChatView({ ir, onToast, onPerfil }: Props) {
  const cv = CONVERSACIONES[0]

  return (
    <div style={{ padding: '24px 32px 64px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
      <MsgTabs activo="chat" ir={ir} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-muted)', marginBottom: 14 }}>
        <button onClick={() => ir('bandeja')} style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, padding: 0 }}>
          Bandeja
        </button>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{cv.cliente}</span>
      </div>
      <div style={{ height: 'calc(100vh - 240px)', minHeight: 400, border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden', display: 'flex' }}>
        <ChatPanel
          cv={cv}
          onToast={onToast}
          onPerfil={onPerfil}
          onArchivar={() => {}}
          plantillas={PLANTILLAS}
          onIrAPlantillas={() => ir('plantillas')}
        />
      </div>
    </div>
  )
}

export default ChatView
