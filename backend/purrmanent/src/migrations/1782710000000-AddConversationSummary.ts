import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConversationSummary1782710000000 implements MigrationInterface {
  name = 'AddConversationSummary1782710000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ai_coach_conversations" ADD COLUMN IF NOT EXISTS "summary" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ai_coach_conversations" DROP COLUMN IF EXISTS "summary"`,
    );
  }
}
