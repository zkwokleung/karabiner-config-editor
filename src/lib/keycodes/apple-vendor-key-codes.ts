import type { KeyCodeCategory } from './types';

export const APPLE_VENDOR_KEY_CODE_CATEGORIES: KeyCodeCategory[] = [
  {
    category: 'Apple vendor keys',
    items: [
      {
        label: 'apple_display_brightness_decrement',
        apple_vendor_top_case_key_code: 'brightness_down',
      },
      {
        label: 'apple_display_brightness_increment',
        apple_vendor_top_case_key_code: 'brightness_up',
      },
      {
        label: 'apple_top_case_display_brightness_decrement',
        apple_vendor_keyboard_key_code: 'brightness_down',
      },
      {
        label: 'apple_top_case_display_brightness_increment',
        apple_vendor_keyboard_key_code: 'brightness_up',
      },
      { label: 'dashboard', apple_vendor_top_case_key_code: 'dashboard' },
      { label: 'launchpad', apple_vendor_top_case_key_code: 'launchpad' },
      {
        label: 'mission_control',
        apple_vendor_top_case_key_code: 'mission_control',
      },
      {
        label: 'illumination_decrement',
        apple_vendor_top_case_key_code: 'illumination_down',
      },
      {
        label: 'illumination_increment',
        apple_vendor_top_case_key_code: 'illumination_up',
      },
      {
        label: 'video_mirror',
        apple_vendor_top_case_key_code: 'video_mirror',
      },
      {
        label: 'illumination_toggle',
        apple_vendor_top_case_key_code: 'illumination_toggle',
      },
      {
        label: 'mission_control (apple_vendor_keyboard)',
        apple_vendor_keyboard_key_code: 'mission_control',
      },
      {
        label: 'spotlight',
        apple_vendor_keyboard_key_code: 'spotlight',
      },
      {
        label: 'dashboard (apple_vendor_keyboard)',
        apple_vendor_keyboard_key_code: 'dashboard',
      },
      {
        label: 'function',
        apple_vendor_keyboard_key_code: 'function',
      },
      {
        label: 'launchpad (apple_vendor_keyboard)',
        apple_vendor_keyboard_key_code: 'launchpad',
      },
      {
        label: 'expose_all',
        apple_vendor_keyboard_key_code: 'expose_all',
      },
      {
        label: 'expose_desktop',
        apple_vendor_keyboard_key_code: 'expose_desktop',
      },
      {
        label: 'language',
        apple_vendor_keyboard_key_code: 'language',
      },
    ],
  },
];
