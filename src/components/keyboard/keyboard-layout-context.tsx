'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import type {
  KeyboardLayoutType,
  KeyboardLegendType,
} from '@/lib/keyboard-layout';

const LEGEND_STORAGE_KEY = 'karabiner-config-editor:keyboard-legend:v1';
const LAYOUT_STORAGE_KEY = 'karabiner-config-editor:keyboard-layout:v1';

interface KeyboardLayoutContextValue {
  layoutType: KeyboardLayoutType;
  setLayoutType: Dispatch<SetStateAction<KeyboardLayoutType>>;
  keyboardTypeV2: KeyboardLayoutType;
  legendType: KeyboardLegendType;
  setLegendType: Dispatch<SetStateAction<KeyboardLegendType>>;
}

interface KeyboardLayoutProviderProps {
  children: ReactNode;
  keyboardTypeV2?: KeyboardLayoutType;
}

const KeyboardLayoutContext = createContext<KeyboardLayoutContextValue | null>(
  null,
);

export function KeyboardLayoutProvider({
  children,
  keyboardTypeV2,
}: KeyboardLayoutProviderProps) {
  const [layoutType, setLayoutType] = useState<KeyboardLayoutType>(
    () => keyboardTypeV2 ?? 'ansi',
  );
  const [legendType, setLegendType] = useState<KeyboardLegendType>('qwerty');
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedLayout = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
      const storedLegend = window.localStorage.getItem(LEGEND_STORAGE_KEY);
      if (isKeyboardLayoutType(storedLayout)) setLayoutType(storedLayout);
      if (isKeyboardLegendType(storedLegend)) setLegendType(storedLegend);
    } catch {
      // Storage may be unavailable in privacy-restricted browser contexts.
    } finally {
      setPreferencesLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!preferencesLoaded) return;
    try {
      window.localStorage.setItem(LAYOUT_STORAGE_KEY, layoutType);
      window.localStorage.setItem(LEGEND_STORAGE_KEY, legendType);
    } catch {
      // Keep the in-memory preferences when storage is unavailable.
    }
  }, [layoutType, legendType, preferencesLoaded]);

  const value = useMemo(() => {
    return {
      layoutType,
      setLayoutType,
      keyboardTypeV2: keyboardTypeV2 ?? 'ansi',
      legendType,
      setLegendType,
    };
  }, [keyboardTypeV2, layoutType, legendType]);

  return (
    <KeyboardLayoutContext.Provider value={value}>
      {children}
    </KeyboardLayoutContext.Provider>
  );
}

function isKeyboardLayoutType(
  value: string | null,
): value is KeyboardLayoutType {
  return value === 'ansi' || value === 'iso' || value === 'jis';
}

function isKeyboardLegendType(
  value: string | null,
): value is KeyboardLegendType {
  return value === 'qwerty' || value === 'dvorak' || value === 'colemak';
}

export function useKeyboardLayout() {
  const context = useContext(KeyboardLayoutContext);

  if (!context) {
    throw new Error(
      'useKeyboardLayout must be used within a KeyboardLayoutProvider',
    );
  }

  return context;
}
