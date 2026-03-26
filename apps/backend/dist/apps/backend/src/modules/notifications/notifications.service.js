"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationsService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(NotificationsService_1.name);
    }
    async sendWhatsApp(to, message) {
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
    buildReminderMessage(data) {
        return `Halo ${data.patientName}! 👋\n\nKami ingin mengingatkan janji temu Anda:\n\n📅 ${data.date}\n⏰ ${data.time} WIB\n👨‍⚕️ ${data.doctorName}\n🏥 ${data.clinicName}\n\nMohon hadir 10 menit sebelum jadwal. Jika perlu mengubah jadwal, hubungi kami segera.\n\nSampai jumpa! 😊`;
    }
    buildInvoiceMessage(data) {
        return `Halo ${data.patientName}! 🦷\n\nInvoice perawatan Anda telah siap:\n📄 ${data.invoiceNumber}\n💰 Total: Rp ${data.total.toLocaleString('id-ID')}\n\nTerima kasih sudah mempercayai ${data.clinicName}. Semoga cepat pulih! 😊`;
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map