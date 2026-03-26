import { Controller, Get, Post, Patch, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TreatmentsService } from './treatments.service';
import { JwtAuthGuard, ClinicId, RequirePermissions } from '../../common/guards/jwt-auth.guard';

@ApiTags('Treatment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'treatments', version: '1' })
export class TreatmentsController {
  constructor(private readonly svc: TreatmentsService) {}
  @Get()             @RequirePermissions('masterdata:view')
  findAll(@ClinicId() cid: string, @Query('category') cat?: string, @Query('all') all?: string) { return this.svc.findAll(cid, cat, all !== '1'); }
  @Get('categories') @RequirePermissions('masterdata:view')
  categories(@ClinicId() cid: string) { return this.svc.getCategories(cid); }
  @Post()            @RequirePermissions('masterdata:manage') @HttpCode(HttpStatus.CREATED)
  create(@ClinicId() cid: string, @Body() dto: any) { return this.svc.create(cid, dto); }
  @Patch(':id')      @RequirePermissions('masterdata:manage')
  update(@ClinicId() cid: string, @Param('id') id: string, @Body() dto: any) { return this.svc.update(cid, id, dto); }
}
