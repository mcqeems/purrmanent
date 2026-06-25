import { User } from './user.entity';
import { Cat, QuestionnaireResponse } from './cat.entity';
import { ChecklistTemplate } from './checklist-template.entity';
import { ChecklistItem } from './checklist-item.entity';
import { CrisisScenario, CrisisEvent } from './crisis.entity';
import {
  AiCoachConversation,
  AiCoachMessage,
  AiCoachCorpus,
} from './coach.entity';
import { HealthRecord } from './health-record.entity';
import { UserBadge, GraduationCertificate } from './gamification.entity';
import { PushSubscription, NotificationLog } from './notification.entity';

export * from './user.entity';
export * from './cat.entity';
export * from './checklist-template.entity';
export * from './checklist-item.entity';
export * from './crisis.entity';
export * from './coach.entity';
export * from './health-record.entity';
export * from './gamification.entity';
export * from './notification.entity';

/** All entities, registered with TypeORM in one place. */
export const entities = [
  User,
  Cat,
  QuestionnaireResponse,
  ChecklistTemplate,
  ChecklistItem,
  CrisisScenario,
  CrisisEvent,
  AiCoachConversation,
  AiCoachMessage,
  AiCoachCorpus,
  HealthRecord,
  UserBadge,
  GraduationCertificate,
  PushSubscription,
  NotificationLog,
];
