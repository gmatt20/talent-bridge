interface CachedResponse {
  value: unknown;
  expiresAt: number;
}

/** Creates a bounded memory cache that shares concurrent reads. */
export function createRequestCache(now: () => number = Date.now) {
  const responses = new Map<string, CachedResponse>();
  const pending = new Map<string, Promise<unknown>>();

  function clear() {
    responses.clear();
    pending.clear();
  }

  async function read<T>(
    key: string,
    load: () => Promise<T>,
    maxAgeMs = 0,
  ): Promise<T> {
    const cached = responses.get(key);
    if (cached && cached.expiresAt > now()) {
      // Each key identifies one endpoint and its response type.
      return cached.value as T;
    }
    responses.delete(key);
    const existing = pending.get(key);
    if (existing) {
      // Concurrent callers use the same endpoint response type.
      return existing as Promise<T>;
    }

    const promise = Promise.resolve().then(load);
    pending.set(key, promise);
    try {
      const value = await promise;
      // An invalidation or newer request must win over an older response.
      if (pending.get(key) === promise && maxAgeMs > 0) {
        for (const [cachedKey, entry] of responses) {
          if (entry.expiresAt <= now()) responses.delete(cachedKey);
        }
        if (responses.size >= 100) {
          const oldestKey = responses.keys().next().value;
          if (oldestKey !== undefined) responses.delete(oldestKey);
        }
        responses.set(key, {value, expiresAt: now() + maxAgeMs});
      }
      return value;
    } finally {
      if (pending.get(key) === promise) pending.delete(key);
    }
  }

  return {read, clear};
}
