import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { CreatePatientDto, UpdatePatientDto } from './dto/patient.dto';
import {
  JwtAuthGuard, ClinicId, RequirePermissions,
} from '../../common/guards/jwt-auth.guard';

@ApiTags('Pasien')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'patients', version: '1' })
export class PatientsController {
  constructor(private readonly svc: PatientsService) {}

  @Get()
  @RequirePermissions('masterdata:view')
  @ApiOperation({ summary: 'List pasien dengan pencarian' })
  findAll(
    @ClinicId() cid: string,
    @Query('q') q?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ) {
    return this.svc.findAll(cid, q, cursor, limit);
  }

  @Get('search/rm')
  @RequirePermissions('masterdata:view')
  @ApiOperation({ summary: 'Cari pasien berdasarkan No. RM' })
  searchRm(@ClinicId() cid: string, @Query('q') q: string) {
    return this.svc.searchByRm(cid, q);
  }

  @Get(':id')
  @RequirePermissions('masterdata:view')
  findOne(@ClinicId() cid: string, @Param('id') id: string) {
    return this.svc.findOne(cid, id);
  }

  @Post()
  @RequirePermissions('masterdata:manage')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Daftarkan pasien baru (No. RM auto-generate)' })
  create(@ClinicId() cid: string, @Body() dto: CreatePatientDto) {
    return this.svc.create(cid, dto);
  }

  @Patch(':id')
  @RequirePermissions('masterdata:manage')
  update(
    @ClinicId() cid: string,
    @Param('id') id: string,
    @Body() dto: UpdatePatientDto,
  ) {
    return this.svc.update(cid, id, dto);
  }

  @Delete(':id')
  @RequirePermissions('masterdata:manage')
  @ApiOperation({ summary: 'Non-aktifkan pasien (soft delete)' })
  deactivate(@ClinicId() cid: string, @Param('id') id: string) {
    return this.svc.deactivate(cid, id);
  }
}
