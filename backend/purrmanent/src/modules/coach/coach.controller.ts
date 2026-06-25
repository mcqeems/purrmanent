import { Body, Controller, Post, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { CoachService } from './coach.service';
import { ChatMessageDto } from './coach.schema';
import { CurrentUser } from '../auth/auth.decorators';

@Controller('coach')
export class CoachController {
  constructor(private readonly coach: CoachService) {}

  /**
   * Streamed Copilot chat (spec §2.4/§8.5). Manual SSE over POST: the browser
   * sends an already-resolved `contextMention` enum; the server streams token
   * deltas as `data:` events and a final `[DONE]` sentinel.
   *
   * Rate-limited to 100/min (proposal §8.4). ponytail: per-IP for the MVP;
   * upgrade path = per-user key via a custom ThrottlerGuard getTracker.
   */
  @Throttle({ default: { ttl: 60_000, limit: 100 } })
  @Post('chat')
  async chat(
    @CurrentUser('id') userId: number,
    @Body() dto: ChatMessageDto,
    @Res() res: Response,
  ): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const send = (event: string, data: unknown) =>
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

    for await (const ev of this.coach.run(userId, dto)) {
      if (ev.type === 'sources') send('sources', ev.data);
      else if (ev.type === 'delta') send('delta', ev.data);
      else if (ev.type === 'error') send('error', true);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  }
}
