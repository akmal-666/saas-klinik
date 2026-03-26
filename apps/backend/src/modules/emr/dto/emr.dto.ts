import {
  IsString, IsOptional, IsArray, IsBoolean,
  IsDateString, IsEnum, IsUUID, IsObject,
  ValidateNested, IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

// ─── SOAP ─────────────────────────────────────────────────
export class SoapDto {
  @ApiProperty({ description: 'Subjective — keluhan pasien' })
  @IsString() S: string;

  @ApiProperty({ description: 'Objective — pemeriksaan klinis' })
  @IsString() O: string;

  @ApiProperty({ description: 'Assessment — diagnosis klinis' })
  @IsString() A: string;

  @ApiProperty({ description: 'Plan — rencana perawatan' })
  @IsString() P: string;
}

// ─── Vitals ───────────────────────────────────────────────
export class VitalsDto {
  @ApiPropertyOptional({ example: '120/80' })
  @IsOptional() @IsString() blood_pressure?: string;

  @ApiPropertyOptional({ example: 80 })
  @IsOptional() pulse?: number;

  @ApiPropertyOptional({ example: 18 })
  @IsOptional() respiratory_rate?: number;

  @ApiPropertyOptional({ example: 36.5 })
  @IsOptional() temperature?: number;
}

// ─── Create EMR ───────────────────────────────────────────
export class CreateEmrDto {
  @ApiPropertyOptional({ description: 'Appointment ID yang terkait (opsional)' })
  @IsOptional() @IsUUID() appointment_id?: string;

  @ApiProperty({ description: 'Patient UUID' })
  @IsUUID() @IsNotEmpty() patient_id: string;

  @ApiProperty({ description: 'Doctor UUID' })
  @IsUUID() @IsNotEmpty() doctor_id: string;

  @ApiProperty({ example: '2026-03-23' })
  @IsDateString() visit_date: string;

  @ApiProperty({ type: SoapDto })
  @ValidateNested() @Type(() => SoapDto) soap: SoapDto;

  @ApiPropertyOptional({ type: VitalsDto })
  @IsOptional() @ValidateNested() @Type(() => VitalsDto)
  vitals?: VitalsDto;

  @ApiPropertyOptional({ example: ['K02.1', 'K04.01'], description: 'ICD-10 codes (Kemenkes standard)' })
  @IsOptional() @IsArray() @IsString({ each: true })
  icd10_codes?: string[];

  @ApiPropertyOptional({ example: ['23.2', '96.54'], description: 'ICD-9-CM procedure codes' })
  @IsOptional() @IsArray() @IsString({ each: true })
  icd9_codes?: string[];

  @ApiPropertyOptional({ description: 'Treatment IDs yang dilakukan' })
  @IsOptional() @IsArray() @IsUUID('4', { each: true })
  treatment_ids?: string[];

  @ApiPropertyOptional()
  @IsOptional() @IsString() notes?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean() consent_signed?: boolean;
}

// ─── Update EMR ───────────────────────────────────────────
export class UpdateEmrDto extends PartialType(CreateEmrDto) {}

// ─── Query EMR ────────────────────────────────────────────
export class EmrQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() patient_id?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() doctor_id?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() date_from?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() date_to?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() q?: string; // search patient name/rm
  @ApiPropertyOptional() @IsOptional() @IsString() cursor?: string;
  @ApiPropertyOptional() @IsOptional() limit?: number;
}

// ─── Digital Consent ─────────────────────────────────────
export class SignConsentDto {
  @ApiProperty({ description: 'Base64 signature image' })
  @IsString() @IsNotEmpty() signature_data: string;

  @ApiPropertyOptional({ description: 'Nama penandatangan (wali pasien)' })
  @IsOptional() @IsString() signer_name?: string;

  @ApiPropertyOptional({ description: 'Hubungan penandatangan dengan pasien' })
  @IsOptional() @IsString() signer_relation?: string;
}
