import {
  IsString, IsEnum, IsOptional, IsArray, IsInt,
  IsDateString, Matches, Min, Max, IsIn, IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AppointmentStatus } from '@klinik/shared-types';

// ─── Create ───────────────────────────────────────────────

export class CreateAppointmentDto {
  @ApiProperty({ example: 'p_uuid_here' })
  @IsString() @IsNotEmpty()
  patient_id: string;

  @ApiProperty({ example: 'd_uuid_here' })
  @IsString() @IsNotEmpty()
  doctor_id: string;

  @ApiProperty({ example: '2026-03-23' })
  @IsDateString()
  scheduled_date: string;

  @ApiProperty({ example: '09:00' })
  @Matches(/^\d{2}:\d{2}$/, { message: 'Format jam: HH:mm' })
  scheduled_time: string;

  @ApiPropertyOptional({ example: 30, minimum: 15, maximum: 180 })
  @IsOptional() @IsInt() @Min(15) @Max(180)
  @Type(() => Number)
  duration_minutes?: number = 30;

  @ApiProperty({ example: ['tr_uuid_1', 'tr_uuid_2'] })
  @IsArray() @IsString({ each: true })
  treatment_ids: string[];

  @ApiPropertyOptional({ example: AppointmentStatus.BOOKED })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus = AppointmentStatus.BOOKED;

  @ApiPropertyOptional({ example: 'Keluhan nyeri gigi depan' })
  @IsOptional() @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: ['walk_in', 'online', 'phone'] })
  @IsOptional()
  @IsIn(['walk_in', 'online', 'phone'])
  source?: 'walk_in' | 'online' | 'phone' = 'walk_in';
}

// ─── Update ───────────────────────────────────────────────

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {}

// ─── Update Status ────────────────────────────────────────

export class UpdateAppointmentStatusDto {
  @ApiProperty({ enum: AppointmentStatus })
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  notes?: string;
}

// ─── Query ────────────────────────────────────────────────

export class AppointmentQueryDto {
  @ApiPropertyOptional({ example: '2026-03-23' })
  @IsOptional() @IsDateString()
  date?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  doctor_id?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  patient_id?: string;

  @ApiPropertyOptional({ enum: AppointmentStatus })
  @IsOptional() @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional({ enum: ['calendar', 'list'] })
  @IsOptional() @IsIn(['calendar', 'list'])
  view?: 'calendar' | 'list' = 'calendar';

  @ApiPropertyOptional({ description: 'Cursor for pagination' })
  @IsOptional() @IsString()
  cursor?: string;

  @ApiPropertyOptional({ example: 50, minimum: 1, maximum: 200 })
  @IsOptional() @IsInt() @Min(1) @Max(200)
  @Type(() => Number)
  limit?: number = 50;
}

// ─── Reschedule ───────────────────────────────────────────

export class RescheduleAppointmentDto {
  @ApiProperty({ example: '2026-03-25' })
  @IsDateString()
  scheduled_date: string;

  @ApiProperty({ example: '10:00' })
  @Matches(/^\d{2}:\d{2}$/)
  scheduled_time: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  reason?: string;
}
