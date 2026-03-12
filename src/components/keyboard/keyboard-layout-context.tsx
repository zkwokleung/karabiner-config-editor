'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import type { KeyboardLayoutType } from '@/lib/keyboard-layout';

interface KeyboardLayoutContextValue {
  layoutType: KeyboardLayoutType;
  setLayoutType: Dispatch<SetStateAction<KeyboardLayoutType>>;
  keyboardTypeV2: KeyboardLayoutType;
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

  const value = useMemo(() => {
    return {
      layoutType,
      setLayoutType,
      keyboardTypeV2: keyboardTypeV2 ?? 'ansi',
    };
  }, [keyboardTypeV2, layoutType]);

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
