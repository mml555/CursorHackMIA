import { randomUUID } from "crypto";

const BUSINESS_MEDIA_BUCKET = "business-media";

export function getBusinessMediaPublicUrl(storagePath: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured");
  }

  const encodedPath = storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${baseUrl}/storage/v1/object/public/${BUSINESS_MEDIA_BUCKET}/${encodedPath}`;
}

export function buildPendingMediaPath(
  profileId: string,
  kind: "logo" | "photo",
  fileName: string,
): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  const suffix = kind === "logo" ? "logo" : randomUUID();
  return `pending/${profileId}/${suffix}-${safeName}`;
}

export { BUSINESS_MEDIA_BUCKET };
