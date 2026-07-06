import { createAuthClient } from 'better-auth/react';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

/**
 * better-auth React client. Points at the backend's native auth handler
 * (mounted at /api/auth). Handles the session cookie, useSession, and social
 * sign-in (Google) — see BACKEND_IMPLEMENTATION.md §6.1.
 */
export const authClient = createAuthClient({
  baseURL: `${API_BASE_URL}/api/auth`,
});

export const { useSession, signIn, signOut, signUp } = authClient;
