import http from "node:http";
import { loadEnv } from "./env.mjs";
import { getClerkUserId, requireClerkUserId } from "./auth.mjs";
import { createOnboardingService } from "./onboarding.mjs";
import { createDiscoveryService } from "./discovery.mjs";
import {
  onboardingCompanySchema,
  onboardingServicesSchema,
  onboardingSocialSchema,
  onboardingConsentSchema,
  discoveryDemoInterestSchema,
  discoverySwipeSchema,
} from "./schemas.mjs";

const env = loadEnv();
const supabaseConfig = {
  supabaseUrl: env.supabaseUrl,
  supabaseServiceRoleKey: env.supabaseServiceRoleKey,
};
const onboarding = createOnboardingService(supabaseConfig);
const discovery = createDiscoveryService(supabaseConfig);

function json(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(body));
}

function success(res, data, status = 200) {
  json(res, status, { data });
}

function failure(res, error) {
  const status = error.status ?? 500;
  const code = error.code ?? "INTERNAL_ERROR";
  json(res, status, {
    error: {
      code,
      message: error.message ?? "Something went wrong",
      details: error.details,
    },
  });
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  if (chunks.length === 0) return null;
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (!origin) return;

  const allowed =
    env.allowedOrigins.length === 0 || env.allowedOrigins.includes(origin);

  if (allowed) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Authorization, Content-Type",
    );
    res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, PUT, POST, OPTIONS");
  }
}

async function handleOnboarding(req, res, pathname, method) {
  const clerkUserId = await requireClerkUserId(req, env.clerkSecretKey);

  if (pathname === "/onboarding/status" && method === "GET") {
    const status = await onboarding.getStatus(clerkUserId);
    return success(res, status);
  }

  if (pathname === "/onboarding/company" && method === "PATCH") {
    const body = onboardingCompanySchema.parse(await readJson(req));
    const status = await onboarding.saveCompany(clerkUserId, body);
    return success(res, status);
  }

  if (pathname === "/onboarding/services" && method === "PUT") {
    const body = onboardingServicesSchema.parse(await readJson(req));
    const status = await onboarding.saveServices(clerkUserId, body);
    return success(res, status);
  }

  if (pathname === "/onboarding/social" && method === "PATCH") {
    const body = onboardingSocialSchema.parse(await readJson(req));
    const status = await onboarding.saveSocial(clerkUserId, body);
    return success(res, status);
  }

  if (pathname === "/onboarding/consent" && method === "POST") {
    const body = onboardingConsentSchema.parse(await readJson(req));
    const status = await onboarding.saveConsent(clerkUserId, body);
    return success(res, status);
  }

  if (pathname === "/onboarding/complete" && method === "POST") {
    const status = await onboarding.complete(clerkUserId);
    return success(res, status);
  }

  failure(res, Object.assign(new Error("Not found"), { status: 404, code: "NOT_FOUND" }));
}

async function handleDiscovery(req, res, pathname, method) {
  if (pathname === "/discovery/network" && method === "GET") {
    const url = new URL(req.url ?? "/", "http://localhost");
    const payload = await discovery.getNetwork({
      metro: url.searchParams.get("metro") ?? undefined,
      industry: url.searchParams.get("industry") ?? undefined,
      query: url.searchParams.get("q") ?? undefined,
    });
    return success(res, payload);
  }

  if (pathname === "/discovery/stats" && method === "GET") {
    const url = new URL(req.url ?? "/", "http://localhost");
    const metro = url.searchParams.get("metro") ?? undefined;
    const payload = await discovery.getStats(metro);
    return success(res, payload);
  }

  if (pathname === "/discovery/recommendations" && method === "GET") {
    const clerkUserId = await getClerkUserId(req, env.clerkSecretKey);
    const payload = await discovery.getRecommendations(clerkUserId);
    return success(res, payload);
  }

  if (pathname === "/discovery/demo-interest" && method === "POST") {
    const body = discoveryDemoInterestSchema.parse(await readJson(req));
    const payload = await discovery.recordDemoInterest(body.targetBusinessId);
    return success(res, payload);
  }

  if (pathname === "/discovery/swipe" && method === "POST") {
    const clerkUserId = await requireClerkUserId(req, env.clerkSecretKey);
    const body = discoverySwipeSchema.parse(await readJson(req));
    const payload = await discovery.recordSwipe(clerkUserId, body);
    return success(res, payload);
  }

  if (pathname === "/discovery/matches" && method === "GET") {
    const clerkUserId = await requireClerkUserId(req, env.clerkSecretKey);
    const payload = await discovery.listMatches(clerkUserId);
    return success(res, payload);
  }

  const businessProfileMatch = pathname.match(
    /^\/discovery\/businesses\/([^/]+)$/,
  );
  if (businessProfileMatch && method === "GET") {
    const payload = await discovery.getBusinessProfile(businessProfileMatch[1]);
    return success(res, payload);
  }

  failure(res, Object.assign(new Error("Not found"), { status: 404, code: "NOT_FOUND" }));
}

const server = http.createServer(async (req, res) => {
  applyCors(req, res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const pathname = url.pathname.replace(/\/$/, "") || "/";

  try {
    if (pathname === "/health" && req.method === "GET") {
      let supabase = "error";
      try {
        await discovery.checkSupabase();
        supabase = "ok";
      } catch (cause) {
        console.error("[onboarding-api] supabase health check failed", cause);
      }

      return success(res, {
        status: "ok",
        service: "reciproca-onboarding-api",
        timestamp: new Date().toISOString(),
        checks: { supabase },
      });
    }

    if (pathname.startsWith("/onboarding")) {
      return await handleOnboarding(req, res, pathname, req.method ?? "GET");
    }

    if (pathname.startsWith("/discovery")) {
      return await handleDiscovery(req, res, pathname, req.method ?? "GET");
    }

    failure(res, Object.assign(new Error("Not found"), { status: 404, code: "NOT_FOUND" }));
  } catch (error) {
    if (error?.name === "ZodError") {
      return failure(
        res,
        Object.assign(new Error("Invalid request"), {
          status: 422,
          code: "VALIDATION_ERROR",
          details: error.flatten?.() ?? error.issues,
        }),
      );
    }

    console.error("[onboarding-api]", error);
    failure(res, error);
  }
});

server.listen(env.port, () => {
  console.log(`reciproca-onboarding-api listening on :${env.port}`);
});
