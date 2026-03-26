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
var QueueService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = exports.QUEUE_INVOICE = exports.QUEUE_REMINDER = exports.QUEUE_SATUSEHAT = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
exports.QUEUE_SATUSEHAT = 'satusehat-sync';
exports.QUEUE_REMINDER = 'appointment-reminder';
exports.QUEUE_INVOICE = 'invoice-notification';
let QueueService = QueueService_1 = class QueueService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(QueueService_1.name);
    }
    async onModuleInit() {
        this.logger.log('QueueService initialized (mock mode — configure REDIS_URL for production)');
    }
    async addSatuSehatSync(job) {
        this.logger.log(`[QUEUE] SATUSEHAT sync queued: EMR ${job.emr_id}`);
    }
    async addReminder(job, delay) {
        this.logger.log(`[QUEUE] Reminder queued: ${job.patient_name} — ${job.reminder_type}`);
    }
    async addInvoiceNotification(job) {
        this.logger.log(`[QUEUE] Invoice notif queued: ${job.invoice_number}`);
    }
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = QueueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], QueueService);
//# sourceMappingURL=queue.service.js.map