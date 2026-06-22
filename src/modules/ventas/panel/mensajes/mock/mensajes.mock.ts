// src/modules/ventas/admin/mensajes/mock/mensajes.mock.ts
// TODO: eliminar cuando el backend esté listo.
// Conversaciones, chat y plantillas de ejemplo — Rama Indumentaria.

export interface Conversacion {
    id:      string
    cliente: string
    preview: string
    tiempo:  string
    unread:  boolean
    pedido:  string | null
}

export const CONVERSACIONES: Conversacion[] = [
    { id: 'cv1', cliente: 'María Fernández',  preview: 'Perfecto, gracias! ¿Cuándo llegaría?',      tiempo: '14:26', unread: true,  pedido: '1284' },
    { id: 'cv2', cliente: 'Joaquín Pérez',    preview: 'Quería consultar por talles disponibles',   tiempo: '13:10', unread: true,  pedido: '1283' },
    { id: 'cv3', cliente: 'Camila Rodríguez', preview: 'Muchas gracias por todo!',                  tiempo: '11:50', unread: true,  pedido: '1282' },
    { id: 'cv4', cliente: 'Lucas Giménez',    preview: 'Ya recibí el pedido, todo perfecto',        tiempo: 'Ayer',  unread: false, pedido: '1281' },
    { id: 'cv5', cliente: 'Sofía Martínez',   preview: 'Hola! Tienen el vestido en azul?',          tiempo: 'Ayer',  unread: false, pedido: null   },
]

export interface ChatMsg {
    from: 'cli' | 'me'
    txt:  string
    hora: string
}

export const CHAT_MSGS: ChatMsg[] = [
    { from: 'cli', txt: 'Hola, quería saber si el pedido #1284 ya fue enviado', hora: '14:20' },
    { from: 'me',  txt: 'Hola María! Sí, tu pedido ya está en camino. El código de seguimiento es AR3489573', hora: '14:25' },
    { from: 'cli', txt: 'Perfecto, gracias! ¿Cuándo llegaría aproximadamente?', hora: '14:26' },
    { from: 'me',  txt: 'Estimamos entrega para mañana o pasado. Te avisamos cuando llegue 😊', hora: '14:28' },
]

export interface Plantilla {
    nombre: string
    texto:  string
    tags:   string[]
}

export const PLANTILLAS: Plantilla[] = [
    { nombre: 'Pedido confirmado',     texto: 'Hola {nombre}! Tu pedido #{id} fue confirmado. Estamos preparando todo para vos 😊', tags: ['pedido'] },
    { nombre: 'Listo para retirar',    texto: 'Hola {nombre}! Tu pedido #{id} está listo para retirar en nuestra tienda.',          tags: ['retiro'] },
    { nombre: 'Código de seguimiento', texto: 'Hola {nombre}! Te enviamos el código de seguimiento de tu pedido: {tracking}',        tags: ['envío'] },
    { nombre: 'Gracias por tu compra', texto: 'Hola {nombre}! Gracias por confiar en Rama Indumentaria. Esperamos verte pronto 🙏',   tags: ['postventa'] },
]
