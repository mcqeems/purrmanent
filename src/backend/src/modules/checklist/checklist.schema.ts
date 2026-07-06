import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const KANBAN_STATUSES = ['todo', 'progress', 'done'] as const;

export const customTodoSchema = z.object({
  catId: z.number().int().positive(),
  itemText: z.string().min(1).max(500),
  board: z.enum(['daily', 'phase']).default('daily'),
});

export const moveItemSchema = z.object({
  itemId: z.number().int().positive(),
  newStatus: z.enum(KANBAN_STATUSES),
});

export class CustomTodoDto extends createZodDto(customTodoSchema) {}
export class MoveItemDto extends createZodDto(moveItemSchema) {}
