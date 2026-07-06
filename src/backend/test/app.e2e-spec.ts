import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { AUTH_INSTANCE } from './../src/modules/auth/auth.provider';

/**
 * The AUTH_INSTANCE factory builds better-auth via dynamic import(); jest's
 * CommonJS VM cannot execute that (it works at runtime under Node). Override the
 * token with a stub so the module compiles for the smoke test.
 */
interface HealthResponse {
  status: string;
  ts: string;
}

describe('Health (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AUTH_INSTANCE)
      .useValue({})
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  it('/api/health (GET) returns ok', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/health')
      .expect(200);
    const body = res.body as HealthResponse;
    expect(body.status).toBe('ok');
    expect(typeof body.ts).toBe('string');
  });

  afterEach(async () => {
    await app.close();
  });
});
