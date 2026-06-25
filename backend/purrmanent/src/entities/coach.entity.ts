import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('ai_coach_conversations')
export class AiCoachConversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'cat_id', type: 'int', nullable: true })
  catId: number | null;

  @CreateDateColumn({ name: 'started_at', type: 'timestamptz' })
  startedAt: Date;

  @Column({ name: 'last_message_at', type: 'timestamptz', nullable: true })
  lastMessageAt: Date | null;
}

@Entity('ai_coach_messages')
export class AiCoachMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'conversation_id', type: 'int' })
  conversationId: number;

  @Column({ type: 'varchar', length: 20 })
  role: string; // 'user' | 'assistant' | 'system'

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'retrieved_chunks', type: 'jsonb', nullable: true })
  retrievedChunks: unknown;

  @Column({ type: 'jsonb', nullable: true })
  sources: unknown;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}

/**
 * Corpus rows. The `embedding VECTOR(384)` column is intentionally NOT mapped
 * here (plan §3.3): TypeORM has no native vector type. All embedding writes and
 * similarity search go through the raw-SQL CorpusRepository.
 */
@Entity('ai_coach_corpus')
export class AiCoachCorpus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'chunk_text', type: 'text' })
  chunkText: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  source: string | null;

  @Column({ name: 'source_url', type: 'text', nullable: true })
  sourceUrl: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  topic: string | null;

  @Column({ type: 'varchar', length: 5, default: 'en' })
  language: string;
}
