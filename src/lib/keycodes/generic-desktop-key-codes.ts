import type { KeyCodeCategory } from './types';

export const GENERIC_DESKTOP_KEY_CODE_CATEGORIES: KeyCodeCategory[] = [
  {
    category: 'System controls',
    items: [
      { label: 'system_sleep', generic_desktop: 'system_sleep' },
      { label: 'system_app_menu', generic_desktop: 'system_app_menu' },
      { label: 'dpad_up', generic_desktop: 'dpad_up' },
      { label: 'dpad_down', generic_desktop: 'dpad_down' },
      { label: 'dpad_right', generic_desktop: 'dpad_right' },
      { label: 'dpad_left', generic_desktop: 'dpad_left' },
      { label: 'do_not_disturb', generic_desktop: 'do_not_disturb' },
    ],
  },
];
