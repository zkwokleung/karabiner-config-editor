'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toKarabinerKeyCode } from '@/lib/keyboard-layout';
import type { Manipulator } from '@/types/karabiner';
import { KeyboardShell } from '@/components/keyboard/keyboard-shell';
import { useKeyboardLayout } from '@/components/keyboard/keyboard-layout-context';
import { getEventKeyValue } from '@/lib/karabiner-keycodes';

export interface ComplexModificationKeyboardProps {
  manipulators: Manipulator[];
  className?: string;
  onKeyClick?: (keyCode: string) => void;
  selectedFromKey?: string | null;
  mode?: 'view' | 'select-from' | 'select-to';
  selectedToKeys?: string[];
  onToKeyToggle?: (keyCode: string) => void;
  showMappedKeys?: boolean;
  selectedKeys?: string[];
}

export function ComplexModificationKeyboard({
  manipulators,
  className,
  onKeyClick,
  selectedFromKey,
  mode = 'view',
  selectedToKeys = [],
  onToKeyToggle,
  showMappedKeys = true,
  selectedKeys = [],
}: ComplexModificationKeyboardProps) {
  const { layoutType, setLayoutType, keyboardTypeV2 } = useKeyboardLayout();
  const [transientSelectedKeys, setTransientSelectedKeys] = useState<string[]>(
    [],
  );

  const areArraysEqual = useCallback((a: string[], b: string[]) => {
    if (a === b) return true;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }, []);

  const externalSelectedKeys = useMemo(() => {
    return Array.from(
      new Set([
        ...selectedKeys,
        ...selectedToKeys,
        ...(selectedFromKey ? [selectedFromKey] : []),
      ]),
    );
  }, [selectedFromKey, selectedKeys, selectedToKeys]);

  // Keep a local selection in sync so highlights react immediately to clicks
  useEffect(() => {
    const next = Array.from(new Set(externalSelectedKeys));
    setTransientSelectedKeys((prev) =>
      areArraysEqual(prev, next) ? prev : next,
    );
  }, [externalSelectedKeys, areArraysEqual]);

  // Build set of keys that have manipulators (from keys only)
  const mappedKeys = useMemo(() => {
    if (!showMappedKeys) {
      return [];
    }
    const keySet = new Set<string>();
    manipulators.forEach((m) => {
      const fromKey = getEventKeyValue(m.from);
      if (fromKey) {
        keySet.add(fromKey);
      }
    });
    return Array.from(keySet);
  }, [manipulators, showMappedKeys]);

  const highlightLayers = useMemo(() => {
    const dedupedSelectedKeys = Array.from(
      new Set([...externalSelectedKeys, ...transientSelectedKeys]),
    );

    if (mode === 'select-to') {
      return [{ className: 'kb-selected-to', keys: dedupedSelectedKeys }];
    }

    return [
      { className: 'kb-mapped', keys: mappedKeys },
      {
        className: 'kb-selected',
        keys: dedupedSelectedKeys,
      },
    ];
  }, [mappedKeys, mode, externalSelectedKeys, transientSelectedKeys]);

  const handleKeyPress = useCallback(
    (button: string) => {
      const karabinerKey = toKarabinerKeyCode(button);

      if (mode === 'select-to') {
        setTransientSelectedKeys((prev) => {
          const hasKey = prev.includes(karabinerKey);
          if (hasKey) {
            return prev.filter((k) => k !== karabinerKey);
          }
          return [karabinerKey]; // single-select behavior matches dialog expectation
        });
        onToKeyToggle?.(karabinerKey);
      } else {
        onKeyClick?.(karabinerKey);
      }
    },
    [mode, onKeyClick, onToKeyToggle],
  );

  const legend =
    showMappedKeys && mode !== 'select-to' ? (
      <div className='flex items-center gap-3 text-xs text-muted-foreground'>
        <div className='flex items-center gap-1'>
          <div className='w-2.5 h-2.5 rounded-sm bg-primary/20 border border-primary' />
          <span>Mapped</span>
        </div>
      </div>
    ) : null;

  return (
    <KeyboardShell
      className={className}
      layoutType={layoutType}
      displayLayoutType={keyboardTypeV2}
      onLayoutChange={(value) => setLayoutType(value)}
      legend={legend}
      keyboardBaseClass='complex-kb'
      highlightLayers={highlightLayers}
      onKeyPress={handleKeyPress}
      physicalKeyboardHighlight={false}
    />
  );
}
