// Uploader de imágenes con drag & drop y vista previa (logo, favicon, hero).
// Guarda la imagen como dataURL en el estado de apariencia.

import { useRef, useState } from 'react'
import { Image as ImageIcon, Upload, Trash2 } from 'lucide-react'

interface ImgUploaderProps {
    value:    string | null
    onChange: (v: string | null) => void
    shape?:   'square' | 'circle'
    size?:    number
    formats?: string
}

export function ImgUploader({ value, onChange, shape = 'square', size = 96, formats = 'PNG, JPG · máx 2MB' }: ImgUploaderProps) {
    const ref = useRef<HTMLInputElement>(null)
    const [drag, setDrag] = useState(false)

    const handle = (file: File | undefined | null) => {
        if (!file || !file.type.startsWith('image/')) return
        const r = new FileReader()
        r.onload = e => onChange(e.target?.result as string)
        r.readAsDataURL(file)
    }

    const radius = shape === 'circle' ? '50%' : 12

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
                onClick={() => !value && ref.current?.click()}
                onDragOver={e => { e.preventDefault(); setDrag(true) }}
                onDragLeave={() => setDrag(false)}
                onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]) }}
                style={{
                    width: size, height: size, borderRadius: radius,
                    border: `1.5px dashed ${drag ? 'var(--color-primary)' : 'var(--color-border-strong)'}`,
                    background: value ? 'transparent' : (drag ? 'var(--color-primary-bg)' : 'var(--color-surface-alt)'),
                    color: 'var(--color-muted)', cursor: value ? 'default' : 'pointer',
                    display: 'grid', placeItems: 'center', flexShrink: 0, overflow: 'hidden',
                    transition: 'border-color 150ms, background 150ms',
                }}
            >
                {value
                    ? <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ textAlign: 'center', padding: 8 }}><ImageIcon size={22} strokeWidth={1.5} /><div style={{ fontSize: 10, marginTop: 4 }}>Subir</div></div>}
                <input ref={ref} type="file" accept="image/*" onChange={e => handle(e.target.files?.[0])} style={{ display: 'none' }} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                {value ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                        <button onClick={() => ref.current?.click()} style={smallBtn}><Upload size={12} strokeWidth={1.5} /> Cambiar imagen</button>
                        <button onClick={() => onChange(null)} style={{ ...smallBtn, color: 'var(--color-error)', border: 'none', background: 'transparent' }}><Trash2 size={12} strokeWidth={1.5} /> Quitar</button>
                    </div>
                ) : (
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>Arrastrá una imagen acá</div>
                        <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>
                            o <button onClick={() => ref.current?.click()} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--color-primary)', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, textDecoration: 'underline' }}>elegila</button> desde tu equipo
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-subtle)', fontFamily: '"Geist Mono", monospace', marginTop: 6 }}>{formats}</div>
                    </div>
                )}
            </div>
        </div>
    )
}

const smallBtn: React.CSSProperties = {
    height: 30, padding: '0 10px', borderRadius: 6, background: 'var(--color-surface-alt)',
    border: '1px solid var(--color-border)', color: 'var(--color-body)', fontSize: 12,
    fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6,
}
