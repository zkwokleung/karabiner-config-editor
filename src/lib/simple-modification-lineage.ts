import type {
  Condition,
  DeviceIdentifier,
  KeyCode,
  Manipulator,
  Profile,
  SimpleModification,
} from '@/types/karabiner';
import type { KeyCodeField } from '@/lib/keycodes/types';
import { getEventKeyField, getEventKeyValue } from '@/lib/karabiner-keycodes';

export interface KeyIdentity {
  field: KeyCodeField;
  value: string;
}

export interface SimpleModificationLineageScope {
  kind: 'all-other-devices' | 'condition' | 'device';
  deviceIndex?: number;
  label?: string;
  physicalSources: KeyIdentity[];
  affected: boolean;
}

export interface SimpleModificationLineage {
  postSimpleInput: KeyIdentity;
  scopes: SimpleModificationLineageScope[];
}

export function resolveSimpleModificationLineage(
  profile: Profile,
  manipulator: Manipulator,
): SimpleModificationLineage | null {
  const postSimpleInput = toIdentity(manipulator.from);
  if (!postSimpleInput) return null;

  const deviceConditions = (manipulator.conditions || []).filter(
    isDeviceScopeCondition,
  );
  const profileMappings = getEffectiveMappings(
    profile.simple_modifications || [],
  );
  const scopes: SimpleModificationLineageScope[] = [];

  const deviceIfConditions = deviceConditions.filter(
    (condition): condition is DeviceIfCondition =>
      condition.type === 'device_if',
  );

  if (
    deviceIfConditions.length === 0 &&
    isScopeAllowed(undefined, deviceConditions)
  ) {
    scopes.push(
      resolveScope(
        'all-other-devices',
        postSimpleInput,
        profileMappings,
        undefined,
        deviceConditions.length > 0
          ? 'Devices allowed by conditions'
          : undefined,
      ),
    );
  }

  getConditionDeviceCandidates(deviceIfConditions)
    .filter((identifiers) => isScopeAllowed(identifiers, deviceConditions))
    .forEach((identifiers, candidateIndex) => {
      scopes.push(
        resolveScope(
          'condition',
          postSimpleInput,
          profileMappings,
          candidateIndex,
          formatConditionScopeLabel(identifiers),
        ),
      );
    });

  profile.devices?.forEach((device, deviceIndex) => {
    if (!isScopeAllowed(device.identifiers, deviceConditions)) return;

    const deviceMappings = getEffectiveMappings(
      device.simple_modifications || [],
    );
    const overriddenSources = new Set(
      deviceMappings.map(({ source }) => identityKey(source)),
    );
    const effectiveMappings = [
      ...deviceMappings,
      ...profileMappings.filter(
        ({ source }) => !overriddenSources.has(identityKey(source)),
      ),
    ];

    scopes.push(
      resolveScope('device', postSimpleInput, effectiveMappings, deviceIndex),
    );
  });

  return { postSimpleInput, scopes };
}

function resolveScope(
  kind: SimpleModificationLineageScope['kind'],
  postSimpleInput: KeyIdentity,
  mappings: EffectiveMapping[],
  deviceIndex?: number,
  label?: string,
): SimpleModificationLineageScope {
  const inputKey = identityKey(postSimpleInput);
  const inputIsRemapped = mappings.some(
    ({ source }) => identityKey(source) === inputKey,
  );
  const feedingMappings = mappings.filter(({ targets }) =>
    targets.some((target) => identityKey(target) === inputKey),
  );
  const physicalSources = uniqueIdentities([
    ...(inputIsRemapped ? [] : [postSimpleInput]),
    ...feedingMappings.map(({ source }) => source),
  ]);

  return {
    kind,
    deviceIndex,
    label,
    physicalSources,
    affected: inputIsRemapped || feedingMappings.length > 0,
  };
}

interface EffectiveMapping {
  source: KeyIdentity;
  targets: KeyIdentity[];
}

function getEffectiveMappings(
  mappings: SimpleModification[],
): EffectiveMapping[] {
  const seenSources = new Set<string>();
  const result: EffectiveMapping[] = [];

  for (const mapping of mappings) {
    const source = toIdentity(mapping.from);
    if (!source || seenSources.has(identityKey(source))) continue;
    seenSources.add(identityKey(source));

    const targets = (Array.isArray(mapping.to) ? mapping.to : [mapping.to])
      .map(toIdentity)
      .filter((identity): identity is KeyIdentity => identity !== null);
    result.push({ source, targets });
  }

  return result;
}

function toIdentity(event: KeyCode): KeyIdentity | null {
  const field = getEventKeyField(event);
  const value = getEventKeyValue(event);
  return field && value ? { field, value } : null;
}

function uniqueIdentities(identities: KeyIdentity[]): KeyIdentity[] {
  const seen = new Set<string>();
  return identities.filter((identity) => {
    const key = identityKey(identity);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function identityKey(identity: KeyIdentity): string {
  return `${identity.field}:${identity.value}`;
}

type DeviceScopeCondition = Condition & {
  type: 'device_if' | 'device_unless';
};

type DeviceIfCondition = DeviceScopeCondition & { type: 'device_if' };

function isDeviceScopeCondition(
  condition: Condition,
): condition is DeviceScopeCondition {
  return condition.type === 'device_if' || condition.type === 'device_unless';
}

function isScopeAllowed(
  identifiers: DeviceIdentifier | undefined,
  conditions: DeviceScopeCondition[],
): boolean {
  return conditions.every((condition) => {
    const matches = identifiers
      ? (condition.identifiers || []).some((candidate) =>
          matchesIdentifier(identifiers, candidate),
        )
      : false;
    return condition.type === 'device_if' ? matches : !matches;
  });
}

function getConditionDeviceCandidates(
  conditions: DeviceIfCondition[],
): DeviceIdentifier[] {
  if (conditions.length === 0) return [];

  let candidates: DeviceIdentifier[] = [{}];
  for (const condition of conditions) {
    const identifiers = condition.identifiers || [];
    candidates = candidates.flatMap((candidate) =>
      identifiers.flatMap((identifier) => {
        const merged = mergeCompatibleIdentifiers(candidate, identifier);
        return merged ? [merged] : [];
      }),
    );
  }

  const seen = new Set<string>();
  return candidates.filter((candidate) => {
    const key = stableIdentifierKey(candidate);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mergeCompatibleIdentifiers(
  left: DeviceIdentifier,
  right: DeviceIdentifier,
): DeviceIdentifier | null {
  const sharedKeys = Object.keys(left).filter((key) => key in right) as Array<
    keyof DeviceIdentifier
  >;
  if (sharedKeys.some((key) => left[key] !== right[key])) return null;
  return { ...left, ...right };
}

function stableIdentifierKey(identifier: DeviceIdentifier): string {
  return Object.entries(identifier)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}:${String(value)}`)
    .join('|');
}

function formatConditionScopeLabel(identifier: DeviceIdentifier): string {
  const parts: string[] = [];
  if (identifier.vendor_id !== undefined) {
    parts.push(`vendor ${identifier.vendor_id}`);
  }
  if (identifier.product_id !== undefined) {
    parts.push(`product ${identifier.product_id}`);
  }
  if (identifier.is_keyboard !== undefined) {
    parts.push(identifier.is_keyboard ? 'keyboard' : 'non-keyboard');
  }
  if (identifier.is_pointing_device !== undefined) {
    parts.push(
      identifier.is_pointing_device ? 'pointing device' : 'non-pointing device',
    );
  }
  return parts.length > 0
    ? `Devices matching ${parts.join(', ')}`
    : 'Devices matching conditions';
}

function matchesIdentifier(
  actual: DeviceIdentifier,
  expected: DeviceIdentifier,
): boolean {
  const keys = Object.keys(expected) as Array<keyof DeviceIdentifier>;
  return keys.every((key) => actual[key] === expected[key]);
}
