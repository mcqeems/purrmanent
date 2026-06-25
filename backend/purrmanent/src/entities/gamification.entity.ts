import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('user_badges')
@Unique(['userId', 'catId', 'badgeKey'])
export class UserBadge {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'cat_id', type: 'int', nullable: true })
  catId: number | null;

  @Column({ name: 'badge_key', type: 'varchar', length: 50 })
  badgeKey: string;

  @CreateDateColumn({ name: 'earned_at', type: 'timestamptz' })
  earnedAt: Date;
}

@Entity('graduation_certificates')
@Unique(['userId', 'catId'])
export class GraduationCertificate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'cat_id', type: 'int' })
  catId: number;

  @Column({ name: 'certificate_data', type: 'jsonb', nullable: true })
  certificateData: unknown;

  @CreateDateColumn({ name: 'issued_at', type: 'timestamptz' })
  issuedAt: Date;

  @Column({ name: 'shared_count', type: 'int', default: 0 })
  sharedCount: number;
}
