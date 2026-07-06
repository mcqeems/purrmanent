import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { CatsService } from './cats.service';
import { CreateCatDto, UpdateCatDto } from './cat.schema';
import { CurrentUser } from '../auth/auth.decorators';

@Controller('cats')
export class CatsController {
  constructor(private readonly cats: CatsService) {}

  @Get()
  list(@CurrentUser('id') userId: number) {
    return this.cats.findAllForUser(userId);
  }

  @Post()
  create(@CurrentUser('id') userId: number, @Body() dto: CreateCatDto) {
    return this.cats.create(userId, dto);
  }

  @Get(':id')
  get(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cats.findOneForUser(userId, id);
  }

  @Put(':id')
  update(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCatDto,
  ) {
    return this.cats.update(userId, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cats.remove(userId, id);
  }
}
