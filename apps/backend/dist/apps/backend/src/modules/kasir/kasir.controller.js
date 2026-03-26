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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KasirController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const kasir_service_1 = require("./kasir.service");
const kasir_dto_1 = require("./dto/kasir.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let KasirController = class KasirController {
    constructor(svc) {
        this.svc = svc;
    }
    listInvoices(cid, q) { return this.svc.listInvoices(cid, q); }
    dailySummary(cid, date) {
        return this.svc.getDailySummary(cid, date ?? new Date().toISOString().split('T')[0]);
    }
    getInvoice(cid, id) { return this.svc.getInvoice(cid, id); }
    createInvoice(cid, dto, u) {
        return this.svc.createInvoice(cid, dto, u.sub);
    }
    addPayment(cid, id, dto, u) {
        return this.svc.addPayment(cid, id, dto, u.sub);
    }
    applyVoucher(cid, id, dto) {
        return this.svc.applyVoucher(cid, id, dto);
    }
    voidInvoice(cid, id, reason) {
        return this.svc.voidInvoice(cid, id, reason ?? 'Dibatalkan');
    }
    getDepositHistory(cid, pid) {
        return this.svc.getDepositHistory(cid, pid);
    }
    topUpDeposit(cid, dto, u) {
        return this.svc.topUpDeposit(cid, dto, u.sub);
    }
};
exports.KasirController = KasirController;
__decorate([
    (0, common_1.Get)('invoices'),
    (0, jwt_auth_guard_1.RequirePermissions)('kasir:view'),
    (0, swagger_1.ApiOperation)({ summary: 'List invoices dengan filter' }),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, kasir_dto_1.InvoiceQueryDto]),
    __metadata("design:returntype", void 0)
], KasirController.prototype, "listInvoices", null);
__decorate([
    (0, common_1.Get)('invoices/daily-summary'),
    (0, jwt_auth_guard_1.RequirePermissions)('kasir:view'),
    (0, swagger_1.ApiOperation)({ summary: 'Ringkasan kasir harian' }),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], KasirController.prototype, "dailySummary", null);
__decorate([
    (0, common_1.Get)('invoices/:id'),
    (0, jwt_auth_guard_1.RequirePermissions)('kasir:view'),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], KasirController.prototype, "getInvoice", null);
__decorate([
    (0, common_1.Post)('invoices'),
    (0, jwt_auth_guard_1.RequirePermissions)('kasir:create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Buat invoice baru' }),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, jwt_auth_guard_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, kasir_dto_1.CreateInvoiceDto, Object]),
    __metadata("design:returntype", void 0)
], KasirController.prototype, "createInvoice", null);
__decorate([
    (0, common_1.Post)('invoices/:id/payments'),
    (0, jwt_auth_guard_1.RequirePermissions)('kasir:create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Tambah pembayaran ke invoice (multi-method supported)' }),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, jwt_auth_guard_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, kasir_dto_1.AddPaymentDto, Object]),
    __metadata("design:returntype", void 0)
], KasirController.prototype, "addPayment", null);
__decorate([
    (0, common_1.Post)('invoices/:id/voucher'),
    (0, jwt_auth_guard_1.RequirePermissions)('kasir:create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Terapkan kode voucher/promo ke invoice' }),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, kasir_dto_1.ApplyVoucherDto]),
    __metadata("design:returntype", void 0)
], KasirController.prototype, "applyVoucher", null);
__decorate([
    (0, common_1.Delete)('invoices/:id'),
    (0, jwt_auth_guard_1.RequirePermissions)('kasir:void'),
    (0, swagger_1.ApiOperation)({ summary: 'Void / batalkan invoice' }),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], KasirController.prototype, "voidInvoice", null);
__decorate([
    (0, common_1.Get)('deposits/:patientId'),
    (0, jwt_auth_guard_1.RequirePermissions)('kasir:view'),
    (0, swagger_1.ApiOperation)({ summary: 'Riwayat & saldo deposit pasien' }),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Param)('patientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], KasirController.prototype, "getDepositHistory", null);
__decorate([
    (0, common_1.Post)('deposits/topup'),
    (0, jwt_auth_guard_1.RequirePermissions)('kasir:create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Top-up deposit pasien' }),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, jwt_auth_guard_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, kasir_dto_1.DepositTopUpDto, Object]),
    __metadata("design:returntype", void 0)
], KasirController.prototype, "topUpDeposit", null);
exports.KasirController = KasirController = __decorate([
    (0, swagger_1.ApiTags)('Kasir & Pembayaran'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)({ path: 'kasir', version: '1' }),
    __metadata("design:paramtypes", [kasir_service_1.KasirService])
], KasirController);
//# sourceMappingURL=kasir.controller.js.map