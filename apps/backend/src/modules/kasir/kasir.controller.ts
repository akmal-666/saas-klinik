// kasir.controller.ts
import {
  Controller, Get, Post, Patch, Body, Param,
  Query, HttpCode, HttpStatus, UseGuards, Delete,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { KasirService } from './kasir.service';
import { CreateInvoiceDto, AddPaymentDto, ApplyVoucherDto, DepositTopUpDto, InvoiceQueryDto } from './dto/kasir.dto';
import { JwtAuthGuard, CurrentUser, ClinicId, RequirePermissions, JwtPayload } from '../../common/guards/jwt-auth.guard';

@ApiTags('Kasir & Pembayaran')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'kasir', version: '1' })
export class KasirController {
  constructor(private readonly svc: KasirService) {}

  @Get('invoices')
  @RequirePermissions('kasir:view')
  @ApiOperation({ summary: 'List invoices dengan filter' })
  listInvoices(@ClinicId() cid: string, @Query() q: InvoiceQueryDto) { return this.svc.listInvoices(cid, q); }

  @Get('invoices/daily-summary')
  @RequirePermissions('kasir:view')
  @ApiOperation({ summary: 'Ringkasan kasir harian' })
  dailySummary(@ClinicId() cid: string, @Query('date') date: string) {
    return this.svc.getDailySummary(cid, date ?? new Date().toISOString().split('T')[0]);
  }

  @Get('invoices/:id')
  @RequirePermissions('kasir:view')
  getInvoice(@ClinicId() cid: string, @Param('id') id: string) { return this.svc.getInvoice(cid, id); }

  @Post('invoices')
  @RequirePermissions('kasir:create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat invoice baru' })
  createInvoice(@ClinicId() cid: string, @Body() dto: CreateInvoiceDto, @CurrentUser() u: JwtPayload) {
    return this.svc.createInvoice(cid, dto, u.sub);
  }

  @Post('invoices/:id/payments')
  @RequirePermissions('kasir:create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tambah pembayaran ke invoice (multi-method supported)' })
  addPayment(@ClinicId() cid: string, @Param('id') id: string, @Body() dto: AddPaymentDto, @CurrentUser() u: JwtPayload) {
    return this.svc.addPayment(cid, id, dto, u.sub);
  }

  @Post('invoices/:id/voucher')
  @RequirePermissions('kasir:create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Terapkan kode voucher/promo ke invoice' })
  applyVoucher(@ClinicId() cid: string, @Param('id') id: string, @Body() dto: ApplyVoucherDto) {
    return this.svc.applyVoucher(cid, id, dto);
  }

  @Delete('invoices/:id')
  @RequirePermissions('kasir:void')
  @ApiOperation({ summary: 'Void / batalkan invoice' })
  voidInvoice(@ClinicId() cid: string, @Param('id') id: string, @Body('reason') reason: string) {
    return this.svc.voidInvoice(cid, id, reason ?? 'Dibatalkan');
  }

  // ─── Deposit ──────────────────────────────────────────
  @Get('deposits/:patientId')
  @RequirePermissions('kasir:view')
  @ApiOperation({ summary: 'Riwayat & saldo deposit pasien' })
  getDepositHistory(@ClinicId() cid: string, @Param('patientId') pid: string) {
    return this.svc.getDepositHistory(cid, pid);
  }

  @Post('deposits/topup')
  @RequirePermissions('kasir:create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Top-up deposit pasien' })
  topUpDeposit(@ClinicId() cid: string, @Body() dto: DepositTopUpDto, @CurrentUser() u: JwtPayload) {
    return this.svc.topUpDeposit(cid, dto, u.sub);
  }
}
