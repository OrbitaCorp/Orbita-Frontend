import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export type AppRole = 'owner' | 'admin' | 'cashier' | 'employee';

/** Restringe un endpoint a los roles indicados. Ej: @Roles('owner', 'admin'). */
export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);
