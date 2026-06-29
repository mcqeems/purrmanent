import { describe, it, expect } from 'vitest';
import { buildUrl, parseError, ApiError } from '@/lib/api/client';

describe('buildUrl', () => {
  it('prefixes /api', () => {
    expect(buildUrl('/cats')).toMatch(/\/api\/cats$/);
  });

  it('appends snake_case query params', () => {
    expect(buildUrl('/checklist/today', { cat_id: 3 })).toMatch(
      /\/api\/checklist\/today\?cat_id=3$/,
    );
  });

  it('skips undefined/null query values', () => {
    expect(buildUrl('/x', { a: undefined, b: 2, c: null })).toMatch(
      /\/api\/x\?b=2$/,
    );
  });
});

describe('parseError', () => {
  it('parses the backend error envelope into a typed ApiError', async () => {
    const res = new Response(
      JSON.stringify({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'bad input',
          details: [{ field: 'email' }],
        },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
    const err = await parseError(res);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.isValidation).toBe(true);
    expect(err.details).toEqual([{ field: 'email' }]);
  });

  it('falls back to a status code when the body is not JSON', async () => {
    const res = new Response('upstream exploded', { status: 500 });
    const err = await parseError(res);
    expect(err.code).toBe('HTTP_500');
    expect(err.status).toBe(500);
    expect(err.isValidation).toBe(false);
  });
});
