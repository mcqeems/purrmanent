import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from '../entities';
import type { Env } from '../config/env';
import { CorpusRepository } from './corpus.repository';

/**
 * Global DB module. synchronize is always false — schema changes go through
 * migrations only (plan §7 / acceptance §10.2).
 */
@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        type: 'postgres' as const,
        url: config.get('DATABASE_URL', { infer: true }),
        entities,
        synchronize: false,
        autoLoadEntities: false,
      }),
    }),
    TypeOrmModule.forFeature(entities),
  ],
  providers: [CorpusRepository],
  exports: [TypeOrmModule, CorpusRepository],
})
export class DatabaseModule {}
