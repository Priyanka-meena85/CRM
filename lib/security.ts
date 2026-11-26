import crypto from "crypto";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";
import type { Role, SessionUser } from "@/lib/types";

// ─── 1. XSS SANITIZATION ─────────────────────────────────────────────────────
const DANGEROUS_HTML_RE = /<[^>]*>?/g;
const JS_URI_RE = /javascript:|data:text\/html|vbscript:/gi;

export function sanitizeText(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .replace(DANGEROUS_HTML_RE, "")
    .replace(JS_URI_RE, "")
    .trim();
}

// ─── 2. SSRF PROTECTION ──────────────────────────────────────────────────────
const PRIVATE_HOST_RE =
  /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.|169\.254\.|0\.0\.0\.0|\[::1\])/i;

export function isSafeExternalUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    if (PRIVATE_HOST_RE.test(parsed.hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

// ─── 3. FILE UPLOAD VALIDATION (Magic Bytes + MIME + Size) ───────────────────
const ALLOWED_IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

export function validateImageUpload(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): { valid: boolean; reason?: string } {
  if (!ALLOWED_IMAGE_MIMES.has(mimeType)) {
    return { valid: false, reason: "Sirf JPG, PNG, ya WEBP image allowed hai" };
  }
  if (buffer.byteLength === 0 || buffer.byteLength > MAX_UPLOAD_BYTES) {
    return { valid: false, reason: "File size 5MB se kam honi chahiye" };
  }
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (!ext || !["jpg", "jpeg", "png", "webp"].includes(ext)) {
    return { valid: false, reason: "Invalid file extension" };
  }

  // Magic-byte signature check
  const isPng =
    buffer.length >= 4 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47;
  const isJpeg =
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff;
  const isWebp =
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP";

  if (!isPng && !isJpeg && !isWebp) {
    return { valid: false, reason: "File content invalid ya corrupted hai" };
  }

  return { valid: true };
}

// ─── 4. RATE LIMITING (Sliding Window) ───────────────────────────────────────
const rateLimitStore = new Map<string, number[]>();

export function checkRateLimit(
  key: string,
  maxAttempts = 10,
  windowMs = 15 * 60 * 1000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowStart = now - windowMs;
  const timestamps = (rateLimitStore.get(key) || []).filter((ts) => ts > windowStart);

  if (timestamps.length >= maxAttempts) {
    rateLimitStore.set(key, timestamps);
    return { allowed: false, remaining: 0 };
  }

  timestamps.push(now);
  rateLimitStore.set(key, timestamps);
  return { allowed: true, remaining: maxAttempts - timestamps.length };
}

// ─── 5. CSRF / ORIGIN CHECK ──────────────────────────────────────────────────
export function verifySameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return true; // Non-browser or same-origin fetch without Origin header
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

// ─── 6. WEBHOOK SIGNATURE VERIFICATION (HMAC-SHA256) ─────────────────────────
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string | undefined
): boolean {
  if (!signatureHeader || !secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const cleanSig = signatureHeader.replace(/^sha256=/i, "");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(cleanSig, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// ─── 7. SERVER-SIDE AUTH & RBAC GUARDS ───────────────────────────────────────
export async function requireSession(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session.user as unknown as SessionUser;
}

export async function requireRole(allowedRoles: Role[]): Promise<SessionUser | null> {
  const user = await requireSession();
  if (!user || !allowedRoles.includes(user.role)) return null;
  return user;
}

// ─── 8. PRODUCTION-SAFE LOGGING ──────────────────────────────────────────────
export function safeErrorLog(context: string, error: unknown): void {
  if (process.env.NODE_ENV === "production") {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error(`[API Error] ${context}: ${msg}`);
  } else {
    console.error(`[API Error] ${context}:`, error);
  }
}
