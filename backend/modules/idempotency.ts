import { getStore } from "../core/store";

export function withIdempotency<T>(scope: string, key: string, handler: () => T): T {
  const store = getStore();
  const cacheKey = `${scope}:${key}`;
  if (store.idempotency.has(cacheKey)) return store.idempotency.get(cacheKey) as T;
  const result = handler();
  store.idempotency.set(cacheKey, result);
  return result;
}
