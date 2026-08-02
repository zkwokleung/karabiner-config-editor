import { describe, expect, it } from 'vitest';

import { resolveSimpleModificationLineage } from '@/lib/simple-modification-lineage';
import type { Manipulator, Profile } from '@/types/karabiner';

const escapeManipulator: Manipulator = {
  type: 'basic',
  from: { key_code: 'escape' },
  to: [{ key_code: 'tab' }],
};

describe('simple-modification lineage', () => {
  it('honors device overrides when resolving physical source keys', () => {
    const profile: Profile = {
      name: 'Default',
      simple_modifications: [
        { from: { key_code: 'caps_lock' }, to: { key_code: 'escape' } },
      ],
      devices: [
        {
          identifiers: { vendor_id: 1, product_id: 10 },
          simple_modifications: [
            { from: { key_code: 'caps_lock' }, to: { key_code: 'tab' } },
          ],
        },
        {
          identifiers: { vendor_id: 2, product_id: 20 },
        },
      ],
    };

    const lineage = resolveSimpleModificationLineage(
      profile,
      escapeManipulator,
    );

    expect(lineage?.postSimpleInput).toEqual({
      field: 'key_code',
      value: 'escape',
    });
    expect(lineage?.scopes).toEqual([
      {
        kind: 'all-other-devices',
        deviceIndex: undefined,
        label: undefined,
        physicalSources: [
          { field: 'key_code', value: 'escape' },
          { field: 'key_code', value: 'caps_lock' },
        ],
        affected: true,
      },
      {
        kind: 'device',
        deviceIndex: 0,
        label: undefined,
        physicalSources: [{ field: 'key_code', value: 'escape' }],
        affected: false,
      },
      {
        kind: 'device',
        deviceIndex: 1,
        label: undefined,
        physicalSources: [
          { field: 'key_code', value: 'escape' },
          { field: 'key_code', value: 'caps_lock' },
        ],
        affected: true,
      },
    ]);
  });

  it('includes only device scopes allowed by device conditions', () => {
    const profile: Profile = {
      name: 'Default',
      simple_modifications: [
        { from: { key_code: 'caps_lock' }, to: { key_code: 'escape' } },
      ],
      devices: [
        { identifiers: { vendor_id: 1, product_id: 10 } },
        { identifiers: { vendor_id: 1, product_id: 99 } },
        { identifiers: { vendor_id: 2, product_id: 10 } },
      ],
    };
    const conditionedManipulator: Manipulator = {
      ...escapeManipulator,
      conditions: [
        { type: 'device_if', identifiers: [{ vendor_id: 1 }] },
        { type: 'device_unless', identifiers: [{ product_id: 99 }] },
      ],
    };

    const lineage = resolveSimpleModificationLineage(
      profile,
      conditionedManipulator,
    );

    expect(
      lineage?.scopes.map(({ kind, deviceIndex }) => ({
        kind,
        deviceIndex,
      })),
    ).toEqual([
      { kind: 'condition', deviceIndex: 0 },
      { kind: 'device', deviceIndex: 0 },
    ]);
    expect(lineage?.scopes.every((scope) => scope.affected)).toBe(true);
  });
});
