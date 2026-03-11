import {
  PROFILE_PARAMETER_DEFAULTS,
  type ProfileParameterKey,
} from '@/components/configurations/constants';
import type { Parameters } from '@/types/karabiner';

export function parseOptionalNumber(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function normalizeOptionalObject<T extends object>(
  value: T,
): T | undefined {
  const nextEntries = Object.entries(value as Record<string, unknown>).filter(
    ([, entryValue]) => entryValue !== undefined,
  );

  if (nextEntries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(nextEntries) as T;
}

export function normalizeProfileParameters(
  parameters: Parameters,
): Parameters | undefined {
  const nextEntries = Object.entries(parameters).filter(([key, value]) => {
    if (value === undefined) {
      return false;
    }

    return value !== PROFILE_PARAMETER_DEFAULTS[key as ProfileParameterKey];
  });

  if (nextEntries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(nextEntries) as Parameters;
}
