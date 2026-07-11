import { SetMetadata } from '@nestjs/common';

export const FULL_MODE_ONLY_KEY = 'fullModeOnly';

/** Marca un endpoint como disponible solo cuando business.mode = FULL (403 en SHOWCASE). */
export const FullModeOnly = () => SetMetadata(FULL_MODE_ONLY_KEY, true);
