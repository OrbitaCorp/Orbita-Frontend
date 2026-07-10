import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'

const SK: React.CSSProperties = { background: 'var(--color-surface-alt)', borderRadius: 8 }

function PlantillasSkeleton() {
  return (
    <div>
      {/* Fila filtros + botón */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[56, 72, 64, 72, 88].map((w, i) => (
            <div key={i} style={{ ...SK, height: 30, width: w, borderRadius: 9999 }} />
          ))}
        </div>
        <div style={{ ...SK, height: 36, width: 140, borderRadius: 8 }} />
      </div>
      {/* Grid de cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ ...SK, height: 148, borderRadius: 12 }} />
        ))}
      </div>
    </div>
  )
}
import type { Plantilla, CategoriaPlantilla } from './mock/mensajes.mock'
import { PLANTILLAS, CATEGORIAS_PLANTILLA } from './mock/mensajes.mock'
import { PlantillaCard } from './components/PlantillaCard'
import { ModalPlantilla } from './components/ModalPlantilla'
import { ModalUsarPlantilla } from './components/ModalUsarPlantilla'

interface Props {
  onToast: (m: string) => void
}

type FiltroCategoria = 'todas' | CategoriaPlantilla

export function PlantillasMensajes({ onToast }: Props) {
  const [loading, setLoading] = useState(true)
  const [plantillas, setPlantillas] = useState<Plantilla[]>(PLANTILLAS)
  const [filtro, setFiltro]         = useState<FiltroCategoria>('todas')
  const [modalEditar, setModalEditar]  = useState<Plantilla | true | null>(null)
  const [modalUsar, setModalUsar]      = useState<Plantilla | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700)
    return () => clearTimeout(t)
  }, [])

  if (loading) return <PlantillasSkeleton />

  const filtradas = filtro === 'todas'
    ? plantillas
    : plantillas.filter((p) => p.categoria === filtro)

  const categoriasPresentes = CATEGORIAS_PLANTILLA.filter((c) =>
    plantillas.some((p) => p.categoria === c.id),
  )

  const handleGuardar = (data: Omit<Plantilla, 'id'>) => {
    if (modalEditar === true) {
      const id = `p${Date.now()}`
      setPlantillas((prev) => [...prev, { id, ...data }])
      onToast('Plantilla creada')
    } else if (modalEditar && typeof modalEditar === 'object') {
      setPlantillas((prev) => prev.map((p) => p.id === (modalEditar as Plantilla).id ? { ...p, ...data } : p))
      onToast('Plantilla actualizada')
    }
    setModalEditar(null)
  }

  const handleEliminar = (id: string) => {
    setPlantillas((prev) => prev.filter((p) => p.id !== id))
    onToast('Plantilla eliminada')
  }

  const pillStyle = (activo: boolean): React.CSSProperties => ({
    height: 30, padding: '0 12px', borderRadius: 9999,
    border: `1.5px solid ${activo ? 'var(--color-primary)' : 'var(--color-border)'}`,
    background: activo ? 'var(--color-primary-bg)' : 'transparent',
    color: activo ? 'var(--color-primary)' : 'var(--color-muted)',
    fontSize: 12.5, fontWeight: activo ? 600 : 500,
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 150ms ease',
  })

  return (
    <>
      {/* Filtros + botón en la misma fila */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button style={pillStyle(filtro === 'todas')} onClick={() => setFiltro('todas')}>Todas</button>
          {categoriasPresentes.map((c) => (
            <button key={c.id} style={pillStyle(filtro === c.id)} onClick={() => setFiltro(c.id)}>
              {c.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setModalEditar(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 36, padding: '0 14px', borderRadius: 8, border: 'none', background: 'var(--color-primary)', color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}
        >
          <Plus size={15} /> Nueva plantilla
        </button>
      </div>

      {/* Grid */}
      {filtradas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--color-muted)', fontSize: 14 }}>
          No hay plantillas en esta categoría.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {filtradas.map((p) => (
            <PlantillaCard
              key={p.id}
              p={p}
              onUsar={(pl) => setModalUsar(pl)}
              onEditar={(pl) => setModalEditar(pl)}
              onEliminar={handleEliminar}
            />
          ))}
        </div>
      )}

      {modalEditar && (
        <ModalPlantilla
          plantilla={modalEditar === true ? undefined : modalEditar}
          onGuardar={handleGuardar}
          onCerrar={() => setModalEditar(null)}
        />
      )}

      {modalUsar && (
        <ModalUsarPlantilla
          plantilla={modalUsar}
          cv={null}
          onEnviar={(txt) => { onToast(`Mensaje enviado: "${txt.slice(0, 40)}…"`) }}
          onCerrar={() => setModalUsar(null)}
        />
      )}
    </>
  )
}
