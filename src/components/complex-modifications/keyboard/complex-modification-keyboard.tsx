'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import { cn } from '@/lib/utils';
import {
  getLayoutForType,
  KEYBOARD_DISPLAY,
  BUTTON_WIDTHS,
  toKarabinerKeyCode,
  toSimpleKeyboardButton,
  KEYBOARD_LAYOUT_OPTIONS,
  type KeyboardLayoutType,
} from '@/lib/keyboard-layout';
import type { Manipulator } from '@/types/karabiner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  const keyboardRef = useRef<typeof Keyboard | null>(null);
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

  // Build maps for "from" and "to" keys
  const { fromKeys, toKeys } = useMemo(() => {
    const fromSet = new Set<string>();
    const toSet = new Set<string>();

    filteredManipulators.forEach((m) => {
      const fromKey = m.from.key_code || m.from.consumer_key_code || '';
      if (fromKey) {
        fromSet.add(fromKey);
        (m.to || []).forEach((t) => {
          const toKey = t.key_code || t.consumer_key_code || '';
          if (toKey) {
            toSet.add(toKey);
          }
        });
      }
    });

    return { fromKeys: fromSet, toKeys: toSet };
  }, [filteredManipulators]);

  // Convert to simple-keyboard buttons for styling
  const fromButtons = useMemo(() => {
    return Array.from(fromKeys)
      .map((k) => toSimpleKeyboardButton(k))
      .join(' ');
  }, [fromKeys]);

  const toButtons = useMemo(() => {
    return Array.from(toKeys)
      .map((k) => toSimpleKeyboardButton(k))
      .join(' ');
  }, [toKeys]);

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
      // Normal view mode - show from/to mappings
      if (toButtons) {
        themes.push({
          class: 'kb-to',
          buttons: toButtons,
        });
      }

      if (fromButtons) {
        themes.push({
          class: 'kb-from',
          buttons: fromButtons,
        });
      }

      // Selected from key (overrides from styling)
      if (selectedFromButton) {
        themes.push({
          class: 'kb-selected',
          buttons: selectedFromButton,
        });
      }
    }

    return themes.length > 0 ? themes : undefined;
  }, [fromButtons, toButtons, selectedFromButton, selectedToButtons, mode]);

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

  const layout = getLayoutForType(layoutType);
  const buttonWidths = BUTTON_WIDTHS[layoutType];

  // Generate CSS for button widths
  const buttonWidthStyles = useMemo(() => {
    return Object.entries(buttonWidths)
      .map(([button, width]) => {
        return `.complex-kb .hg-button[data-skbtn="${button}"] { width: ${width}; min-width: ${width}; max-width: ${width}; }`;
      })
      .join('\n');
  }, [buttonWidths]);

  // Force re-render when layout or buttonTheme changes
  useEffect(() => {
    if (keyboardRef.current) {
      (
        keyboardRef.current as {
          setOptions?: (opts: Record<string, unknown>) => void;
        }
      )?.setOptions?.({
        layout: layout,
        buttonTheme: buttonTheme,
      });
    }
  }, [layout, buttonTheme]);

  return (
    <div className={cn('select-none relative', className)}>
      {/* Header: Layout selector + Legend */}
      <div className='flex items-center justify-between mb-3 flex-wrap gap-2'>
        <Select
          value={layoutType}
          onValueChange={(v) => setLayoutType(v as KeyboardLayoutType)}
        >
          <SelectTrigger className='w-[130px] h-8 bg-transparent text-xs'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {KEYBOARD_LAYOUT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label} ({opt.description})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Inline Legend */}
        <div className='flex items-center gap-3 text-xs text-muted-foreground'>
          <div className='flex items-center gap-1'>
            <div className='w-2.5 h-2.5 rounded-sm bg-blue-500/20 border border-blue-500' />
            <span>From</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='w-2.5 h-2.5 rounded-sm bg-green-500/20 border border-green-500' />
            <span>To</span>
          </div>
          {mode === 'select-to' && (
            <div className='flex items-center gap-1'>
              <div className='w-2.5 h-2.5 rounded-sm bg-purple-500/20 border border-purple-500' />
              <span>Selected</span>
            </div>
          )}
        </div>
      </div>

      {/* Modifier State Bar */}
      <ModifierStateBar
        state={modifierState}
        onChange={setModifierState}
        className='mb-3'
        disabled={mode === 'select-to'}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .complex-kb.simple-keyboard.hg-theme-default {
          background: var(--color-muted) !important;
          padding: 10px !important;
          border-radius: 10px !important;
          font-family: inherit !important;
        }
        .complex-kb.simple-keyboard .hg-row {
          gap: 4px !important;
          margin-bottom: 4px !important;
        }
        .complex-kb.simple-keyboard .hg-row:last-child {
          margin-bottom: 0 !important;
        }
        .complex-kb.simple-keyboard .hg-button {
          height: 38px !important;
          min-width: 38px !important;
          border-radius: 6px !important;
          background: var(--color-background) !important;
          border: 1px solid var(--color-border) !important;
          color: var(--color-foreground) !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
          transition: all 0.1s ease !important;
        }
        .complex-kb.simple-keyboard .hg-button:hover {
          background: var(--color-accent) !important;
          border-color: var(--color-primary) !important;
        }
        .complex-kb.simple-keyboard .hg-button:active {
          transform: translateY(1px) !important;
          box-shadow: none !important;
        }
        /* "From" keys - blue */
        .complex-kb.simple-keyboard .hg-button.kb-from {
          background: color-mix(in srgb, #3b82f6 15%, var(--color-background)) !important;
          border-color: #3b82f6 !important;
          border-width: 2px !important;
          color: #3b82f6 !important;
          font-weight: 600 !important;
        }
        .complex-kb.simple-keyboard .hg-button.kb-from:hover {
          background: color-mix(in srgb, #3b82f6 25%, var(--color-background)) !important;
        }
        /* "To" keys - green */
        .complex-kb.simple-keyboard .hg-button.kb-to {
          background: color-mix(in srgb, #22c55e 15%, var(--color-background)) !important;
          border-color: #22c55e !important;
          border-width: 2px !important;
          color: #22c55e !important;
          font-weight: 600 !important;
        }
        .complex-kb.simple-keyboard .hg-button.kb-to:hover {
          background: color-mix(in srgb, #22c55e 25%, var(--color-background)) !important;
        }
        /* Selected "from" key - stronger blue */
        .complex-kb.simple-keyboard .hg-button.kb-selected {
          background: color-mix(in srgb, #3b82f6 30%, var(--color-background)) !important;
          border-color: #3b82f6 !important;
          border-width: 3px !important;
          color: #3b82f6 !important;
          font-weight: 700 !important;
          box-shadow: 0 0 0 2px color-mix(in srgb, #3b82f6 30%, transparent) !important;
        }
        /* Selected "to" keys in select mode - purple */
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
        ${buttonWidthStyles}
      `,
        }}
      />

      <div className='bg-muted/50 rounded-lg border p-2'>
        <Keyboard
          keyboardRef={(r) =>
            (keyboardRef.current = r as typeof Keyboard | null)
          }
          baseClass='complex-kb'
          layout={layout}
          display={KEYBOARD_DISPLAY}
          onKeyPress={handleKeyPress}
          buttonTheme={buttonTheme}
          physicalKeyboardHighlight={false}
          mergeDisplay={true}
          useButtonTag={true}
        />
      </div>

      {/* Help text */}
      <p className='text-xs text-muted-foreground mt-3 text-center'>
        {mode === 'select-to'
          ? 'Click keys to select/deselect them as "to" targets'
          : 'Click on any key to create or edit a mapping. Use modifier buttons above to filter.'}
      </p>
    </div>
  );
}
