import { requireApprovedBusinessMember } from "@/lib/clerk/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { swipeDiscoverySchema } from "@/lib/validation/schemas";
import { apiSuccess, handleRouteError } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { business } = await requireApprovedBusinessMember();
    const body = swipeDiscoverySchema.parse(await req.json());
    const supabase = createAdminClient();

    if (body.targetBusinessId === business.id) {
      return handleRouteError(new Error("Cannot swipe on your own business"));
    }

    const { data: swipe, error } = await supabase
      .from("business_discovery_swipes")
      .upsert(
        {
          swiper_business_id: business.id,
          target_business_id: body.targetBusinessId,
          action: body.action,
        },
        { onConflict: "swiper_business_id,target_business_id" },
      )
      .select("*")
      .single();

    if (error) throw error;
    return apiSuccess({ swipe });
  } catch (error) {
    return handleRouteError(error);
  }
}
