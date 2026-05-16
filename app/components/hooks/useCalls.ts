'use client';

import { useCallback, useEffect, useState } from 'react';
import type { CallRow } from '@/lib/call-stats';
import { normalizeCallFromApi } from '@/lib/call-stats';

export function useCalls(businessId: string) {
  const [calls, setCalls] = useState<CallRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCalls = useCallback(async () => {
    const res = await fetch(`/api/calls/${businessId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load calls');
    const rows = Array.isArray(data) ? data : [];
    setCalls(rows.map((row) => normalizeCallFromApi(row)));
  }, [businessId]);

  useEffect(() => {
    loadCalls()
      .catch((e) =>
        setError(e instanceof Error ? e.message : 'Failed to load calls'),
      )
      .finally(() => setLoading(false));
  }, [loadCalls]);

  return { calls, loading, error, reload: loadCalls };
}
