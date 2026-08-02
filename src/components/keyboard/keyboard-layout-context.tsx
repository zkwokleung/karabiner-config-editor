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
  const [layoutType, setLayoutType] = useState<KeyboardLayoutType>('ansi');
  const [legendType, setLegendType] = useState<KeyboardLegendType>('qwerty');
  const [legendPreferenceLoaded, setLegendPreferenceLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LEGEND_STORAGE_KEY);
      if (stored === 'qwerty' || stored === 'dvorak' || stored === 'colemak') {
        setLegendType(stored);
      }
    } catch {
      // Storage may be unavailable in privacy-restricted browser contexts.
    } finally {
      setLegendPreferenceLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!legendPreferenceLoaded) return;
    try {
      window.localStorage.setItem(LEGEND_STORAGE_KEY, legendType);
    } catch {
      // Keep the in-memory preference when storage is unavailable.
    }
  }, [legendPreferenceLoaded, legendType]);

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

export function useKeyboardLayout() {
  const context = useContext(KeyboardLayoutContext);

  if (!context) {
    throw new Error(
      'useKeyboardLayout must be used within a KeyboardLayoutProvider',
    );
  }

  return context;
}
