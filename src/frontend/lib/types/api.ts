// API entity types — mirror the backend entities / OpenAPI DTOs
// (backend-api-docs.json + BACKEND_IMPLEMENTATION.md). Source of truth = backend.

export type Gender = 'male' | 'female' | 'unknown';
export type Personality = 'shy' | 'balanced' | 'active' | 'aggressive';
export type AdoptionSource = 'shelter' | 'self' | 'rescue';
export type KanbanStatus = 'todo' | 'progress' | 'done';
export type ChecklistBoard = 'daily' | 'phase';
export type HealthRecordType =
  'vaccination' | 'deworming' | 'vet_visit' | 'weight' | 'note';

export interface SessionUser {
  id: number;
  email: string;
  name: string;
  emailVerified: boolean;
  image?: string | null;
  role?: string;
  points?: number;
  preferredLanguage?: string;
}

export interface Cat {
  id: number;
  userId: number;
  name: string;
  ageMonths: number | null;
  gender: Gender | null;
  breed: string | null;
  personality: Personality;
  adoptionDate: string;
  adoptionSource: AdoptionSource;
  shelterCode: string | null;
  photoUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface ChecklistItem {
  id: number;
  catId: number;
  dayNumber: number;
  scheduledDate: string | null;
  board: ChecklistBoard;
  kanbanStatus: KanbanStatus;
  itemText: string;
  isCustom: boolean;
  completedAt: string | null;
}

export interface CatBoardSummary {
  catId: number;
  name: string;
  todo: number;
  progress: number;
  done: number;
}

export interface GraduationStatus {
  catId: number;
  name: string;
  daysElapsed: number;
  qualifyingDays: number;
  missedDays: number;
  requiredDays: number;
  graduated: boolean;
  graduationDate?: string;
}

export interface MoveResult {
  success: true;
  pointsAdded: number;
}

export interface GamificationStatus {
  points: number;
  streak: number;
}

export interface HealthRecord {
  id: number;
  catId: number;
  recordType: HealthRecordType;
  recordData: Record<string, unknown>;
  recordedAt: string;
  nextDueDate: string | null;
  createdAt?: string;
}

export interface CrisisSlide {
  title: string;
  markdown: string;
  todos: string[];
}

export interface CrisisIdentifyResult {
  eventId: number;
  source: 'rule' | 'ai';
  scenarioKey: string | null;
  slides: CrisisSlide[];
}

/** Coach SSE event payloads (POST /api/coach/chat). */
export interface CoachSource {
  source: string | null;
  url: string | null;
}

export interface PendingAction {
  actionName: string;
  args: Record<string, unknown>;
  toolCallId: string;
}

export interface ConfirmActionResult {
  ok: boolean;
  action: string;
  result?: unknown;
  error?: string;
  message: string;
}

export interface CoachConversation {
  id: number;
  userId: number;
  catId: number | null;
  startedAt: string;
  lastMessageAt: string | null;
}

export interface CoachStoredMessage {
  id: number;
  conversationId: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: unknown;
  createdAt: string;
}
