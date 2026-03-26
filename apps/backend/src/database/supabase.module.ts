import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_CLIENT = 'SUPABASE_CLIENT';
export const SUPABASE_ADMIN = 'SUPABASE_ADMIN';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: SUPABASE_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService): SupabaseClient => {
        return createClient(
          config.getOrThrow('SUPABASE_URL'),
          config.getOrThrow('SUPABASE_ANON_KEY'),
        );
      },
    },
    {
      // Service role client — bypasses RLS. Use only in backend
      provide: SUPABASE_ADMIN,
      inject: [ConfigService],
      useFactory: (config: ConfigService): SupabaseClient => {
        return createClient(
          config.getOrThrow('SUPABASE_URL'),
          config.getOrThrow('SUPABASE_SERVICE_ROLE_KEY'),
          { auth: { autoRefreshToken: false, persistSession: false } },
        );
      },
    },
  ],
  exports: [SUPABASE_CLIENT, SUPABASE_ADMIN],
})
export class SupabaseModule {}
