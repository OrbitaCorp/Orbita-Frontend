import type { CSSProperties } from 'react'
import type { CategoriaPOS } from '../../types'

interface Props {
  categorias: CategoriaPOS[]
  categoriaActiva: string | undefined
  onChange: (categoriaId: string | undefined) => void
}

export function FiltrosCatalogo({ categorias, categoriaActiva, onChange }: Props) {
  const todos = categoriaActiva === undefined

  const chipStyle = (activo: boolean): CSSProperties => ({
    padding: '5px 14px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: activo ? 600 : 400,
    border: activo ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border)',
    background: activo ? 'var(--color-primary)' : 'transparent',
    color: activo ? '#fff' : 'var(--color-body)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
    transition: 'background 0.1s, border-color 0.1s, color 0.1s',
  })

  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '2px 0' }}>
      <button style={chipStyle(todos)} onClick={() => onChange(undefined)}>
        Todos
      </button>
      {categorias.map((cat) => {
        const activo = categoriaActiva === cat.id
        return (
          <button
            key={cat.id}
            style={chipStyle(activo)}
            onClick={() => onChange(activo ? undefined : cat.id)}
          >
            {cat.label}
          </button>
        )
      })}
    </div>
  )
}
