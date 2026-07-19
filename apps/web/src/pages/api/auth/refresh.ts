import type { NextApiRequest, NextApiResponse } from 'next'
import { callBackend, readRefreshCookie, setRefreshCookie, clearRefreshCookie } from '@/lib/auth/bff'

// POST /api/auth/refresh
// Lee el refresh token de la cookie httpOnly, lo rota contra el backend y
// devuelve un access token nuevo. Es también el mecanismo de "handoff" entre
// subdominios: cuando el dueño aterriza en {slug}.orbita.local/panel sin access
// token en memoria, esta ruta usa la cookie (compartida en .orbita.local) para
// mintear uno nuevo.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' })

  const refreshToken = readRefreshCookie(req)
  if (!refreshToken) return res.status(401).json({ error: 'NO_SESSION' })

  const { status, body } = await callBackend('/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
  })

  if (status >= 400 || !body || typeof body !== 'object') {
    clearRefreshCookie(res, req) // refresh inválido/expirado → matar la sesión
    return res.status(401).json({ error: 'SESSION_EXPIRED' })
  }

  const { refreshToken: rotated, ...rest } = body as Record<string, unknown>
  if (typeof rotated === 'string') setRefreshCookie(res, req, rotated)

  return res.status(200).json(rest) // { token }
}
