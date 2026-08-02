import { describe, expect, it } from 'vitest';

import {
  getKeySelectionFromKeyboardCode,
  isModifierKeyboardCode,
} from '@/lib/keyboard-event-keycodes';
import { validateConfig } from '@/lib/validation';
import type { KarabinerConfig, Manipulator } from '@/types/karabiner';

function configWithOtherKeyActions(actions: unknown): KarabinerConfig {
  const manipulator = {
    type: 'basic',
    from: { key_code: 'a' },
    to_if_other_key_pressed: actions,
  } as unknown as Manipulator;

  return {
    global: {},
    profiles: [
      {
        name: 'Default',
        complex_modifications: {
          rules: [
            {
              description: 'Other-key actions',
              manipulators: [manipulator],
            },
          ],
        },
      },
    ],
  };
}

describe('import validation', () => {
  it('reports a non-array other-key action without throwing', () => {
    const errors = validateConfig(configWithOtherKeyActions({}));

    expect(errors).toContainEqual({
      path: 'profiles[0].complex_modifications.rules[0].manipulators[0].to_if_other_key_pressed',
      message: 'Other-key actions must be an array',
      severity: 'error',
    });
  });

  it('reports malformed nested other-key actions precisely', () => {
    const errors = validateConfig(
      configWithOtherKeyActions([null, { other_keys: [null], to: [] }]),
    );

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: 'profiles[0].complex_modifications.rules[0].manipulators[0].to_if_other_key_pressed[0]',
        }),
        expect.objectContaining({
          path: 'profiles[0].complex_modifications.rules[0].manipulators[0].to_if_other_key_pressed[1].other_keys[0]',
        }),
        expect.objectContaining({
          path: 'profiles[0].complex_modifications.rules[0].manipulators[0].to_if_other_key_pressed[1].to',
        }),
      ]),
    );
  });
});

describe('physical key recording', () => {
  it.each([
    ['KeyA', { field: 'key_code', value: 'a' }],
    ['Digit0', { field: 'key_code', value: '0' }],
    ['F24', { field: 'key_code', value: 'f24' }],
    ['Numpad7', { field: 'key_code', value: 'keypad_7' }],
    [
      'AudioVolumeUp',
      { field: 'consumer_key_code', value: 'volume_increment' },
    ],
  ])('maps %s to the matching Karabiner key', (code, selection) => {
    expect(getKeySelectionFromKeyboardCode(code)).toEqual(selection);
  });

  it('rejects unsupported keys and standalone modifiers', () => {
    expect(getKeySelectionFromKeyboardCode('F25')).toBeNull();
    expect(isModifierKeyboardCode('ShiftLeft')).toBe(true);
    expect(isModifierKeyboardCode('KeyA')).toBe(false);
  });
});
