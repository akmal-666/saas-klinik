// emr.controller.ts
import {
  Controller, Get, Post, Patch, Body, Param,
  Query, HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { EmrService } from './emr.service';
import { CreateEmrDto, UpdateEmrDto, EmrQueryDto, SignConsentDto } from './dto/emr.dto';
import {
  JwtAuthGuard, CurrentUser, ClinicId,
  RequirePermissions, JwtPayload,
} from '../../common/guards/jwt-auth.guard';

@ApiTags('EMR — Rekam Medis')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'emr', version: '1' })
export class EmrController {
  constructor(private readonly svc: EmrService) {}

  // ── GET /emr ────────────────────────────────────────────
  @Get()
  @RequirePermissions('emr:view')
  @ApiOperation({ summary: 'List EMR records (dengan filter)' })
  findAll(
    @ClinicId() clinicId: string,
    @Query() query: EmrQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.svc.findAll(clinicId, query, user);
  }

  // ── GET /emr/icd10/search ───────────────────────────────
  @Get('icd10/search')
  @RequirePermissions('emr:view')
  @ApiOperation({ summary: 'Cari kode ICD-10 dental (Kemenkes standard)' })
  @ApiQuery({ name:'q', required:false, description:'Kata kunci kode atau deskripsi' })
  @ApiQuery({ name:'category', required:false, description:'Filter kategori' })
  searchIcd10(
    @Query('q') q: string = '',
    @Query('category') category?: string,
    @ClinicId() _clinicId?: string,
  ) {
    return this.svc.searchIcd10(q, category);
  }

  // ── GET /emr/icd9/search ────────────────────────────────
  @Get('icd9/search')
  @RequirePermissions('emr:view')
  @ApiOperation({ summary: 'Cari kode ICD-9-CM tindakan dental' })
  searchIcd9(
    @Query('q') q: string = '',
    @Query('category') category?: string,
    @ClinicId() _clinicId?: string,
  ) {
    return this.svc.searchIcd9(q, category);
  }

  // ── GET /emr/patients/:patientId/history ────────────────
  @Get('patients/:patientId/history')
  @RequirePermissions('emr:view')
  @ApiOperation({ summary: 'Timeline riwayat kunjungan pasien lengkap' })
  getPatientHistory(
    @ClinicId() clinicId: string,
    @Param('patientId') patientId: string,
  ) {
    return this.svc.getPatientHistory(clinicId, patientId);
  }

  // ── GET /emr/:id ────────────────────────────────────────
  @Get(':id')
  @RequirePermissions('emr:view')
  @ApiOperation({ summary: 'Detail EMR satu kunjungan + attachments' })
  findOne(
    @ClinicId() clinicId: string,
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.svc.findOne(clinicId, id, user);
  }

  // ── POST /emr ───────────────────────────────────────────
  @Post()
  @RequirePermissions('emr:create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat EMR baru (auto-complete linked appointment)' })
  create(
    @ClinicId() clinicId: string,
    @Body() dto: CreateEmrDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.svc.create(clinicId, dto, user);
  }

  // ── PATCH /emr/:id ──────────────────────────────────────
  @Patch(':id')
  @RequirePermissions('emr:update')
  @ApiOperation({ summary: 'Update EMR (SOAP, ICD codes, treatments)' })
  update(
    @ClinicId() clinicId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEmrDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.svc.update(clinicId, id, dto, user);
  }

  // ── POST /emr/:id/consent ───────────────────────────────
  @Post(':id/consent')
  @RequirePermissions('emr:update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tanda tangan digital informed consent' })
  signConsent(
    @ClinicId() clinicId: string,
    @Param('id') id: string,
    @Body() dto: SignConsentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.svc.signConsent(clinicId, id, dto, user);
  }
}
