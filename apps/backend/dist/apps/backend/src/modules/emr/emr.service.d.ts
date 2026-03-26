import { SupabaseClient } from '@supabase/supabase-js';
import { JwtPayload } from '../../common/guards/jwt-auth.guard';
import { CreateEmrDto, UpdateEmrDto, EmrQueryDto, SignConsentDto } from './dto/emr.dto';
export declare class EmrService {
    private readonly sb;
    private readonly logger;
    constructor(sb: SupabaseClient);
    findAll(clinic_id: string, query: EmrQueryDto, actor: JwtPayload): Promise<{
        data: any;
        meta: {
            cursor: string;
            next_cursor: any;
            total: any;
            limit: number;
            has_more: boolean;
        };
    }>;
    findOne(clinic_id: string, id: string, actor: JwtPayload): Promise<any>;
    create(clinic_id: string, dto: CreateEmrDto, actor: JwtPayload): Promise<any>;
    update(clinic_id: string, id: string, dto: UpdateEmrDto, actor: JwtPayload): Promise<any>;
    signConsent(clinic_id: string, id: string, dto: SignConsentDto, actor: JwtPayload): Promise<any>;
    getPatientHistory(clinic_id: string, patient_id: string): Promise<{
        patient: any;
        visits: any;
        deposit_balance: any;
        total_visits: any;
    }>;
    searchIcd10(q: string, category?: string): Promise<any>;
    searchIcd9(q: string, category?: string): Promise<any>;
    private validateBelongsToClinic;
    private queueSatuSehatSync;
}
