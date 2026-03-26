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
exports.TreatmentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const treatments_service_1 = require("./treatments.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let TreatmentsController = class TreatmentsController {
    constructor(svc) {
        this.svc = svc;
    }
    findAll(cid, cat, all) { return this.svc.findAll(cid, cat, all !== '1'); }
    categories(cid) { return this.svc.getCategories(cid); }
    create(cid, dto) { return this.svc.create(cid, dto); }
    update(cid, id, dto) { return this.svc.update(cid, id, dto); }
};
exports.TreatmentsController = TreatmentsController;
__decorate([
    (0, common_1.Get)(),
    (0, jwt_auth_guard_1.RequirePermissions)('masterdata:view'),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('all')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], TreatmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, jwt_auth_guard_1.RequirePermissions)('masterdata:view'),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TreatmentsController.prototype, "categories", null);
__decorate([
    (0, common_1.Post)(),
    (0, jwt_auth_guard_1.RequirePermissions)('masterdata:manage'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TreatmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, jwt_auth_guard_1.RequirePermissions)('masterdata:manage'),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], TreatmentsController.prototype, "update", null);
exports.TreatmentsController = TreatmentsController = __decorate([
    (0, swagger_1.ApiTags)('Treatment'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)({ path: 'treatments', version: '1' }),
    __metadata("design:paramtypes", [treatments_service_1.TreatmentsService])
], TreatmentsController);
//# sourceMappingURL=treatments.controller.js.map