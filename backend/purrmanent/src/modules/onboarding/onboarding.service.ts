import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  Cat,
  ChecklistItem,
  ChecklistTemplate,
  QuestionnaireResponse,
  User,
} from '../../entities';
import { QuestionnaireDto } from './onboarding.schema';
import { generatePlan, phaseForDay } from '../../common/plan/plan';

export interface OnboardingResult {
  catId: number;
  planSummary: ReturnType<typeof generatePlan>;
  redirectTo: string;
}

@Injectable()
export class OnboardingService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Single atomic transaction: create Cat -> QuestionnaireResponse
   * (with generated_plan) -> run rule-based generatePlan -> seed Day-1 daily
   * checklist items from templates. Rolls back entirely on any failure.
   */
  async submit(
    userId: number,
    dto: QuestionnaireDto,
  ): Promise<OnboardingResult> {
    return this.dataSource.transaction(async (em) => {
      const plan = generatePlan({
        catPersonality: dto.catPersonality,
        adopterExperience: dto.adopterExperience,
      });

      const cat = await em.save(
        em.create(Cat, {
          userId,
          name: dto.catName,
          ageMonths: dto.catAgeMonths ?? null,
          gender: dto.catGender ?? null,
          breed: dto.catBreed ?? null,
          personality: dto.catPersonality,
          adoptionDate: dto.adoptionDate,
          adoptionSource: dto.adoptionSource,
          shelterCode: dto.shelterCode ?? null,
        }),
      );

      await em.save(
        em.create(QuestionnaireResponse, {
          userId,
          catId: cat.id,
          catName: dto.catName,
          catAgeMonths: dto.catAgeMonths ?? null,
          catGender: dto.catGender ?? null,
          catBreed: dto.catBreed ?? null,
          adoptionSource: dto.adoptionSource,
          shelterCode: dto.shelterCode ?? null,
          catPersonality: dto.catPersonality,
          adopterExperience: dto.adopterExperience,
          homeType: dto.homeType ?? null,
          householdComposition: dto.householdComposition ?? null,
          concerns: dto.concerns ?? null,
          otherConcerns: dto.otherConcerns ?? null,
          generatedPlan: plan,
        }),
      );

      // Persist timezone/locale on the user (drives crons + Copilot language).
      if (dto.timezone || dto.preferredLanguage) {
        await em.update(User, userId, {
          ...(dto.timezone ? { timezone: dto.timezone } : {}),
          ...(dto.preferredLanguage
            ? { preferredLanguage: dto.preferredLanguage }
            : {}),
        });
      }

      // Seed Day-1 daily items from templates for the resolved phase.
      const phase = phaseForDay(1, plan.decompressionDays);
      const templates = await em.find(ChecklistTemplate, {
        where: { phase, dayInPhase: 1, board: 'daily' },
        order: { orderIndex: 'ASC' },
      });
      const today = new Date().toISOString().slice(0, 10);
      if (templates.length > 0) {
        await em.save(
          templates.map((t) =>
            em.create(ChecklistItem, {
              catId: cat.id,
              dayNumber: 1,
              scheduledDate: today,
              templateId: t.id,
              isCustom: false,
              board: 'daily',
              kanbanStatus: 'todo',
              itemText: t.itemText,
            }),
          ),
        );
      }

      return {
        catId: cat.id,
        planSummary: plan,
        redirectTo: '/today',
      };
    });
  }
}
