import { auth } from "@clerk/nextjs/server";
import { getBackendApiUrl, BackendError } from "@/lib/backend/config";

type BackendEnvelope<T> = { data: T } | { error: { code: string; message: string; details?: unknown } };

async function buildBackendHeaders(init: RequestInit, withAuth: boolean) {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  if (withAuth) {
    const { getToken } = await auth();
    const token = await getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  return headers;
}

export async function backendRequestOptionalAuth<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const baseUrl = getBackendApiUrl();
  const headers = await buildBackendHeaders(init, true);
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
  return parseBackendResponse<T>(response);
}

export async function backendRequestPublic<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const baseUrl = getBackendApiUrl();
  const headers = await buildBackendHeaders(init, false);

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  return parseBackendResponse<T>(response);
}

export async function backendRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const baseUrl = getBackendApiUrl();
  const headers = await buildBackendHeaders(init, true);

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  return parseBackendResponse<T>(response);
}

async function parseBackendResponse<T>(response: Response): Promise<T> {
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
