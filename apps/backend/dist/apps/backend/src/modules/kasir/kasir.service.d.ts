import { SupabaseClient } from '@supabase/supabase-js';
import { CreateInvoiceDto, AddPaymentDto, ApplyVoucherDto, DepositTopUpDto, InvoiceQueryDto } from './dto/kasir.dto';
export declare class KasirService {
    private readonly sb;
    private readonly logger;
    constructor(sb: SupabaseClient);
    listInvoices(clinic_id: string, query: InvoiceQueryDto): Promise<{
        data: any;
        meta: {
            next_cursor: any;
            has_more: boolean;
            total: any;
            limit: number;
        };
    }>;
    getInvoice(clinic_id: string, id: string): Promise<any>;
    createInvoice(clinic_id: string, dto: CreateInvoiceDto, created_by: string): Promise<any>;
    addPayment(clinic_id: string, invoice_id: string, dto: AddPaymentDto, created_by: string): Promise<any>;
    applyVoucher(clinic_id: string, invoice_id: string, dto: ApplyVoucherDto): Promise<any>;
    voidInvoice(clinic_id: string, id: string, reason: string): Promise<any>;
    getDepositBalance(clinic_id: string, patient_id: string): Promise<number>;
    topUpDeposit(clinic_id: string, dto: DepositTopUpDto, created_by: string): Promise<any>;
    getDepositHistory(clinic_id: string, patient_id: string): Promise<{
        patient: any;
        transactions: any;
        current_balance: number;
    }>;
    getDailySummary(clinic_id: string, date: string): Promise<{
        date: string;
        total_invoices: any;
        total_invoice_amount: any;
        total_paid: any;
        total_outstanding: number;
        by_payment_method: any;
        invoices_by_status: {
            issued: any;
            paid: any;
            partial: any;
            cancelled: any;
        };
    }>;
    private resolvePromo;
    private reconcileInvoiceStatus;
}
