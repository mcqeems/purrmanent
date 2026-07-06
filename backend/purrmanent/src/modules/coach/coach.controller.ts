import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Res,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { CoachService } from './coach.service';
import { ChatMessageDto, ConfirmActionDto } from './coach.schema';
import { CurrentUser } from '../auth/auth.decorators';

@Controller('coach')
export class CoachController {
  constructor(private readonly coach: CoachService) {}

  /**
   * Streamed Copilot chat. Manual SSE over POST: the browser
   * sends an already-resolved `contextMention` enum; the server streams token
   * deltas as `data:` events and a final `[DONE]` sentinel.
   *
   * Rate-limited to 100/min. ponytail: per-IP for the MVP;
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
      else if (ev.type === 'confirm') send('confirm', ev.data);
      else if (ev.type === 'conversation') send('conversation', ev.data);
      else if (ev.type === 'error') send('error', true);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  }

  /**
   * Execute a write action the agent proposed (via the `confirm` SSE event)
   * after the user approves it. userId comes from the session; the action's
   * Zod schema re-validates `args` server-side (anti-IDOR + untrusted input).
   */
  @Throttle({ default: { ttl: 60_000, limit: 60 } })
  @Post('confirm-action')
  confirmAction(
    @CurrentUser('id') userId: number,
    @Body() dto: ConfirmActionDto,
  ) {
    return this.coach.confirmAction(userId, dto);
  }

  @Get('conversations')
  listConversations(@CurrentUser('id') userId: number) {
    return this.coach.listConversations(userId);
  }

  @Get('conversations/:id/messages')
  conversationMessages(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.coach.getMessages(userId, id);
  }
}
