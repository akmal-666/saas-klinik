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
exports.SignConsentDto = exports.EmrQueryDto = exports.UpdateEmrDto = exports.CreateEmrDto = exports.VitalsDto = exports.SoapDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class SoapDto {
}
exports.SoapDto = SoapDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Subjective — keluhan pasien' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SoapDto.prototype, "S", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Objective — pemeriksaan klinis' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SoapDto.prototype, "O", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Assessment — diagnosis klinis' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SoapDto.prototype, "A", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Plan — rencana perawatan' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SoapDto.prototype, "P", void 0);
class VitalsDto {
}
exports.VitalsDto = VitalsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '120/80' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VitalsDto.prototype, "blood_pressure", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 80 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], VitalsDto.prototype, "pulse", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 18 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], VitalsDto.prototype, "respiratory_rate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 36.5 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], VitalsDto.prototype, "temperature", void 0);
class CreateEmrDto {
}
exports.CreateEmrDto = CreateEmrDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Appointment ID yang terkait (opsional)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateEmrDto.prototype, "appointment_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Patient UUID' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEmrDto.prototype, "patient_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Doctor UUID' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEmrDto.prototype, "doctor_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-03-23' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateEmrDto.prototype, "visit_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: SoapDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SoapDto),
    __metadata("design:type", SoapDto)
], CreateEmrDto.prototype, "soap", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: VitalsDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => VitalsDto),
    __metadata("design:type", VitalsDto)
], CreateEmrDto.prototype, "vitals", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['K02.1', 'K04.01'], description: 'ICD-10 codes (Kemenkes standard)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateEmrDto.prototype, "icd10_codes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['23.2', '96.54'], description: 'ICD-9-CM procedure codes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateEmrDto.prototype, "icd9_codes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Treatment IDs yang dilakukan' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], CreateEmrDto.prototype, "treatment_ids", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmrDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateEmrDto.prototype, "consent_signed", void 0);
class UpdateEmrDto extends (0, swagger_1.PartialType)(CreateEmrDto) {
}
exports.UpdateEmrDto = UpdateEmrDto;
class EmrQueryDto {
}
exports.EmrQueryDto = EmrQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], EmrQueryDto.prototype, "patient_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], EmrQueryDto.prototype, "doctor_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], EmrQueryDto.prototype, "date_from", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], EmrQueryDto.prototype, "date_to", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmrQueryDto.prototype, "q", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmrQueryDto.prototype, "cursor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], EmrQueryDto.prototype, "limit", void 0);
class SignConsentDto {
}
exports.SignConsentDto = SignConsentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Base64 signature image' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SignConsentDto.prototype, "signature_data", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Nama penandatangan (wali pasien)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SignConsentDto.prototype, "signer_name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Hubungan penandatangan dengan pasien' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SignConsentDto.prototype, "signer_relation", void 0);
//# sourceMappingURL=emr.dto.js.map