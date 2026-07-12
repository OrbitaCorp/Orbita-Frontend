import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private _adminClient: SupabaseClient | undefined;

  constructor(private readonly config: ConfigService) {}

  get adminClient(): SupabaseClient {
    if (!this._adminClient) {
      const url = this.config.get<string>('SUPABASE_URL');
      const key = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY');
      if (!url || !key) {
        this.logger.warn('SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configurados — auth deshabilitada');
      }
      this._adminClient = createClient(url ?? '', key ?? '', {
        auth: { autoRefreshToken: false, persistSession: false },
      });
    }
    return this._adminClient;
  }
}
