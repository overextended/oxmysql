import { CacheValue } from './CacheValue';

export class Cache {
  private cache: Map<string, CacheValue> = new Map();
  private readonly ttl: number;

  constructor(ttl: number) {
    this.ttl = ttl;
    this.startCleanupThread();
  }

  private startCleanupThread(): void {
    setInterval(() => {
      const now: number = Date.now();
      this.cache.forEach((value, key) => {
        if (value.expires <= now) {
          this.cache.delete(key);
        }
      });
    }, 60 * 1000);
  }

  private generateKey(query: string, params: any[]): string {
    return query + JSON.stringify(params);
  }

  public get(query: string, params: any[]): any {
    const key: string = this.generateKey(query, params);
    const value: CacheValue | undefined = this.cache.get(key);

    if (value && value.expires > Date.now()) {
      return value.data;
    }

    return null;
  }

  public set(query: string, params: any[], data: any, ttl?: number): void {
    const key: string = this.generateKey(query, params);
    const expiration: number = Date.now() + (ttl ?? this.ttl);

    this.cache.set(key, {
      data,
      expires: expiration,
    });
  }

  public clear(query: string, params: any[]): void {
    const key: string = this.generateKey(query, params);
    this.cache.delete(key);
  }

  public clearAll(): void {
    this.cache.clear();
  }
}
