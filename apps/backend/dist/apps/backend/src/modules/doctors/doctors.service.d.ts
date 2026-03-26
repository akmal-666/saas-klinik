import { SupabaseClient } from '@supabase/supabase-js';
export declare class DoctorsService {
    private readonly sb;
    constructor(sb: SupabaseClient);
    findAll(clinic_id: string, includeSchedules?: boolean): Promise<any>;
    findOne(clinic_id: string, id: string): Promise<any>;
    create(clinic_id: string, dto: any): Promise<any>;
    update(clinic_id: string, id: string, dto: any): Promise<any>;
    getAvailability(clinic_id: string, doctor_id: string, date: string): Promise<{
        appointments: any;
        on_leave: boolean;
    }>;
}
