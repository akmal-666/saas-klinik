import { Controller, Get, Post, Patch, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { JwtAuthGuard, ClinicId, RequirePermissions } from '../../common/guards/jwt-auth.guard';

@ApiTags('Dokter')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'doctors', version: '1' })
export class DoctorsController {
  constructor(private readonly svc: DoctorsService) {}
  @Get()        @RequirePermissions('masterdata:view')
  findAll(@ClinicId() cid: string, @Query('full') full?: string) { return this.svc.findAll(cid, full === '1'); }
  @Get(':id')   @RequirePermissions('masterdata:view')
  findOne(@ClinicId() cid: string, @Param('id') id: string) { return this.svc.findOne(cid, id); }
  @Get(':id/availability') @RequirePermissions('appointment:view')
  availability(@ClinicId() cid: string, @Param('id') id: string, @Query('date') date: string) { return this.svc.getAvailability(cid, id, date); }
  @Post()       @RequirePermissions('masterdata:manage') @HttpCode(HttpStatus.CREATED)
  create(@ClinicId() cid: string, @Body() dto: any) { return this.svc.create(cid, dto); }
  @Patch(':id') @RequirePermissions('masterdata:manage')
  update(@ClinicId() cid: string, @Param('id') id: string, @Body() dto: any) { return this.svc.update(cid, id, dto); }
}
