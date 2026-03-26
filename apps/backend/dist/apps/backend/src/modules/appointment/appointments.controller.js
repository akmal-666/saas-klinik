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
exports.AppointmentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const appointments_service_1 = require("./appointments.service");
const appointment_dto_1 = require("./dto/appointment.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let AppointmentsController = class AppointmentsController {
    constructor(svc) {
        this.svc = svc;
    }
    findAll(clinicId, query) {
        return this.svc.findAll(clinicId, query);
    }
    getTodaySummary(clinicId) {
        return this.svc.getTodaySummary(clinicId);
    }
    findOne(clinicId, id) {
        return this.svc.findOne(clinicId, id);
    }
    create(clinicId, dto, user) {
        return this.svc.create(clinicId, dto, user.sub);
    }
    update(clinicId, id, dto) {
        return this.svc.update(clinicId, id, dto);
    }
    updateStatus(clinicId, id, dto) {
        return this.svc.updateStatus(clinicId, id, dto);
    }
    reschedule(clinicId, id, dto, user) {
        return this.svc.reschedule(clinicId, id, dto, user.sub);
    }
    remove(clinicId, id) {
        return this.svc.remove(clinicId, id);
    }
};
exports.AppointmentsController = AppointmentsController;
__decorate([
    (0, common_1.Get)(),
    (0, jwt_auth_guard_1.RequirePermissions)('appointment:view'),
    (0, swagger_1.ApiOperation)({ summary: 'List appointments (calendar & list view)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns paginated appointments' }),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, appointment_dto_1.AppointmentQueryDto]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('today/summary'),
    (0, jwt_auth_guard_1.RequirePermissions)('appointment:view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get today appointment counts per status' }),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "getTodaySummary", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, jwt_auth_guard_1.RequirePermissions)('appointment:view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get single appointment with relations' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Appointment UUID' }),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, jwt_auth_guard_1.RequirePermissions)('appointment:create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create new appointment' }),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, jwt_auth_guard_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, appointment_dto_1.CreateAppointmentDto, Object]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, jwt_auth_guard_1.RequirePermissions)('appointment:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update appointment details' }),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, appointment_dto_1.UpdateAppointmentDto]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, jwt_auth_guard_1.RequirePermissions)('appointment:update'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update appointment status (flow-controlled)',
        description: 'Status transitions: prebook→booked→confirmed→waiting→engaged→completed. Cancel/reschedule allowed at most stages.',
    }),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, appointment_dto_1.UpdateAppointmentStatusDto]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Put)(':id/reschedule'),
    (0, jwt_auth_guard_1.RequirePermissions)('appointment:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Reschedule appointment to new date/time' }),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, jwt_auth_guard_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, appointment_dto_1.RescheduleAppointmentDto, Object]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "reschedule", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, jwt_auth_guard_1.RequirePermissions)('appointment:delete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel appointment' }),
    __param(0, (0, jwt_auth_guard_1.ClinicId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "remove", null);
exports.AppointmentsController = AppointmentsController = __decorate([
    (0, swagger_1.ApiTags)('Appointments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)({ path: 'appointments', version: '1' }),
    __metadata("design:paramtypes", [appointments_service_1.AppointmentsService])
], AppointmentsController);
//# sourceMappingURL=appointments.controller.js.map