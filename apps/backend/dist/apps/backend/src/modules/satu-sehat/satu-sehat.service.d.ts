import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
export declare class SatuSehatService {
    private readonly sb;
    private readonly config;
    private readonly logger;
    private tokenCache;
    constructor(sb: SupabaseClient, config: ConfigService);
    private getAccessToken;
    syncEmr(emr_id: string, clinic_id: string): Promise<void>;
    private buildFhirBundle;
    private postBundle;
    syncPendingBatch(limit?: number): Promise<{
        synced: number;
        failed: number;
    }>;
}
