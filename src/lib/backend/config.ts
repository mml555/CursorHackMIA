export class BackendError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code = "BACKEND_ERROR",
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "BackendError";
  }
}

export function getBackendApiUrl(): string {
  const url = process.env.BACKEND_API_URL?.trim();
  if (!url) {
    throw new BackendError(
      "Backend API is not configured. Set BACKEND_API_URL in .env.local.",
      503,
      "BACKEND_NOT_CONFIGURED",
    );
  }
  return url.replace(/\/$/, "");
}
