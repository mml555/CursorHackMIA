import { requireUserId, getProfileByClerkId } from "@/lib/clerk/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { createListingSchema } from "@/lib/validation/schemas";
import { apiSuccess, handleRouteError, apiError } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const clerkUserId = await requireUserId();
    const profile = await getProfileByClerkId(clerkUserId);
    if (!profile) {
      return apiError("NOT_FOUND", "Profile not found", 404);
    }

    const supabase = createAdminClient();
    const { data: membership } = await supabase
      .from("business_members")
      .select("business_id")
      .eq("profile_id", profile.id)
      .maybeSingle();

    if (!membership) {
      return apiSuccess({ listings: [] });
    }

    const { data: listings, error } = await supabase
      .from("listings")
      .select("*")
      .eq("business_id", membership.business_id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return apiSuccess({ listings: listings ?? [] });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: Request) {
  try {
    const clerkUserId = await requireUserId();
    const profile = await getProfileByClerkId(clerkUserId);
    if (!profile) {
      return apiError("NOT_FOUND", "Profile not found", 404);
    }

    const body = createListingSchema.parse(await req.json());
    const supabase = createAdminClient();

    const { data: membership } = await supabase
      .from("business_members")
      .select("business_id")
      .eq("profile_id", profile.id)
      .maybeSingle();

    if (!membership) {
      return apiError("FORBIDDEN", "Create a business before adding listings", 403);
    }

    const { data: listing, error } = await supabase
      .from("listings")
      .insert({
        business_id: membership.business_id,
        listing_type: body.listingType,
        category: body.category,
        unit: body.unit,
        quantity: body.quantity,
        fmv_estimate: body.fmvEstimate ?? null,
        notes: body.notes ?? null,
      })
      .select("*")
      .single();

    if (error) throw error;
    return apiSuccess({ listing }, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
