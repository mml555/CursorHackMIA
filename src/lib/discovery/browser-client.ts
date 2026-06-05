import type {
  DiscoveryMember,
  DiscoveryRecommendations,
  DiscoveryStats,
} from "@/lib/discovery/types";

type ApiEnvelope<T> = { data: T };

class DiscoveryClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "DiscoveryClientError";
  }
}

async function parseResponse<T>(res: Response): Promise<T> {
  const body = (await res.json()) as ApiEnvelope<T> & {
    error?: { message?: string };
  };

  if (!res.ok) {
    throw new DiscoveryClientError(
      body.error?.message ?? "Request failed",
      res.status,
    );
  }

  return body.data;
}

export async function fetchDiscoveryStats(
  metro = "Austin",
): Promise<DiscoveryStats> {
  const params = new URLSearchParams({ metro });
  const res = await fetch(`/api/discovery/stats?${params.toString()}`);
  return parseResponse<DiscoveryStats>(res);
}

export async function fetchDiscoveryNetwork(options?: {
  metro?: string;
  industry?: string;
  query?: string;
}): Promise<{ members: DiscoveryMember[] }> {
  const params = new URLSearchParams();
  if (options?.metro) params.set("metro", options.metro);
  if (options?.industry) params.set("industry", options.industry);
  if (options?.query) params.set("q", options.query);

  const qs = params.toString();
  const res = await fetch(`/api/discovery/network${qs ? `?${qs}` : ""}`);
  return parseResponse<{ members: DiscoveryMember[] }>(res);
}

export async function fetchDiscoveryRecommendations(): Promise<DiscoveryRecommendations> {
  const res = await fetch("/api/discovery/recommendations");
  return parseResponse<DiscoveryRecommendations>(res);
}

export async function swipeDiscoveryBusiness(input: {
  targetBusinessId: string;
  action: "interested" | "pass" | "save";
}): Promise<void> {
  const res = await fetch("/api/discovery/swipe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const body = (await res.json()) as { error?: { message?: string } };
    throw new DiscoveryClientError(
      body.error?.message ?? "Swipe failed",
      res.status,
    );
  }
}
