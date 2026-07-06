import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildUrl, parseError, ApiError, apiFetch } from '@/lib/api/client';

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

describe('apiFetch', () => {
  const origFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = origFetch;
  });

  function mockFetch(body: unknown, status = 200) {
    const text = body === undefined ? '' : JSON.stringify(body);
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(text, {
        status,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  }

	it('sends credentials and JSON content-type when body is present', async () => {
		mockFetch({ ok: true });
		await apiFetch('/test', { body: { a: 1 } });
		expect(globalThis.fetch).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({
				credentials: 'include',
				headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
			}),
		);
	});

	it('sends credentials without content-type when no body', async () => {
		mockFetch({ ok: true });
		await apiFetch('/test');
		const [, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
		expect(init.credentials).toBe('include');
		expect(init.headers['Content-Type']).toBeUndefined();
	});

  it('returns parsed JSON on success', async () => {
    mockFetch({ name: 'Mochi', id: 1 });
    const result = await apiFetch<{ name: string; id: number }>('/cats/1');
    expect(result).toEqual({ name: 'Mochi', id: 1 });
  });

  it('returns undefined for 204 No Content', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(null, { status: 204 }),
    );
    const result = await apiFetch('/delete');
    expect(result).toBeUndefined();
  });

	it('throws ApiError on non-2xx response', async () => {
		mockFetch(
			{ error: { code: 'NOT_FOUND', message: 'Cat not found' } },
			404,
		);
		try {
			await apiFetch('/cats/999');
			expect.fail('should have thrown');
		} catch (err) {
			expect(err).toBeInstanceOf(ApiError);
			expect((err as ApiError).code).toBe('NOT_FOUND');
			expect((err as ApiError).status).toBe(404);
		}
	});

  it('serializes body to JSON', async () => {
    mockFetch({ ok: true });
    await apiFetch('/test', { body: { name: 'Mochi' } });
    const [, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(init.body).toBe('{"name":"Mochi"}');
  });
});
