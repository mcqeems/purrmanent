import { Injectable, Logger, OnModuleInit, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as webpush from 'web-push';
import { NotificationLog, PushSubscription } from '../../entities';
import type { Env } from '../../config/env';
import { PushSubscribeDto } from './notification.schema';

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

/**
 * Validates a push subscription endpoint URL against an allowlist of permitted domains.
 * @param endpoint - The push subscription endpoint URL to validate
 * @returns The validated endpoint URL
 * @throws BadRequestException if the endpoint is invalid or not in the allowlist
 */
function validatePushEndpoint(endpoint: string): string {
  const allowedDomains = ['example.com']; // add your allowed domains here

  try {
    const url = new URL(endpoint);

    // Only allow http and https protocols
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error('Invalid protocol');
    }

    // Extract hostname and validate against allowlist
    const hostname = url.hostname;
    if (!allowedDomains.includes(hostname)) {
      throw new Error('Domain not allowed');
    }

    return endpoint;
  } catch (err) {
    throw new BadRequestException('Invalid URL');
  }
}

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);
  private enabled = false;
  vapidPublicKey?: string;

  constructor(
    @InjectRepository(PushSubscription)
    private readonly subs: Repository<PushSubscription>,
    @InjectRepository(NotificationLog)
    private readonly logs: Repository<NotificationLog>,
    private readonly config: ConfigService<Env, true>,
  ) {}

  onModuleInit(): void {
    const pub = this.config.get('VAPID_PUBLIC_KEY', { infer: true });
    const priv = this.config.get('VAPID_PRIVATE_KEY', { infer: true });
    const subject = this.config.get('VAPID_SUBJECT', { infer: true });
    // treat placeholder "..." as unset
    if (pub && priv && pub !== '...' && priv !== '...') {
      webpush.setVapidDetails(subject, pub, priv);
      this.vapidPublicKey = pub;
      this.enabled = true;
    } else {
      this.logger.warn('VAPID keys unset — push notifications disabled');
    }
  }

  async subscribe(
    userId: number,
    dto: PushSubscribeDto,
  ): Promise<{ success: true }> {
    const validatedEndpoint = validatePushEndpoint(dto.endpoint);
    await this.subs
      .createQueryBuilder()
      .insert()
      .values({
        userId,
        endpoint: validatedEndpoint,
        p256dhKey: dto.keys.p256dh,
        authKey: dto.keys.auth,
        userAgent: dto.userAgent ?? null,
      })
      .orUpdate(
        ['p256dh_key', 'auth_key', 'user_agent'],
        ['user_id', 'endpoint'],
      )
      .execute();
    return { success: true };
  }

  async unsubscribe(
    userId: number,
    endpoint: string,
  ): Promise<{ success: true }> {
    await this.subs.delete({ userId, endpoint });
    return { success: true };
  }

  /** Deliver a push to every subscription of a user; prune dead endpoints. */
  async send(
    userId: number,
    payload: PushPayload,
    type = 'reminder',
  ): Promise<number> {
    if (!this.enabled) return 0;
    const subscriptions = await this.subs.find({ where: { userId } });
    let delivered = 0;
    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dhKey, auth: sub.authKey },
          },
          JSON.stringify(payload),
        );
        delivered++;
        await this.subs.update(sub.id, { lastUsedAt: new Date() });
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 410 || status === 404) {
          await this.subs.delete(sub.id); // prune dead endpoint
        } else {
          this.logger.error(`push send failed (${status}): ${String(err)}`);
        }
      }
    }
    await this.logs.save(
      this.logs.create({
        userId,
        notificationType: type,
        delivered: delivered > 0,
      }),
    );
    return delivered;
  }
}
