import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { Cat, HealthRecord } from '../../entities';
import { CatsService } from '../cats/cats.service';
import {
  CreateHealthRecordInput,
  UpdateHealthRecordInput,
} from './health.schema';

export interface DueRecord {
  recordId: number;
  catId: number;
  catName: string;
  userId: number;
  recordType: string;
  nextDueDate: string;
}

@Injectable()
export class HealthService {
  constructor(
    @InjectRepository(HealthRecord)
    private readonly records: Repository<HealthRecord>,
    @InjectRepository(Cat)
    private readonly cats: Repository<Cat>,
    private readonly catsService: CatsService,
  ) {}

  /** Reverse-chronological timeline for a cat (ownership-checked). */
  async timeline(userId: number, catId: number): Promise<HealthRecord[]> {
    await this.catsService.findOneForUser(userId, catId);
    return this.records.find({
      where: { catId },
      order: { recordedAt: 'DESC', id: 'DESC' },
    });
  }

  async create(
    userId: number,
    dto: CreateHealthRecordInput,
  ): Promise<HealthRecord> {
    await this.catsService.findOneForUser(userId, dto.catId);
    return this.records.save(
      this.records.create({
        catId: dto.catId,
        recordType: dto.recordType,
        recordData: dto.recordData,
        recordedAt: dto.recordedAt,
        nextDueDate: dto.nextDueDate ?? null,
      }),
    );
  }

  private async ownedRecord(userId: number, id: number): Promise<HealthRecord> {
    // Scoped lookup: join health record with cat ownership in a single query
    // to prevent existence oracle. Returns null if record doesn't exist OR
    // if the record's cat is not owned by userId.
    const record = await this.records
      .createQueryBuilder('r')
      .innerJoin(Cat, 'c', 'c.id = r.cat_id')
      .where('r.id = :id', { id })
      .andWhere('c.user_id = :userId', { userId })
      .getOne();
    
    if (!record) throw new NotFoundException('Health record not found');
    return record;
  }

  async update(
    userId: number,
    id: number,
    dto: UpdateHealthRecordInput,
  ): Promise<HealthRecord> {
    const record = await this.ownedRecord(userId, id);
    if (dto.recordData) record.recordData = dto.recordData;
    if (dto.recordedAt) record.recordedAt = dto.recordedAt;
    if (dto.nextDueDate !== undefined) record.nextDueDate = dto.nextDueDate;
    return this.records.save(record);
  }

  async remove(userId: number, id: number): Promise<{ success: true }> {
    const record = await this.ownedRecord(userId, id);
    await this.records.delete(record.id);
    return { success: true };
  }

  /**
   * Upcoming due records across the user's OWN cats only (anti-IDOR — unlike
   * findDue, which is the cross-user cron query). Defaults to the next 30 days.
   */
  async upcomingForUser(
    userId: number,
    withinDays = 30,
  ): Promise<HealthRecord[]> {
    const cats = await this.catsService.findAllForUser(userId);
    if (cats.length === 0) return [];
    const today = new Date().toISOString().slice(0, 10);
    const to = new Date(Date.now() + withinDays * 86_400_000)
      .toISOString()
      .slice(0, 10);
    return this.records.find({
      where: {
        catId: In(cats.map((c) => c.id)),
        nextDueDate: Between(today, to),
      },
      order: { nextDueDate: 'ASC' },
    });
  }

  /**
   * Records whose next_due_date falls within [from, to] inclusive — used by the
   * reminder cron (fire 3 days before and on the due date).
   */
  async findDue(from: string, to: string): Promise<DueRecord[]> {
    const rows = await this.records
      .createQueryBuilder('r')
      .innerJoin(Cat, 'c', 'c.id = r.cat_id')
      .where('r.next_due_date BETWEEN :from AND :to', { from, to })
      .andWhere('c.is_active = true')
      .select('r.id', 'recordId')
      .addSelect('r.cat_id', 'catId')
      .addSelect('c.name', 'catName')
      .addSelect('c.user_id', 'userId')
      .addSelect('r.record_type', 'recordType')
      .addSelect('r.next_due_date', 'nextDueDate')
      .getRawMany<DueRecord>();
    return rows;
  }
}
