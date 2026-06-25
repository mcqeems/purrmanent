import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ChecklistItem } from './checklist-item.entity';

@Entity('cats')
export class Cat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @ManyToOne(() => User, (user) => user.cats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'age_months', type: 'int', nullable: true })
  ageMonths: number | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  gender: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  breed: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  personality: string | null;

  @Column({ name: 'adoption_date', type: 'date' })
  adoptionDate: string;

  @Column({ name: 'adoption_source', type: 'varchar', length: 50, nullable: true })
  adoptionSource: string | null;

  @Column({ name: 'photo_url', type: 'text', nullable: true })
  photoUrl: string | null;

  @Column({ name: 'shelter_code', type: 'varchar', length: 50, nullable: true })
  shelterCode: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => ChecklistItem, (item) => item.cat)
  checklistItems: ChecklistItem[];
}

@Entity('questionnaire_responses')
export class QuestionnaireResponse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'cat_id', type: 'int' })
  catId: number;

  @Column({ name: 'cat_name', type: 'varchar', length: 100 })
  catName: string;

  @Column({ name: 'cat_age_months', type: 'int', nullable: true })
  catAgeMonths: number | null;

  @Column({ name: 'cat_gender', type: 'varchar', length: 10, nullable: true })
  catGender: string | null;

  @Column({ name: 'cat_breed', type: 'varchar', length: 100, nullable: true })
  catBreed: string | null;

  @Column({ name: 'adoption_source', type: 'varchar', length: 50, nullable: true })
  adoptionSource: string | null;

  @Column({ name: 'shelter_code', type: 'varchar', length: 50, nullable: true })
  shelterCode: string | null;

  @Column({ name: 'cat_personality', type: 'varchar', length: 20, nullable: true })
  catPersonality: string | null;

  @Column({ name: 'adopter_experience', type: 'varchar', length: 20, nullable: true })
  adopterExperience: string | null;

  @Column({ name: 'home_type', type: 'varchar', length: 30, nullable: true })
  homeType: string | null;

  @Column({ name: 'household_composition', type: 'varchar', length: 50, nullable: true })
  householdComposition: string | null;

  @Column({ type: 'jsonb', nullable: true })
  concerns: unknown;

  @Column({ name: 'other_concerns', type: 'text', nullable: true })
  otherConcerns: string | null;

  @Column({ name: 'generated_plan', type: 'jsonb', nullable: true })
  generatedPlan: unknown;

  @CreateDateColumn({ name: 'submitted_at', type: 'timestamptz' })
  submittedAt: Date;
}
