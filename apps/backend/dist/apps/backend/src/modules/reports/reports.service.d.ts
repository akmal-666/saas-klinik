import { SupabaseClient } from '@supabase/supabase-js';
export declare class ReportsService {
    private readonly sb;
    constructor(sb: SupabaseClient);
    getRevenueReport(clinic_id: string, date_from: string, date_to: string, doctor_id?: string): Promise<{
        date_from: string;
        date_to: string;
        total_revenue: any;
        total_invoices: any;
        by_day: {
            date: string;
            revenue: number;
        }[];
    }>;
    getVisitReport(clinic_id: string, date_from: string, date_to: string): Promise<{
        date_from: string;
        date_to: string;
        total_appointments: any;
        total_completed: any;
        total_cancelled: any;
        total_unique_patients: number;
        new_patients: any;
        returning_patients: number;
        completion_rate: number;
        cancel_rate: number;
    }>;
    getDailySummary(clinic_id: string, date: string): Promise<{
        date: string;
        appointments: {
            total: any;
            completed: any;
            cancelled: any;
            waiting: any;
        };
        revenue: {
            total: any;
            by_method: any;
            invoices: any;
        };
        emr_count: any;
    }>;
}
