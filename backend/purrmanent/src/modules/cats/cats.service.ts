import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cat } from '../../entities';
import { CreateCatDto, UpdateCatDto } from './cat.schema';

/**
 * Every method is scoped to the owning user (plan §9, §18 — no IDOR).
 * The ownership check lives here in the service, not just the controller.
 */
@Injectable()
export class CatsService {
  constructor(@InjectRepository(Cat) private readonly cats: Repository<Cat>) {}

  findAllForUser(userId: number): Promise<Cat[]> {
    return this.cats.find({
      where: { userId, isActive: true },
      order: { createdAt: 'ASC' },
    });
  }

  async findOneForUser(userId: number, id: number): Promise<Cat> {
    const cat = await this.cats.findOne({ where: { id, userId } });
    if (!cat) throw new NotFoundException('Cat not found');
    return cat;
  }

  create(userId: number, dto: CreateCatDto): Promise<Cat> {
    const cat = this.cats.create({
      userId,
      name: dto.name,
      ageMonths: dto.ageMonths ?? null,
      gender: dto.gender ?? null,
      breed: dto.breed ?? null,
      personality: dto.personality,
      adoptionDate: dto.adoptionDate,
      adoptionSource: dto.adoptionSource,
      shelterCode: dto.shelterCode ?? null,
      photoUrl: dto.photoUrl ?? null,
    });
    return this.cats.save(cat);
  }

  async update(userId: number, id: number, dto: UpdateCatDto): Promise<Cat> {
    const cat = await this.findOneForUser(userId, id);
    Object.assign(cat, dto);
    return this.cats.save(cat);
  }
}
