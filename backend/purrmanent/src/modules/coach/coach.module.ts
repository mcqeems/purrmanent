import { Module } from '@nestjs/common';
import { CoachService } from './coach.service';
import { CoachController } from './coach.controller';
import { CoachToolsService } from './coach-tools.service';
import { EmbeddingsService } from '../../common/embeddings/embeddings';
import { CatsModule } from '../cats/cats.module';

@Module({
  imports: [CatsModule],
  controllers: [CoachController],
  providers: [CoachService, CoachToolsService, EmbeddingsService],
  exports: [CoachToolsService, EmbeddingsService],
})
export class CoachModule {}
