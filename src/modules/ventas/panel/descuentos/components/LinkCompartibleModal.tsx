import { useState } from 'react'
import { X, Copy, Check, ChevronDown, ChevronUp, Link2 } from 'lucide-react'
import { useRouter } from 'next/router'
import { useToggleLink } from '../hooks/useToggleLink'
import { useEnviarLinkEmail } from '../hooks/useEnviarLinkEmail'
import { useClientes } from '../hooks/useClientes'
import { productosMock, categoriasMock } from '../mock/productos'
import type { Cupon } from '../types'
import type { ClienteMock } from '../mock/clientes'

const MONO: React.CSSProperties = { fontFamily: '"Geist Mono", "Fira Code", monospace' }
type TipoDestino = 'inicio' | 'producto' | 'categoria'

function buildUrl(negocioId: string, codigo: string, redirect: string | null) {
  const base = `https://${negocioId}.orbita.com/descuento/${codigo}`
  return redirect ? `${base}?redirect=${redirect}` : base
}

function descCupon(c: Cupon) {
  const val = c.tipoDescuento === 'porcentaje' ? `${c.valor}%` : `$${c.valor.toLocaleString('es-AR')}`
  const alcance = c.alcance === 'ticket' ? 'en tu compra' : 'en productos seleccionados'
  return `${val} de descuento ${alcance}`
}

interface Props {
  cupon: Cupon
  onClose: () => void
}

export function LinkCompartibleModal({ cupon, onClose }: Props) {
  const router = useRouter()
  const negocioId = (router.query.negocioId as string) ?? 'mi-tienda'

  const [linkActivo, setLinkActivo] = useState(cupon.link_activo)
  const [tipoDestino, setTipoDestino] = useState<TipoDestino>(() => {
    if (!cupon.link_redirect) return 'inicio'
    if (cupon.link_redirect.startsWith('/productos/')) return 'producto'
    return 'categoria'
  })
  const [redirect, setRedirect] = useState<string | null>(cupon.link_redirect)
  const [copiado, setCopiado] = useState(false)
  const [queryProducto, setQueryProducto] = useState('')
  const [emailExpanded, setEmailExpanded] = useState(false)
  const [queryCliente, setQueryCliente] = useState('')
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteMock | null>(null)
  const [emailEnviado, setEmailEnviado] = useState(false)
  const [showClienteDropdown, setShowClienteDropdown] = useState(false)

  const toggleLink = useToggleLink()
  const enviarEmail = useEnviarLinkEmail()
  const { data: clientesFiltrados = [] } = useClientes(queryCliente)

  const urlActual = buildUrl(negocioId, cupon.codigo, redirect)

  function copiar() {
    navigator.clipboard.writeText(urlActual).catch(() => {})
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  function handleActivar() {
    toggleLink.mutate({ id: cupon.id, link_activo: true, link_redirect: redirect })
    setLinkActivo(true)
  }

  function handleTipoDestino(tipo: TipoDestino) {
    setTipoDestino(tipo)
    setRedirect(null)
  }

  function handleEnviarEmail() {
    if (!clienteSeleccionado) return
    enviarEmail.mutate({ cuponId: cupon.id, clienteId: clienteSeleccionado.id }, {
      onSuccess: () => setEmailEnviado(true),
    })
  }

  const productosFiltrados = productosMock.filter((p) =>
    !queryProducto || p.nombre.toLowerCase().includes(queryProducto.toLowerCase())
  )

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
      <div style={{ position: 'relative', width: '100%', maxWidth: 560, maxHeight: '88vh', overflowY: 'auto', background: 'var(--color-bg)', borderRadius: 14, boxShadow: '0 24px 64px rgba(0,0,0,0.22)', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 14px', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>Link compartible</div>
            <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2, ...MONO }}>{cupon.codigo}</div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-body)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Sección 1 — URL */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 10 }}>URL del link</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', fontSize: 12, color: 'var(--color-body)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ...MONO }}>
                {urlActual}
              </div>
              <button onClick={copiar} style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5, height: 36, padding: '0 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: copiado ? 'var(--color-success-bg, #f0fdf4)' : 'var(--color-bg)', color: copiado ? 'var(--color-success)' : 'var(--color-body)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                {copiado ? <><Check size={13} /> Copiado</> : <><Copy size={13} /> Copiar</>}
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 9999, background: linkActivo ? 'rgba(16,185,129,.1)' : 'var(--color-surface-alt)', color: linkActivo ? 'var(--color-success)' : 'var(--color-muted)' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                {linkActivo ? 'Activo' : 'Inactivo'}
              </span>
              {!linkActivo && (
                <button onClick={handleActivar} disabled={toggleLink.isPending} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 28, padding: '0 10px', borderRadius: 7, border: '1px solid var(--color-primary)', background: 'transparent', color: 'var(--color-primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  <Link2 size={12} /> Activar link
                </button>
              )}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)' }} />

          {/* Sección 2 — Página de destino */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 12 }}>Página de destino</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(['inicio', 'producto', 'categoria'] as TipoDestino[]).map((t) => {
                const labels = { inicio: 'Página de inicio', producto: 'Producto específico', categoria: 'Categoría' }
                return (
                  <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--color-body)' }}>
                    <input type="radio" name="destino" value={t} checked={tipoDestino === t} onChange={() => handleTipoDestino(t)} style={{ accentColor: 'var(--color-primary)' }} />
                    {labels[t]}
                  </label>
                )
              })}
            </div>

            {tipoDestino === 'producto' && (
              <div style={{ marginTop: 12 }}>
                <input value={queryProducto} onChange={(e) => setQueryProducto(e.target.value)} placeholder="Buscar producto…" style={{ width: '100%', height: 34, padding: '0 10px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                <div style={{ maxHeight: 140, overflowY: 'auto', marginTop: 6, border: '1px solid var(--color-border)', borderRadius: 8 }}>
                  {productosFiltrados.map((p) => (
                    <button key={p.id} onClick={() => setRedirect(`/productos/${p.id}`)} style={{ width: '100%', textAlign: 'left', padding: '7px 10px', background: redirect === `/productos/${p.id}` ? 'var(--color-primary-bg)' : 'transparent', color: redirect === `/productos/${p.id}` ? 'var(--color-primary)' : 'var(--color-body)', border: 'none', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid var(--color-border)' }}>
                      {p.nombre}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tipoDestino === 'categoria' && (
              <div style={{ marginTop: 12, border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
                {categoriasMock.map((cat) => (
                  <button key={cat.id} onClick={() => setRedirect(`/categorias/${cat.id}`)} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: redirect === `/categorias/${cat.id}` ? 'var(--color-primary-bg)' : 'transparent', color: redirect === `/categorias/${cat.id}` ? 'var(--color-primary)' : 'var(--color-body)', border: 'none', borderBottom: '1px solid var(--color-border)', cursor: 'pointer', fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {cat.nombre}
                    <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>{cat.productosCount} productos</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)' }} />

          {/* Sección 3 — Enviar por email (colapsable) */}
          <div>
            <button onClick={() => setEmailExpanded(!emailExpanded)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>Enviar a un cliente</span>
              {emailExpanded ? <ChevronUp size={15} color="var(--color-muted)" /> : <ChevronDown size={15} color="var(--color-muted)" />}
            </button>

            {emailExpanded && (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ position: 'relative' }}>
                  <input value={clienteSeleccionado ? `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}` : queryCliente} onChange={(e) => { setQueryCliente(e.target.value); setClienteSeleccionado(null); setEmailEnviado(false); setShowClienteDropdown(true) }} onFocus={() => setShowClienteDropdown(true)} onBlur={() => setTimeout(() => setShowClienteDropdown(false), 150)} placeholder="Buscar cliente por nombre o email…" style={{ width: '100%', height: 34, padding: '0 10px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                  {showClienteDropdown && clientesFiltrados.length > 0 && !clienteSeleccionado && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 8, marginTop: 4, maxHeight: 160, overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                      {clientesFiltrados.map((c) => (
                        <button key={c.id} onMouseDown={() => { setClienteSeleccionado(c); setShowClienteDropdown(false) }} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: 'transparent', border: 'none', borderBottom: '1px solid var(--color-border)', cursor: 'pointer', fontSize: 13 }}>
                          <span style={{ color: 'var(--color-text)' }}>{c.nombre} {c.apellido}</span>
                          <span style={{ color: 'var(--color-muted)', marginLeft: 8, fontSize: 12 }}>{c.email}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {clienteSeleccionado && (
                  <div style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-surface)', fontSize: 12, color: 'var(--color-body)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div><span style={{ color: 'var(--color-muted)' }}>De:</span> <span style={MONO}>rama-tienda@orbita.com</span></div>
                    <div><span style={{ color: 'var(--color-muted)' }}>Para:</span> <span style={MONO}>{clienteSeleccionado.email}</span></div>
                    <div><span style={{ color: 'var(--color-muted)' }}>Asunto:</span> ¡Tenés un descuento exclusivo en Rama Tienda!</div>
                    <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 6, paddingTop: 6, color: 'var(--color-body)', lineHeight: 1.5 }}>
                      Hola {clienteSeleccionado.nombre}, te compartimos un descuento especial: <strong>{descCupon(cupon)}</strong>.
                      El descuento se aplica automáticamente al entrar desde el link.
                    </div>
                  </div>
                )}

                {emailEnviado ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-success)', fontWeight: 500 }}>
                    <Check size={14} /> Email enviado a {clienteSeleccionado?.email} ✓
                  </div>
                ) : (
                  <button onClick={handleEnviarEmail} disabled={!clienteSeleccionado || enviarEmail.isPending} style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6, height: 34, padding: '0 14px', borderRadius: 8, border: 'none', background: clienteSeleccionado ? 'var(--color-primary)' : 'var(--color-border)', color: clienteSeleccionado ? '#fff' : 'var(--color-muted)', fontSize: 13, fontWeight: 500, cursor: clienteSeleccionado ? 'pointer' : 'not-allowed' }}>
                    {enviarEmail.isPending ? 'Enviando…' : 'Enviar email'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--color-border)', flexShrink: 0 }}>
          <button onClick={onClose} style={{ height: 36, padding: '0 18px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-body)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
