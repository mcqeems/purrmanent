import { Module } from '@nestjs/common';
import { ChecklistService } from './checklist.service';
import { ChecklistController } from './checklist.controller';
import { ChecklistGenerationService } from './checklist-generation.service';
import { ChecklistCronService } from './checklist-cron.service';
import { CatsModule } from '../cats/cats.module';

@Module({
  imports: [CatsModule],
  controllers: [ChecklistController],
  providers: [
    ChecklistService,
    ChecklistGenerationService,
    ChecklistCronService,
  ],
  exports: [ChecklistService, ChecklistGenerationService],
})
export class ChecklistModule {}
