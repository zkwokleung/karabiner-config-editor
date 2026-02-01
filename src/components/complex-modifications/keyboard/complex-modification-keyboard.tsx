'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  toKarabinerKeyCode,
  toSimpleKeyboardButton,
  type KeyboardLayoutType,
} from '@/lib/keyboard-layout';
import type { Manipulator } from '@/types/karabiner';
import { KeyboardShell } from '@/components/keyboard/keyboard-shell';
import { ModifierStateBar, type ModifierState } from './modifier-state-bar';

export interface ComplexModificationKeyboardProps {
  manipulators: Manipulator[];
  className?: string;
  onKeyClick?: (keyCode: string) => void;
  selectedFromKey?: string | null;
  mode?: 'view' | 'select-from' | 'select-to';
  selectedToKeys?: string[];
  onToKeyToggle?: (keyCode: string) => void;
}

export function ComplexModificationKeyboard({
  manipulators,
  className,
  onKeyClick,
  selectedFromKey,
  mode = 'view',
  selectedToKeys = [],
  onToKeyToggle,
}: ComplexModificationKeyboardProps) {
  const [layoutType, setLayoutType] = useState<KeyboardLayoutType>('ansi');
  const [modifierState, setModifierState] = useState<ModifierState>({
    command: false,
    option: false,
    control: false,
    shift: false,
  });

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
    const keySet = new Set<string>();
    filteredManipulators.forEach((m) => {
      const fromKey = m.from.key_code || m.from.consumer_key_code || '';
      if (fromKey) {
        keySet.add(fromKey);
      }
    });
    return keySet;
  }, [filteredManipulators]);

  // Convert to simple-keyboard buttons for styling
  const mappedButtons = useMemo(() => {
    return Array.from(mappedKeys)
      .map((k) => toSimpleKeyboardButton(k))
      .join(' ');
  }, [mappedKeys]);

  const selectedFromButton = useMemo(() => {
    return selectedFromKey ? toSimpleKeyboardButton(selectedFromKey) : '';
  }, [selectedFromKey]);

  const selectedToButtons = useMemo(() => {
    return selectedToKeys.map((k) => toSimpleKeyboardButton(k)).join(' ');
  }, [selectedToKeys]);

  // Build button theme for highlighting
  const buttonTheme = useMemo(() => {
    const themes: Array<{ class: string; buttons: string }> = [];

    if (mode === 'select-to') {
      // In select-to mode, highlight selected to keys
      if (selectedToButtons) {
        themes.push({
          class: 'kb-selected-to',
          buttons: selectedToButtons,
        });
      }
    } else {
      // Normal view mode - show mapped keys
      if (mappedButtons) {
        themes.push({
          class: 'kb-mapped',
          buttons: mappedButtons,
        });
      }

      // Selected key (overrides mapped styling)
      if (selectedFromButton) {
        themes.push({
          class: 'kb-selected',
          buttons: selectedFromButton,
        });
      }
    }

    return themes.length > 0 ? themes : undefined;
  }, [mappedButtons, selectedFromButton, selectedToButtons, mode]);

  const handleKeyPress = useCallback(
    (button: string) => {
      const karabinerKey = toKarabinerKeyCode(button);

      if (mode === 'select-to') {
        onToKeyToggle?.(karabinerKey);
      } else {
        onKeyClick?.(karabinerKey);
      }
    },
    [mode, onKeyClick, onToKeyToggle],
  );

  const legend = (
    <div className='flex items-center gap-3 text-xs text-muted-foreground'>
      <div className='flex items-center gap-1'>
        <div className='w-2.5 h-2.5 rounded-sm bg-primary/20 border border-primary' />
        <span>Mapped</span>
      </div>
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
      keyboardKey={`${mappedButtons}-${selectedToButtons}-${mode}`}
      buttonTheme={buttonTheme}
      onKeyPress={handleKeyPress}
      physicalKeyboardHighlight={false}
      afterKeyboard={
        <p className='text-xs text-muted-foreground mt-3 text-center'>
          {mode === 'select-to'
            ? 'Click keys to select/deselect them as "to" targets'
            : 'Click on any key to create or edit a mapping. Use modifier buttons above to filter.'}
        </p>
      }
      extraStyles={`
        .complex-kb.simple-keyboard .hg-button.kb-mapped {
          background: color-mix(in srgb, var(--color-primary) 15%, var(--color-background)) !important;
          border-color: var(--color-primary) !important;
          border-width: 2px !important;
          color: var(--color-primary) !important;
          font-weight: 600 !important;
        }
        .complex-kb.simple-keyboard .hg-button.kb-mapped:hover {
          background: color-mix(in srgb, var(--color-primary) 25%, var(--color-background)) !important;
        }
        .complex-kb.simple-keyboard .hg-button.kb-selected {
          background: color-mix(in srgb, var(--color-primary) 30%, var(--color-background)) !important;
          border-color: var(--color-primary) !important;
          border-width: 3px !important;
          color: var(--color-primary) !important;
          font-weight: 700 !important;
          box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary) 30%, transparent) !important;
        }
        .complex-kb.simple-keyboard .hg-button.kb-selected-to {
          background: color-mix(in srgb, #a855f7 25%, var(--color-background)) !important;
          border-color: #a855f7 !important;
          border-width: 2px !important;
          color: #a855f7 !important;
          font-weight: 600 !important;
        }
        .complex-kb.simple-keyboard .hg-button.kb-selected-to:hover {
          background: color-mix(in srgb, #a855f7 35%, var(--color-background)) !important;
        }
      `}
    />
  );
}
