import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/demo(.*)",
  "/design(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/health",
  "/api/webhooks/(.*)",
  "/api/discovery/network",
  "/api/discovery/stats",
  "/api/discovery/recommendations",
  "/api/discovery/demo-interest",
  "/api/discovery/businesses/(.*)",
]);

function isOnboardingWelcome(req: Request) {
  return new URL(req.url).pathname === "/onboarding";
}

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req) && !isOnboardingWelcome(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
