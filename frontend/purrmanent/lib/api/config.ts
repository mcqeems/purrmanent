/** Backend base URL — overridable via env; defaults to local dev. */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

/** Global route prefix (matches backend API_GLOBAL_PREFIX). */
export const API_PREFIX = '/api';
