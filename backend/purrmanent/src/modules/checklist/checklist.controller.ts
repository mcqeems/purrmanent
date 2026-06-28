import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ChecklistService } from './checklist.service';
import { CustomTodoDto, MoveItemDto } from './checklist.schema';
import { CurrentUser } from '../auth/auth.decorators';

@Controller('checklist')
export class ChecklistController {
  constructor(private readonly checklist: ChecklistService) {}

  // user is derived from the session, never trusted from the query (§18).
  @Get('global')
  global(@CurrentUser('id') userId: number) {
    return this.checklist.getGlobal(userId);
  }

  @Get('graduation')
  graduation(@CurrentUser('id') userId: number) {
    return this.checklist.graduationStatus(userId);
  }

  @Get('today')
  today(
    @CurrentUser('id') userId: number,
    @Query('cat_id', ParseIntPipe) catId: number,
  ) {
    return this.checklist.getToday(userId, catId);
  }

  @Get('phase')
  phase(
    @CurrentUser('id') userId: number,
    @Query('cat_id', ParseIntPipe) catId: number,
  ) {
    return this.checklist.getPhase(userId, catId);
  }

  @Post('custom')
  custom(@CurrentUser('id') userId: number, @Body() dto: CustomTodoDto) {
    return this.checklist.addCustom(userId, dto);
  }

  @Put('move')
  move(@CurrentUser('id') userId: number, @Body() dto: MoveItemDto) {
    return this.checklist.move(userId, dto);
  }
}
