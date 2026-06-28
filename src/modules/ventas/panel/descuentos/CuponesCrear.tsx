import { useState, useEffect } from 'react'
import { ArrowLeft, Shuffle } from 'lucide-react'
import { SectionCard, FormField, LabelRow } from './components/FormField'
import { TipoCuponSelector } from './components/TipoCuponSelector'
import { AlcanceSelector } from './components/AlcanceSelector'
import { CategoriaLista } from './components/CategoriaLista'
import { ProductoArbol } from './components/ProductoArbol'
import { Toggle } from '../../_shared/components/Toggle'
import { PreviewCupon } from './components/PreviewCupon'
import { ResumenSidebar } from './components/ResumenSidebar'
import { useCupon } from './hooks/useCupon'
import { useCrearCupon } from './hooks/useCrearCupon'
import { useEditarCupon } from './hooks/useEditarCupon'
import { generarCodigoCupon } from './utils'
import type { TipoCupon, AlcanceDescuento } from './types'

interface Props {
  id?: string
  onVolver: () => void
}

export function CuponesCrear({ id, onVolver }: Props) {
  const [codigo, setCodigo] = useState(generarCodigoCupon())
  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState<TipoCupon | null>(null)
  const [valor, setValor] = useState('')
  const [alcance, setAlcance] = useState<AlcanceDescuento>('ticket')
  const [productosIds, setProductosIds] = useState<string[]>([])
  const [categoriasIds, setCategoriasIds] = useState<string[]>([])
  const [montoMinimo, setMontoMinimo] = useState('')
  const [sinMontoMinimo, setSinMontoMinimo] = useState(true)
  const [usosMaxTotal, setUsosMaxTotal] = useState('')
  const [usosMaxPorCliente, setUsosMaxPorCliente] = useState('')
  const [ilimitadoTotal, setIlimitadoTotal] = useState(true)
  const [ilimitadoPorCliente, setIlimitadoPorCliente] = useState(true)
  const [fechaInicio, setFechaInicio] = useState(() => new Date().toISOString().split('T')[0])
  const [fechaExpiracion, setFechaExpiracion] = useState('')
  const [sinVencimiento, setSinVencimiento] = useState(false)
  const [errores, setErrores] = useState<Record<string, string>>({})

  const { data: existing, isLoading } = useCupon(id)
  const crearMutation = useCrearCupon()
  const editarMutation = useEditarCupon()

  useEffect(() => {
    if (!existing) return
    setCodigo(existing.codigo)
    setNombre(existing.nombre)
    setTipo(existing.tipoDescuento)
    setValor(String(existing.valor))
    setAlcance(existing.alcance)
    setProductosIds(existing.productosIds ?? [])
    setCategoriasIds(existing.categoriasIds ?? [])
    setSinMontoMinimo(!existing.montoMinimo)
    setMontoMinimo(String(existing.montoMinimo ?? ''))
    setIlimitadoTotal(!existing.usosMaxTotal)
    setUsosMaxTotal(String(existing.usosMaxTotal ?? ''))
    setIlimitadoPorCliente(!existing.usosMaxPorCliente)
    setUsosMaxPorCliente(String(existing.usosMaxPorCliente ?? ''))
    setFechaInicio(existing.fechaInicio.split('T')[0])
    setSinVencimiento(!existing.fechaExpiracion)
    setFechaExpiracion(existing.fechaExpiracion?.split('T')[0] ?? '')
  }, [existing])

  const validar = () => {
    const e: Record<string, string> = {}
    if (!codigo.trim()) e.codigo = 'El código es obligatorio'
    if (!nombre.trim()) e.nombre = 'El nombre es obligatorio'
    if (!tipo) e.tipo = 'Seleccioná un tipo de cupón'
    if (!valor) e.valor = 'Ingresá un valor de descuento'
    if (!fechaInicio) e.fechaInicio = 'Seleccioná fecha de inicio'
    if (!sinVencimiento && !fechaExpiracion) e.fechaExpiracion = 'Seleccioná fecha de expiración o activá "Sin vencimiento"'
    return e
  }

  const handleSubmit = async () => {
    const e = validar()
    if (Object.keys(e).length) { setErrores(e); return }
    const payload = {
      codigo,
      nombre,
      tipoDescuento: tipo!,
      valor: parseFloat(valor),
      alcance,
      productosIds: alcance === 'producto' ? productosIds : undefined,
      categoriasIds: alcance === 'categoria' ? categoriasIds : undefined,
      montoMinimo: sinMontoMinimo ? null : parseFloat(montoMinimo) || null,
      usosMaxTotal: ilimitadoTotal ? null : parseInt(usosMaxTotal) || null,
      usosMaxPorCliente: ilimitadoPorCliente ? null : parseInt(usosMaxPorCliente) || null,
      fechaInicio,
      fechaExpiracion: sinVencimiento ? null : fechaExpiracion,
      activo: true,
    }
    if (id) {
      await editarMutation.mutateAsync({ id, data: payload })
    } else {
      await crearMutation.mutateAsync(payload as Parameters<typeof crearMutation.mutateAsync>[0])
    }
    onVolver()
  }

  const isSaving = crearMutation.isPending || editarMutation.isPending

  const header = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <button
        type="button"
        onClick={onVolver}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-body)', cursor: 'pointer', flexShrink: 0 }}
      >
        <ArrowLeft size={16} />
      </button>
      <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--color-text)' }}>
        {id ? 'Editar cupón' : 'Nuevo cupón'}
      </h1>
    </div>
  )

  if (isLoading && id) {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 40 }}>
        {header}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[190, 240, 130, 130].map((h, i) => (
              <div key={i} style={{ height: h, borderRadius: 12, background: 'var(--color-surface-alt)' }} />
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ height: 190, borderRadius: 12, background: 'var(--color-surface-alt)' }} />
            <div style={{ height: 170, borderRadius: 12, background: 'var(--color-surface-alt)' }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 40 }}>
      {header}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SectionCard title="Información básica" subtitle="Definí el código y nombre del cupón.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <p style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 500, color: 'var(--color-body)' }}>
                  Código del cupón
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <FormField
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                      placeholder="PROMO-ABCD"
                      mono
                      error={errores.codigo}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setCodigo(generarCodigoCupon())}
                    style={{
                      flexShrink: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      height: 38,
                      padding: '0 16px',
                      borderRadius: 8,
                      border: '1.5px solid var(--color-border)',
                      background: 'var(--color-bg)',
                      color: 'var(--color-body)',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Shuffle size={14} />
                    Generar
                  </button>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--color-muted)' }}>
                  Este es el código que el cliente ingresará en el POS o la tienda online.
                </p>
              </div>
              <div>
                <FormField
                  label="Nombre descriptivo"
                  placeholder="Ej: Cupón bienvenida 10%"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  error={errores.nombre}
                />
                <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--color-muted)' }}>
                  Solo visible para administradores. No se muestra al cliente.
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Configuración" subtitle="Definí qué descuento otorga este cupón.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <p style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 500, color: 'var(--color-body)' }}>Tipo de descuento</p>
                <TipoCuponSelector tipo={tipo} onChange={setTipo} error={errores.tipo} />
              </div>
              {tipo && (
                <>
                  <FormField
                    label={tipo === 'porcentaje' ? 'Porcentaje de descuento' : 'Monto de descuento'}
                    prefix={tipo === 'monto_fijo' ? '$' : undefined}
                    suffix={tipo === 'porcentaje' ? '%' : undefined}
                    type="number" min="0"
                    placeholder={tipo === 'porcentaje' ? '10' : '5000'}
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    mono
                    error={errores.valor}
                  />
                  <div>
                    <p style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 500, color: 'var(--color-body)' }}>Alcance</p>
                    <AlcanceSelector alcance={alcance} onChange={(a) => { setAlcance(a); setProductosIds([]); setCategoriasIds([]) }} />
                  </div>
                  {alcance === 'categoria' && <CategoriaLista categoriasIds={categoriasIds} onChange={setCategoriasIds} />}
                  {alcance === 'producto' && <ProductoArbol productosIds={productosIds} onChange={setProductosIds} />}
                  <div>
                    <LabelRow
                      label="Compra mínima"
                      right={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>Sin mínimo</span>
                          <Toggle checked={sinMontoMinimo} onChange={setSinMontoMinimo} />
                        </div>
                      }
                    />
                    <FormField prefix="$" type="number" min="0" placeholder="20000" value={montoMinimo} onChange={(e) => setMontoMinimo(e.target.value)} disabled={sinMontoMinimo} mono />
                  </div>
                </>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Límites de uso">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <LabelRow label="Usos totales" right={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 12, color: 'var(--color-muted)' }}>Ilimitado</span><Toggle checked={ilimitadoTotal} onChange={setIlimitadoTotal} /></div>} />
                <FormField type="number" min="1" placeholder="500" value={usosMaxTotal} onChange={(e) => setUsosMaxTotal(e.target.value)} disabled={ilimitadoTotal} mono />
              </div>
              <div>
                <LabelRow label="Usos por cliente" right={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 12, color: 'var(--color-muted)' }}>Ilimitado</span><Toggle checked={ilimitadoPorCliente} onChange={setIlimitadoPorCliente} /></div>} />
                <FormField type="number" min="1" placeholder="1" value={usosMaxPorCliente} onChange={(e) => setUsosMaxPorCliente(e.target.value)} disabled={ilimitadoPorCliente} mono />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Vigencia">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FormField label="Fecha de inicio" type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} error={errores.fechaInicio} />
              <div>
                <LabelRow label="Fecha de expiración" right={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 12, color: 'var(--color-muted)' }}>Sin vencimiento</span><Toggle checked={sinVencimiento} onChange={setSinVencimiento} /></div>} />
                <FormField type="date" value={fechaExpiracion} onChange={(e) => setFechaExpiracion(e.target.value)} disabled={sinVencimiento} error={errores.fechaExpiracion} />
              </div>
            </div>
          </SectionCard>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingBottom: 40 }}>
            <button type="button" onClick={onVolver} style={{ height: 40, padding: '0 20px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-body)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Cancelar</button>
            <button type="button" onClick={handleSubmit} disabled={isSaving} style={{ height: 40, padding: '0 24px', borderRadius: 8, border: 'none', background: isSaving ? 'var(--color-border)' : 'var(--color-primary)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: isSaving ? 'not-allowed' : 'pointer' }}>
              {isSaving ? 'Guardando…' : id ? 'Guardar cambios' : 'Crear cupón'}
            </button>
          </div>
        </div>

        <div style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <PreviewCupon codigo={codigo} nombre={nombre} tipo={tipo} valor={valor} alcance={alcance} montoMinimo={montoMinimo} />
          <ResumenSidebar nombre={nombre} tipo={null} aplicacion="manual" fechaInicio={fechaInicio} fechaFin={fechaExpiracion} sinVencimiento={sinVencimiento} diasVigencia={[]} ilimitadoUsos={ilimitadoTotal} limiteUsosTotal={usosMaxTotal} />
        </div>
      </div>
    </div>
  )
}
