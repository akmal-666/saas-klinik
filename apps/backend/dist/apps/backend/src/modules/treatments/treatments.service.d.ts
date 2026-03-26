import { SupabaseClient } from '@supabase/supabase-js';
export declare class TreatmentsService {
    private readonly sb;
    constructor(sb: SupabaseClient);
    findAll(clinic_id: string, category?: string, active?: boolean): Promise<any>;
    create(clinic_id: string, dto: any): Promise<any>;
    update(clinic_id: string, id: string, dto: any): Promise<any>;
    getCategories(clinic_id: string): Promise<unknown[]>;
}
