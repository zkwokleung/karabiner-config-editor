export const KEY_CODE_FIELDS = [
  'key_code',
  'consumer_key_code',
  'pointing_button',
  'apple_vendor_top_case_key_code',
  'apple_vendor_keyboard_key_code',
  'generic_desktop',
] as const;

export type KeyCodeField = (typeof KEY_CODE_FIELDS)[number];

export interface KeyCodeItem {
  label: string;
  key_code?: string;
  consumer_key_code?: string;
  pointing_button?: string;
  apple_vendor_top_case_key_code?: string;
  apple_vendor_keyboard_key_code?: string;
  generic_desktop?: string;
  not_from?: boolean;
}

export interface KeyCodeCategory {
  category: string;
  items: KeyCodeItem[];
}
