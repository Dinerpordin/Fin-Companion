/**
 * lib/supabaseClient.ts
 *
 * Centralised, lazy Supabase client singleton.
 * Import `getSupabaseClient()` wherever Supabase auth or DB access is needed.
 *
 * Returns null when NEXT_PUBLIC_SUPABASE_URL is absent or contains the
 * placeholder value — this allows pages to degrade gracefully to
 * local/offline storage rather than throwing at module load time.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!url || url.includes("placeholder")) return null;

  _client = createClient(url, key);
  return _client;
}

/** Convenience: true when Supabase is fully configured. */
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");
