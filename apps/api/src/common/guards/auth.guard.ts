import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Extrae y valida el JWT de Supabase, resuelve el contexto (member/customer/platform_admin)
 * y setea req.user. STUB: por ahora deja pasar todo.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(_context: ExecutionContext): boolean {
    // TODO(auth): validar Bearer token de Supabase y poblar req.user.
    // El endpoint puede estar marcado @Public() vía IS_PUBLIC_KEY.
    void IS_PUBLIC_KEY;
    void this.reflector;
    return true;
  }
}
