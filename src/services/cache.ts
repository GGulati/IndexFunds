interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export class Cache<K, V> {
  private cache: Map<K, CacheEntry<V>>;
  private defaultDuration: number;

  constructor(defaultDuration: number) {
    this.cache = new Map();
    this.defaultDuration = defaultDuration;
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry || Date.now() >= entry.expiresAt) {
      this.delete(key);
      return undefined;
    }
    return entry.data;
  }

  set(key: K, value: V, duration?: number): void {
    const expiresAt = Date.now() + (duration ?? this.defaultDuration);
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      expiresAt
    });
  }

  delete(key: K): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
} 