import { createAdminClient } from "@/lib/supabase/server";
import type { BusinessStatus } from "@/lib/db/types";
import type { AdminBusinessVettingInput } from "@/lib/validation/schemas";
import { TradeError } from "@/lib/trades/errors";

const VETTING_TRANSITIONS: Record<
  AdminBusinessVettingInput["action"],
  { from: BusinessStatus[]; to: BusinessStatus }
> = {
  approve: { from: ["pending"], to: "approved" },
  reject: { from: ["pending"], to: "rejected" },
  suspend: { from: ["approved"], to: "suspended" },
};

export async function listBusinessesForAdmin(status?: BusinessStatus) {
  const supabase = createAdminClient();
  let query = supabase
    .from("businesses")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function vetBusiness(
  businessId: string,
  input: AdminBusinessVettingInput,
) {
  const supabase = createAdminClient();
  const transition = VETTING_TRANSITIONS[input.action];

  const { data: business, error: loadError } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", businessId)
    .maybeSingle();

  if (loadError) throw loadError;
  if (!business) {
    throw new TradeError("Business not found", 404, "NOT_FOUND");
  }

  if (!transition.from.includes(business.status)) {
    throw new TradeError(
      `Cannot ${input.action} a business with status "${business.status}"`,
      409,
      "INVALID_STATUS",
    );
  }

  const { data: updated, error } = await supabase
    .from("businesses")
    .update({
      status: transition.to,
      admin_notes: input.adminNotes ?? business.admin_notes,
    })
    .eq("id", businessId)
    .eq("status", business.status)
    .select("*")
    .single();

  if (error) throw error;
  return updated;
}
