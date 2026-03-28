import { useState, useEffect, useCallback } from 'react';
import { productApi } from '../services/api';
import type { Product, Page } from '../types';

export function useProducts(params?: Record<string, string>) {
  const [data, setData] = useState<Page<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await productApi.list(params);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
