import { useState, useEffect, useCallback } from 'react';
import { activityApi } from '../services/api';
import type { ActivityLog, Page } from '../types';

export function useActivity(params?: Record<string, string>) {
  const [data, setData] = useState<Page<ActivityLog> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await activityApi.list(params);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load activity');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
