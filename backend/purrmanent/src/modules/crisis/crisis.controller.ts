import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CrisisService } from './crisis.service';
import {
  IdentifyCrisisDto,
  CrisisStepDto,
  ResolveCrisisDto,
} from './crisis.schema';
import { CurrentUser } from '../auth/auth.decorators';

@Controller('crisis')
export class CrisisController {
  constructor(private readonly crisis: CrisisService) {}

  @Post('identify')
  identify(@CurrentUser('id') userId: number, @Body() dto: IdentifyCrisisDto) {
    return this.crisis.identify(userId, dto);
  }

  @Get('protocol/:id')
  protocol(@Param('id', ParseIntPipe) id: number) {
    return this.crisis.getProtocol(id);
  }

  @Post('step')
  step(@CurrentUser('id') userId: number, @Body() dto: CrisisStepDto) {
    return this.crisis.step(userId, dto);
  }

  @Post('resolve')
  resolve(@CurrentUser('id') userId: number, @Body() dto: ResolveCrisisDto) {
    return this.crisis.resolve(userId, dto);
  }
}
