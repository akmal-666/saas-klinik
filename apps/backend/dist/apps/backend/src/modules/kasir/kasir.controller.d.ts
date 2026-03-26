import { KasirService } from './kasir.service';
import { CreateInvoiceDto, AddPaymentDto, ApplyVoucherDto, DepositTopUpDto, InvoiceQueryDto } from './dto/kasir.dto';
import { JwtPayload } from '../../common/guards/jwt-auth.guard';
export declare class KasirController {
    private readonly svc;
    constructor(svc: KasirService);
    listInvoices(cid: string, q: InvoiceQueryDto): Promise<{
        data: any;
        meta: {
            next_cursor: any;
            has_more: boolean;
            total: any;
            limit: number;
        };
    }>;
    dailySummary(cid: string, date: string): Promise<{
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
    getInvoice(cid: string, id: string): Promise<any>;
    createInvoice(cid: string, dto: CreateInvoiceDto, u: JwtPayload): Promise<any>;
    addPayment(cid: string, id: string, dto: AddPaymentDto, u: JwtPayload): Promise<any>;
    applyVoucher(cid: string, id: string, dto: ApplyVoucherDto): Promise<any>;
    voidInvoice(cid: string, id: string, reason: string): Promise<any>;
    getDepositHistory(cid: string, pid: string): Promise<{
        patient: any;
        transactions: any;
        current_balance: number;
    }>;
    topUpDeposit(cid: string, dto: DepositTopUpDto, u: JwtPayload): Promise<any>;
}
