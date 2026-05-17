/** Internal app routes — prefetch in dev/client to avoid “Compiling…” on first navigation. */
export const APP_PREFETCH_HREFS = [
  '/',
  '/dashboard',
  '/agent',
  '/call-logs',
  '/settings',
  '/admin',
] as const;
