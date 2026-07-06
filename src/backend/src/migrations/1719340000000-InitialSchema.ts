import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Initial schema.
 *
 * Layout:
 *   1. pgvector extension (must precede the VECTOR column).
 *   2. better-auth tables (users, user_sessions, accounts, verifications) using
 *      integer ids (useNumberId) + camelCase columns (kysely default).
 *   3. App-domain tables, FK -> users(id) / cats(id).
 *   4. Indexes, incl. ivfflat for RAG.
 *
 * Plan decisions applied: checklist_items.board discriminator;
 * ai_coach_corpus.embedding VECTOR(384) for all-MiniLM-L6-v2.
 */
export class InitialSchema1719340000000 implements MigrationInterface {
  name = 'InitialSchema1719340000000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE EXTENSION IF NOT EXISTS vector`);

    // ---- better-auth: users ----
    await q.query(`
      CREATE TABLE "users" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL UNIQUE,
        "emailVerified" BOOLEAN NOT NULL DEFAULT false,
        "image" TEXT,
        "points" INTEGER NOT NULL DEFAULT 0,
        "timezone" TEXT NOT NULL DEFAULT 'Asia/Jakarta',
        "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
        "lastLoginAt" TIMESTAMPTZ,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
      )`);

    // ---- better-auth: user_sessions ----
    await q.query(`
      CREATE TABLE "user_sessions" (
        "id" SERIAL PRIMARY KEY,
        "expiresAt" TIMESTAMPTZ NOT NULL,
        "token" TEXT NOT NULL UNIQUE,
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
      )`);

    // ---- better-auth: accounts ----
    await q.query(`
      CREATE TABLE "accounts" (
        "id" SERIAL PRIMARY KEY,
        "accountId" TEXT NOT NULL,
        "providerId" TEXT NOT NULL,
        "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "accessToken" TEXT,
        "refreshToken" TEXT,
        "idToken" TEXT,
        "accessTokenExpiresAt" TIMESTAMPTZ,
        "refreshTokenExpiresAt" TIMESTAMPTZ,
        "scope" TEXT,
        "password" TEXT,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
      )`);

    // ---- better-auth: verifications ----
    await q.query(`
      CREATE TABLE "verifications" (
        "id" SERIAL PRIMARY KEY,
        "identifier" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "expiresAt" TIMESTAMPTZ NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
      )`);

    // ---- cats ----
    await q.query(`
      CREATE TABLE "cats" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "name" VARCHAR(100) NOT NULL,
        "age_months" INTEGER,
        "gender" VARCHAR(10),
        "breed" VARCHAR(100),
        "personality" VARCHAR(20),
        "adoption_date" DATE NOT NULL,
        "adoption_source" VARCHAR(50),
        "photo_url" TEXT,
        "shelter_code" VARCHAR(50),
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      )`);

    // ---- questionnaire_responses ----
    await q.query(`
      CREATE TABLE "questionnaire_responses" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER REFERENCES "users"("id") ON DELETE CASCADE,
        "cat_id" INTEGER REFERENCES "cats"("id") ON DELETE CASCADE,
        "cat_name" VARCHAR(100) NOT NULL,
        "cat_age_months" INTEGER,
        "cat_gender" VARCHAR(10),
        "cat_breed" VARCHAR(100),
        "adoption_source" VARCHAR(50),
        "shelter_code" VARCHAR(50),
        "cat_personality" VARCHAR(20),
        "adopter_experience" VARCHAR(20),
        "home_type" VARCHAR(30),
        "household_composition" VARCHAR(50),
        "concerns" JSONB,
        "other_concerns" TEXT,
        "generated_plan" JSONB,
        "submitted_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      )`);

    // ---- checklist_templates ----
    await q.query(`
      CREATE TABLE "checklist_templates" (
        "id" SERIAL PRIMARY KEY,
        "phase" VARCHAR(20) NOT NULL,
        "day_in_phase" INTEGER NOT NULL,
        "time_of_day" VARCHAR(10) NOT NULL,
        "category" VARCHAR(30) NOT NULL,
        "board" VARCHAR(10) NOT NULL DEFAULT 'daily',
        "item_text" TEXT NOT NULL,
        "item_text_id" TEXT,
        "order_index" INTEGER NOT NULL,
        UNIQUE ("phase", "day_in_phase", "time_of_day", "order_index")
      )`);

    // ---- checklist_items (board discriminator) ----
    await q.query(`
      CREATE TABLE "checklist_items" (
        "id" SERIAL PRIMARY KEY,
        "cat_id" INTEGER NOT NULL REFERENCES "cats"("id") ON DELETE CASCADE,
        "day_number" INTEGER NOT NULL,
        "scheduled_date" DATE NOT NULL,
        "template_id" INTEGER REFERENCES "checklist_templates"("id"),
        "is_custom" BOOLEAN NOT NULL DEFAULT false,
        "board" VARCHAR(10) NOT NULL DEFAULT 'daily',
        "kanban_status" VARCHAR(10) NOT NULL DEFAULT 'todo',
        "item_text" TEXT NOT NULL,
        "completed_at" TIMESTAMPTZ,
        "notes" TEXT,
        UNIQUE ("cat_id", "scheduled_date", "template_id")
      )`);

    // ---- crisis_scenarios ----
    await q.query(`
      CREATE TABLE "crisis_scenarios" (
        "id" SERIAL PRIMARY KEY,
        "scenario_key" VARCHAR(50) NOT NULL UNIQUE,
        "name" VARCHAR(100) NOT NULL,
        "icon" VARCHAR(10),
        "severity" VARCHAR(20),
        "triage_questions" JSONB,
        "protocol_steps" JSONB,
        "vet_referral_threshold" INTEGER,
        "protocol_data" JSONB
      )`);

    // ---- crisis_events ----
    await q.query(`
      CREATE TABLE "crisis_events" (
        "id" SERIAL PRIMARY KEY,
        "cat_id" INTEGER REFERENCES "cats"("id") ON DELETE CASCADE,
        "user_id" INTEGER REFERENCES "users"("id") ON DELETE CASCADE,
        "scenario_id" INTEGER REFERENCES "crisis_scenarios"("id"),
        "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "triage_answers" JSONB,
        "steps_completed" JSONB,
        "outcome" VARCHAR(50),
        "is_done" BOOLEAN,
        "reason_not_done" TEXT,
        "resolved_at" TIMESTAMPTZ,
        "duration_seconds" INTEGER
      )`);

    // ---- ai_coach_corpus (embedding handled raw) ----
    await q.query(`
      CREATE TABLE "ai_coach_corpus" (
        "id" SERIAL PRIMARY KEY,
        "chunk_text" TEXT NOT NULL,
        "source" VARCHAR(100),
        "source_url" TEXT,
        "topic" VARCHAR(50),
        "language" VARCHAR(5) DEFAULT 'en',
        "embedding" VECTOR(384)
      )`);

    // ---- ai_coach_conversations ----
    await q.query(`
      CREATE TABLE "ai_coach_conversations" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER REFERENCES "users"("id"),
        "cat_id" INTEGER REFERENCES "cats"("id"),
        "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "last_message_at" TIMESTAMPTZ
      )`);

    // ---- ai_coach_messages ----
    await q.query(`
      CREATE TABLE "ai_coach_messages" (
        "id" SERIAL PRIMARY KEY,
        "conversation_id" INTEGER REFERENCES "ai_coach_conversations"("id") ON DELETE CASCADE,
        "role" VARCHAR(20) NOT NULL,
        "content" TEXT NOT NULL,
        "retrieved_chunks" JSONB,
        "sources" JSONB,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      )`);

    // ---- health_records ----
    await q.query(`
      CREATE TABLE "health_records" (
        "id" SERIAL PRIMARY KEY,
        "cat_id" INTEGER NOT NULL REFERENCES "cats"("id") ON DELETE CASCADE,
        "record_type" VARCHAR(30) NOT NULL,
        "record_data" JSONB NOT NULL,
        "recorded_at" DATE NOT NULL,
        "next_due_date" DATE,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      )`);

    // ---- user_badges ----
    await q.query(`
      CREATE TABLE "user_badges" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER REFERENCES "users"("id"),
        "cat_id" INTEGER REFERENCES "cats"("id"),
        "badge_key" VARCHAR(50) NOT NULL,
        "earned_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE ("user_id", "cat_id", "badge_key")
      )`);

    // ---- graduation_certificates ----
    await q.query(`
      CREATE TABLE "graduation_certificates" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER REFERENCES "users"("id"),
        "cat_id" INTEGER REFERENCES "cats"("id"),
        "certificate_data" JSONB,
        "issued_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "shared_count" INTEGER NOT NULL DEFAULT 0,
        UNIQUE ("user_id", "cat_id")
      )`);

    // ---- push_subscriptions ----
    await q.query(`
      CREATE TABLE "push_subscriptions" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "endpoint" TEXT NOT NULL,
        "p256dh_key" TEXT NOT NULL,
        "auth_key" TEXT NOT NULL,
        "user_agent" TEXT,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "last_used_at" TIMESTAMPTZ,
        UNIQUE ("user_id", "endpoint")
      )`);

    // ---- notification_log ----
    await q.query(`
      CREATE TABLE "notification_log" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER REFERENCES "users"("id"),
        "notification_type" VARCHAR(50),
        "sent_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "delivered" BOOLEAN,
        "clicked" BOOLEAN NOT NULL DEFAULT false
      )`);

    // ---- indexes ----
    await q.query(
      `CREATE INDEX "idx_checklist_items_cat_date" ON "checklist_items" ("cat_id", "scheduled_date")`,
    );
    await q.query(
      `CREATE INDEX "idx_cats_user_active" ON "cats" ("user_id", "is_active")`,
    );
    await q.query(
      `CREATE INDEX "idx_health_records_cat" ON "health_records" ("cat_id", "recorded_at" DESC)`,
    );
    await q.query(
      `CREATE INDEX "idx_crisis_events_cat" ON "crisis_events" ("cat_id", "started_at" DESC)`,
    );
    await q.query(
      `CREATE INDEX "idx_ai_coach_messages_conv" ON "ai_coach_messages" ("conversation_id", "created_at")`,
    );
    await q.query(
      `CREATE INDEX "idx_ai_coach_corpus_embedding" ON "ai_coach_corpus" USING ivfflat ("embedding" vector_cosine_ops) WITH (lists = 100)`,
    );
    await q.query(`CREATE INDEX "idx_users_email" ON "users" ("email")`);
    await q.query(
      `CREATE INDEX "idx_user_sessions_token" ON "user_sessions" ("token")`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    for (const t of [
      'notification_log',
      'push_subscriptions',
      'graduation_certificates',
      'user_badges',
      'health_records',
      'ai_coach_messages',
      'ai_coach_conversations',
      'ai_coach_corpus',
      'crisis_events',
      'crisis_scenarios',
      'checklist_items',
      'checklist_templates',
      'questionnaire_responses',
      'cats',
      'verifications',
      'accounts',
      'user_sessions',
      'users',
    ]) {
      await q.query(`DROP TABLE IF EXISTS "${t}" CASCADE`);
    }
  }
}
