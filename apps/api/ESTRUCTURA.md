

src/
prisma/              ← ya existe (PrismaModule + PrismaService)
auth/                ← registro, login, me, invitación, forgot/reset password
businesses/          ← CRUD negocio, config general, apariencia, notificaciones
branches/            ← CRUD sucursales (lectura en V1)
members/             ← CRUD miembros, invitación
roles/               ← CRUD roles + permisos
categories/          ← CRUD con árbol (parent_id)
tags/                ← CRUD simple
products/            ← CRUD productos + variantes + opciones + imágenes
inventory/           ← stock, movimientos, proveedores
customers/           ← CRUD clientes + direcciones
orders/              ← CRUD órdenes (POS + online), cambio de estado, cola
payments/            ← lectura, verificación de transferencia
cash/                ← sesiones de caja + movimientos
mercadopago/         ← OAuth, webhooks, Point setup
discounts/           ← CRUD descuentos/cupones, evaluate, validate, métricas
returns/             ← devoluciones + notas de crédito
conversations/       ← mensajería (conversaciones + mensajes)
message-templates/   ← plantillas
reviews/             ← opiniones verificadas
audit/               ← lectura de logs de auditoría
reports/             ← dashboard, ventas, productos, clientes, inventario
subscriptions/       ← lectura de suscripción, webhooks preapproval
platform/            ← super-admin (negocios, admins, licencias comp)
domains/             ← subdominios + dominios custom
storefront/          ← endpoints públicos de la tienda
common/              ← guards, decorators, filters, interceptors compartidos