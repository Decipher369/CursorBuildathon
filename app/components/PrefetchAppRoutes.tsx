'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { APP_PREFETCH_HREFS } from '@/lib/app-prefetch';

/** Warms Next.js route modules + RSC payloads for main app navigation. */
export default function PrefetchAppRoutes() {
  const router = useRouter();

  useEffect(() => {
    APP_PREFETCH_HREFS.forEach((href) => {
      try {
        router.prefetch(href);
      } catch {
        /* ignore */
      }
    });
  }, [router]);

  return null;
}
