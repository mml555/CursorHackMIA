import { createAdminClient } from "@/lib/supabase/server";
import type { CreateBusinessInput } from "@/lib/validation/schemas";
import type { Profile } from "@/lib/db/types";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
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
      description: input.description ?? null,
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

  return business;
}

export async function getBusinessWithMembership(clerkUserId: string) {
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();

  if (!profile) return { profile: null, membership: null, business: null };

  const { data: membership } = await supabase
    .from("business_members")
    .select("*")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (!membership) return { profile, membership: null, business: null };

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", membership.business_id)
    .single();

  return { profile, membership, business };
}
