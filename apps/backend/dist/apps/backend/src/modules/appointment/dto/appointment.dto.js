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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RescheduleAppointmentDto = exports.AppointmentQueryDto = exports.UpdateAppointmentStatusDto = exports.UpdateAppointmentDto = exports.CreateAppointmentDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const shared_types_1 = require("../../../../../../packages/shared-types/src/index.ts");
class CreateAppointmentDto {
    constructor() {
        this.duration_minutes = 30;
        this.status = shared_types_1.AppointmentStatus.BOOKED;
        this.source = 'walk_in';
    }
}
exports.CreateAppointmentDto = CreateAppointmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'p_uuid_here' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "patient_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'd_uuid_here' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "doctor_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-03-23' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "scheduled_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '09:00' }),
    (0, class_validator_1.Matches)(/^\d{2}:\d{2}$/, { message: 'Format jam: HH:mm' }),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "scheduled_time", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 30, minimum: 15, maximum: 180 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(15),
    (0, class_validator_1.Max)(180),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateAppointmentDto.prototype, "duration_minutes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['tr_uuid_1', 'tr_uuid_2'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateAppointmentDto.prototype, "treatment_ids", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: shared_types_1.AppointmentStatus.BOOKED }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_types_1.AppointmentStatus),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Keluhan nyeri gigi depan' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['walk_in', 'online', 'phone'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['walk_in', 'online', 'phone']),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "source", void 0);
class UpdateAppointmentDto extends (0, swagger_1.PartialType)(CreateAppointmentDto) {
}
exports.UpdateAppointmentDto = UpdateAppointmentDto;
class UpdateAppointmentStatusDto {
}
exports.UpdateAppointmentStatusDto = UpdateAppointmentStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: shared_types_1.AppointmentStatus }),
    (0, class_validator_1.IsEnum)(shared_types_1.AppointmentStatus),
    __metadata("design:type", String)
], UpdateAppointmentStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAppointmentStatusDto.prototype, "notes", void 0);
class AppointmentQueryDto {
    constructor() {
        this.view = 'calendar';
        this.limit = 50;
    }
}
exports.AppointmentQueryDto = AppointmentQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-03-23' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AppointmentQueryDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AppointmentQueryDto.prototype, "doctor_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AppointmentQueryDto.prototype, "patient_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: shared_types_1.AppointmentStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_types_1.AppointmentStatus),
    __metadata("design:type", String)
], AppointmentQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['calendar', 'list'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['calendar', 'list']),
    __metadata("design:type", String)
], AppointmentQueryDto.prototype, "view", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Cursor for pagination' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AppointmentQueryDto.prototype, "cursor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 50, minimum: 1, maximum: 200 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(200),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], AppointmentQueryDto.prototype, "limit", void 0);
class RescheduleAppointmentDto {
}
exports.RescheduleAppointmentDto = RescheduleAppointmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-03-25' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], RescheduleAppointmentDto.prototype, "scheduled_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '10:00' }),
    (0, class_validator_1.Matches)(/^\d{2}:\d{2}$/),
    __metadata("design:type", String)
], RescheduleAppointmentDto.prototype, "scheduled_time", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RescheduleAppointmentDto.prototype, "reason", void 0);
//# sourceMappingURL=appointment.dto.js.map