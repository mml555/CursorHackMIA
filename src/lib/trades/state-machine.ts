import type { ProposalStatus } from "@/lib/db/types";

const TRANSITIONS: Record<ProposalStatus, ProposalStatus[]> = {
  draft: ["published", "cancelled"],
  published: ["pending_acceptance", "cancelled"],
  pending_acceptance: ["matched", "cancelled"],
  matched: ["confirmed", "disputed", "cancelled"],
  confirmed: ["in_progress", "disputed"],
  in_progress: ["completed", "disputed"],
  completed: ["rated"],
  rated: [],
  cancelled: [],
  disputed: ["confirmed", "in_progress", "cancelled"],
};

export class InvalidTransitionError extends Error {
  constructor(from: ProposalStatus, to: ProposalStatus) {
    super(`Invalid proposal transition: ${from} → ${to}`);
    this.name = "InvalidTransitionError";
  }
}

export function canTransition(
  from: ProposalStatus,
  to: ProposalStatus,
): boolean {
  return TRANSITIONS[from].includes(to);
}

export function assertTransition(
  from: ProposalStatus,
  to: ProposalStatus,
): void {
  if (!canTransition(from, to)) {
    throw new InvalidTransitionError(from, to);
  }
}

export function nextStatusAfterPublish(): ProposalStatus {
  return "published";
}

export function nextStatusAfterAllInterested(): ProposalStatus {
  return "pending_acceptance";
}

export function nextStatusAfterAllAccepted(): ProposalStatus {
  return "matched";
}
