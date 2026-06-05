import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/server";
import {
  BUSINESS_MEDIA_BUCKET,
  buildPendingMediaPath,
} from "@/lib/storage/business-media";
import type { CreateBusinessInput } from "@/lib/validation/schemas";
import type { BusinessPhoto, Profile } from "@/lib/db/types";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function assertPendingPathForProfile(storagePath: string, profileId: string) {
  const prefix = `pending/${profileId}/`;
  if (!storagePath.startsWith(prefix)) {
    throw new Error("Invalid media path for this account");
  }
}

function fileExtension(fileName: string): string {
  const match = fileName.match(/\.([a-zA-Z0-9]+)$/);
  return match ? match[1].toLowerCase() : "jpg";
}

async function finalizeStoragePath(
  pendingPath: string,
  finalPath: string,
): Promise<string> {
  const supabase = createAdminClient();

  const { data: blob, error: downloadError } = await supabase.storage
    .from(BUSINESS_MEDIA_BUCKET)
    .download(pendingPath);

  if (downloadError) throw downloadError;

  const { error: uploadError } = await supabase.storage
    .from(BUSINESS_MEDIA_BUCKET)
    .upload(finalPath, blob, {
      upsert: true,
      contentType: blob.type || undefined,
    });

  if (uploadError) throw uploadError;

  await supabase.storage.from(BUSINESS_MEDIA_BUCKET).remove([pendingPath]);

  return finalPath;
}

async function attachBusinessMedia(
  profile: Profile,
  businessId: string,
  input: CreateBusinessInput,
) {
  assertPendingPathForProfile(input.logoStoragePath, profile.id);

  const logoFileName = input.logoStoragePath.split("/").pop() ?? "logo.jpg";
  const logoExt = fileExtension(logoFileName);
  const logoFinalPath = `${businessId}/logo.${logoExt}`;
  const logoStoragePath = await finalizeStoragePath(
    input.logoStoragePath,
    logoFinalPath,
  );

  const supabase = createAdminClient();

  const { error: logoError } = await supabase
    .from("businesses")
    .update({ logo_storage_path: logoStoragePath })
    .eq("id", businessId);

  if (logoError) throw logoError;

  const photoRows: BusinessPhoto[] = [];

  for (const [index, photo] of input.photos.entries()) {
    assertPendingPathForProfile(photo.storagePath, profile.id);

    const photoExt = fileExtension(photo.fileName);
    const photoFinalPath = `${businessId}/photos/${randomUUID()}.${photoExt}`;
    const storagePath = await finalizeStoragePath(
      photo.storagePath,
      photoFinalPath,
    );

    const { data: inserted, error: photoError } = await supabase
      .from("business_photos")
      .insert({
        business_id: businessId,
        storage_path: storagePath,
        file_name: photo.fileName,
        mime_type: photo.mimeType ?? null,
        caption: photo.caption ?? null,
        sort_order: photo.sortOrder ?? index,
      })
      .select("*")
      .single();

    if (photoError) throw photoError;
    photoRows.push(inserted);
  }

  return { logoStoragePath, photos: photoRows };
}

export async function createBusinessForProfile(
  profile: Profile,
  input: CreateBusinessInput,
) {
  const supabase = createAdminClient();

  const { data: existingMembership } = await supabase
    .from("business_members")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (existingMembership) {
    throw new Error("User already belongs to a business");
  }

  const baseSlug = slugify(input.dba || input.legalName);
  const slug = `${baseSlug}-${profile.id.slice(0, 8)}`;

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .insert({
      legal_name: input.legalName,
      dba: input.dba ?? null,
      slug,
      metro: input.metro,
      vertical: input.vertical,
      website: input.website || null,
      description: input.description,
      status: "pending",
    })
    .select("*")
    .single();

  if (businessError) throw businessError;

  const { error: memberError } = await supabase.from("business_members").insert({
    profile_id: profile.id,
    business_id: business.id,
    role: "owner",
  });

  if (memberError) throw memberError;

  const media = await attachBusinessMedia(profile, business.id, input);

  return {
    ...business,
    logo_storage_path: media.logoStoragePath,
    photos: media.photos,
  };
}

export async function getBusinessPhotos(businessId: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("business_photos")
    .select("*")
    .eq("business_id", businessId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getBusinessWithMembership(clerkUserId: string) {
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();

  if (!profile) return { profile: null, membership: null, business: null, photos: [] };

  const { data: membership } = await supabase
    .from("business_members")
    .select("*")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (!membership) {
    return { profile, membership: null, business: null, photos: [] };
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", membership.business_id)
    .single();

  const photos = await getBusinessPhotos(membership.business_id);

  return { profile, membership, business, photos };
}

export async function uploadPendingBusinessMedia(
  profile: Profile,
  file: File,
  kind: "logo" | "photo",
) {
  const supabase = createAdminClient();
  const storagePath = buildPendingMediaPath(profile.id, kind, file.name);

  const { error } = await supabase.storage
    .from(BUSINESS_MEDIA_BUCKET)
    .upload(storagePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (error) throw error;

  return {
    storagePath,
    fileName: file.name,
    mimeType: file.type,
  };
}
