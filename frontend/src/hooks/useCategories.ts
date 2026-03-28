import { useState, useEffect } from 'react';
import { categoryApi } from '../services/api';
import type { Category } from '../types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const result = await categoryApi.list();
      setCategories(result);
    } catch {
      // silently fail, categories will be empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  return { categories, loading, refetch: fetch };
}
