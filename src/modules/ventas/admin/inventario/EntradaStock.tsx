// src/modules/ventas/admin/inventario/EntradaStock.tsx — Vista 24

import { Button } from '@/design-system/components/Button'
import { InvTabs, type VistaInventario } from './components/InvTabs'
import { StockForm } from './components/StockForm'

interface Props {
    ir:      (v: VistaInventario) => void
    onToast: (m: string) => void
}

export default function EntradaStock({ ir, onToast }: Props) {
    return (
        <div style={pageWrap}>
            <InvTabs activo="entrada" ir={ir} />
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text)', margin: 0 }}>Registrar entrada de stock</h1>
                <Button variant="outline" onClick={() => ir('movimientos')}>Ver historial</Button>
            </div>
            <StockForm onToast={onToast} onDone={() => ir('stock')} />
        </div>
    )
}

const pageWrap: React.CSSProperties = { padding: '24px 32px 64px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }
