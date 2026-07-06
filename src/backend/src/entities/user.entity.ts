import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cat } from './cat.entity';

/**
 * Maps the better-auth `users` table (created with useNumberId => integer id).
 * Auth-owned columns are camelCase (better-auth/kysely default) and must be
 * double-quoted in raw SQL. App-specific columns (points, timezone,
 * preferredLanguage, lastLoginAt) are declared as better-auth additionalFields.
 *
 * ponytail: better-auth owns inserts/updates to identity columns; the app only
 * reads them and mutates app-specific fields (e.g. points). Treat name/email/
 * emailVerified as auth-managed.
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', unique: true })
  email: string;

  @Column({ name: 'emailVerified', type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'text', nullable: true })
  image: string | null;

  @Column({ type: 'int', default: 0 })
  points: number;

  @Column({ type: 'text', default: 'Asia/Jakarta' })
  timezone: string;

  @Column({ name: 'preferredLanguage', type: 'text', default: 'en' })
  preferredLanguage: string;

  @CreateDateColumn({ name: 'createdAt', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'lastLoginAt', type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;

  @Column({ name: 'login_streak', type: 'int', default: 0 })
  loginStreak: number;

  @Column({ name: 'last_active_date', type: 'date', nullable: true })
  lastActiveDate: string | null;

  @OneToMany(() => Cat, (cat) => cat.user)
  cats: Cat[];
}
