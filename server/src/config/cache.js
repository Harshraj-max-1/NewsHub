/**
 * In-Memory Cache with TTL and Redis-compatible interface
 * Allows easy plug-and-play replacement with Redis in production.
 */
class MemoryCache {
  constructor() {
    this.store = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0
    };
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return item.value;
  }

  set(key, value, ttlSeconds = 600) {
    this.stats.sets++;
    this.store.set(key, {
      value,
      expiresAt: Date.now() + (ttlSeconds * 1000)
    });
  }

  del(key) {
    return this.store.delete(key);
  }

  flush() {
    this.store.clear();
  }

  getStats() {
    return {
      ...this.stats,
      size: this.store.size
    };
  }
}

const cache = new MemoryCache();
module.exports = cache;
