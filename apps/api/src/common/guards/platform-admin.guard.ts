import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

/** Verifica que el usuario sea super-admin de plataforma (fuera del multi-tenant). STUB. */
@Injectable()
export class PlatformAdminGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    // TODO(RBT-290): implementar antes de exponer cualquier endpoint de plataforma —
    // hoy retorna true siempre (cualquier request pasa como admin de plataforma).
    // Verificado 2026-07-20: ningún endpoint usa este guard todavía (platform.controller.ts
    // son todos stubs sin @UseGuards). Si se agrega @UseGuards(PlatformAdminGuard) a algún
    // endpoint, esta implementación DEBE completarse primero — verificar que req.user
    // corresponde a un platform_admin activo en la DB, no solo un member/customer autenticado.
    return true;
  }
}
