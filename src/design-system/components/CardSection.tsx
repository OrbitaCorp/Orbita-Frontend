// Card con header estructurado: título, subtítulo, badge de alerta y acción.

// Es el patrón más repetido en el panel admin de Orbita — todas las secciones  de datos (gráficos, tablas, listas) viven dentro de este contenedor.
// Diferencia con Card: Card es un contenedor genérico sin estructura interna.
// CardSection agrega un header con título + línea divisora + slot de contenido.
// Se usa en: todas las pantallas de Alex (Dashboard, Reportes, Pedidos, Clientes, Configuración), y también en las de Alan (POS, Inventario).

import { Card }  from './Card'     // del design system
import { Badge } from './Badge'    // del design system

interface CardSectionProps {
    title:     string               // título del header
    subtitle?: string               // descripción breve bajo el título
    action?:   React.ReactNode      // botón o link a la derecha del header
    badge?:    number               // número de alertas (muestra en rojo si > 0)
    children:  React.ReactNode      // contenido de la sección
    padding?:  'sm' | 'md' | 'lg'  // hereda los paddings de Card, default 'md'
}

export function CardSection({ title, subtitle, action, badge, children, padding = 'md' }: CardSectionProps) {
    return (
        // Usamos Card del design system como base — no reinventamos el contenedor
        <Card padding={padding} style={{ display:'flex', flexDirection:'column' }}>

            {/* Header: título + badge + acción */}
            <div style={{
                display:       'flex',
                alignItems:    'center',
                gap:           12,
                paddingBottom: 16,
                marginBottom:  16,
                // Línea divisora entre header y contenido
                borderBottom:  '1px solid var(--color-border)',
            }}>
                <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <h3 style={{
                            fontSize:  14,
                            fontWeight: 600,
                            color:     'var(--color-text)',
                            margin:    0,
                        }}>
                            {title}
                        </h3>

                        {/* Badge de alerta — solo aparece si badge > 0
                            Usa status 'cancelado' (rojo) del design system
                            porque indica items que requieren atención urgente */}
                        {badge !== undefined && badge > 0 && (
                            <Badge
                                status="cancelado"
                                label={String(badge)}
                                dot={false}
                                size="sm"
                            />
                        )}
                    </div>

                    {/* Subtítulo opcional */}
                    {subtitle && (
                        <div style={{ fontSize:11, color:'var(--color-muted)', marginTop:2 }}>
                            {subtitle}
                        </div>
                    )}
                </div>

                {/* Slot de acción — puede ser un Button, un link, o cualquier cosa */}
                {action}
            </div>

            {/* Contenido de la sección */}
            {children}
        </Card>
    )
}