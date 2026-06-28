import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { validateEnv } from './config/env';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { CatsModule } from './modules/cats/cats.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { ChecklistModule } from './modules/checklist/checklist.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { CrisisModule } from './modules/crisis/crisis.module';
import { CoachModule } from './modules/coach/coach.module';
import { HealthModule } from './modules/health/health.module';
import { NotificationModule } from './modules/notification/notification.module';
import { DemoModule } from './modules/demo/demo.module';
import { LlmModule } from './common/llm/llm.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    // Global rate limit (plan §11/§8.4). Default 120 req/min per IP; sensitive
    // routes override via @Throttle. Auth routes are rate-limited by
    // better-auth itself (they bypass Nest guards — mounted on express).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    DatabaseModule,
    LlmModule,
    AuthModule,
    CatsModule,
    OnboardingModule,
    ChecklistModule,
    GamificationModule,
    CrisisModule,
    CoachModule,
    NotificationModule,
    HealthModule,
    DemoModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
