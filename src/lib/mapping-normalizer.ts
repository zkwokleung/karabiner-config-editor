import { getKeyLabel } from '@/lib/keyboard-layout';
import type {
  Device,
  FnFunctionKey,
  KarabinerConfig,
  KeyCode,
  Manipulator,
  Profile,
  ToEvent,
} from '@/types/karabiner';

export type NormalizedMappingType = 'simple' | 'fn' | 'complex';
export type MappingScope = 'profile' | 'device';
export type ComplexTargetPhase =
  | 'to'
  | 'to_if_alone'
  | 'to_if_held_down'
  | 'to_after_key_up';

export interface NormalizedTarget {
  key: string;
  phase: ComplexTargetPhase | 'default';
  modifiers: string[];
}

export interface NormalizedMappingEntry {
  id: string;
  type: NormalizedMappingType;
  scope: MappingScope;
  profileIndex: number;
  profileName: string;
  mappingIndex?: number;
  deviceIndex?: number;
  deviceLabel?: string;
  fromKey: string;
  fromModifiers: string[];
  toTargets: NormalizedTarget[];
  conditionsCount: number;
  ruleIndex?: number;
  ruleDescription?: string;
  manipulatorIndex?: number;
}

export function normalizeConfigMappings(
  config: KarabinerConfig,
): NormalizedMappingEntry[] {
  const entries: NormalizedMappingEntry[] = [];

  config.profiles.forEach((profile, profileIndex) => {
    const profileName = profile.name || `Profile ${profileIndex + 1}`;

    collectSimpleMappings(entries, profile, profileIndex, profileName);
    collectFnMappings(entries, profile, profileIndex, profileName);
    collectComplexMappings(entries, profile, profileIndex, profileName);
  });

  return entries;
}

function collectSimpleMappings(
  entries: NormalizedMappingEntry[],
  profile: Profile,
  profileIndex: number,
  profileName: string,
) {
  profile.simple_modifications?.forEach((mapping, mappingIndex) => {
    const entry = buildSimpleLikeEntry({
      type: 'simple',
      id: `p-${profileIndex}-simple-${mappingIndex}`,
      mapping,
      mappingIndex,
      profileIndex,
      profileName,
      scope: 'profile',
    });
    if (entry) {
      entries.push(entry);
    }
  });

  profile.devices?.forEach((device, deviceIndex) => {
    const deviceLabel = formatDeviceLabel(device, deviceIndex);
    device.simple_modifications?.forEach((mapping, mappingIndex) => {
      const entry = buildSimpleLikeEntry({
        type: 'simple',
        id: `p-${profileIndex}-d-${deviceIndex}-simple-${mappingIndex}`,
        mapping,
        mappingIndex,
        profileIndex,
        profileName,
        scope: 'device',
        deviceIndex,
        deviceLabel,
      });
      if (entry) {
        entries.push(entry);
      }
    });
  });
}

function collectFnMappings(
  entries: NormalizedMappingEntry[],
  profile: Profile,
  profileIndex: number,
  profileName: string,
) {
  profile.fn_function_keys?.forEach((mapping, mappingIndex) => {
    const entry = buildSimpleLikeEntry({
      type: 'fn',
      id: `p-${profileIndex}-fn-${mappingIndex}`,
      mapping,
      mappingIndex,
      profileIndex,
      profileName,
      scope: 'profile',
    });
    if (entry) {
      entries.push(entry);
    }
  });

  profile.devices?.forEach((device, deviceIndex) => {
    const deviceLabel = formatDeviceLabel(device, deviceIndex);
    device.fn_function_keys?.forEach((mapping, mappingIndex) => {
      const entry = buildSimpleLikeEntry({
        type: 'fn',
        id: `p-${profileIndex}-d-${deviceIndex}-fn-${mappingIndex}`,
        mapping,
        mappingIndex,
        profileIndex,
        profileName,
        scope: 'device',
        deviceIndex,
        deviceLabel,
      });
      if (entry) {
        entries.push(entry);
      }
    });
  });
}

function collectComplexMappings(
  entries: NormalizedMappingEntry[],
  profile: Profile,
  profileIndex: number,
  profileName: string,
) {
  profile.complex_modifications?.rules?.forEach((rule, ruleIndex) => {
    rule.manipulators.forEach((manipulator, manipulatorIndex) => {
      const fromKey = pickKey(manipulator.from);
      if (!fromKey) {
        return;
      }

      entries.push({
        id: `p-${profileIndex}-rule-${ruleIndex}-m-${manipulatorIndex}`,
        type: 'complex',
        scope: 'profile',
        profileIndex,
        profileName,
        fromKey,
        fromModifiers: normalizeModifiers(
          manipulator.from.modifiers?.mandatory,
        ),
        toTargets: collectComplexTargets(manipulator),
        conditionsCount: manipulator.conditions?.length || 0,
        ruleIndex,
        ruleDescription: rule.description || `Rule ${ruleIndex + 1}`,
        manipulatorIndex,
      });
    });
  });
}

function buildSimpleLikeEntry({
  type,
  id,
  mapping,
  mappingIndex,
  profileIndex,
  profileName,
  scope,
  deviceIndex,
  deviceLabel,
}: {
  type: 'simple' | 'fn';
  id: string;
  mapping: FnFunctionKey;
  mappingIndex: number;
  profileIndex: number;
  profileName: string;
  scope: MappingScope;
  deviceIndex?: number;
  deviceLabel?: string;
}): NormalizedMappingEntry | null {
  const fromKey = pickKey(mapping.from);
  if (!fromKey) {
    return null;
  }

  const toValues = Array.isArray(mapping.to) ? mapping.to : [mapping.to];
  const toTargets = toValues
    .map((value) => pickKey(value))
    .filter(Boolean)
    .map((key) => ({ key, phase: 'default' as const, modifiers: [] }));

  return {
    id,
    type,
    scope,
    profileIndex,
    profileName,
    mappingIndex,
    deviceIndex,
    deviceLabel,
    fromKey,
    fromModifiers: [],
    toTargets,
    conditionsCount: 0,
  };
}

function collectComplexTargets(manipulator: Manipulator): NormalizedTarget[] {
  const targets: NormalizedTarget[] = [];

  appendTargets(targets, manipulator.to, 'to');
  appendTargets(targets, manipulator.to_if_alone, 'to_if_alone');
  appendTargets(targets, manipulator.to_if_held_down, 'to_if_held_down');
  appendTargets(targets, manipulator.to_after_key_up, 'to_after_key_up');

  return targets;
}

function appendTargets(
  targets: NormalizedTarget[],
  events: ToEvent[] | undefined,
  phase: ComplexTargetPhase,
) {
  events?.forEach((event) => {
    const key = pickKey(event);
    if (!key) {
      return;
    }

    targets.push({
      key,
      phase,
      modifiers: normalizeModifiers(event.modifiers),
    });
  });
}

function pickKey(value?: KeyCode | ToEvent | null): string {
  if (!value) {
    return '';
  }
  return (
    value.key_code || value.consumer_key_code || value.pointing_button || ''
  );
}

function normalizeModifiers(modifiers: string[] | undefined): string[] {
  if (!modifiers || modifiers.length === 0) {
    return [];
  }
  return Array.from(new Set(modifiers)).sort();
}

function formatDeviceLabel(device: Device, index: number): string {
  const parts: string[] = [];
  if (device.identifiers?.vendor_id) {
    parts.push(`Vendor ${device.identifiers.vendor_id}`);
  }
  if (device.identifiers?.product_id) {
    parts.push(`Product ${device.identifiers.product_id}`);
  }
  if (device.identifiers?.is_keyboard) {
    parts.push('Keyboard');
  }
  if (device.identifiers?.is_pointing_device) {
    parts.push('Pointing device');
  }

  if (parts.length === 0) {
    return `Device ${index + 1}`;
  }

  return `Device ${index + 1} • ${parts.join(' • ')}`;
}

export function formatTargetSummary(entry: NormalizedMappingEntry): string {
  if (entry.toTargets.length === 0) {
    return 'No key output';
  }

  return entry.toTargets
    .slice(0, 3)
    .map((target) => {
      const mods =
        target.modifiers.length > 0 ? `${target.modifiers.join(' + ')} + ` : '';
      return `${mods}${getKeyLabel(target.key)}`;
    })
    .join(', ');
}
