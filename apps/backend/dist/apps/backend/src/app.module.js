"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const health_controller_1 = require("./health.controller");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const supabase_module_1 = require("./database/supabase.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const clinics_module_1 = require("./modules/clinics/clinics.module");
const doctors_module_1 = require("./modules/doctors/doctors.module");
const patients_module_1 = require("./modules/patients/patients.module");
const appointments_module_1 = require("./modules/appointment/appointments.module");
const emr_module_1 = require("./modules/emr/emr.module");
const treatments_module_1 = require("./modules/treatments/treatments.module");
const kasir_module_1 = require("./modules/kasir/kasir.module");
const invoices_module_1 = require("./modules/invoices/invoices.module");
const payments_module_1 = require("./modules/payments/payments.module");
const deposits_module_1 = require("./modules/deposits/deposits.module");
const promotions_module_1 = require("./modules/promotions/promotions.module");
const payroll_module_1 = require("./modules/payroll/payroll.module");
const share_codes_module_1 = require("./modules/share-codes/share-codes.module");
const insurances_module_1 = require("./modules/insurances/insurances.module");
const items_module_1 = require("./modules/items/items.module");
const reports_module_1 = require("./modules/reports/reports.module");
const satu_sehat_module_1 = require("./modules/satu-sehat/satu-sehat.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const audit_module_1 = require("./modules/audit/audit.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        controllers: [health_controller_1.HealthController],
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            throttler_1.ThrottlerModule.forRoot([
                { name: 'short', ttl: 1000, limit: 20 },
                { name: 'long', ttl: 60000, limit: 200 },
            ]),
            supabase_module_1.SupabaseModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            clinics_module_1.ClinicsModule,
            doctors_module_1.DoctorsModule,
            patients_module_1.PatientsModule,
            appointments_module_1.AppointmentsModule,
            emr_module_1.EmrModule,
            treatments_module_1.TreatmentsModule,
            kasir_module_1.KasirModule,
            invoices_module_1.InvoicesModule,
            payments_module_1.PaymentsModule,
            deposits_module_1.DepositsModule,
            promotions_module_1.PromotionsModule,
            payroll_module_1.PayrollModule,
            share_codes_module_1.ShareCodesModule,
            insurances_module_1.InsurancesModule,
            items_module_1.ItemsModule,
            reports_module_1.ReportsModule,
            satu_sehat_module_1.SatuSehatModule,
            notifications_module_1.NotificationsModule,
            audit_module_1.AuditModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map