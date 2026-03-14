import { COMMON_KEY_CODE_CATEGORIES } from '@/lib/keycodes/common-key-codes';
import { CONSUMER_KEY_CODE_CATEGORIES } from '@/lib/keycodes/consumer-key-codes';
import { APPLE_VENDOR_KEY_CODE_CATEGORIES } from '@/lib/keycodes/apple-vendor-key-codes';
import { GENERIC_DESKTOP_KEY_CODE_CATEGORIES } from '@/lib/keycodes/generic-desktop-key-codes';
import { POINTING_BUTTON_KEY_CODE_CATEGORIES } from '@/lib/keycodes/pointing-button-codes';
import {
  KEY_CODE_FIELDS,
  type KeyCodeField,
  type KeyCodeItem,
} from '@/lib/keycodes/types';

export type { KeyCodeCategory, KeyCodeItem } from '@/lib/keycodes/types';

export const KARABINER_KEYCODES = [
  ...COMMON_KEY_CODE_CATEGORIES,
  ...CONSUMER_KEY_CODE_CATEGORIES,
  ...APPLE_VENDOR_KEY_CODE_CATEGORIES,
  ...GENERIC_DESKTOP_KEY_CODE_CATEGORIES,
  ...POINTING_BUTTON_KEY_CODE_CATEGORIES,
];

export type ResolvedKeyCodeItem = {
  item: KeyCodeItem;
  field: KeyCodeField;
};

export type KeySelection = {
  value: string;
  field: KeyCodeField;
};

type KeyEventLike = Partial<Record<KeyCodeField, string>>;

const VALUE_TO_ITEMS = new Map<string, ResolvedKeyCodeItem[]>();
const FIELD_TO_VALUES = new Map<KeyCodeField, Set<string>>();

for (const field of KEY_CODE_FIELDS) {
  FIELD_TO_VALUES.set(field, new Set<string>());
}

for (const category of KARABINER_KEYCODES) {
  for (const item of category.items) {
    for (const field of KEY_CODE_FIELDS) {
      const value = item[field];
      if (!value) {
        continue;
      }

      FIELD_TO_VALUES.get(field)?.add(value);

      const resolvedItem = { item, field };
      const existing = VALUE_TO_ITEMS.get(value);
      if (existing) {
        existing.push(resolvedItem);
      } else {
        VALUE_TO_ITEMS.set(value, [resolvedItem]);
      }
    }
  }
}

export function getKeyCodeValue(item: KeyCodeItem): string {
  for (const field of KEY_CODE_FIELDS) {
    const value = item[field];
    if (value) {
      return value;
    }
  }

  return '';
}

export function getKeyCodeField(item: KeyCodeItem): KeyCodeField | null {
  for (const field of KEY_CODE_FIELDS) {
    if (item[field]) {
      return field;
    }
  }

  return null;
}

export function findKeyCodeItems(value: string): ResolvedKeyCodeItem[] {
  return VALUE_TO_ITEMS.get(value) || [];
}

export function findKeyCodeItem(value: string): KeyCodeItem | undefined {
  return findKeyCodeItems(value)[0]?.item;
}

export function findKeyCodeItemByField(
  value: string,
  field: KeyCodeField,
): KeyCodeItem | undefined {
  return findKeyCodeItems(value).find((entry) => entry.field === field)?.item;
}

export function supportsKeyCodeValueForField(
  value: string,
  field: KeyCodeField,
): boolean {
  return FIELD_TO_VALUES.get(field)?.has(value) || false;
}

export function extractKeySelection(
  value?: KeyEventLike | null,
): KeySelection | null {
  if (!value) {
    return null;
  }

  for (const field of KEY_CODE_FIELDS) {
    const keyValue = value[field];
    if (keyValue) {
      return {
        field,
        value: keyValue,
      };
    }
  }

  return null;
}

export function getEventKeyField(
  value?: KeyEventLike | null,
): KeyCodeField | null {
  return extractKeySelection(value)?.field || null;
}

export function getEventKeyValue(value?: KeyEventLike | null): string {
  return extractKeySelection(value)?.value || '';
}

export function clearEventKeyFields<T extends KeyEventLike>(value: T): T {
  const next = { ...value } as Record<string, unknown>;
  for (const field of KEY_CODE_FIELDS) {
    delete next[field];
  }
  return next as T;
}

export function resolveFieldForKeyValue(keyValue: string): KeyCodeField | null {
  // Strict resolution: return null when ambiguous or unknown.
  if (!keyValue) return null;

  if (/^button\d+$/u.test(keyValue)) {
    return 'pointing_button';
  }

  const items = findKeyCodeItems(keyValue);
  if (items.length === 1) {
    return items[0].field;
  }

  // 0 items (unknown) or >1 items (ambiguous) -> strict null
  return null;
}

export function setEventKeyValue<T extends KeyEventLike>(
  value: T,
  keyValue: string,
  field: KeyCodeField,
): T {
  const next = clearEventKeyFields(value);

  if (!keyValue) {
    return next;
  }

  return {
    ...next,
    [field]: keyValue,
  } as T;
}
