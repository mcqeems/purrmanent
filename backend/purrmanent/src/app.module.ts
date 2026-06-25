import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { validateEnv } from './config/env';
import { HealthController } from './common/health/health.controller';
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
import { LlmModule } from './common/llm/llm.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
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
  ],
  controllers: [HealthController],
})
export class AppModule {}
