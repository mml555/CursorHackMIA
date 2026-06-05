import { NextResponse } from "next/server";
import { getBackendApiUrl } from "@/lib/backend/config";
import { checkSupabaseConnection } from "@/lib/supabase/health-check";

export const dynamic = "force-dynamic";

async function checkBackendHealth(): Promise<{
  status: "missing_env" | "unreachable" | "ok" | "degraded";
  supabase?: string;
  hint?: string;
}> {
  if (!process.env.BACKEND_API_URL?.trim()) {
    return {
      status: "missing_env",
      hint: "Set BACKEND_API_URL to your Render onboarding API URL.",
    };
  }

  try {
    const response = await fetch(`${getBackendApiUrl()}/health`, {
      cache: "no-store",
    });
    const json = (await response.json().catch(() => null)) as {
      data?: { checks?: { supabase?: string } };
    } | null;

    if (!response.ok) {
      return {
        status: "unreachable",
        hint: "Render /health did not return 200. Check root directory is services/onboarding-api.",
      };
    }

    const supabase = json?.data?.checks?.supabase;
    if (supabase === "ok") {
      return { status: "ok", supabase };
    }

    return {
      status: "degraded",
      supabase: supabase ?? "unknown",
      hint:
        "Render SUPABASE_URL must match Vercel NEXT_PUBLIC_SUPABASE_URL (same project). Dead hosts like lgsfyrxkqpipaumngvfi.supabase.co cause discovery 500s.",
    };
  } catch {
    return {
      status: "unreachable",
      hint: "Could not reach BACKEND_API_URL. Confirm Render service is running.",
    };
  }
}

export async function GET() {
  const supabase = await checkSupabaseConnection();
  const backend = await checkBackendHealth();

  return NextResponse.json({
    status: "ok",
    service: "reciproca-api",
    timestamp: new Date().toISOString(),
    checks: {
      clerk: process.env.CLERK_SECRET_KEY ? "configured" : "missing_env",
      backend: backend.status,
      ...(backend.supabase ? { backendSupabase: backend.supabase } : {}),
      ...(backend.hint ? { backendHint: backend.hint } : {}),
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
