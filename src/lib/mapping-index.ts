import type { NormalizedMappingEntry } from '@/lib/mapping-normalizer';

export interface MappingIndex {
  byFromKey: Map<string, NormalizedMappingEntry[]>;
  byToKey: Map<string, NormalizedMappingEntry[]>;
  mappedKeys: Set<string>;
}

export function buildMappingIndex(
  entries: NormalizedMappingEntry[],
): MappingIndex {
  const byFromKey = new Map<string, NormalizedMappingEntry[]>();
  const byToKey = new Map<string, NormalizedMappingEntry[]>();
  const toDedup = new Map<string, Set<string>>();
  const mappedKeys = new Set<string>();

  entries.forEach((entry) => {
    if (entry.fromKey) {
      mappedKeys.add(entry.fromKey);
      const fromEntries = byFromKey.get(entry.fromKey) || [];
      fromEntries.push(entry);
      byFromKey.set(entry.fromKey, fromEntries);
    }

    entry.toTargets.forEach((target) => {
      mappedKeys.add(target.key);

      const seenForKey = toDedup.get(target.key) || new Set<string>();
      if (seenForKey.has(entry.id)) {
        return;
      }
      seenForKey.add(entry.id);
      toDedup.set(target.key, seenForKey);

      const toEntries = byToKey.get(target.key) || [];
      toEntries.push(entry);
      byToKey.set(target.key, toEntries);
    });
  });

  return { byFromKey, byToKey, mappedKeys };
}
