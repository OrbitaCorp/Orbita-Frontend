import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** Extrae el business_id del request (derivado del token por AuthGuard). Nunca viene en URL/body. */
export const CurrentBusiness = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.businessId;
  },
);
