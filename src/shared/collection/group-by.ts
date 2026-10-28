export function groupBy<T>(items: readonly T[], keyOf: (item: T) => string): Map<string, T[]> {
  const grouped = new Map<string, T[]>();

  for (const item of items) {
    const key = keyOf(item);
    const bucket = grouped.get(key);
    if (bucket) {
      bucket.push(item);
      continue;
    }
    grouped.set(key, [item]);
  }

  return grouped;
}

export function alignByKey<T>(
  keys: readonly string[],
  grouped: ReadonlyMap<string, T>,
  empty: T,
): T[] {
  return keys.map((key) => grouped.get(key) ?? empty);
}
