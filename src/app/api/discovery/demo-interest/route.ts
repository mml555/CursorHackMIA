import { z } from "zod";
import { apiSuccess, handleRouteError } from "@/lib/api/errors";
import { DEMO_FOCAL_BUSINESS_SLUG } from "@/lib/discovery/constants";
import { getBusinessIdBySlug } from "@/lib/discovery/service";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  targetBusinessId: z.string().uuid(),
});

/**
 * Public demo endpoint — records an "interested" swipe from the seeded
 * focal business (Sunrise Yoga) when the viewer is not signed in.
 */
export async function POST(req: Request) {
  try {
    const body = bodySchema.parse(await req.json());
    const focalBusinessId = await getBusinessIdBySlug(DEMO_FOCAL_BUSINESS_SLUG);

    if (!focalBusinessId) {
      return handleRouteError(
        new Error("Demo business not found. Run npm run db:reset to seed data."),
      );
    }

    if (body.targetBusinessId === focalBusinessId) {
      return handleRouteError(new Error("Cannot express interest in your own business"));
    }

    const supabase = createAdminClient();

    const { data: target, error: targetError } = await supabase
      .from("businesses")
      .select("id, status")
      .eq("id", body.targetBusinessId)
      .maybeSingle();

    if (targetError) throw targetError;
    if (!target || target.status !== "approved") {
      return handleRouteError(new Error("Target business not found"));
    }

    const { data: swipe, error } = await supabase
      .from("business_discovery_swipes")
      .upsert(
        {
          swiper_business_id: focalBusinessId,
          target_business_id: body.targetBusinessId,
          action: "interested",
        },
        { onConflict: "swiper_business_id,target_business_id" },
      )
      .select("*")
      .single();

    if (error) throw error;
    return apiSuccess({ swipe, demo: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
