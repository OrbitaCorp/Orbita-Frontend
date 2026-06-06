// src/modules/ventas/admin/inventario/AjusteStock.tsx — Vista 25

import { InvTabs, type VistaInventario } from './components/InvTabs'
import { StockForm } from './components/StockForm'

interface Props {
    ir:      (v: VistaInventario) => void
    onToast: (m: string) => void
}

export default function AjusteStock({ ir, onToast }: Props) {
    return (
        <div style={pageWrap}>
            <InvTabs activo="ajuste" ir={ir} />
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text)', margin: '0 0 20px' }}>Ajuste de stock</h1>
            <StockForm ajuste onToast={onToast} onDone={() => ir('stock')} />
        </div>
    )
}

const pageWrap: React.CSSProperties = { padding: '24px 32px 64px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }
