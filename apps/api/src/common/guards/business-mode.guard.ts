import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FULL_MODE_ONLY_KEY } from '../decorators/full-mode-only.decorator';

/**
 * Bloquea endpoints @FullModeOnly() cuando business.mode = SHOWCASE (403 SHOWCASE_MODE).
 * STUB: deja pasar todo.
 */
@Injectable()
export class BusinessModeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(_context: ExecutionContext): boolean {
    // TODO(mode): si @FullModeOnly() y business.mode === 'SHOWCASE' → ForbiddenException.
    void FULL_MODE_ONLY_KEY;
    void this.reflector;
    return true;
  }
}
