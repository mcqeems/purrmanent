import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { HealthService } from './health.service';
import { CreateHealthRecordDto, UpdateHealthRecordDto } from './health.schema';
import { CurrentUser } from '../auth/auth.decorators';

@Controller('health')
export class HealthLogController {
  constructor(private readonly health: HealthService) {}

  @Get('timeline')
  timeline(
    @CurrentUser('id') userId: number,
    @Query('cat_id', ParseIntPipe) catId: number,
  ) {
    return this.health.timeline(userId, catId);
  }

  @Post('record')
  create(
    @CurrentUser('id') userId: number,
    @Body() dto: CreateHealthRecordDto,
  ) {
    return this.health.create(userId, dto);
  }

  @Put('record/:id')
  update(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHealthRecordDto,
  ) {
    return this.health.update(userId, id, dto);
  }

  @Delete('record/:id')
  remove(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.health.remove(userId, id);
  }
}
