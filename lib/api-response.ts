import { NextResponse } from "next/server";

/**
 * Standardized JSON success response for API route handlers.
 */
export function apiOk<T>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}

/**
 * Standardized JSON error response for API route handlers.
 */
export function apiError(message: string, status = 400): NextResponse<{ error: string }> {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Safely parses a dynamic route numeric ID parameter.
 */
export function parseIntParam(raw: string | undefined): number | null {
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/**
 * Wraps an API route handler with consistent error logging and 500 fallback.
 */
export async function withApiHandler(
  label: string,
  fn: () => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    return await fn();
  } catch (error) {
    console.error(`[API Error] ${label}:`, error);
    return apiError("Internal server error", 500);
  }
}
