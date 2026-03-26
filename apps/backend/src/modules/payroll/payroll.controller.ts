import { Controller, Get, Post, Patch, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { JwtAuthGuard, ClinicId, RequirePermissions, CurrentUser, JwtPayload } from '../../common/guards/jwt-auth.guard';

@ApiTags('Payroll Dokter')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'payroll', version: '1' })
export class PayrollController {
  constructor(private readonly svc: PayrollService) {}

  @Get('periods')            @RequirePermissions('payroll:view')
  listPeriods(@ClinicId() cid: string) { return this.svc.listPeriods(cid); }

  @Get('periods/:id')        @RequirePermissions('payroll:view')
  getPeriod(@ClinicId() cid: string, @Param('id') id: string) { return this.svc.getPeriod(cid, id); }

  @Post('periods/calculate') @RequirePermissions('payroll:manage') @HttpCode(HttpStatus.CREATED)
  calculate(@ClinicId() cid: string, @Body() dto: { period_start: string; period_end: string }, @CurrentUser() u: JwtPayload) {
    return this.svc.calculatePeriod(cid, dto.period_start, dto.period_end, u.sub);
  }

  @Patch('periods/:id/approve') @RequirePermissions('payroll:manage')
  approve(@ClinicId() cid: string, @Param('id') id: string, @CurrentUser() u: JwtPayload) {
    return this.svc.approvePeriod(cid, id, u.sub);
  }

  @Patch('periods/:pid/items/:iid/paid') @RequirePermissions('payroll:manage')
  markPaid(@ClinicId() cid: string, @Param('pid') pid: string, @Param('iid') iid: string) {
    return this.svc.markItemPaid(cid, pid, iid);
  }

  @Patch('periods/:pid/items/:iid/override') @RequirePermissions('payroll:manage')
  override(@ClinicId() cid: string, @Param('pid') pid: string, @Param('iid') iid: string, @Body() dto: { amount: number; reason: string }) {
    return this.svc.overrideItem(cid, pid, iid, dto.amount, dto.reason);
  }

  @Get('doctors/:id/summary') @RequirePermissions('payroll:view')
  doctorSummary(@ClinicId() cid: string, @Param('id') id: string, @Query('year') year: number) {
    return this.svc.getDoctorSummary(cid, id, year ?? new Date().getFullYear());
  }
}
