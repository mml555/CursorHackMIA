import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "reciproca-api",
    timestamp: new Date().toISOString(),
    checks: {
      clerk: process.env.CLERK_SECRET_KEY ? "configured" : "missing_env",
      backend: process.env.BACKEND_API_URL ? "configured" : "missing_env",
    },
  });
}
