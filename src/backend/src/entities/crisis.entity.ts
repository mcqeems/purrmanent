import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('crisis_scenarios')
export class CrisisScenario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'scenario_key', type: 'varchar', length: 50, unique: true })
  scenarioKey: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  icon: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  severity: string | null;

  @Column({ name: 'triage_questions', type: 'jsonb', nullable: true })
  triageQuestions: unknown;

  @Column({ name: 'protocol_steps', type: 'jsonb', nullable: true })
  protocolSteps: unknown;

  @Column({ name: 'vet_referral_threshold', type: 'int', nullable: true })
  vetReferralThreshold: number | null;

  // full parsed slide dataset { slides: [{ title, markdown, todos[] }] }
  @Column({ name: 'protocol_data', type: 'jsonb', nullable: true })
  protocolData: unknown;
}

@Entity('crisis_events')
export class CrisisEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cat_id', type: 'int' })
  catId: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'scenario_id', type: 'int', nullable: true })
  scenarioId: number | null;

  @CreateDateColumn({ name: 'started_at', type: 'timestamptz' })
  startedAt: Date;

  @Column({ name: 'triage_answers', type: 'jsonb', nullable: true })
  triageAnswers: unknown;

  @Column({ name: 'steps_completed', type: 'jsonb', nullable: true })
  stepsCompleted: unknown;

  @Column({ type: 'varchar', length: 50, nullable: true })
  outcome: string | null; // 'resolved' | 'partial' | 'vet_referred'

  @Column({ name: 'is_done', type: 'boolean', nullable: true })
  isDone: boolean | null;

  @Column({ name: 'reason_not_done', type: 'text', nullable: true })
  reasonNotDone: string | null;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt: Date | null;

  @Column({ name: 'duration_seconds', type: 'int', nullable: true })
  durationSeconds: number | null;
}
