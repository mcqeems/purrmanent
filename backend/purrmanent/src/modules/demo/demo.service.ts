import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cat } from '../../entities';

@Injectable()
export class DemoService {
  constructor(@InjectRepository(Cat) private readonly cats: Repository<Cat>) {}

  /** Public onboarding prefill for a demo shelter code. */
  async prefill(code: string) {
    const cat = await this.cats.findOne({ where: { shelterCode: code } });
    if (!cat) throw new NotFoundException('No demo cat for that code');
    return {
      catName: cat.name,
      catPersonality: cat.personality,
      catBreed: cat.breed,
      catAgeMonths: cat.ageMonths,
      adoptionSource: 'shelter',
      shelterCode: cat.shelterCode,
    };
  }
}
