function readEnv(name, fallbackName) {
  const value = process.env[name]?.trim() || process.env[fallbackName]?.trim();
  return value || "";
}

export function loadEnv() {
  const clerkSecretKey = readEnv("CLERK_SECRET_KEY");
  const supabaseUrl = readEnv("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL");
  const supabaseServiceRoleKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");

  const missing = [];
  if (!clerkSecretKey) missing.push("CLERK_SECRET_KEY");
  if (!supabaseUrl) {
    missing.push("SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)");
  }
  if (!supabaseServiceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");

  if (missing.length > 0) {
    throw new Error(
      `Missing required env vars on Render: ${missing.join(", ")}. ` +
        "Set SUPABASE_URL to your hosted project URL (same as Vercel NEXT_PUBLIC_SUPABASE_URL).",
    );
  }

  return {
    port: Number(process.env.PORT ?? 3001),
    clerkSecretKey,
    supabaseUrl,
    supabaseServiceRoleKey,
    allowedOrigins: (process.env.ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  };
}
