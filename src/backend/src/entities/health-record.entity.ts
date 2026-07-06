import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('health_records')
export class HealthRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cat_id', type: 'int' })
  catId: number;

  @Column({ name: 'record_type', type: 'varchar', length: 30 })
  recordType: string; // 'vaccination'|'deworming'|'vet_visit'|'weight'|'note'

  @Column({ name: 'record_data', type: 'jsonb' })
  recordData: Record<string, unknown>;

  @Column({ name: 'recorded_at', type: 'date' })
  recordedAt: string;

  @Column({ name: 'next_due_date', type: 'date', nullable: true })
  nextDueDate: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
