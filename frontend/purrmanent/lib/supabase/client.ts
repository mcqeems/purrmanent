import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Browser client for direct-to-bucket uploads (FRONTEND_BUILD_PLAN B3).
// Requires NEXT_PUBLIC_SUPABASE_URL + a PUBLISHABLE/anon key. The cat-images
// bucket must allow authenticated/anon inserts + public read (see README).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key) : null;

export const SUPABASE_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_BUCKET ?? "cat-images";

export const isUploadConfigured = supabase != null;
