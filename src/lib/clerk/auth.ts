import { auth, currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";
import type { Business, BusinessMember, Profile } from "@/lib/db/types";

export class AuthError extends Error {
  constructor(
    message: string,
    readonly status: 401 | 403 = 401,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new AuthError("Authentication required");
  }
  return userId;
}

export async function requireAdmin(): Promise<string> {
  const userId = await requireUserId();
  const user = await currentUser();
  const role = user?.publicMetadata?.role;
  if (role !== "admin") {
    throw new AuthError("Admin access required", 403);
  }
  return userId;
}

export async function getProfileByClerkId(
  clerkUserId: string,
): Promise<Profile | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export type MemberContext = {
  profile: Profile;
  membership: BusinessMember;
  business: Business;
};

export async function requireApprovedBusinessMember(): Promise<MemberContext> {
  const clerkUserId = await requireUserId();
  const profile = await getProfileByClerkId(clerkUserId);

  if (!profile) {
    throw new AuthError("Profile not found. Complete onboarding first.", 403);
  }

  const supabase = createAdminClient();
  const { data: membership, error: memberError } = await supabase
    .from("business_members")
    .select("*")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (memberError) throw memberError;
  if (!membership) {
    throw new AuthError("No business membership found.", 403);
  }

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", membership.business_id)
    .single();

  if (businessError) throw businessError;
  if (business.status !== "approved") {
    throw new AuthError("Business is not approved for trading.", 403);
  }

  return { profile, membership, business };
}
