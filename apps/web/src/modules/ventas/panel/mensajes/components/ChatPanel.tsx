import { useEffect, useRef, useState } from 'react'
import { MessageSquare, Package } from 'lucide-react'
import type { Conversacion, ChatMsg, Plantilla } from '../mock/mensajes.mock'
import { CHAT_MSGS_BY_CV, PEDIDOS_POR_CLIENTE } from '../mock/mensajes.mock'
import { ChatHeader } from './ChatHeader'
import { Composer } from './Composer'

interface Props {
  cv:              Conversacion | null
  onToast:         (m: string) => void
  onPerfil:        () => void
  onArchivar:      (id: string) => void
  plantillas:      Plantilla[]
  onIrAPlantillas: () => void
}

const MONO = '"Geist Mono", "Fira Code", monospace'

/** Renderiza texto con chips inline para patrones #XXXX */
function BurbujaTxt({ txt, me }: { txt: string; me: boolean }) {
  const partes = txt.split(/(#\d+)/g)
  return (
    <>
      {partes.map((p, i) =>
        /^#\d+$/.test(p) ? (
          <span
            key={i}
            title="Ver pedido"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              padding: '1px 7px', borderRadius: 9999,
              background: me ? 'rgba(255,255,255,.22)' : 'var(--color-primary-bg)',
              color: me ? '#fff' : 'var(--color-primary)',
              fontSize: 12, fontWeight: 700, fontFamily: MONO,
              cursor: 'pointer', verticalAlign: 'middle',
              border: me ? '1px solid rgba(255,255,255,.3)' : '1px solid var(--color-primary)',
            }}
          >
            <Package size={9} />
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  )
}

export function ChatPanel({ cv, onToast, onPerfil, onArchivar, plantillas, onIrAPlantillas }: Props) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  const pedidos = PEDIDOS_POR_CLIENTE[cv?.id ?? ''] ?? []

  useEffect(() => {
    setMsgs(CHAT_MSGS_BY_CV[cv?.id ?? ''] ?? [])
  }, [cv?.id])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [msgs])

  const handleEnviar = (txt: string) => {
    const d = new Date()
    const hora = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
    setMsgs((prev) => [...prev, { from: 'me', txt, hora }])
  }

  if (!cv) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--color-muted)', padding: 32 }}>
        <MessageSquare size={40} strokeWidth={1.3} />
        <p style={{ margin: 0, fontSize: 14, textAlign: 'center', lineHeight: 1.5, maxWidth: 240 }}>
          Seleccioná una conversación para ver los mensajes.
        </p>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
      <ChatHeader
        cv={cv}
        pedidos={pedidos}
        onPerfil={onPerfil}
        onArchivar={() => onArchivar(cv.id)}
      />

      {/* Mensajes */}
      <div
        ref={scrollRef}
        style={{
          flex: 1, overflowY: 'auto',
          padding: 18, display: 'flex',
          flexDirection: 'column', gap: 10,
          background: 'var(--color-surface)',
          minHeight: 0,
        }}
      >
        {msgs.map((m, i) => {
          const me = m.from === 'me'
          return (
            <div key={i} style={{ alignSelf: me ? 'flex-end' : 'flex-start', maxWidth: '72%' }}>
              <div style={{
                padding: '10px 13px',
                borderRadius: 12,
                background: me ? 'var(--color-primary)' : 'var(--color-bg)',
                border: me ? 'none' : '1px solid var(--color-border)',
                color: me ? '#fff' : 'var(--color-text)',
                fontSize: 13.5, lineHeight: 1.6,
                borderBottomRightRadius: me ? 4 : 12,
                borderBottomLeftRadius: me ? 12 : 4,
              }}>
                <BurbujaTxt txt={m.txt} me={me} />
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-muted)', fontFamily: MONO, marginTop: 3, textAlign: me ? 'right' : 'left' }}>
                {m.hora}
              </div>
            </div>
          )
        })}

        {msgs.length === 0 && (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--color-muted)', fontSize: 13 }}>
            Sé el primero en escribir un mensaje
          </div>
        )}
      </div>

      <Composer
        cv={cv}
        plantillas={plantillas}
        pedidos={pedidos}
        onSend={(txt) => { handleEnviar(txt); onToast('Mensaje enviado') }}
        onIrAPlantillas={onIrAPlantillas}
        onToast={onToast}
      />
    </div>
  )
}
