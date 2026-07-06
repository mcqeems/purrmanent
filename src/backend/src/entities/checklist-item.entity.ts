import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cat } from './cat.entity';

export type KanbanStatus = 'todo' | 'progress' | 'done';
export type Board = 'daily' | 'phase';

@Entity('checklist_items')
export class ChecklistItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cat_id', type: 'int' })
  catId: number;

  @ManyToOne(() => Cat, (cat) => cat.checklistItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cat_id' })
  cat: Cat;

  @Column({ name: 'day_number', type: 'int' })
  dayNumber: number;

  @Column({ name: 'scheduled_date', type: 'date' })
  scheduledDate: string;

  @Column({ name: 'template_id', type: 'int', nullable: true })
  templateId: number | null;

  @Column({ name: 'is_custom', type: 'boolean', default: false })
  isCustom: boolean;

  // 'daily' | 'phase' discriminator
  @Column({ type: 'varchar', length: 10, default: 'daily' })
  board: Board;

  @Column({
    name: 'kanban_status',
    type: 'varchar',
    length: 10,
    default: 'todo',
  })
  kanbanStatus: KanbanStatus;

  @Column({ name: 'item_text', type: 'text' })
  itemText: string;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
