import { Body, Controller, Post } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { QuestionnaireDto } from './onboarding.schema';
import { CurrentUser } from '../auth/auth.decorators';

/**
 * Onboarding submission endpoint. Protected by global CsrfGuard (requires
 * X-Requested-With header) and AuthGuard (requires authenticated session).
 */
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboarding: OnboardingService) {}

  @Post('submit')
  submit(@CurrentUser('id') userId: number, @Body() dto: QuestionnaireDto) {
    return this.onboarding.submit(userId, dto);
  }
}
