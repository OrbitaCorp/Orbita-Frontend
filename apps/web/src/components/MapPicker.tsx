import dynamic from 'next/dynamic'

type Props = {
  center:    [number, number]
  onDragEnd: (latLng: [number, number]) => void
}

const Inner = dynamic(() => import('./MapPickerInner'), {
  ssr: false,
  loading: () => (
    <div style={{
      height: 240,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-surface)',
      fontSize: 13, color: 'var(--color-muted)',
    }}>
      Cargando mapa…
    </div>
  ),
})

export function MapPicker({ center, onDragEnd }: Props) {
  return <Inner center={center} onDragEnd={onDragEnd} />
}
