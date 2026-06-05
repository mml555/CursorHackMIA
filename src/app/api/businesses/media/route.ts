import { requireUserId, getProfileByClerkId } from "@/lib/clerk/auth";
import { uploadPendingBusinessMedia } from "@/lib/businesses/service";
import { getBusinessMediaPublicUrl } from "@/lib/storage/business-media";
import { apiSuccess, handleRouteError, apiError } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const clerkUserId = await requireUserId();
    const profile = await getProfileByClerkId(clerkUserId);

    if (!profile) {
      return apiError(
        "PROFILE_NOT_FOUND",
        "Profile not found. Wait for account sync or sign in again.",
        403,
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const kind = formData.get("kind");

    if (!(file instanceof File)) {
      return apiError("VALIDATION_ERROR", "A file is required", 422);
    }

    if (kind !== "logo" && kind !== "photo") {
      return apiError("VALIDATION_ERROR", "kind must be logo or photo", 422);
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return apiError(
        "VALIDATION_ERROR",
        "Only JPEG, PNG, WebP, and GIF images are allowed",
        422,
      );
    }

    const maxBytes = kind === "logo" ? MAX_LOGO_BYTES : MAX_PHOTO_BYTES;
    if (file.size > maxBytes) {
      return apiError(
        "VALIDATION_ERROR",
        kind === "logo"
          ? "Logo must be 2MB or smaller"
          : "Each photo must be 5MB or smaller",
        422,
      );
    }

    const upload = await uploadPendingBusinessMedia(profile, file, kind);

    return apiSuccess({
      ...upload,
      publicUrl: getBusinessMediaPublicUrl(upload.storagePath),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
