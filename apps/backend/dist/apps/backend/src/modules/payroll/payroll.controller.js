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
exports.PayrollController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payroll_service_1 = require("./payroll.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let PayrollController = class PayrollController {
    constructor(svc) {
        this.svc = svc;
    }
    listPeriods(cid) { return this.svc.listPeriods(cid); }
    getPeriod(cid, id) { return this.svc.getPeriod(cid, id); }
    calculate(cid, dto, u) {
        return this.svc.calculatePeriod(cid, dto.period_start, dto.period_end, u.sub);
    }
    approve(cid, id, u) {
        return this.svc.approvePeriod(cid, id, u.sub);
    }
    markPaid(cid, pid, iid) {
        return this.svc.markItemPaid(cid, pid, iid);
    }
    override(cid, pid, iid, dto) {
        return this.svc.overrideItem(cid, pid, iid, dto.amount, dto.reason);
    }
    doctorSummary(cid, id, year) {
        return this.svc.getDoctorSummary(cid, id, year ?? new Date().getFullYear());
    }
};
exports.PayrollController = PayrollController;
__decorate([
    (0, common_1.Get)('periods'),
    (0, jwt_auth_guard_1.RequirePermissions)('payroll:view'),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "listPeriods", null);
__decorate([
    (0, common_1.Get)('periods/:id'),
    (0, jwt_auth_guard_1.RequirePermissions)('payroll:view'),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "getPeriod", null);
__decorate([
    (0, common_1.Post)('periods/calculate'),
    (0, jwt_auth_guard_1.RequirePermissions)('payroll:manage'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, jwt_auth_guard_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "calculate", null);
__decorate([
    (0, common_1.Patch)('periods/:id/approve'),
    (0, jwt_auth_guard_1.RequirePermissions)('payroll:manage'),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, jwt_auth_guard_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "approve", null);
__decorate([
    (0, common_1.Patch)('periods/:pid/items/:iid/paid'),
    (0, jwt_auth_guard_1.RequirePermissions)('payroll:manage'),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Param)('pid')),
    __param(2, (0, common_1.Param)('iid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "markPaid", null);
__decorate([
    (0, common_1.Patch)('periods/:pid/items/:iid/override'),
    (0, jwt_auth_guard_1.RequirePermissions)('payroll:manage'),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Param)('pid')),
    __param(2, (0, common_1.Param)('iid')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "override", null);
__decorate([
    (0, common_1.Get)('doctors/:id/summary'),
    (0, jwt_auth_guard_1.RequirePermissions)('payroll:view'),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "doctorSummary", null);
exports.PayrollController = PayrollController = __decorate([
    (0, swagger_1.ApiTags)('Payroll Dokter'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)({ path: 'payroll', version: '1' }),
    __metadata("design:paramtypes", [payroll_service_1.PayrollService])
], PayrollController);
//# sourceMappingURL=payroll.controller.js.map