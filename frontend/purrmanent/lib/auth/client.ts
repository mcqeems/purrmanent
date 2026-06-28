import { createAuthClient } from "better-auth/react";
import { API_BASE_URL } from "@/lib/api/config";

/**
 * better-auth React client. Points at the backend's native auth handler
 * (mounted at /api/auth). Handles the session cookie, useSession, and social
 * sign-in (Google) — see BACKEND_IMPLEMENTATION.md §6.1.
 */
export const authClient = createAuthClient({
  baseURL: `${API_BASE_URL}/api/auth`,
});

export const { useSession, signIn, signOut, signUp } = authClient;
