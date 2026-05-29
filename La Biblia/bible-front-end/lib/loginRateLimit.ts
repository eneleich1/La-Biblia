type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

/** Returns true when the request should be blocked (rate limited). */
export function isLoginRateLimited(ip: string): boolean {
  const key = `login:${ip}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  bucket.count += 1;
  if (bucket.count > MAX_ATTEMPTS) {
    return true;
  }
  return false;
}

export function loginRateLimitRetryAfterSeconds(ip: string): number {
  const bucket = buckets.get(`login:${ip}`);
  if (!bucket) return 60;
  return Math.max(1, Math.ceil((bucket.resetAt - Date.now()) / 1000));
}
