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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    AuthModule,
    CatsModule,
    OnboardingModule,
    ChecklistModule,
    GamificationModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
