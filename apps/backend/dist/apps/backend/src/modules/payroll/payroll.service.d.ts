import { SupabaseClient } from '@supabase/supabase-js';
export declare class PayrollService {
    private readonly sb;
    private readonly logger;
    constructor(sb: SupabaseClient);
    calculatePeriod(clinic_id: string, period_start: string, period_end: string, created_by: string): Promise<any>;
    listPeriods(clinic_id: string): Promise<any>;
    getPeriod(clinic_id: string, id: string): Promise<any>;
    approvePeriod(clinic_id: string, id: string, approved_by: string): Promise<any>;
    markItemPaid(clinic_id: string, period_id: string, item_id: string): Promise<any>;
    overrideItem(clinic_id: string, period_id: string, item_id: string, amount: number, reason: string): Promise<any>;
    getDoctorSummary(clinic_id: string, doctor_id: string, year: number): Promise<{
        doctor_id: string;
        year: number;
        total_revenue: any;
        total_earned: any;
        monthly: any;
    }>;
}
