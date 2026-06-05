import { getApprovedBusinessBySlug } from "@/lib/businesses/service";
import { getBusinessMediaPublicUrl } from "@/lib/storage/business-media";
import { apiError, apiSuccess, handleRouteError } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const record = await getApprovedBusinessBySlug(slug);

    if (!record) {
      return apiError("NOT_FOUND", "Vendor not found", 404);
    }

    const logoUrl = record.business.logo_storage_path
      ? getBusinessMediaPublicUrl(record.business.logo_storage_path)
      : null;

    const photos = record.photos.map((photo) => ({
      ...photo,
      publicUrl: getBusinessMediaPublicUrl(photo.storage_path),
    }));

    return apiSuccess({
      business: record.business,
      logoUrl,
      photos,
      listings: record.listings,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
