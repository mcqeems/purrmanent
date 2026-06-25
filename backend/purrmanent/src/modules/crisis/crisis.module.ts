import { Module } from '@nestjs/common';
import { CrisisService } from './crisis.service';
import { CrisisController } from './crisis.controller';
import { CrisisAiService } from './crisis-ai.service';
import { CatsModule } from '../cats/cats.module';

@Module({
  imports: [CatsModule],
  controllers: [CrisisController],
  providers: [CrisisService, CrisisAiService],
  exports: [CrisisService],
})
export class CrisisModule {}
