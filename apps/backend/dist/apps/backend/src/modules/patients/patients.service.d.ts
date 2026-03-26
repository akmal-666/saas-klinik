import { SupabaseClient } from '@supabase/supabase-js';
import { CreatePatientDto, UpdatePatientDto } from './dto/patient.dto';
export { CreatePatientDto, UpdatePatientDto };
export declare class PatientsService {
    private readonly sb;
    constructor(sb: SupabaseClient);
    findAll(clinic_id: string, q?: string, cursor?: string, limit?: number): Promise<{
        data: any;
        meta: {
            has_more: boolean;
            next_cursor: any;
            total: any;
            limit: number;
        };
    }>;
    findOne(clinic_id: string, id: string): Promise<any>;
    create(clinic_id: string, dto: CreatePatientDto): Promise<any>;
    update(clinic_id: string, id: string, dto: UpdatePatientDto): Promise<any>;
    deactivate(clinic_id: string, id: string): Promise<any>;
    searchByRm(clinic_id: string, rm: string): Promise<any>;
}
