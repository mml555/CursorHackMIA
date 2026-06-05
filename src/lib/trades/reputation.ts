import { createAdminClient } from "@/lib/supabase/server";

const MIN_PUBLIC_RATINGS = 3;

export async function refreshBusinessReputation(businessId: string): Promise<void> {
  const supabase = createAdminClient();

  const { data: ratings, error } = await supabase
    .from("vendor_ratings")
    .select("score")
    .eq("rated_business_id", businessId);

  if (error) throw error;

  const scores = (ratings ?? []).map((rating) => rating.score);
  const count = scores.length;

  if (count === 0) {
    await supabase
      .from("businesses")
      .update({ reputation_score: null, ratings_count: 0 })
      .eq("id", businessId);
    return;
  }

  const average = scores.reduce((sum, score) => sum + score, 0) / count;
  const reputationScore =
    count >= MIN_PUBLIC_RATINGS ? Number(average.toFixed(2)) : null;

  const { error: updateError } = await supabase
    .from("businesses")
    .update({
      reputation_score: reputationScore,
      ratings_count: count,
    })
    .eq("id", businessId);

  if (updateError) throw updateError;
}
