import { Controller, Get, Post } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { CurrentUser } from '../auth/auth.decorators';

@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamification: GamificationService) {}

  @Get('status')
  status(@CurrentUser('id') userId: number) {
    return this.gamification.getStatus(userId);
  }

  @Post('check-in')
  checkIn(@CurrentUser('id') userId: number) {
    return this.gamification.checkIn(userId);
  }
}
