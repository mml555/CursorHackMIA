import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/types";
import { requireSupabaseEnv } from "@/lib/config/env";

let adminClient: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Server-only Supabase client using the service role key.
 * MVP: Clerk validates identity in route handlers; membership enforced in app code.
 */
export function createAdminClient() {
  if (adminClient) return adminClient;

  const { url, serviceRoleKey } = requireSupabaseEnv();
  adminClient = createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
}
