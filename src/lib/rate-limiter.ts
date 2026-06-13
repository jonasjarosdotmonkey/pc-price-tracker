interface RateLimitState {
  count: number;
  resetAt: number;
}

const limits = new Map<string, RateLimitState>();

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const state = limits.get(key);

  if (!state || now > state.resetAt) {
    limits.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowSeconds * 1000 };
  }

  if (state.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: state.resetAt };
  }

  state.count++;
  return { allowed: true, remaining: maxRequests - state.count, resetAt: state.resetAt };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        await sleep(delayMs * attempt);
      }
    }
  }
  throw lastError;
}
