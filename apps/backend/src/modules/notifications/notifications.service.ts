import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface WhatsAppMessage {
  phone: string;
  message: string;
}

/**
 * NotificationsService — WhatsApp + Email notifications
 * Configure WHATSAPP_API_URL and WHATSAPP_API_KEY in .env
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  constructor(private readonly config: ConfigService) {}

  async sendWhatsApp(to: string, message: string): Promise<void> {
    const apiUrl = this.config.get('WHATSAPP_API_URL');
    const apiKey = this.config.get('WHATSAPP_API_KEY');
    if (!apiUrl || !apiKey) {
      this.logger.warn(`[WA] Mock send to ${to}: ${message.slice(0, 60)}...`);
      return;
    }
    await fetch(`${apiUrl}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ to, type: 'text', text: { body: message } }),
    });
    this.logger.log(`[WA] Sent to ${to}`);
  }

  buildReminderMessage(data: {
    patientName: string; doctorName: string; date: string; time: string; clinicName: string;
  }): string {
    return `Halo ${data.patientName}! 👋\n\nKami ingin mengingatkan janji temu Anda:\n\n📅 ${data.date}\n⏰ ${data.time} WIB\n👨‍⚕️ ${data.doctorName}\n🏥 ${data.clinicName}\n\nMohon hadir 10 menit sebelum jadwal. Jika perlu mengubah jadwal, hubungi kami segera.\n\nSampai jumpa! 😊`;
  }

  buildInvoiceMessage(data: {
    patientName: string; invoiceNumber: string; total: number; clinicName: string;
  }): string {
    return `Halo ${data.patientName}! 🦷\n\nInvoice perawatan Anda telah siap:\n📄 ${data.invoiceNumber}\n💰 Total: Rp ${data.total.toLocaleString('id-ID')}\n\nTerima kasih sudah mempercayai ${data.clinicName}. Semoga cepat pulih! 😊`;
  }
}
