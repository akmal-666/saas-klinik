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
exports.SatuSehatController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const satu_sehat_service_1 = require("./satu-sehat.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let SatuSehatController = class SatuSehatController {
    constructor(svc) {
        this.svc = svc;
    }
    syncEmr(cid, id) {
        return this.svc.syncEmr(id, cid);
    }
    syncBatch() {
        return this.svc.syncPendingBatch(20);
    }
};
exports.SatuSehatController = SatuSehatController;
__decorate([
    (0, common_1.Post)('sync/emr/:id'),
    (0, jwt_auth_guard_1.RequirePermissions)('settings:manage'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SatuSehatController.prototype, "syncEmr", null);
__decorate([
    (0, common_1.Post)('sync/batch'),
    (0, jwt_auth_guard_1.RequirePermissions)('settings:manage'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SatuSehatController.prototype, "syncBatch", null);
exports.SatuSehatController = SatuSehatController = __decorate([
    (0, swagger_1.ApiTags)('SATUSEHAT Sync'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)({ path: 'satu-sehat', version: '1' }),
    __metadata("design:paramtypes", [satu_sehat_service_1.SatuSehatService])
], SatuSehatController);
//# sourceMappingURL=satu-sehat.controller.js.map