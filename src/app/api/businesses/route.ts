import { requireUserId, getProfileByClerkId } from "@/lib/clerk/auth";
import { createBusinessForProfile } from "@/lib/businesses/service";
import { createBusinessSchema } from "@/lib/validation/schemas";
import { apiSuccess, handleRouteError } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const clerkUserId = await requireUserId();
    const body = createBusinessSchema.parse(await req.json());

    const profile = await getProfileByClerkId(clerkUserId);
    if (!profile) {
      return handleRouteError(
        new Error("Profile not found. Wait for account sync or sign in again."),
      );
    }

    const business = await createBusinessForProfile(profile, body);
    return apiSuccess({ business }, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
