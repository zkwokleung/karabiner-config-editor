'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toKarabinerKeyCode } from '@/lib/keyboard-layout';
import type { Manipulator } from '@/types/karabiner';
import { KeyboardShell } from '@/components/keyboard/keyboard-shell';
import { useKeyboardLayout } from '@/components/keyboard/keyboard-layout-context';
import { ModifierStateBar, type ModifierState } from './modifier-state-bar';

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
  const { layoutType, setLayoutType } = useKeyboardLayout();
  const [transientSelectedKeys, setTransientSelectedKeys] = useState<string[]>(
    [],
  );
  const [modifierState, setModifierState] = useState<ModifierState>({
    command: false,
    option: false,
    control: false,
    shift: false,
  });

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

  // Filter manipulators based on modifier state
  const filteredManipulators = useMemo(() => {
    const activeModifiers: string[] = [];
    if (modifierState.command)
      activeModifiers.push('command', 'left_command', 'right_command');
    if (modifierState.option)
      activeModifiers.push('option', 'left_option', 'right_option');
    if (modifierState.control)
      activeModifiers.push('control', 'left_control', 'right_control');
    if (modifierState.shift)
      activeModifiers.push('shift', 'left_shift', 'right_shift');

    if (activeModifiers.length === 0) {
      return manipulators;
    }

    return manipulators.filter((m) => {
      const mandatory = m.from.modifiers?.mandatory || [];
      // Check if all active modifier types are represented in mandatory
      const hasCommand =
        !modifierState.command ||
        mandatory.some((mod) =>
          ['command', 'left_command', 'right_command'].includes(mod),
        );
      const hasOption =
        !modifierState.option ||
        mandatory.some((mod) =>
          ['option', 'left_option', 'right_option'].includes(mod),
        );
      const hasControl =
        !modifierState.control ||
        mandatory.some((mod) =>
          ['control', 'left_control', 'right_control'].includes(mod),
        );
      const hasShift =
        !modifierState.shift ||
        mandatory.some((mod) =>
          ['shift', 'left_shift', 'right_shift'].includes(mod),
        );
      return hasCommand && hasOption && hasControl && hasShift;
    });
  }, [manipulators, modifierState]);

  // Build set of keys that have mappings (from keys only)
  const mappedKeys = useMemo(() => {
    if (!showMappedKeys) {
      return [];
    }
    const keySet = new Set<string>();
    filteredManipulators.forEach((m) => {
      const fromKey = m.from.key_code || m.from.consumer_key_code || '';
      if (fromKey) {
        keySet.add(fromKey);
      }
    });
    return Array.from(keySet);
  }, [filteredManipulators, showMappedKeys]);

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

  const legend = (
    <div className='flex items-center gap-3 text-xs text-muted-foreground'>
      {showMappedKeys && mode !== 'select-to' && (
        <div className='flex items-center gap-1'>
          <div className='w-2.5 h-2.5 rounded-sm bg-primary/20 border border-primary' />
          <span>Mapped</span>
        </div>
      )}
      {mode === 'select-to' && (
        <div className='flex items-center gap-1'>
          <div className='w-2.5 h-2.5 rounded-sm bg-purple-500/20 border border-purple-500' />
          <span>Selected</span>
        </div>
      )}
    </div>
  );

  const modifierControls = (
    <ModifierStateBar
      state={modifierState}
      onChange={setModifierState}
      className='mb-3'
      disabled={mode === 'select-to'}
    />
  );

  return (
    <KeyboardShell
      className={className}
      layoutType={layoutType}
      onLayoutChange={(value) => setLayoutType(value)}
      legend={legend}
      beforeKeyboard={modifierControls}
      keyboardBaseClass='complex-kb'
      highlightLayers={highlightLayers}
      onKeyPress={handleKeyPress}
      physicalKeyboardHighlight={false}
    />
  );
}
