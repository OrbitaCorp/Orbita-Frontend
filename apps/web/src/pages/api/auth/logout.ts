import type { NextApiRequest, NextApiResponse } from 'next'
import { callBackend, readRefreshCookie, clearRefreshCookie } from '@/lib/auth/bff'

// POST /api/auth/logout
// Revoca el refresh token en el backend y limpia la cookie httpOnly.
// Idempotente: si no hay cookie, igual responde 200.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' })

  const refreshToken = readRefreshCookie(req)
  if (refreshToken) {
    await callBackend('/auth/logout', { method: 'POST', body: { refreshToken } })
  }

  clearRefreshCookie(res, req)
  return res.status(200).json({ ok: true })
}
