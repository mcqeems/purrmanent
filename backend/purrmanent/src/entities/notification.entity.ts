import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('push_subscriptions')
@Unique(['userId', 'endpoint'])
export class PushSubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ type: 'text' })
  endpoint: string;

  @Column({ name: 'p256dh_key', type: 'text' })
  p256dhKey: string;

  @Column({ name: 'auth_key', type: 'text' })
  authKey: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Column({ name: 'last_used_at', type: 'timestamptz', nullable: true })
  lastUsedAt: Date | null;
}

@Entity('notification_log')
export class NotificationLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'notification_type', type: 'varchar', length: 50, nullable: true })
  notificationType: string | null;

  @CreateDateColumn({ name: 'sent_at', type: 'timestamptz' })
  sentAt: Date;

  @Column({ type: 'boolean', nullable: true })
  delivered: boolean | null;

  @Column({ type: 'boolean', default: false })
  clicked: boolean;
}
