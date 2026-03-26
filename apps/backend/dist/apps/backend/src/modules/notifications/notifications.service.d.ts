import { ConfigService } from '@nestjs/config';
export interface WhatsAppMessage {
    phone: string;
    message: string;
}
export declare class NotificationsService {
    private readonly config;
    private readonly logger;
    constructor(config: ConfigService);
    sendWhatsApp(to: string, message: string): Promise<void>;
    buildReminderMessage(data: {
        patientName: string;
        doctorName: string;
        date: string;
        time: string;
        clinicName: string;
    }): string;
    buildInvoiceMessage(data: {
        patientName: string;
        invoiceNumber: string;
        total: number;
        clinicName: string;
    }): string;
}
