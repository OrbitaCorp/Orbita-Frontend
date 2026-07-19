import type { NextApiRequest, NextApiResponse } from 'next'
import { callBackend, firstHeader } from '@/lib/auth/bff'

// POST /api/auth/register
// Proxy de POST /auth/register (requiere X-Business-Slug). No setea cookie: el
// backend NO devuelve token en el registro (el usuario debe loguearse después).
// Passthrough del status y el body ({ message } en éxito).
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' })

  const slug = firstHeader(req.headers['x-business-slug'])
  if (!slug) return res.status(400).json({ error: 'MISSING_SLUG', message: 'Falta la tienda de destino' })

  const { status, body } = await callBackend('/auth/register', {
    method: 'POST',
    body: req.body,
    slug,
  })

  return res.status(status).json(body ?? { error: 'REGISTER_FAILED' })
}
