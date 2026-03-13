'use client';

import { KeyCodeSelector } from '@/components/mapping/selectors/key-code-selector';
import type { KeyboardLayoutType } from '@/lib/keyboard-layout';

interface KeyInputProps {
  value: string;
  onChange: (value: string) => void;
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
  onChange,
  placeholder = 'Select or type key...',
  excludeNotFrom = false,
  layoutAware = false,
  layoutType,
}: KeyInputProps) {
  return (
    <KeyCodeSelector
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      excludeNotFrom={excludeNotFrom}
      layoutAware={layoutAware}
      layoutType={layoutType}
    />
  );
}
