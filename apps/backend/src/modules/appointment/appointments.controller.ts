import {
  Controller, Get, Post, Patch, Delete, Put,
  Body, Param, Query, HttpCode, HttpStatus,
  UseGuards, Version,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiBearerAuth,
  ApiParam, ApiResponse,
} from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  UpdateAppointmentStatusDto,
  AppointmentQueryDto,
  RescheduleAppointmentDto,
} from './dto/appointment.dto';
import {
  JwtAuthGuard,
  CurrentUser,
  ClinicId,
  RequirePermissions,
  JwtPayload,
} from '../../common/guards/jwt-auth.guard';

@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'appointments', version: '1' })
export class AppointmentsController {
  constructor(private readonly svc: AppointmentsService) {}

  // ── GET /appointments ──────────────────────────────────
  @Get()
  @RequirePermissions('appointment:view')
  @ApiOperation({ summary: 'List appointments (calendar & list view)' })
  @ApiResponse({ status: 200, description: 'Returns paginated appointments' })
  findAll(
    @ClinicId() clinicId: string,
    @Query() query: AppointmentQueryDto,
  ) {
    return this.svc.findAll(clinicId, query);
  }

  // ── GET /appointments/today/summary ───────────────────
  @Get('today/summary')
  @RequirePermissions('appointment:view')
  @ApiOperation({ summary: 'Get today appointment counts per status' })
  getTodaySummary(@ClinicId() clinicId: string) {
    return this.svc.getTodaySummary(clinicId);
  }

  // ── GET /appointments/:id ─────────────────────────────
  @Get(':id')
  @RequirePermissions('appointment:view')
  @ApiOperation({ summary: 'Get single appointment with relations' })
  @ApiParam({ name: 'id', description: 'Appointment UUID' })
  findOne(
    @ClinicId() clinicId: string,
    @Param('id') id: string,
  ) {
    return this.svc.findOne(clinicId, id);
  }

  // ── POST /appointments ────────────────────────────────
  @Post()
  @RequirePermissions('appointment:create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new appointment' })
  create(
    @ClinicId() clinicId: string,
    @Body() dto: CreateAppointmentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.svc.create(clinicId, dto, user.sub);
  }

  // ── PATCH /appointments/:id ───────────────────────────
  @Patch(':id')
  @RequirePermissions('appointment:update')
  @ApiOperation({ summary: 'Update appointment details' })
  update(
    @ClinicId() clinicId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
  ) {
    return this.svc.update(clinicId, id, dto);
  }

  // ── PATCH /appointments/:id/status ────────────────────
  @Patch(':id/status')
  @RequirePermissions('appointment:update')
  @ApiOperation({
    summary: 'Update appointment status (flow-controlled)',
    description: 'Status transitions: prebook→booked→confirmed→waiting→engaged→completed. Cancel/reschedule allowed at most stages.',
  })
  updateStatus(
    @ClinicId() clinicId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentStatusDto,
  ) {
    return this.svc.updateStatus(clinicId, id, dto);
  }

  // ── PUT /appointments/:id/reschedule ──────────────────
  @Put(':id/reschedule')
  @RequirePermissions('appointment:update')
  @ApiOperation({ summary: 'Reschedule appointment to new date/time' })
  reschedule(
    @ClinicId() clinicId: string,
    @Param('id') id: string,
    @Body() dto: RescheduleAppointmentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.svc.reschedule(clinicId, id, dto, user.sub);
  }

  // ── DELETE /appointments/:id ──────────────────────────
  @Delete(':id')
  @RequirePermissions('appointment:delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel appointment' })
  remove(
    @ClinicId() clinicId: string,
    @Param('id') id: string,
  ) {
    return this.svc.remove(clinicId, id);
  }
}
