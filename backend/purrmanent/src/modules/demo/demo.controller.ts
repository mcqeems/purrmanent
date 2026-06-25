import { Controller, Get, Query } from '@nestjs/common';
import { DemoService } from './demo.service';
import { Public } from '../auth/auth.decorators';

@Controller('demo')
export class DemoController {
  constructor(private readonly demo: DemoService) {}

  @Public()
  @Get('prefill')
  prefill(@Query('code') code: string) {
    return this.demo.prefill(code);
  }
}
