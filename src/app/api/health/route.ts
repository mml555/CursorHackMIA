import { NextResponse } from "next/server";
import { checkSupabaseConnection } from "@/lib/supabase/health-check";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await checkSupabaseConnection();

  return NextResponse.json({
    status: "ok",
    service: "reciproca-api",
    timestamp: new Date().toISOString(),
    checks: {
      clerk: process.env.CLERK_SECRET_KEY ? "configured" : "missing_env",
      backend: process.env.BACKEND_API_URL ? "configured" : "missing_env",
      supabase: supabase.env,
      supabaseConnection: supabase.connection,
      ...(supabase.host ? { supabaseHost: supabase.host } : {}),
      ...(supabase.urlProjectRef
        ? { supabaseProjectRef: supabase.urlProjectRef }
        : {}),
      ...(supabase.projectRefMatch === false
        ? { supabaseProjectRefMatch: false }
        : {}),
      ...(supabase.discoveryView
        ? { discoveryView: supabase.discoveryView }
        : {}),
      ...(supabase.error ? { supabaseError: supabase.error } : {}),
      ...(supabase.hint ? { supabaseHint: supabase.hint } : {}),
    },
  });
}
