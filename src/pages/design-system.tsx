import { useState } from 'react';
import { Button }     from '@/design-system/components/Button';
import { Input }      from '@/design-system/components/Input';
import { Badge }      from '@/design-system/components/Badge';
import { Card }       from '@/design-system/components/Card';
import { Modal }      from '@/design-system/components/Modal';
import { Toast }      from '@/design-system/components/Toast';
import { Table }      from '@/design-system/components/Table';
import { Skeleton }   from '@/design-system/components/Skeleton';
import { EmptyState } from '@/design-system/components/EmptyState';
import { LineChart, BarChart, DonutChart } from '@/design-system/components/Chart';
import type { Column } from '@/design-system/components/Table';

// ─── Datos de ejemplo ─────────────────────────────────────────────────────────

type Pedido = { id: string; cliente: string; monto: number; estado: string };

const pedidos: Pedido[] = [
  { id: 'ORB-2847', cliente: 'María Fernández',  monto: 48900, estado: 'Pendiente'  },
  { id: 'ORB-2846', cliente: 'Lucas Giménez',    monto: 89000, estado: 'Enviado'    },
  { id: 'ORB-2845', cliente: 'Valentina Sosa',   monto: 42600, estado: 'Cancelado'  },
];

const columns: Column<Pedido>[] = [
  {
    key: 'id', header: '# Pedido', width: '130px',
    render: (r) => <span style={{ fontFamily: '"Geist Mono", monospace', fontWeight: 600, color: 'var(--color-text)' }}>#{r.id}</span>,
  },
  { key: 'cliente', header: 'Cliente' },
  {
    key: 'monto', header: 'Monto', align: 'right', width: '120px',
    render: (r) => <span style={{ fontFamily: '"Geist Mono", monospace', fontWeight: 600, color: 'var(--color-text)' }}>${r.monto.toLocaleString('es-AR')}</span>,
  },
  {
    key: 'estado', header: 'Estado', width: '130px',
    render: (r) => <Badge status={r.estado.toLowerCase().replace(' ', '-') as any} />,
  },
];

// ─── Sección helper ───────────────────────────────────────────────────────────

function Section({ num, title, file, children }: { num: string; title: string; file: string; children: React.ReactNode }) {
  return (
    <section>
      <header style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: 'var(--color-surface-alt)', color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>
          {num}
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {file}
        </span>
        <span style={{ fontSize: 13, color: 'var(--color-body)', fontWeight: 500 }}>{title}</span>
      </header>
      <div style={{
        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
        borderRadius: 12, padding: 24,
        boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
      }}>
        {children}
      </div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        {children}
      </div>
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function DesignSystemPage() {
  const [dark,       setDark]       = useState(false);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [modalType,  setModalType]  = useState<'default' | 'danger' | 'success'>('danger');
  const [inputValue, setInputValue] = useState('');
  const [page,       setPage]       = useState(1);

  // Toggle dark mode en el html
  const toggleDark = () => {
    document.documentElement.classList.toggle('dark');
    setDark(d => !d);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: '"Geist", Inter, sans-serif' }}>
      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 32px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'linear-gradient(135deg,#2563EB,#3B82F6)',
                  display: 'grid', placeItems: 'center',
                }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fff' }} />
                </div>
                <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, color: 'var(--color-text)' }}>
                  Design System · Orbita
                </h1>
              </div>
              <p style={{ fontSize: 13, color: 'var(--color-muted)', margin: 0, marginLeft: 48 }}>
                Referencia visual de componentes — <span style={{ fontFamily: '"Geist Mono", monospace' }}>v1.0</span>
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={toggleDark}>
              {dark ? '☀ Modo claro' : '☾ Modo oscuro'}
            </Button>
          </div>
          <div style={{ marginTop: 20, height: 1, background: 'var(--color-border)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* 01 · Button */}
          <Section num="01" file="Button.tsx" title="Botones">
            <Row label="Variantes">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="outline">Outline</Button>
            </Row>
            <Row label="Tamaños">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </Row>
            <Row label="Estados">
              <Button disabled>Disabled</Button>
              <Button loading>Guardando…</Button>
            </Row>
          </Section>

          {/* 02 · Input */}
          <Section num="02" file="Input.tsx" title="Inputs y formularios">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              <Input label="Email" placeholder="hola@orbita.com" value={inputValue} onChange={e => setInputValue(e.target.value)} />
              <Input label="Con error" placeholder="escribí algo" error="El email no es válido" />
              <Input label="Deshabilitado" value="No editable" disabled />
              <Input label="Monto" prefix="$" mono placeholder="0" />
            </div>
          </Section>

          {/* 03 · Badge */}
          <Section num="03" file="Badge.tsx" title="Status badges">
            <Row label="Con dot">
              <Badge status="pendiente" />
              <Badge status="confirmado" />
              <Badge status="cancelado" />
              <Badge status="completado" />
              <Badge status="en-proceso" />
              <Badge status="enviado" />
            </Row>
            <Row label="Sin dot · sm">
              <Badge status="pendiente"  dot={false} size="sm" />
              <Badge status="confirmado" dot={false} size="sm" />
              <Badge status="cancelado"  dot={false} size="sm" />
              <Badge status="completado" dot={false} size="sm" />
            </Row>
          </Section>

          {/* 04 · Card */}
          <Section num="04" file="Card.tsx" title="Cards">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <Card>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Ventas del mes</div>
                <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--color-primary)', fontFamily: '"Geist Mono", monospace' }}>$1.124.300</div>
              </Card>
              <Card hoverable onClick={() => {}}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>Card hoverable</div>
                <div style={{ fontSize: 13, color: 'var(--color-body)' }}>Pasá el cursor para ver la elevación.</div>
              </Card>
            </div>
          </Section>

          {/* 05 · Modal */}
          <Section num="05" file="Modal.tsx" title="Modales">
            <Row label="Disparadores">
              <Button variant="danger" onClick={() => { setModalType('danger'); setModalOpen(true); }}>Abrir modal · Danger</Button>
              <Button variant="primary" onClick={() => { setModalType('success'); setModalOpen(true); }}>Abrir modal · Success</Button>
              <Button variant="outline" onClick={() => { setModalType('default'); setModalOpen(true); }}>Abrir modal · Default</Button>
            </Row>
            <Modal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              title={modalType === 'danger' ? '¿Eliminar pedido?' : modalType === 'success' ? 'Confirmar acción' : 'Información'}
              variant={modalType}
              footer={
                <>
                  <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancelar</Button>
                  <Button variant={modalType === 'danger' ? 'danger' : 'primary'} size="sm" onClick={() => setModalOpen(false)}>
                    {modalType === 'danger' ? 'Eliminar' : 'Confirmar'}
                  </Button>
                </>
              }
            >
              {modalType === 'danger'
                ? 'Esta acción es permanente. El pedido y todos sus datos se eliminarán de tus reportes.'
                : 'Vamos a marcar este pedido como entregado y notificar al cliente por email.'}
            </Modal>
          </Section>

          {/* 06 · Toast */}
          <Section num="06" file="Toast.tsx" title="Notificaciones toast">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 400 }}>
              <Toast variant="success" title="Pedido confirmado"   description="#ORB-2847 pasó a estado en preparación." />
              <Toast variant="error"   title="Error al guardar"    description="Verificá tu conexión e intentá de nuevo." persistent onClose={() => {}} />
              <Toast variant="warning" title="Stock bajo"          description={'Quedan 2 unidades de "Buzo capucha azul".'} />
              <Toast variant="info"    title="Nueva versión"       description="Actualizamos el panel de pedidos con mejoras." />
            </div>
          </Section>

          {/* 07 · Table */}
          <Section num="07" file="Table.tsx" title="Tablas">
            <Table
              columns={columns}
              data={pedidos}
              keyField="id"
              pagination={{ page, total: 24, perPage: 3, onChange: setPage }}
            />
          </Section>

          {/* 08 · Chart */}
          <Section num="08" file="Chart.tsx" title="Gráficos">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <Card padding="sm">
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Ventas en el tiempo</div>
                <LineChart data={[22, 38, 28, 56, 48, 72, 64, 88]} labels={['L','M','M','J','V','S','D','L']} max={100} />
              </Card>
              <Card padding="sm">
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Top productos</div>
                <BarChart data={[{ label: 'Remera negra', value: 48 }, { label: 'Buzo azul', value: 32 }, { label: 'Zapatillas', value: 24 }]} />
              </Card>
              <Card padding="sm">
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Canales</div>
                <DonutChart
                  data={[{ label: 'Online', value: 68, color: 'var(--color-primary)' }, { label: 'Presencial', value: 32, color: 'var(--color-success)' }]}
                  label="Online"
                />
              </Card>
            </div>
          </Section>

          {/* 09 · Skeleton */}
          <Section num="09" file="Skeleton.tsx" title="Loading skeletons">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <Card padding="sm">
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
                  <Skeleton width={40} height={40} radius="50%" />
                  <div style={{ flex: 1 }}>
                    <Skeleton width="70%" style={{ marginBottom: 8, display: 'block' }} />
                    <Skeleton width="40%" height={10} />
                  </div>
                </div>
                <Skeleton style={{ marginBottom: 8, display: 'block' }} />
                <Skeleton width="80%" />
              </Card>
              <Card padding="sm">
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < 2 ? '1px solid var(--color-border)' : 'none', alignItems: 'center' }}>
                    <Skeleton width={60} height={10} />
                    <Skeleton width="50%" height={10} />
                    <Skeleton width={60} height={10} />
                  </div>
                ))}
              </Card>
            </div>
          </Section>

          {/* 10 · EmptyState */}
          <Section num="10" file="EmptyState.tsx" title="Empty states">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <Card>
                <EmptyState
                  icon={({ size, strokeWidth }) => (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
                      <path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
                    </svg>
                  )}
                  title="Todavía no hay pedidos"
                  description="Cuando alguien compre en tu tienda, va a aparecer acá."
                  action={{ label: 'Crear primer pedido', onClick: () => {}, variant: 'primary' }}
                />
              </Card>
              <Card>
                <EmptyState
                  icon={({ size, strokeWidth }) => (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  )}
                  title="Sin clientes registrados"
                  description="Tus clientes se cargan automáticamente con cada venta."
                  action={{ label: 'Importar clientes', onClick: () => {}, variant: 'outline' }}
                />
              </Card>
            </div>
          </Section>

        </div>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--color-border)', fontSize: 12, color: 'var(--color-subtle)', fontFamily: '"Geist Mono", monospace', textAlign: 'center' }}>
          Orbita Design System · v1.0 · Solo desarrollo
        </div>
      </main>
    </div>
  );
}
