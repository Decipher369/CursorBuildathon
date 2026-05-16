export function sentimentClass(label?: string) {
  if (label === 'positive')
    return 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200';
  if (label === 'negative')
    return 'bg-red-500/15 text-red-800 dark:text-red-200';
  return 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300';
}
