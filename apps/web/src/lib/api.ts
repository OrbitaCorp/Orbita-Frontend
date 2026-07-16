const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1'

// ─── Sesión de onboarding (localStorage) ───────────────────────────────────
// No hay todavía un manejo de sesión global en el frontend — esto es
// deliberadamente mínimo: guarda lo que el wizard de onboarding necesita para
// seguir autenticado entre pasos/recargas mientras el negocio sigue en
// borrador (isActive: false). Ver PENDIENTES.md.

const TOKEN_KEY = 'orbita_onboarding_token'
const BUSINESS_ID_KEY = 'orbita_onboarding_business_id'
const BRANCH_ID_KEY = 'orbita_onboarding_branch_id'

export function getOnboardingSession() {
  if (typeof window === 'undefined') return null
  const token = localStorage.getItem(TOKEN_KEY)
  const businessId = localStorage.getItem(BUSINESS_ID_KEY)
  const branchId = localStorage.getItem(BRANCH_ID_KEY)
  if (!token || !businessId || !branchId) return null
  return { token, businessId, branchId }
}

export function setOnboardingSession(session: { token: string; businessId: string; branchId: string }) {
  localStorage.setItem(TOKEN_KEY, session.token)
  localStorage.setItem(BUSINESS_ID_KEY, session.businessId)
  localStorage.setItem(BRANCH_ID_KEY, session.branchId)
}

export function clearOnboardingSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(BUSINESS_ID_KEY)
  localStorage.removeItem(BRANCH_ID_KEY)
}

// ─── Fetch wrapper ──────────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const session = getOnboardingSession()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }
  if (session?.token) headers['Authorization'] = `Bearer ${session.token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const isJson = res.headers.get('content-type')?.includes('application/json')
  const body = isJson ? await res.json().catch(() => null) : null

  if (!res.ok) {
    const message = body?.message ?? body?.error ?? `Error ${res.status}`
    throw new ApiError(res.status, Array.isArray(message) ? message.join(', ') : message)
  }
  return body as T
}

// ─── Onboarding ─────────────────────────────────────────────────────────────

export type RegisterBusinessInput = {
  ownerName: string
  email: string
  password: string
  businessName: string
}

export type RegisterBusinessResult = {
  token: string
  business: { id: string; name: string; subdomain: string; mode: string; isActive: boolean }
  branch: { id: string; name: string }
  member: { id: string; name: string; email: string }
}

export function registerBusiness(input: RegisterBusinessInput) {
  return request<RegisterBusinessResult>('/onboarding/register-business', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export type UpdateOnboardingBusinessInput = Partial<{
  name: string
  industry: string
  description: string
  subdomain: string
  mode: 'FULL' | 'SHOWCASE'
  subrubros: string[]
  teamSize: string
  operatesPhysical: boolean
  operatesOnline: boolean
}>

export function updateOnboardingBusiness(input: UpdateOnboardingBusinessInput) {
  return request('/onboarding/business', { method: 'PUT', body: JSON.stringify(input) })
}

export function getBusiness() {
  return request<{
    id: string; name: string; industry: string; description: string | null
    subdomain: string; mode: string; isActive: boolean; isPaused: boolean
    subrubros: string[]; teamSize: string | null
    operatesPhysical: boolean; operatesOnline: boolean
  }>('/business')
}

export type UpdateBranchInput = Partial<{
  name: string
  address: string
  latitude: number
  longitude: number
  isActive: boolean
}>

export function updateBranch(branchId: string, input: UpdateBranchInput) {
  return request(`/branches/${branchId}`, { method: 'PUT', body: JSON.stringify(input) })
}

export type UpdateBusinessConfigInput = Partial<{
  whatsapp: string
  email: string
  acceptsMercadopago: boolean
  acceptsCash: boolean
  acceptsTransfer: boolean
  acceptsCard: boolean
  acceptsPickup: boolean
  transferAlias: string
}>

export function updateBusinessConfig(input: UpdateBusinessConfigInput) {
  return request('/business/config', { method: 'PUT', body: JSON.stringify(input) })
}

export function getBusinessConfig() {
  return request<{
    whatsapp: string | null; email: string | null
    acceptsMercadopago: boolean; acceptsCash: boolean; acceptsTransfer: boolean
    acceptsCard: boolean; acceptsPickup: boolean; transferAlias: string | null
  }>('/business/config')
}

export function publishBusiness() {
  return request<{ url: string; published: boolean }>('/business/publish', { method: 'POST' })
}
