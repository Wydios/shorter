import { warn } from "@utils/logger.js";
import config from "@data";

interface shortData {
    code: string,
    url: string,
    target: string,
    expires: Date
};

const cache = new Map<string, { data: shortData, cacheExpires: number }>();

export function getCache(key: string): shortData | null {
    const item = cache.get(key);
    if (!item) return null;

    if (Date.now() >= item.cacheExpires) {
        cache.delete(key);
        return null;
    };

    return item.data;
};

export function setCache(key: string, data: shortData, seconds: number): void {
    cache.set(key, {
        data,
        cacheExpires: Date.now() + seconds * 1000
    });
};

export function removeCache(key: string): boolean {
    return cache.delete(key);
};

export function cleanupCache(): void {
    const now = Date.now();

    for (const [key, item] of cache.entries()) {
        if (now >= item.cacheExpires) {
            cache.delete(key);
        }
    }

    if (cache.size > config.maxCacheCount) {
        const size = cache.size;

        cache.clear();
        warn(`🧹 Cache cleared (${size} entries removed)`);
    }
};