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
exports.EmrController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const emr_service_1 = require("./emr.service");
const emr_dto_1 = require("./dto/emr.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let EmrController = class EmrController {
    constructor(svc) {
        this.svc = svc;
    }
    findAll(clinicId, query, user) {
        return this.svc.findAll(clinicId, query, user);
    }
    searchIcd10(q = '', category, _clinicId) {
        return this.svc.searchIcd10(q, category);
    }
    searchIcd9(q = '', category, _clinicId) {
        return this.svc.searchIcd9(q, category);
    }
    getPatientHistory(clinicId, patientId) {
        return this.svc.getPatientHistory(clinicId, patientId);
    }
    findOne(clinicId, id, user) {
        return this.svc.findOne(clinicId, id, user);
    }
    create(clinicId, dto, user) {
        return this.svc.create(clinicId, dto, user);
    }
    update(clinicId, id, dto, user) {
        return this.svc.update(clinicId, id, dto, user);
    }
    signConsent(clinicId, id, dto, user) {
        return this.svc.signConsent(clinicId, id, dto, user);
    }
};
exports.EmrController = EmrController;
__decorate([
    (0, common_1.Get)(),
    (0, jwt_auth_guard_1.RequirePermissions)('emr:view'),
    (0, swagger_1.ApiOperation)({ summary: 'List EMR records (dengan filter)' }),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, jwt_auth_guard_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, emr_dto_1.EmrQueryDto, Object]),
    __metadata("design:returntype", void 0)
], EmrController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('icd10/search'),
    (0, jwt_auth_guard_1.RequirePermissions)('emr:view'),
    (0, swagger_1.ApiOperation)({ summary: 'Cari kode ICD-10 dental (Kemenkes standard)' }),
    (0, swagger_1.ApiQuery)({ name: 'q', required: false, description: 'Kata kunci kode atau deskripsi' }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, description: 'Filter kategori' }),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, jwt_auth_guard_1.ClinicId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], EmrController.prototype, "searchIcd10", null);
__decorate([
    (0, common_1.Get)('icd9/search'),
    (0, jwt_auth_guard_1.RequirePermissions)('emr:view'),
    (0, swagger_1.ApiOperation)({ summary: 'Cari kode ICD-9-CM tindakan dental' }),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, jwt_auth_guard_1.ClinicId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], EmrController.prototype, "searchIcd9", null);
__decorate([
    (0, common_1.Get)('patients/:patientId/history'),
    (0, jwt_auth_guard_1.RequirePermissions)('emr:view'),
    (0, swagger_1.ApiOperation)({ summary: 'Timeline riwayat kunjungan pasien lengkap' }),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Param)('patientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], EmrController.prototype, "getPatientHistory", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, jwt_auth_guard_1.RequirePermissions)('emr:view'),
    (0, swagger_1.ApiOperation)({ summary: 'Detail EMR satu kunjungan + attachments' }),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, jwt_auth_guard_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], EmrController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, jwt_auth_guard_1.RequirePermissions)('emr:create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Buat EMR baru (auto-complete linked appointment)' }),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, jwt_auth_guard_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, emr_dto_1.CreateEmrDto, Object]),
    __metadata("design:returntype", void 0)
], EmrController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, jwt_auth_guard_1.RequirePermissions)('emr:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update EMR (SOAP, ICD codes, treatments)' }),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, jwt_auth_guard_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, emr_dto_1.UpdateEmrDto, Object]),
    __metadata("design:returntype", void 0)
], EmrController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/consent'),
    (0, jwt_auth_guard_1.RequirePermissions)('emr:update'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Tanda tangan digital informed consent' }),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, jwt_auth_guard_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, emr_dto_1.SignConsentDto, Object]),
    __metadata("design:returntype", void 0)
], EmrController.prototype, "signConsent", null);
exports.EmrController = EmrController = __decorate([
    (0, swagger_1.ApiTags)('EMR — Rekam Medis'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)({ path: 'emr', version: '1' }),
    __metadata("design:paramtypes", [emr_service_1.EmrService])
], EmrController);
//# sourceMappingURL=emr.controller.js.map