// satu-sehat.controller.ts
import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SatuSehatService } from './satu-sehat.service';
import { JwtAuthGuard, ClinicId, RequirePermissions } from '../../common/guards/jwt-auth.guard';

@ApiTags('SATUSEHAT Sync')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'satu-sehat', version: '1' })
export class SatuSehatController {
  constructor(private readonly svc: SatuSehatService) {}

  @Post('sync/emr/:id')
  @RequirePermissions('settings:manage')
  @HttpCode(HttpStatus.OK)
  syncEmr(@ClinicId() cid: string, @Param('id') id: string) {
    return this.svc.syncEmr(id, cid);
  }

  @Post('sync/batch')
  @RequirePermissions('settings:manage')
  @HttpCode(HttpStatus.OK)
  syncBatch() {
    return this.svc.syncPendingBatch(20);
  }
}
