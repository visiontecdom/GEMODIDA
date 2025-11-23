import { useEffect, useRef, useState } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const fetchData = async () => {
      const cached = cache.get(key);
      const now = Date.now();

      if (cached && now - cached.timestamp < ttl) {
        if (isMounted.current) {
          setData(cached.data);
          setLoading(false);
        }
        return;
      }

      try {
        const result = await fetcher();
        cache.set(key, { data: result, timestamp: now });
        if (isMounted.current) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted.current) {
          setError(err instanceof Error ? err.message : 'Error');
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted.current = false;
    };
  }, [key, fetcher, ttl]);

  const clearCache = () => {
    cache.delete(key);
  };

  return { data, loading, error, clearCache };
}

export function clearAllCache() {
  cache.clear();
}
