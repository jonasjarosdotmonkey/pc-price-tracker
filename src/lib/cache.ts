const cache = new Map<string, { data: unknown; expires: number }>();

export function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCache<T>(key: string, data: T, ttlSeconds = 300): void {
  cache.set(key, { data, expires: Date.now() + ttlSeconds * 1000 });
}

export function deleteCache(key: string): void {
  cache.delete(key);
}

export function clearCache(): void {
  cache.clear();
}

export function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds = 300
): Promise<T> {
  const cached = getCache<T>(key);
  if (cached !== null) return Promise.resolve(cached);
  return fn().then((data) => {
    setCache(key, data, ttlSeconds);
    return data;
  });
}
