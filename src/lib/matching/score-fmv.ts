import { CASH_TOPUP_IMBALANCE_THRESHOLD } from "@/lib/matching/config";
import type { CashTopupSuggestion, MatchParty } from "@/lib/matching/types";

/**
 * When one party gives materially more FMV than they receive, suggest cash top-up.
 */
export function suggestCashTopup(
  parties: MatchParty[],
): CashTopupSuggestion | null {
  const withFmv = parties
    .map((p) => ({ ...p, fmv: p.estimatedFmv ?? 0 }))
    .filter((p) => p.fmv > 0);

  if (withFmv.length < 2) return null;

  let payer = withFmv[0];
  let maxImbalance = 0;

  for (const party of withFmv) {
    const others = withFmv.filter((p) => p.businessId !== party.businessId);
    const avgOther =
      others.reduce((sum, p) => sum + p.fmv, 0) / Math.max(others.length, 1);

    if (party.fmv <= avgOther) continue;

    const imbalance = (party.fmv - avgOther) / party.fmv;
    if (imbalance > maxImbalance) {
      maxImbalance = imbalance;
      payer = party;
    }
  }

  if (maxImbalance < CASH_TOPUP_IMBALANCE_THRESHOLD) return null;

  const receiver = withFmv
    .filter((p) => p.businessId !== payer.businessId)
    .sort((a, b) => a.fmv - b.fmv)[0];

  if (!receiver) return null;

  const amount = Math.round((payer.fmv - receiver.fmv) * 100) / 100;
  if (amount <= 0) return null;

  return {
    payerBusinessId: payer.businessId,
    payerBusinessName: payer.businessName,
    amount,
    givesFmv: payer.fmv,
    receivesFmv: receiver.fmv,
  };
}
