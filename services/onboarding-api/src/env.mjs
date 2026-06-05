const required = [
  "CLERK_SECRET_KEY",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
];

export function loadEnv() {
  const missing = required.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }

  return {
    port: Number(process.env.PORT ?? 3001),
    clerkSecretKey: process.env.CLERK_SECRET_KEY.trim(),
    supabaseUrl: process.env.SUPABASE_URL.trim(),
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY.trim(),
    allowedOrigins: (process.env.ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  };
}
