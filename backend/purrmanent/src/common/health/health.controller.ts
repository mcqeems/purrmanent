import { Controller, Get } from '@nestjs/common';

/**
 * Deploy smoke test / uptime probe. With the global prefix this is GET /api/health.
 * Public (no auth) — see plan §6, §20.
 */
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', ts: new Date().toISOString() };
  }
}
