import type { UserJSON } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function upsertProfileFromClerkUser(user: UserJSON) {
  const primaryEmail = user.email_addresses.find(
    (e) => e.id === user.primary_email_address_id,
  )?.email_address;

  if (!primaryEmail) {
    throw new Error(`Clerk user ${user.id} has no primary email`);
  }

  const fullName = [user.first_name, user.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        clerk_user_id: user.id,
        email: primaryEmail,
        full_name: fullName || null,
      },
      { onConflict: "clerk_user_id" },
    )
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProfileByClerkId(clerkUserId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("clerk_user_id", clerkUserId);

  if (error) throw error;
}
