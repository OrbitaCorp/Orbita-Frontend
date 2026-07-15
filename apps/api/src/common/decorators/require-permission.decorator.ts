import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permission';

/** Restringe un endpoint al permiso indicado (code de `permissions`). Ej: @RequirePermission('catalog.manage'). */
export const RequirePermission = (permission: string) => SetMetadata(PERMISSION_KEY, permission);
