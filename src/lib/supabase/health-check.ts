import { createAdminClient } from "@/lib/supabase/server";

function projectRefFromUrl(url: string): string | null {
  try {
    const host = new URL(url).hostname;
    const match = host.match(/^([a-z0-9]+)\.supabase\.co$/i);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

function projectRefFromServiceRoleKey(key: string): string | null {
  try {
    const payload = JSON.parse(
      Buffer.from(key.split(".")[1], "base64url").toString("utf8"),
    ) as { ref?: string; iss?: string; role?: string };
    return payload.ref ?? null;
  } catch {
    return null;
  }
}

export async function checkSupabaseConnection(): Promise<{
  env: "configured" | "missing_env";
  connection: "ok" | "error";
  host?: string;
  keyProjectRef?: string | null;
  urlProjectRef?: string | null;
  projectRefMatch?: boolean;
  discoveryView?: "ok" | "error";
  error?: string;
  hint?: string;
}> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !key) {
    return {
      env: "missing_env",
      connection: "error",
      hint: "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on Vercel.",
    };
  }

  const urlProjectRef = projectRefFromUrl(url);
  const keyProjectRef = projectRefFromServiceRoleKey(key);
  const projectRefMatch =
    urlProjectRef && keyProjectRef
      ? urlProjectRef === keyProjectRef
      : undefined;

  let host: string | undefined;
  try {
    host = new URL(url).hostname;
  } catch {
    return {
      env: "configured",
      connection: "error",
      error: "NEXT_PUBLIC_SUPABASE_URL is not a valid URL",
      hint: "Use https://<project-ref>.supabase.co",
    };
  }

  if (host === "127.0.0.1" || host === "localhost") {
    return {
      env: "configured",
      connection: "error",
      host,
      error: "Supabase URL points to localhost",
      hint: "Vercel cannot reach local Supabase. Use a hosted project URL.",
    };
  }

  if (keyProjectRef && urlProjectRef && !projectRefMatch) {
    return {
      env: "configured",
      connection: "error",
      host,
      keyProjectRef,
      urlProjectRef,
      projectRefMatch: false,
      error: "Supabase URL and service_role key are from different projects",
      hint: "Copy both values from the same Supabase project Settings → API.",
    };
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("business_discovery_cards")
      .select("business_id")
      .limit(1);

    if (error) {
      const message = error.message ?? "Supabase query failed";
      let hint = "Check Vercel logs for details.";
      if (message.includes("does not exist")) {
        hint = "Run migrations on this project: supabase link && npm run db:push";
      } else if (message.includes("JWT")) {
        hint = "Service role key may be invalid or from another project.";
      }

      return {
        env: "configured",
        connection: "error",
        host,
        keyProjectRef,
        urlProjectRef,
        projectRefMatch,
        discoveryView: "error",
        error: message,
        hint,
      };
    }

    return {
      env: "configured",
      connection: "ok",
      host,
      keyProjectRef,
      urlProjectRef,
      projectRefMatch,
      discoveryView: "ok",
    };
  } catch (cause) {
    const message =
      cause instanceof Error ? cause.message : "Supabase connection failed";
    let hint = "Verify project is active in Supabase dashboard.";
    if (message.includes("fetch failed") || message.includes("ENOTFOUND")) {
      hint = "Project URL does not resolve — project may be paused, deleted, or URL is wrong.";
    }

    return {
      env: "configured",
      connection: "error",
      host,
      keyProjectRef,
      urlProjectRef,
      projectRefMatch,
      error: message,
      hint,
    };
  }
}
