import { useEffect, useRef, useState } from 'react'
import { MoreVertical } from 'lucide-react'

export interface ItemMenuContextual {
  label: string
  Icono?: React.ComponentType<{ size?: number; color?: string }>
  onClick?: () => void
  destructivo?: boolean
  separadorAntes?: boolean
}

interface Props {
  items: ItemMenuContextual[]
}

function FilaMenu({
  item,
  onClose,
}: {
  item: ItemMenuContextual
  onClose: () => void
}) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => {
        item.onClick?.()
        onClose()
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        padding: '8px 12px',
        borderRadius: 6,
        fontSize: 13,
        textAlign: 'left',
        cursor: 'pointer',
        border: 'none',
        fontFamily: 'inherit',
        color: item.destructivo ? 'var(--color-error)' : 'var(--color-body)',
        background: hover
          ? item.destructivo
            ? 'var(--color-error-bg)'
            : 'var(--color-surface-alt)'
          : 'transparent',
        transition: 'background 100ms ease',
      }}
    >
      {item.Icono && (
        <item.Icono
          size={14}
          color={item.destructivo ? 'var(--color-error)' : undefined}
        />
      )}
      {item.label}
    </button>
  )
}

export function MenuContextual({ items }: Props) {
  const [abierto, setAbierto] = useState(false)
  const [hover, setHover] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!abierto) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [abierto])

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setAbierto((a) => !a)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          width: 30,
          height: 30,
          borderRadius: 6,
          border: '1px solid var(--color-border)',
          background: abierto || hover ? 'var(--color-surface-alt)' : 'var(--color-bg)',
          color: 'var(--color-body)',
          cursor: 'pointer',
          display: 'grid',
          placeItems: 'center',
          transition: 'background 100ms ease',
        }}
        title="Más opciones"
      >
        <MoreVertical size={14} />
      </button>

      {abierto && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 4px)',
            width: 192,
            borderRadius: 10,
            zIndex: 50,
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 4px 16px rgba(0,0,0,.12)',
            padding: 4,
          }}
        >
          {items.map((item, i) => (
            <div key={i}>
              {item.separadorAntes && (
                <div
                  style={{
                    height: 1,
                    background: 'var(--color-border)',
                    margin: '4px 0',
                  }}
                />
              )}
              <FilaMenu item={item} onClose={() => setAbierto(false)} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
