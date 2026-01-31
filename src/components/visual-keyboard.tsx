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
import type { SimpleModification } from '@/types/karabiner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface VisualKeyboardProps {
  mappings?: SimpleModification[];
  selectedKey?: string | null;
  onKeySelect?: (keyCode: string) => void;
  conflictingKeys?: Set<string>;
  className?: string;
}

export function VisualKeyboard({
  mappings = [],
  selectedKey = null,
  onKeySelect,
  conflictingKeys = new Set(),
  className,
}: VisualKeyboardProps) {
  const keyboardRef = useRef<typeof Keyboard | null>(null);
  const [layoutType, setLayoutType] = useState<KeyboardLayoutType>('ansi');

  // Build a map of from -> to for quick lookup (Karabiner key codes)
  const mappingMap = useMemo(() => {
    const map = new Map<string, string>();
    mappings.forEach((mod) => {
      const fromKey = mod.from.key_code || mod.from.consumer_key_code || '';
      const toRaw = Array.isArray(mod.to) ? mod.to[0] : mod.to;
      const toKey = toRaw?.key_code || toRaw?.consumer_key_code || '';
      if (fromKey && toKey) {
        map.set(fromKey, toKey);
      }
    });
    return map;
  }, [mappings]);

  // Convert Karabiner key codes to simple-keyboard buttons for styling
  const remappedButtons = useMemo(() => {
    return Array.from(mappingMap.keys())
      .map((k) => toSimpleKeyboardButton(k))
      .join(' ');
  }, [mappingMap]);

  const conflictButtons = useMemo(() => {
    return Array.from(conflictingKeys)
      .map((k) => toSimpleKeyboardButton(k))
      .join(' ');
  }, [conflictingKeys]);

  const selectedButton = useMemo(() => {
    return selectedKey ? toSimpleKeyboardButton(selectedKey) : '';
  }, [selectedKey]);

  // Build button theme for highlighting
  const buttonTheme = useMemo(() => {
    const themes: Array<{ class: string; buttons: string }> = [];

    if (selectedButton) {
      themes.push({
        class: 'kb-selected',
        buttons: selectedButton,
      });
    }

    if (remappedButtons && !selectedButton) {
      // Don't apply remapped style if the button is selected
      const remappedWithoutSelected = remappedButtons
        .split(' ')
        .filter((b) => b !== selectedButton)
        .join(' ');
      if (remappedWithoutSelected) {
        themes.push({
          class: 'kb-remapped',
          buttons: remappedWithoutSelected,
        });
      }
    } else if (remappedButtons) {
      themes.push({
        class: 'kb-remapped',
        buttons: remappedButtons,
      });
    }

    if (conflictButtons) {
      themes.push({
        class: 'kb-conflict',
        buttons: conflictButtons,
      });
    }

    return themes.length > 0 ? themes : undefined;
  }, [selectedButton, remappedButtons, conflictButtons]);

  const handleKeyPress = useCallback(
    (button: string) => {
      const karabinerKey = toKarabinerKeyCode(button);
      onKeySelect?.(karabinerKey);
    },
    [onKeySelect],
  );

  const layout = getLayoutForType(layoutType);
  const buttonWidths = BUTTON_WIDTHS[layoutType];

  // Generate CSS for button widths
  const buttonWidthStyles = useMemo(() => {
    return Object.entries(buttonWidths)
      .map(([button, width]) => {
        const escapedButton = button.replace(/[{}[\]]/g, '\\$&');
        return `.simple-keyboard .hg-button[data-skbtn="${button}"], .simple-keyboard .hg-button[data-skbtn="${escapedButton}"] { width: ${width}; min-width: ${width}; max-width: ${width}; }`;
      })
      .join('\n');
  }, [buttonWidths]);

  // Force re-render when layout changes
  useEffect(() => {
    if (keyboardRef.current) {
      (
        keyboardRef.current as {
          setOptions?: (opts: Record<string, unknown>) => void;
        }
      )?.setOptions?.({
        layout: layout,
      });
    }
  }, [layout]);

  return (
    <div className={cn('select-none', className)}>
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center gap-2'>
          <Label htmlFor='layout-select' className='text-sm'>
            Layout:
          </Label>
          <Select
            value={layoutType}
            onValueChange={(v) => setLayoutType(v as KeyboardLayoutType)}
          >
            <SelectTrigger
              id='layout-select'
              className='w-[140px] h-8 bg-transparent'
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KEYBOARD_LAYOUT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label} - {opt.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <style>{`
        .simple-keyboard {
          background: transparent;
          padding: 8px;
          border-radius: 8px;
          font-family: inherit;
        }
        .simple-keyboard .hg-row {
          gap: 4px;
        }
        .simple-keyboard .hg-button {
          height: 36px;
          min-width: 36px;
          border-radius: 6px;
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
          color: hsl(var(--foreground));
          font-size: 11px;
          font-weight: 500;
          box-shadow: none;
          transition: all 0.15s ease;
        }
        .simple-keyboard .hg-button:hover {
          background: hsl(var(--accent));
        }
        .simple-keyboard .hg-button:active {
          background: hsl(var(--accent));
          transform: scale(0.98);
        }
        .simple-keyboard .hg-button.kb-selected {
          background: hsl(var(--primary) / 0.2);
          border-color: hsl(var(--primary));
          box-shadow: 0 0 0 2px hsl(var(--primary) / 0.3);
        }
        .simple-keyboard .hg-button.kb-remapped {
          background: hsl(142 76% 36% / 0.1);
          border-color: hsl(142 76% 36%);
          color: hsl(142 76% 36%);
        }
        .simple-keyboard .hg-button.kb-conflict {
          background: hsl(var(--destructive) / 0.1);
          border-color: hsl(var(--destructive));
          color: hsl(var(--destructive));
        }
        .dark .simple-keyboard .hg-button.kb-remapped {
          color: hsl(142 76% 56%);
        }
        ${buttonWidthStyles}
      `}</style>

      <div className='bg-muted/50 rounded-lg border p-2'>
        <Keyboard
          keyboardRef={(r) =>
            (keyboardRef.current = r as typeof Keyboard | null)
          }
          layout={layout}
          display={KEYBOARD_DISPLAY}
          onKeyPress={handleKeyPress}
          buttonTheme={buttonTheme}
          physicalKeyboardHighlight={true}
          physicalKeyboardHighlightBgColor='hsl(var(--accent))'
          physicalKeyboardHighlightTextColor='hsl(var(--foreground))'
          mergeDisplay={true}
          useButtonTag={true}
        />
      </div>

      <div className='flex items-center gap-4 mt-3 text-xs text-muted-foreground'>
        <div className='flex items-center gap-1.5'>
          <div className='w-3 h-3 rounded bg-primary/20 border border-primary' />
          <span>Selected</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <div className='w-3 h-3 rounded bg-green-500/20 border border-green-500' />
          <span>Remapped</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <div className='w-3 h-3 rounded bg-destructive/20 border border-destructive' />
          <span>Conflict</span>
        </div>
      </div>
    </div>
  );
}
