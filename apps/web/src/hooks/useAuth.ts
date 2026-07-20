// Re-export del hook de auth para poder importarlo como '@/hooks/useAuth'.
// La implementación vive en el provider (lib/auth/AuthContext).
export { useAuth } from '@/lib/auth/AuthContext'
export type { AuthUser, AuthStatus, RegisterPayload } from '@/lib/auth/AuthContext'
