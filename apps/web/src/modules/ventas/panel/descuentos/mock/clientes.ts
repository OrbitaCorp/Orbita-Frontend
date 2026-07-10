// Clientes mock — para el selector de envío por email del link compartible.
// TODO: Reemplazar por GET /api/clientes?busqueda=...

export interface ClienteMock {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono: string
}

export const clientesMock: ClienteMock[] = [
  { id: 'cli1', nombre: 'María', apellido: 'Fernández', email: 'maria.f@gmail.com', telefono: '+54 9 11 2345-6789' },
  { id: 'cli2', nombre: 'Joaquín', apellido: 'Pérez', email: 'jperez@hotmail.com', telefono: '+54 9 11 3456-7890' },
  { id: 'cli3', nombre: 'Valentina', apellido: 'López', email: 'valen.lopez@gmail.com', telefono: '+54 9 11 4567-8901' },
  { id: 'cli4', nombre: 'Tomás', apellido: 'García', email: 'tomas.garcia@yahoo.com', telefono: '+54 9 11 5678-9012' },
  { id: 'cli5', nombre: 'Lucía', apellido: 'Martínez', email: 'luciamtz@gmail.com', telefono: '+54 9 11 6789-0123' },
  { id: 'cli6', nombre: 'Santiago', apellido: 'Rodríguez', email: 'santi.rdz@gmail.com', telefono: '+54 9 11 7890-1234' },
  { id: 'cli7', nombre: 'Camila', apellido: 'Sánchez', email: 'camila.sanchez@outlook.com', telefono: '+54 9 11 8901-2345' },
  { id: 'cli8', nombre: 'Mateo', apellido: 'González', email: 'mateo.g@gmail.com', telefono: '+54 9 11 9012-3456' },
]
