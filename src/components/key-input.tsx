'use client';

import { KeyCodeSelector } from '@/components/mapping/selectors/key-code-selector';
import type { KeyboardLayoutType } from '@/lib/keyboard-layout';
import type { KeySelection } from '@/lib/karabiner-keycodes';
import type { KeyCodeField } from '@/lib/keycodes/types';

interface KeyInputProps {
  value: string;
  valueField?: KeyCodeField | null;
  onChange: (selection: KeySelection) => void;
  placeholder?: string;
  excludeNotFrom?: boolean;
  layoutAware?: boolean;
  layoutType?: KeyboardLayoutType;
}

/**
 * Key input component using the advanced KeyCodeSelector
 * Provides categorized key code selection with search
 */
export function KeyInput({
  value,
  valueField,
  onChange,
  placeholder = 'Select or type key...',
  excludeNotFrom = false,
  layoutAware = false,
  layoutType,
}: KeyInputProps) {
  return (
    <KeyCodeSelector
      value={value}
      valueField={valueField}
      onChange={onChange}
      placeholder={placeholder}
      excludeNotFrom={excludeNotFrom}
      layoutAware={layoutAware}
      layoutType={layoutType}
    />
  );
}
