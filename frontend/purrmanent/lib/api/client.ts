import { API_BASE_URL, API_PREFIX } from "./config";

/** Backend error envelope: { error: { code, message, details } } (AllExceptionsFilter). */
interface ApiErrorBody {
  error?: { code?: string; message?: string; details?: unknown };
}

/** Typed error thrown by apiFetch for any non-2xx response. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** True for 400 validation failures — drives per-field form errors. */
  get isValidation(): boolean {
    return this.code === "VALIDATION_ERROR";
  }
}

export type QueryParams = Record<
  string,
  string | number | boolean | undefined | null
>;

export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  query?: QueryParams;
}

/** Build a fully-qualified URL with the /api prefix and a query string. */
export function buildUrl(path: string, query?: QueryParams): string {
  const base = `${API_BASE_URL}${API_PREFIX}${
    path.startsWith("/") ? path : `/${path}`
  }`;
  if (!query) return base;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null) qs.set(k, String(v));
  }
  const s = qs.toString();
  return s ? `${base}?${s}` : base;
}

/** Parse a non-ok Response into a typed ApiError (envelope-aware). */
export async function parseError(res: Response): Promise<ApiError> {
  let body: ApiErrorBody = {};
  try {
    body = (await res.json()) as ApiErrorBody;
  } catch {
    // non-JSON error body — fall through to status-based defaults
  }
  const err = body.error;
  return new ApiError(
    res.status,
    err?.code ?? `HTTP_${res.status}`,
    err?.message ?? res.statusText ?? "Request failed",
    err?.details,
  );
}

/**
 * The single boundary to the backend. Always credentialed (cookie session),
 * JSON-encoded, and envelope-aware. snake_case query params are passed via
 * `query` so callers never build URLs by hand.
 */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { body, query, headers, ...rest } = options;
  const res = await fetch(buildUrl(path, query), {
    ...rest,
    credentials: "include",
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
