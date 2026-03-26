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
exports.PatientsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const patients_service_1 = require("./patients.service");
const patient_dto_1 = require("./dto/patient.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let PatientsController = class PatientsController {
    constructor(svc) {
        this.svc = svc;
    }
    findAll(cid, q, cursor, limit) {
        return this.svc.findAll(cid, q, cursor, limit);
    }
    searchRm(cid, q) {
        return this.svc.searchByRm(cid, q);
    }
    findOne(cid, id) {
        return this.svc.findOne(cid, id);
    }
    create(cid, dto) {
        return this.svc.create(cid, dto);
    }
    update(cid, id, dto) {
        return this.svc.update(cid, id, dto);
    }
    deactivate(cid, id) {
        return this.svc.deactivate(cid, id);
    }
};
exports.PatientsController = PatientsController;
__decorate([
    (0, common_1.Get)(),
    (0, jwt_auth_guard_1.RequirePermissions)('masterdata:view'),
    (0, swagger_1.ApiOperation)({ summary: 'List pasien dengan pencarian' }),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Query)('q')),
    __param(2, (0, common_1.Query)('cursor')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number]),
    __metadata("design:returntype", void 0)
], PatientsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('search/rm'),
    (0, jwt_auth_guard_1.RequirePermissions)('masterdata:view'),
    (0, swagger_1.ApiOperation)({ summary: 'Cari pasien berdasarkan No. RM' }),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PatientsController.prototype, "searchRm", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, jwt_auth_guard_1.RequirePermissions)('masterdata:view'),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PatientsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, jwt_auth_guard_1.RequirePermissions)('masterdata:manage'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Daftarkan pasien baru (No. RM auto-generate)' }),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, patient_dto_1.CreatePatientDto]),
    __metadata("design:returntype", void 0)
], PatientsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, jwt_auth_guard_1.RequirePermissions)('masterdata:manage'),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, patient_dto_1.UpdatePatientDto]),
    __metadata("design:returntype", void 0)
], PatientsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, jwt_auth_guard_1.RequirePermissions)('masterdata:manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Non-aktifkan pasien (soft delete)' }),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PatientsController.prototype, "deactivate", null);
exports.PatientsController = PatientsController = __decorate([
    (0, swagger_1.ApiTags)('Pasien'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)({ path: 'patients', version: '1' }),
    __metadata("design:paramtypes", [patients_service_1.PatientsService])
], PatientsController);
//# sourceMappingURL=patients.controller.js.map