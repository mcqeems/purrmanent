import {
  Injectable,
  Logger,
  OnModuleInit,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as webpush from 'web-push';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import type { ServiceAccount } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { NotificationLog, PushSubscription, FcmToken } from '../../entities';
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
  private fcmEnabled = false;
  vapidPublicKey?: string;

  constructor(
    @InjectRepository(PushSubscription)
    private readonly subs: Repository<PushSubscription>,
    @InjectRepository(NotificationLog)
    private readonly logs: Repository<NotificationLog>,
    @InjectRepository(FcmToken)
    private readonly fcmTokens: Repository<FcmToken>,
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

    this.initFcm();
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

  /**
   * Register (or re-register) a native Android FCM token. Tokens are globally
   * unique; re-registering the same token simply moves/refreshes it for the
   * current user and bumps its last-used timestamp.
   */
  async registerFcm(userId: number, token: string): Promise<{ success: true }> {
    const existing = await this.fcmTokens.findOne({ where: { token } });
    if (existing) {
      if (existing.userId !== userId) {
        await this.fcmTokens.update(existing.id, { userId });
      }
      await this.fcmTokens.update(existing.id, { lastUsedAt: new Date() });
      return { success: true };
    }
    await this.fcmTokens.save(this.fcmTokens.create({ userId, token }));
    return { success: true };
  }

  /** Deliver a push to every web-push and FCM subscription of a user. */
  async send(
    userId: number,
    payload: PushPayload,
    type = 'reminder',
  ): Promise<number> {
    const webDelivered = this.enabled
      ? await this.sendWebPush(userId, payload)
      : 0;
    const fcmDelivered = this.fcmEnabled
      ? await this.sendFcm(userId, payload)
      : 0;
    const delivered = webDelivered + fcmDelivered;
    await this.logs.save(
      this.logs.create({
        userId,
        notificationType: type,
        delivered: delivered > 0,
      }),
    );
    return delivered;
  }

  /** Deliver via browser web-push subscriptions; prune dead endpoints. */
  private async sendWebPush(
    userId: number,
    payload: PushPayload,
  ): Promise<number> {
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
    return delivered;
  }

  /** Deliver via native Android FCM tokens; prune dead tokens. */
  private async sendFcm(userId: number, payload: PushPayload): Promise<number> {
    const rows = await this.fcmTokens.find({ where: { userId } });
    let delivered = 0;
    for (const row of rows) {
      try {
        await getMessaging().send({
          token: row.token,
          notification: { title: payload.title, body: payload.body },
          data: payload.url ? { url: payload.url } : undefined,
          android: { priority: 'high' },
        });
        delivered++;
        await this.fcmTokens.update(row.id, { lastUsedAt: new Date() });
      } catch (err) {
        const code = (err as { code?: string }).code;
        if (
          code === 'messaging/registration-token-not-registered' ||
          code === 'messaging/invalid-registration-token'
        ) {
          await this.fcmTokens.delete(row.id); // prune dead token
        } else {
          this.logger.error(
            `FCM send failed (${code ?? 'unknown'}): ${String(err)}`,
          );
        }
      }
    }
    return delivered;
  }

  private initFcm(): void {
    const serviceAccount = this.config.get('FIREBASE_SERVICE_ACCOUNT', {
      infer: true,
    });
    const gacPath = this.config.get('GOOGLE_APPLICATION_CREDENTIALS', {
      infer: true,
    });
    try {
      if (serviceAccount && serviceAccount !== '...') {
        if (getApps().length === 0) {
          initializeApp({
            credential: cert(JSON.parse(serviceAccount) as ServiceAccount),
          });
        }
        this.fcmEnabled = true;
      } else if (gacPath) {
        if (getApps().length === 0) {
          initializeApp({ credential: cert(gacPath) });
        }
        this.fcmEnabled = true;
      } else {
        this.logger.warn('FCM credentials unset — FCM notifications disabled');
        return;
      }
      this.logger.log('Firebase Admin initialized — FCM enabled');
    } catch (e) {
      this.logger.warn(
        `FCM init failed — FCM notifications disabled: ${String(e)}`,
      );
    }
  }
}
