import type { KarabinerConfig } from '@/types/karabiner';

/**
 * Returns a minimal but valid Karabiner configuration that the editor can use
 * as a clean starting point.
 */
export function createMinimalKarabinerConfig(): KarabinerConfig {
  return {
    global: {
      show_in_menu_bar: true,
      show_profile_name_in_menu_bar: false,
    },
    profiles: [
      {
        name: 'Default Profile',
        selected: true,
        simple_modifications: [],
        fn_function_keys: [],
        devices: [],
        complex_modifications: {
          parameters: {},
          rules: [],
        },
      },
    ],
  };
}
