import { useState, useEffect } from 'react';
import { brandApi } from '../services/api';
import type { Brand } from '../types';

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const result = await brandApi.list();
      setBrands(result);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  return { brands, loading, refetch: fetch };
}
