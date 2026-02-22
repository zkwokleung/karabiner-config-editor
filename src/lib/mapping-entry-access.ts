import type { Manipulator } from '@/types/karabiner';
import type {
  KarabinerConfig,
  SimpleModification,
  FnFunctionKey,
} from '@/types/karabiner';
import type { NormalizedMappingEntry } from '@/lib/mapping-normalizer';

export type EditableMappingValue =
  | SimpleModification
  | FnFunctionKey
  | Manipulator;

export function getMappingValue(
  config: KarabinerConfig,
  entry: NormalizedMappingEntry,
): EditableMappingValue | null {
  const profile = config.profiles[entry.profileIndex];
  if (!profile) {
    return null;
  }

  if (entry.type === 'complex') {
    const rule = profile.complex_modifications?.rules?.[entry.ruleIndex ?? -1];
    return rule?.manipulators?.[entry.manipulatorIndex ?? -1] ?? null;
  }

  const mappingIndex = entry.mappingIndex ?? -1;
  if (mappingIndex < 0) {
    return null;
  }

  if (entry.scope === 'profile') {
    const list =
      entry.type === 'simple'
        ? profile.simple_modifications
        : profile.fn_function_keys;
    return list?.[mappingIndex] ?? null;
  }

  const device = profile.devices?.[entry.deviceIndex ?? -1];
  if (!device) {
    return null;
  }

  const list =
    entry.type === 'simple'
      ? device.simple_modifications
      : device.fn_function_keys;
  return list?.[mappingIndex] ?? null;
}

export function updateMappingValue(
  config: KarabinerConfig,
  entry: NormalizedMappingEntry,
  value: EditableMappingValue,
): KarabinerConfig | null {
  const next = structuredClone(config);
  const profile = next.profiles[entry.profileIndex];

  if (!profile) {
    return null;
  }

  if (entry.type === 'complex') {
    const rule = profile.complex_modifications?.rules?.[entry.ruleIndex ?? -1];
    const manipulatorIndex = entry.manipulatorIndex ?? -1;
    if (!rule || manipulatorIndex < 0 || !rule.manipulators[manipulatorIndex]) {
      return null;
    }
    rule.manipulators[manipulatorIndex] = value as Manipulator;
    return next;
  }

  const mappingIndex = entry.mappingIndex ?? -1;
  if (mappingIndex < 0) {
    return null;
  }

  if (entry.scope === 'profile') {
    if (entry.type === 'simple') {
      if (!profile.simple_modifications?.[mappingIndex]) {
        return null;
      }
      profile.simple_modifications[mappingIndex] = value as SimpleModification;
      return next;
    }

    if (!profile.fn_function_keys?.[mappingIndex]) {
      return null;
    }
    profile.fn_function_keys[mappingIndex] = value as FnFunctionKey;
    return next;
  }

  const device = profile.devices?.[entry.deviceIndex ?? -1];
  if (!device) {
    return null;
  }

  if (entry.type === 'simple') {
    if (!device.simple_modifications?.[mappingIndex]) {
      return null;
    }
    device.simple_modifications[mappingIndex] = value as SimpleModification;
    return next;
  }

  if (!device.fn_function_keys?.[mappingIndex]) {
    return null;
  }
  device.fn_function_keys[mappingIndex] = value as FnFunctionKey;
  return next;
}
