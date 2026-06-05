import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "@/lib/clerk/auth";
import { InvalidTransitionError } from "@/lib/trades/state-machine";

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export function apiError(
  code: string,
  message: string,
  status: number,
  details?: unknown,
) {
  const body: ApiErrorBody = { error: { code, message, details } };
  return NextResponse.json(body, { status });
}

export function handleRouteError(error: unknown) {
  if (error instanceof AuthError) {
    return apiError(
      error.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED",
      error.message,
      error.status,
    );
  }

  if (error instanceof ZodError) {
    return apiError("VALIDATION_ERROR", "Invalid request", 422, error.flatten());
  }

  if (error instanceof InvalidTransitionError) {
    return apiError("INVALID_TRANSITION", error.message, 409);
  }

  console.error("[api]", error);
  return apiError("INTERNAL_ERROR", "Something went wrong", 500);
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}
