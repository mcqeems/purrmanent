import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('checklist_templates')
export class ChecklistTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20 })
  phase: string; // 'decompression' | 'routine' | 'home'

  @Column({ name: 'day_in_phase', type: 'int' })
  dayInPhase: number;

  @Column({ name: 'time_of_day', type: 'varchar', length: 10 })
  timeOfDay: string; // 'morning' | 'day' | 'evening'

  @Column({ type: 'varchar', length: 30 })
  category: string; // 'health' | 'mental' | 'interaction' | 'environment'

  // 'daily' (default) | 'phase' discriminator so the daily board and
  // the 90-day milestone board can be queried independently.
  @Column({ type: 'varchar', length: 10, default: 'daily' })
  board: string;

  @Column({ name: 'item_text', type: 'text' })
  itemText: string;

  @Column({ name: 'item_text_id', type: 'text', nullable: true })
  itemTextId: string | null;

  @Column({ name: 'order_index', type: 'int' })
  orderIndex: number;
}
