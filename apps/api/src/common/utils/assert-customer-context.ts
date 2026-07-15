import { ForbiddenException } from '@nestjs/common';
import { AuthContext, CustomerContext } from '../types/auth-context.type';

export function assertCustomerContext(ctx: AuthContext): CustomerContext {
  if (ctx.type !== 'customer') {
    throw new ForbiddenException('Este recurso es exclusivo del storefront (cuenta de cliente)');
  }
  return ctx;
}
