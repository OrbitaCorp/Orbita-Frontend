import { useState, useRef } from 'react'
import { ChevronLeft, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, ArrowRight, RotateCcw } from 'lucide-react'
import { Button } from '@/design-system/components/Button'

type Props = { onVolver: () => void }

type Paso = 1 | 2 | 3

const COLUMNAS_SISTEMA = ['nombre', 'descripcion', 'sku', 'precio', 'precioTachado', 'stock', 'stockMinimo', 'estado', 'categorias']
const COLUMNAS_LABELS: Record<string, string> = {
  nombre: 'Nombre *', descripcion: 'Descripción', sku: 'SKU',
  precio: 'Precio *', precioTachado: 'Precio tachado', stock: 'Stock',
  stockMinimo: 'Stock mínimo', estado: 'Estado', categorias: 'Categorías',
}

// Simulated parsed data from a CSV
const MOCK_FILAS = [
  { Producto: 'Remera Azul', Descripcion: 'Remera de algodón azul', Codigo: 'REM-AZ-001', Valor: '7500', Stock: '20' },
  { Producto: 'Buzo Gris',   Descripcion: 'Buzo con capucha gris',  Codigo: 'BUZ-GR-002', Valor: '16000', Stock: '10' },
  { Producto: 'Pantalón Negro', Descripcion: '',                    Codigo: 'PNT-NG-003', Valor: '',      Stock: '15' },
  { Producto: '',             Descripcion: 'Sin nombre — inválido', Codigo: 'ERR-001',     Valor: '5000',  Stock: '5' },
  { Producto: 'Gorra Blanca', Descripcion: 'Gorra snapback',        Codigo: 'GOR-BL-004', Valor: '8000',  Stock: '25' },
]
const COLUMNAS_ARCHIVO = Object.keys(MOCK_FILAS[0])

function Stepper({ paso }: { paso: Paso }) {
  const pasos = [
    { n: 1, label: 'Subir archivo' },
    { n: 2, label: 'Mapear columnas' },
    { n: 3, label: 'Resultado' },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      {pasos.map((p, i) => (
        <div key={p.n} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700,
              background: paso === p.n ? 'var(--color-primary)' : paso > p.n ? '#34D399' : 'var(--color-surface)',
              color: paso >= p.n ? 'white' : 'var(--color-muted)',
              border: paso < p.n ? '2px solid var(--color-border)' : 'none',
              flexShrink: 0,
            }}>
              {paso > p.n ? <CheckCircle2 size={14} /> : p.n}
            </div>
            <span style={{ fontSize: 13, fontWeight: paso === p.n ? 600 : 400, color: paso === p.n ? 'var(--color-text)' : 'var(--color-muted)' }}>{p.label}</span>
          </div>
          {i < pasos.length - 1 && (
            <div style={{ width: 40, height: 1, background: paso > p.n ? '#34D399' : 'var(--color-border)', margin: '0 12px' }} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function ImportarProductos({ onVolver }: Props) {
  const [paso, setPaso] = useState<Paso>(1)
  const [archivo, setArchivo] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [mapeo, setMapeo] = useState<Record<string, string>>({})
  const [importando, setImportando] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    if (!file) return
    setArchivo(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  async function importar() {
    setImportando(true)
    await new Promise(r => setTimeout(r, 1200))
    setImportando(false)
    setPaso(3)
  }

  const filaValida = (fila: typeof MOCK_FILAS[0]) => {
    const colNombre = Object.entries(mapeo).find(([, v]) => v === 'nombre')?.[0]
    const colPrecio = Object.entries(mapeo).find(([, v]) => v === 'precio')?.[0]
    return !!(colNombre && fila[colNombre as keyof typeof fila]) && !!(colPrecio && fila[colPrecio as keyof typeof fila])
  }

  const filasValidas   = MOCK_FILAS.filter(f => filaValida(f))
  const filasInvalidas = MOCK_FILAS.filter(f => !filaValida(f))

  const mapeosCompletos = Object.values(mapeo).includes('nombre') && Object.values(mapeo).includes('precio')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onVolver} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: 'var(--color-muted)', borderRadius: 6, display: 'flex' }}>
          <ChevronLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Importar productos</h1>
          <p style={{ fontSize: 12, color: 'var(--color-muted)', margin: '2px 0 0' }}>Carga masiva desde CSV o Excel</p>
        </div>
      </div>

      <Stepper paso={paso} />

      {/* ── Paso 1: Upload ──────────────────────────────────────────── */}
      {paso === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />

          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${isDragging ? 'var(--color-primary)' : 'var(--color-border)'}`,
              borderRadius: 12, padding: '48px 24px', textAlign: 'center', cursor: 'pointer',
              background: isDragging ? 'var(--color-primary-bg)' : 'var(--color-surface)',
              transition: 'all 200ms',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--color-primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Upload size={22} style={{ color: 'var(--color-primary)' }} />
              </div>
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', margin: '0 0 6px' }}>
              {archivo ? archivo.name : 'Arrastrá tu archivo aquí'}
            </p>
            <p style={{ fontSize: 13, color: 'var(--color-muted)', margin: 0 }}>
              {archivo ? `${(archivo.size / 1024).toFixed(1)} KB · Listo para continuar` : 'o hacé clic para seleccionar · CSV, XLSX, XLS'}
            </p>
          </div>

          {archivo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10 }}>
              <FileSpreadsheet size={20} style={{ color: '#34D399', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{archivo.name}</div>
                <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>{MOCK_FILAS.length} filas detectadas · {COLUMNAS_ARCHIVO.length} columnas</div>
              </div>
              <button onClick={() => setArchivo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#EF4444' }}>Quitar</button>
            </div>
          )}

          <div style={{ padding: '12px 14px', borderRadius: 8, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', fontSize: 12, color: 'var(--color-body)', lineHeight: 1.5 }}>
            <strong>Formato esperado:</strong> El archivo debe tener una fila de encabezados. Los campos mínimos requeridos son <strong>Nombre</strong> y <strong>Precio</strong>.
            En el próximo paso vas a indicar qué columna de tu archivo corresponde a cada campo.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="primary" size="sm" icon={<ArrowRight size={14} />} disabled={!archivo} onClick={() => setPaso(2)}>
              Continuar
            </Button>
          </div>
        </div>
      )}

      {/* ── Paso 2: Column mapping ──────────────────────────────────── */}
      {paso === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>

            {/* Mapping */}
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 4px' }}>Mapeo de columnas</h3>
              <p style={{ fontSize: 12, color: 'var(--color-muted)', margin: '0 0 16px' }}>Indicá qué columna de tu archivo corresponde a cada campo del sistema.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {COLUMNAS_SISTEMA.map(campo => (
                  <div key={campo} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: 'var(--color-text)' }}>
                      {COLUMNAS_LABELS[campo]}
                    </div>
                    <select
                      value={mapeo[campo] === undefined ? '' : mapeo[campo]}
                      onChange={e => {
                        const val = e.target.value
                        setMapeo(m => {
                          const next = { ...m }
                          // Clear previous mapping for this archivo column
                          Object.keys(next).forEach(k => { if (next[k] === campo) delete next[k] })
                          if (val) next[val] = campo
                          return next
                        })
                      }}
                      style={{ flex: 1.2, height: 32, padding: '0 8px', border: '1px solid var(--color-border)', borderRadius: 7, background: 'var(--color-bg)', color: 'var(--color-body)', fontSize: 12, outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="">— No mapear —</option>
                      {COLUMNAS_ARCHIVO.map(col => <option key={col} value={col}>{col}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              {!mapeosCompletos && (
                <div style={{ marginTop: 12, display: 'flex', gap: 6, fontSize: 11, color: '#F59E0B', alignItems: 'center' }}>
                  <AlertCircle size={12} /> Mapeá al menos Nombre * y Precio * para continuar
                </div>
              )}
            </div>

            {/* Preview */}
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 4px' }}>Vista previa</h3>
              <p style={{ fontSize: 12, color: 'var(--color-muted)', margin: '0 0 16px' }}>Primeras 5 filas del archivo</p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead>
                    <tr>
                      {COLUMNAS_ARCHIVO.map(col => (
                        <th key={col} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600, color: 'var(--color-subtle)', borderBottom: '1px solid var(--color-border)', whiteSpace: 'nowrap' }}>
                          {col}
                          {mapeo[col] && <span style={{ marginLeft: 4, color: 'var(--color-primary)', fontSize: 9 }}>→ {mapeo[col]}</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_FILAS.map((fila, i) => (
                      <tr key={i} style={{ background: filaValida(fila) ? 'transparent' : 'rgba(239,68,68,0.05)' }}>
                        {COLUMNAS_ARCHIVO.map(col => (
                          <td key={col} style={{ padding: '6px 8px', borderBottom: '1px solid var(--color-border)', color: fila[col as keyof typeof fila] ? 'var(--color-body)' : '#F87171', fontStyle: fila[col as keyof typeof fila] ? 'normal' : 'italic' }}>
                            {fila[col as keyof typeof fila] || 'vacío'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="secondary" size="sm" onClick={() => setPaso(1)}>Volver</Button>
            <Button variant="primary" size="sm" icon={<ArrowRight size={14} />} loading={importando} disabled={!mapeosCompletos} onClick={importar}>
              Importar productos
            </Button>
          </div>
        </div>
      )}

      {/* ── Paso 3: Results ─────────────────────────────────────────── */}
      {paso === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { label: 'Importados',  value: filasValidas.length,   color: '#34D399', bg: 'rgba(52,211,153,0.1)',  icon: <CheckCircle2 size={16} /> },
              { label: 'Con errores', value: filasInvalidas.length, color: '#F87171', bg: 'rgba(248,113,113,0.1)', icon: <AlertCircle size={16} /> },
              { label: 'Total',       value: MOCK_FILAS.length,     color: 'var(--color-primary)', bg: 'var(--color-primary-bg)', icon: <FileSpreadsheet size={16} /> },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}30`, borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: s.color }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-body)' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Errors */}
          {filasInvalidas.length > 0 && (
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={14} style={{ color: '#F87171' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>Filas con errores ({filasInvalidas.length})</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: 'var(--color-surface)' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--color-subtle)', borderBottom: '1px solid var(--color-border)' }}>Fila</th>
                    {COLUMNAS_ARCHIVO.map(col => <th key={col} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--color-subtle)', borderBottom: '1px solid var(--color-border)' }}>{col}</th>)}
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--color-subtle)', borderBottom: '1px solid var(--color-border)' }}>Error</th>
                  </tr>
                </thead>
                <tbody>
                  {filasInvalidas.map((fila, i) => {
                    const colNombre = Object.entries(mapeo).find(([, v]) => v === 'nombre')?.[0]
                    const colPrecio = Object.entries(mapeo).find(([, v]) => v === 'precio')?.[0]
                    const errores: string[] = []
                    if (colNombre && !fila[colNombre as keyof typeof fila]) errores.push('Nombre requerido')
                    if (colPrecio && !fila[colPrecio as keyof typeof fila]) errores.push('Precio requerido')
                    return (
                      <tr key={i} style={{ background: 'rgba(239,68,68,0.04)' }}>
                        <td style={{ padding: '8px 12px', color: 'var(--color-muted)', borderBottom: '1px solid var(--color-border)' }}>{i + 1}</td>
                        {COLUMNAS_ARCHIVO.map(col => (
                          <td key={col} style={{ padding: '8px 12px', color: fila[col as keyof typeof fila] ? 'var(--color-body)' : '#F87171', borderBottom: '1px solid var(--color-border)', fontStyle: fila[col as keyof typeof fila] ? 'normal' : 'italic' }}>
                            {fila[col as keyof typeof fila] || '—'}
                          </td>
                        ))}
                        <td style={{ padding: '8px 12px', color: '#F87171', fontWeight: 600, borderBottom: '1px solid var(--color-border)' }}>
                          {errores.join(', ')}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Success rows */}
          {filasValidas.length > 0 && (
            <div style={{ padding: '12px 16px', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle2 size={16} style={{ color: '#34D399', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'var(--color-body)' }}>
                <strong style={{ color: '#34D399' }}>{filasValidas.length} productos</strong> importados correctamente al catálogo.
              </span>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="outline" size="sm" icon={<RotateCcw size={14} />} onClick={() => { setArchivo(null); setMapeo({}); setPaso(1) }}>
              Nueva importación
            </Button>
            <Button variant="primary" size="sm" onClick={onVolver}>Ir al catálogo</Button>
          </div>
        </div>
      )}
    </div>
  )
}
