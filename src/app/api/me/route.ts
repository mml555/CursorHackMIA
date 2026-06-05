import { requireUserId } from "@/lib/clerk/auth";
import { getBusinessWithMembership } from "@/lib/businesses/service";
import { getBusinessMediaPublicUrl } from "@/lib/storage/business-media";
import { apiSuccess, handleRouteError } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const clerkUserId = await requireUserId();
    const context = await getBusinessWithMembership(clerkUserId);

    const logoUrl = context.business?.logo_storage_path
      ? getBusinessMediaPublicUrl(context.business.logo_storage_path)
      : null;

    const photos = (context.photos ?? []).map((photo) => ({
      ...photo,
      publicUrl: getBusinessMediaPublicUrl(photo.storage_path),
    }));

    return apiSuccess({
      clerkUserId,
      profile: context.profile,
      membership: context.membership,
      business: context.business,
      logoUrl,
      photos,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
