import { Module } from '@nestjs/common';
import { CoachService } from './coach.service';
import { CoachController } from './coach.controller';
import { CoachToolsService } from './coach-tools.service';
import { CoachActionsService } from './coach-actions.service';
import { EmbeddingsService } from '../../common/embeddings/embeddings';
import { CatsModule } from '../cats/cats.module';
import { ChecklistModule } from '../checklist/checklist.module';
import { HealthModule } from '../health/health.module';
import { GamificationModule } from '../gamification/gamification.module';
import { CrisisModule } from '../crisis/crisis.module';

@Module({
  imports: [
    CatsModule,
    ChecklistModule,
    HealthModule,
    GamificationModule,
    CrisisModule,
  ],
  controllers: [CoachController],
  providers: [
    CoachService,
    CoachToolsService,
    CoachActionsService,
    EmbeddingsService,
  ],
  exports: [CoachToolsService, EmbeddingsService],
})
export class CoachModule {}
