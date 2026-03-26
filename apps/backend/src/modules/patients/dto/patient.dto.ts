import {
  IsString, IsOptional, IsEnum, IsDateString, IsUUID, IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreatePatientDto {
  @ApiProperty({ example: 'Budi Santoso' })
  @IsString() @IsNotEmpty() full_name: string;

  @ApiProperty({ example: '1990-05-14' })
  @IsDateString() date_of_birth: string;

  @ApiProperty({ enum: ['L','P'] })
  @IsEnum(['L','P']) gender: 'L' | 'P';

  @ApiPropertyOptional({ example: '08211234567' })
  @IsOptional() @IsString() phone?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() email?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() address?: string;

  @ApiPropertyOptional({ example: 'A+' })
  @IsOptional() @IsString() blood_type?: string;

  @ApiPropertyOptional({ example: 'Penisilin' })
  @IsOptional() @IsString() allergy?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsUUID() insurance_id?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() insurance_number?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() notes?: string;
}

export class UpdatePatientDto extends PartialType(CreatePatientDto) {}
