import { auth } from "@clerk/nextjs/server";
import { getBackendApiUrl, BackendError } from "@/lib/backend/config";

type BackendEnvelope<T> = { data: T } | { error: { code: string; message: string; details?: unknown } };

export async function backendRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const baseUrl = getBackendApiUrl();
  const { getToken } = await auth();
  const token = await getToken();

  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const json = (await response.json().catch(() => null)) as BackendEnvelope<T> | null;

  if (!response.ok) {
    const message =
      json && "error" in json
        ? json.error.message
        : response.statusText || "Backend request failed";
    const code =
      json && "error" in json ? json.error.code : "BACKEND_ERROR";
    const details =
      json && "error" in json ? json.error.details : undefined;

    throw new BackendError(message, response.status, code, details);
  }

  if (json && "data" in json) {
    return json.data;
  }

  return json as T;
}
