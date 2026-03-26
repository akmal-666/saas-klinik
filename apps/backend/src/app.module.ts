import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { SupabaseModule } from './database/supabase.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ClinicsModule } from './modules/clinics/clinics.module';
import { DoctorsModule } from './modules/doctors/doctors.module';
import { PatientsModule } from './modules/patients/patients.module';
import { AppointmentsModule } from './modules/appointment/appointments.module';
import { EmrModule } from './modules/emr/emr.module';
import { TreatmentsModule } from './modules/treatments/treatments.module';
import { KasirModule } from './modules/kasir/kasir.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { DepositsModule } from './modules/deposits/deposits.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { ShareCodesModule } from './modules/share-codes/share-codes.module';
import { InsurancesModule } from './modules/insurances/insurances.module';
import { ItemsModule } from './modules/items/items.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SatuSehatModule } from './modules/satu-sehat/satu-sehat.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  controllers: [HealthController],
  imports: [
    // ─── Config ─────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // ─── Rate limiting ───────────────────────────────────
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 20 },
      { name: 'long',  ttl: 60000, limit: 200 },
    ]),

    // ─── Database ────────────────────────────────────────
    SupabaseModule,

    // ─── Feature Modules ─────────────────────────────────
    AuthModule,
    UsersModule,
    ClinicsModule,
    DoctorsModule,
    PatientsModule,
    AppointmentsModule,
    EmrModule,
    TreatmentsModule,
    KasirModule,
    InvoicesModule,
    PaymentsModule,
    DepositsModule,
    PromotionsModule,
    PayrollModule,
    ShareCodesModule,
    InsurancesModule,
    ItemsModule,
    ReportsModule,
    SatuSehatModule,
    NotificationsModule,
    AuditModule,
  ],
})
export class AppModule {}
