import { checkRateLimit, safeErrorLog } from "@/lib/security";

/**
 * Distributed rate limiter using Upstash Redis REST in production,
 * automatically falling back to local sliding-window rate limiting.
 */
export async function checkDistributedRateLimit(
  key: string,
  maxAttempts = 15,
  windowSeconds = 900
): Promise<{ allowed: boolean; remaining: number }> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    return checkRateLimit(key, maxAttempts, windowSeconds * 1000);
  }

  try {
    const cleanKey = `ratelimit:${key}`;
    const res = await fetch(`${redisUrl}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${redisToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", cleanKey],
        ["EXPIRE", cleanKey, windowSeconds, "NX"],
      ]),
    });

    if (!res.ok) return checkRateLimit(key, maxAttempts, windowSeconds * 1000);

    const data = await res.json();
    const count = Number(data?.[0]?.result || 1);
    return {
      allowed: count <= maxAttempts,
      remaining: Math.max(0, maxAttempts - count),
    };
  } catch (err) {
    safeErrorLog("checkDistributedRateLimit", err);
    return checkRateLimit(key, maxAttempts, windowSeconds * 1000);
  }
}
