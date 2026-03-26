import {
  IsString, IsOptional, IsArray, IsNumber, IsEnum,
  IsUUID, IsPositive, Min, Max, ValidateNested,
  IsNotEmpty, IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@klinik/shared-types';

// ─── Invoice item ─────────────────────────────────────────
export class InvoiceItemDto {
  @ApiProperty() @IsUUID() treatment_id: string;
  @ApiProperty() @IsString() treatment_name: string;
  @ApiProperty() @IsNumber() @Min(1) quantity: number;
  @ApiProperty() @IsNumber() @Min(0) unit_price: number;
}

// ─── Create Invoice ───────────────────────────────────────
export class CreateInvoiceDto {
  @ApiProperty() @IsUUID() @IsNotEmpty() patient_id: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() appointment_id?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() emr_id?: string;

  @ApiProperty({ type: [InvoiceItemDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) discount_amount?: number;
  @ApiPropertyOptional() @IsOptional() @IsUUID() promo_id?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() promo_code?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

// ─── Add Payment ──────────────────────────────────────────
export class AddPaymentDto {
  @ApiProperty({ enum: PaymentMethod }) @IsEnum(PaymentMethod) method: PaymentMethod;
  @ApiProperty() @IsNumber() @IsPositive() amount: number;
  @ApiPropertyOptional() @IsOptional() @IsString() reference_number?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() insurance_id?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() insurance_claim_number?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

// ─── Apply Voucher ────────────────────────────────────────
export class ApplyVoucherDto {
  @ApiProperty() @IsString() @IsNotEmpty() code: string;
}

// ─── Deposit Top-up ───────────────────────────────────────
export class DepositTopUpDto {
  @ApiProperty() @IsUUID() patient_id: string;
  @ApiProperty() @IsNumber() @IsPositive() amount: number;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiProperty({ enum: PaymentMethod }) @IsEnum(PaymentMethod) payment_method: PaymentMethod;
  @ApiPropertyOptional() @IsOptional() @IsString() reference_number?: string;
}

// ─── Invoice Query ────────────────────────────────────────
export class InvoiceQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() patient_id?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() date_from?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() date_to?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() q?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cursor?: string;
  @ApiPropertyOptional() @IsOptional() limit?: number;
}
