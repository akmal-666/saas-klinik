import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare const QUEUE_SATUSEHAT = "satusehat-sync";
export declare const QUEUE_REMINDER = "appointment-reminder";
export declare const QUEUE_INVOICE = "invoice-notification";
export interface SatuSehatSyncJob {
    emr_id: string;
    clinic_id: string;
    attempt?: number;
}
export interface ReminderJob {
    appointment_id: string;
    clinic_id: string;
    patient_phone: string;
    patient_name: string;
    doctor_name: string;
    date: string;
    time: string;
    reminder_type: 'H-1' | 'H-0';
}
export interface InvoiceNotifJob {
    invoice_id: string;
    clinic_id: string;
    patient_email: string;
    patient_phone: string;
    invoice_number: string;
    total: number;
}
export declare class QueueService implements OnModuleInit {
    private readonly config;
    private readonly logger;
    constructor(config: ConfigService);
    onModuleInit(): Promise<void>;
    addSatuSehatSync(job: SatuSehatSyncJob): Promise<void>;
    addReminder(job: ReminderJob, delay?: number): Promise<void>;
    addInvoiceNotification(job: InvoiceNotifJob): Promise<void>;
}
