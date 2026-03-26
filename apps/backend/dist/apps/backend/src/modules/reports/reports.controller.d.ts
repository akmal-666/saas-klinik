import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly svc;
    constructor(svc: ReportsService);
    revenue(cid: string, from: string, to: string, doc?: string): Promise<{
        date_from: string;
        date_to: string;
        total_revenue: any;
        total_invoices: any;
        by_day: {
            date: string;
            revenue: number;
        }[];
    }>;
    visits(cid: string, from: string, to: string): Promise<{
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
    daily(cid: string, date: string): Promise<{
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
