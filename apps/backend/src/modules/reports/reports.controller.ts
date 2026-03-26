import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard, ClinicId, RequirePermissions } from '../../common/guards/jwt-auth.guard';

@ApiTags('Laporan')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'reports', version: '1' })
export class ReportsController {
  constructor(private readonly svc: ReportsService) {}

  @Get('revenue')   @RequirePermissions('report:view')
  revenue(@ClinicId() cid: string, @Query('from') from: string, @Query('to') to: string, @Query('doctor_id') doc?: string) {
    return this.svc.getRevenueReport(cid, from ?? new Date().toISOString().split('T')[0], to ?? new Date().toISOString().split('T')[0], doc);
  }
  @Get('visits')    @RequirePermissions('report:view')
  visits(@ClinicId() cid: string, @Query('from') from: string, @Query('to') to: string) {
    return this.svc.getVisitReport(cid, from, to);
  }
  @Get('daily')     @RequirePermissions('report:view')
  daily(@ClinicId() cid: string, @Query('date') date: string) {
    return this.svc.getDailySummary(cid, date ?? new Date().toISOString().split('T')[0]);
  }
}
