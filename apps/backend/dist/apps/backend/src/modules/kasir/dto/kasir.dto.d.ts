import { PaymentMethod } from '@klinik/shared-types';
export declare class InvoiceItemDto {
    treatment_id: string;
    treatment_name: string;
    quantity: number;
    unit_price: number;
}
export declare class CreateInvoiceDto {
    patient_id: string;
    appointment_id?: string;
    emr_id?: string;
    items: InvoiceItemDto[];
    discount_amount?: number;
    promo_id?: string;
    promo_code?: string;
    notes?: string;
}
export declare class AddPaymentDto {
    method: PaymentMethod;
    amount: number;
    reference_number?: string;
    insurance_id?: string;
    insurance_claim_number?: string;
    notes?: string;
}
export declare class ApplyVoucherDto {
    code: string;
}
export declare class DepositTopUpDto {
    patient_id: string;
    amount: number;
    notes?: string;
    payment_method: PaymentMethod;
    reference_number?: string;
}
export declare class InvoiceQueryDto {
    patient_id?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    q?: string;
    cursor?: string;
    limit?: number;
}
