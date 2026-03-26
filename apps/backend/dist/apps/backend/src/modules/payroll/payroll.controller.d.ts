import { PayrollService } from './payroll.service';
import { JwtPayload } from '../../common/guards/jwt-auth.guard';
export declare class PayrollController {
    private readonly svc;
    constructor(svc: PayrollService);
    listPeriods(cid: string): Promise<any>;
    getPeriod(cid: string, id: string): Promise<any>;
    calculate(cid: string, dto: {
        period_start: string;
        period_end: string;
    }, u: JwtPayload): Promise<any>;
    approve(cid: string, id: string, u: JwtPayload): Promise<any>;
    markPaid(cid: string, pid: string, iid: string): Promise<any>;
    override(cid: string, pid: string, iid: string, dto: {
        amount: number;
        reason: string;
    }): Promise<any>;
    doctorSummary(cid: string, id: string, year: number): Promise<{
        doctor_id: string;
        year: number;
        total_revenue: any;
        total_earned: any;
        monthly: any;
    }>;
}
