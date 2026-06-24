import { useState, useRef, type CSSProperties } from 'react'
import { Search, X, Star, Plus } from 'lucide-react'
import { useProductosPOS, useCategoriasPOS } from '../../hooks/useProductosPOS'
import { FiltrosCatalogo } from './FiltrosCatalogo'
import { GrillaProductos } from './GrillaProductos'
import { ProductoCardPOS } from './ProductoCardPOS'
import type { FiltrosCatalogoPOS, ProductoPOS } from '../../types'

interface Props {
  onAgregarProducto: (producto: ProductoPOS) => void
  onItemLibre: () => void
}

const GRID: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
  gap: 10,
}

export function CatalogoPOS({ onAgregarProducto, onItemLibre }: Props) {
  const [busqueda, setBusqueda] = useState('')
  const [busquedaQuery, setBusquedaQuery] = useState('')
  const [categoriaId, setCategoriaId] = useState<string | undefined>()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hayFiltros = !!busquedaQuery || !!categoriaId

  const filtros: FiltrosCatalogoPOS = {
    busqueda: busquedaQuery || undefined,
    categoriaId,
  }

  const { data: productos = [], isFetching } = useProductosPOS(filtros)
  const { data: favoritos = [] as ProductoPOS[] } = useProductosPOS({ soloFavoritos: true })
  const { data: categorias = [] } = useCategoriasPOS()

  const handleBusquedaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setBusqueda(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setBusquedaQuery(val), 250)
  }

  const limpiarBusqueda = () => {
    setBusqueda('')
    setBusquedaQuery('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, height: '100%', minHeight: 0 }}>

      {/* Buscador + Ítem libre */}
      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search
            size={15}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-muted)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            value={busqueda}
            onChange={handleBusquedaChange}
            placeholder="Buscar por nombre, código o SKU…"
            style={{
              width: '100%',
              padding: '9px 36px 9px 36px',
              borderRadius: 10,
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg)',
              color: 'var(--color-text)',
              fontSize: 14,
              fontFamily: 'inherit',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {busqueda && (
            <button
              onClick={limpiarBusqueda}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-muted)',
                padding: 2,
                display: 'flex',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={onItemLibre}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '9px 16px',
            borderRadius: 10,
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg)',
            color: 'var(--color-primary)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
          }}
        >
          <Plus size={14} /> Ítem libre
        </button>
      </div>

      {/* Filtros por categoría */}
      <div style={{ flexShrink: 0 }}>
        <FiltrosCatalogo
          categorias={categorias}
          categoriaActiva={categoriaId}
          onChange={setCategoriaId}
        />
      </div>

      {/* Contenido scrolleable */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          paddingBottom: 12,
          minHeight: 0,
        }}
      >
        {/* Favoritos: solo cuando no hay filtros activos */}
        {!hayFiltros && favoritos.length > 0 && (
          <div>
            <p
              style={{
                margin: '0 0 10px',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--color-warning)',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Star size={11} fill="currentColor" /> Favoritos
            </p>
            <div style={GRID}>
              {favoritos.map((p: ProductoPOS) => (
                <ProductoCardPOS key={p.id} producto={p} onClick={onAgregarProducto} />
              ))}
            </div>
          </div>
        )}

        {/* Grilla principal */}
        <GrillaProductos
          titulo={hayFiltros ? 'Resultados' : 'Todos los productos'}
          productos={productos}
          cargando={isFetching && productos.length === 0}
          onAgregarProducto={onAgregarProducto}
        />
      </div>
    </div>
  )
}
