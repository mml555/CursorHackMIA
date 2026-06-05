import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  return NextResponse.json({
    status: "ok",
    service: "reciproca-api",
    timestamp: new Date().toISOString(),
    checks: {
      supabase: supabaseConfigured ? "configured" : "missing_env",
      clerk: process.env.CLERK_SECRET_KEY ? "configured" : "missing_env",
    },
  });
}
