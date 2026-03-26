export declare function buildInvoiceHtml(invoice: {
    invoice_number: string;
    created_at: string;
    clinic: {
        name: string;
        branch: string;
        address: string;
        phone: string;
    };
    patient: {
        full_name: string;
        rm_number: string;
        phone: string;
    };
    items: {
        treatment_name: string;
        quantity: number;
        unit_price: number;
        total: number;
    }[];
    subtotal: number;
    discount_amount: number;
    tax_amount: number;
    total: number;
    payments: {
        method: string;
        amount: number;
        paid_at: string;
    }[];
    notes?: string;
}): string;
export declare function buildPayrollSlipHtml(slip: {
    doctor_name: string;
    period: string;
    share_code: string;
    doctor_pct: number;
    clinic_pct: number;
    total_revenue: number;
    doctor_amount: number;
    clinic_amount: number;
    override_amount?: number;
    override_reason?: string;
    total_visits: number;
    clinic: {
        name: string;
        branch: string;
    };
    generated_at: string;
}): string;
