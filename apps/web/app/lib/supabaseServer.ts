/**
 * lib/supabaseServer.ts
 *
 * Server-side Supabase client — uses the SERVICE ROLE KEY.
 * NEVER import this file in client components or expose it to the browser.
 * Use only inside Next.js API Route handlers (app/api/**\/route.ts).
 *
 * The service role key bypasses Row Level Security (RLS), so this client
 * can perform privileged operations such as inserting analytics events,
 * managing leads, and generating enterprise API keys.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

/**
 * Returns a singleton Supabase client authenticated with the service role key.
 * Throws clearly if environment variables are missing so misconfiguration is
 * caught at request time rather than silently returning empty data.
 */
export function getSupabaseServer(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase server credentials. " +
        "Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY " +
        "are set in your Vercel environment variables."
    );
  }

  _client = createClient(url, key, {
    auth: {
      // Disable automatic session persistence — this is a server-only client.
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return _client;
}
