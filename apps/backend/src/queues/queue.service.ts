import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// ─── Queue names ──────────────────────────────────────────
export const QUEUE_SATUSEHAT  = 'satusehat-sync';
export const QUEUE_REMINDER   = 'appointment-reminder';
export const QUEUE_INVOICE    = 'invoice-notification';

// ─── Job types ────────────────────────────────────────────
export interface SatuSehatSyncJob {
  emr_id:     string;
  clinic_id:  string;
  attempt?:   number;
}

export interface ReminderJob {
  appointment_id: string;
  clinic_id:      string;
  patient_phone:  string;
  patient_name:   string;
  doctor_name:    string;
  date:           string;
  time:           string;
  reminder_type:  'H-1' | 'H-0';
}

export interface InvoiceNotifJob {
  invoice_id:    string;
  clinic_id:     string;
  patient_email: string;
  patient_phone: string;
  invoice_number:string;
  total:         number;
}

/**
 * QueueService — wraps BullMQ for async job dispatch.
 * In production: install bullmq + ioredis packages.
 *
 * Configuration:
 *   REDIS_URL=rediss://default:xxx@xxx.upstash.io:6379
 *
 * Usage example (in EmrService):
 *   this.queueSvc.addSatuSehatSync({ emr_id: emr.id, clinic_id });
 *
 * Usage example (in scheduler, runs daily):
 *   this.queueSvc.scheduleReminders(tomorrow);
 */
@Injectable()
export class QueueService implements OnModuleInit {
  private readonly logger = new Logger(QueueService.name);

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    // In production, initialize Bull queues here:
    // this.satuSehatQueue = new Queue(QUEUE_SATUSEHAT, { connection: this.redisConnection });
    // this.reminderQueue  = new Queue(QUEUE_REMINDER,  { connection: this.redisConnection });
    // this.invoiceQueue   = new Queue(QUEUE_INVOICE,   { connection: this.redisConnection });
    this.logger.log('QueueService initialized (mock mode — configure REDIS_URL for production)');
  }

  async addSatuSehatSync(job: SatuSehatSyncJob): Promise<void> {
    // await this.satuSehatQueue.add('sync', job, {
    //   attempts: 3,
    //   backoff: { type: 'exponential', delay: 5_000 },
    //   removeOnComplete: { age: 86400 },
    //   removeOnFail:     { age: 7 * 86400 },
    // });
    this.logger.log(`[QUEUE] SATUSEHAT sync queued: EMR ${job.emr_id}`);
  }

  async addReminder(job: ReminderJob, delay?: number): Promise<void> {
    // await this.reminderQueue.add('send', job, {
    //   delay: delay ?? 0,
    //   attempts: 2,
    //   backoff: { type: 'fixed', delay: 60_000 },
    // });
    this.logger.log(`[QUEUE] Reminder queued: ${job.patient_name} — ${job.reminder_type}`);
  }

  async addInvoiceNotification(job: InvoiceNotifJob): Promise<void> {
    // await this.invoiceQueue.add('notify', job, { attempts: 2 });
    this.logger.log(`[QUEUE] Invoice notif queued: ${job.invoice_number}`);
  }
}
