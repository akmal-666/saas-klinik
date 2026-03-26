import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  private readonly startTime = Date.now();

  @Get()
  check() {
    return {
      ok: true,
      data: {
        status:  'healthy',
        version: process.env.npm_package_version ?? '1.0.0',
        env:     process.env.NODE_ENV ?? 'development',
        uptime:  Math.floor((Date.now() - this.startTime) / 1000),
        ts:      new Date().toISOString(),
      },
    };
  }
}
