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
 * Known browser push-service origins. All real browser push notifications
 * route through one of these providers. Any endpoint outside this list is
 * rejected to prevent SSRF via arbitrary public URLs.
 */
const ALLOWED_PUSH_ORIGINS = new Set([
  'fcm.googleapis.com', // Chrome, Edge
  'updates.push.services.mozilla.com', // Firefox
  'web.push.apple.com', // Safari
  'wns.windows.com', // Windows
]);

/**
 * Validates a push subscription endpoint against the allowlist of known
 * browser push-service origins. Blocks non-HTTPS, non-allowlisted, and
 * private/internal endpoints.
 */
function validatePushEndpoint(endpoint: string): string {
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    throw new BadRequestException('Invalid push endpoint URL');
  }

  if (url.protocol !== 'https:') {
    throw new BadRequestException('Push endpoint must use HTTPS');
  }

  if (!ALLOWED_PUSH_ORIGINS.has(url.hostname)) {
    throw new BadRequestException(
      `Push endpoint host "${url.hostname}" is not a recognized push service`,
    );
  }

  return endpoint;
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
      // Defense-in-depth: re-validate endpoint before sending
      try {
        validatePushEndpoint(sub.endpoint);
      } catch {
        this.logger.warn(`Skipping invalid push endpoint: ${sub.endpoint}`);
        await this.subs.delete(sub.id);
        continue;
      }
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
