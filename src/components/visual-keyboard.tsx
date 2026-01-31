'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import { Plus, Pencil, Trash2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getLayoutForType,
  getKeyLabel,
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
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface VisualKeyboardProps {
  mappings?: SimpleModification[];
  conflictingKeys?: Set<string>;
  className?: string;
  onCreateMapping?: (fromKey: string) => void;
  onEditMapping?: (fromKey: string, currentToKey: string) => void;
  onDeleteMapping?: (fromKey: string) => void;
}

export function VisualKeyboard({
  mappings = [],
  conflictingKeys = new Set(),
  className,
  onCreateMapping,
  onEditMapping,
  onDeleteMapping,
}: VisualKeyboardProps) {
  const keyboardRef = useRef<typeof Keyboard | null>(null);
  const [layoutType, setLayoutType] = useState<KeyboardLayoutType>('ansi');
  const [popoverKey, setPopoverKey] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Build a map of from -> to for quick lookup (Karabiner key codes)
  const mappingMap = useMemo(() => {
    const map = new Map<string, string>();
    mappings.forEach((mod) => {
      const fromKeyCode = mod.from.key_code || mod.from.consumer_key_code || '';
      const toRaw = Array.isArray(mod.to) ? mod.to[0] : mod.to;
      const toKeyCode = toRaw?.key_code || toRaw?.consumer_key_code || '';
      if (fromKeyCode && toKeyCode) {
        map.set(fromKeyCode, toKeyCode);
      }
    });
    return map;
  }, [mappings]);

  // Reverse map: to -> from[] (a key can be target of multiple mappings)
  const reverseMap = useMemo(() => {
    const map = new Map<string, string[]>();
    mappingMap.forEach((to, from) => {
      const existing = map.get(to) || [];
      existing.push(from);
      map.set(to, existing);
    });
    return map;
  }, [mappingMap]);

  // Convert Karabiner key codes to simple-keyboard buttons for styling
  const mappedButtons = useMemo(() => {
    return Array.from(mappingMap.keys())
      .map((k) => toSimpleKeyboardButton(k))
      .join(' ');
  }, [mappingMap]);

  // Create custom display that shows mapped-to key labels for mapped keys
  const customDisplay = useMemo(() => {
    const display: Record<string, string> = { ...KEYBOARD_DISPLAY };

    // For each mapping, override the display of the "from" key to show the "to" key label
    mappingMap.forEach((toKeyCode, fromKeyCode) => {
      const simpleKeyboardButton = toSimpleKeyboardButton(fromKeyCode);
      const toLabel = getKeyLabel(toKeyCode);
      display[simpleKeyboardButton] = toLabel;
    });

    return display;
  }, [mappingMap]);

  const conflictButtons = useMemo(() => {
    return Array.from(conflictingKeys)
      .map((k) => toSimpleKeyboardButton(k))
      .join(' ');
  }, [conflictingKeys]);

  // Build button theme for highlighting
  const buttonTheme = useMemo(() => {
    const themes: Array<{ class: string; buttons: string }> = [];

    // Keys that have mappings
    if (mappedButtons) {
      themes.push({
        class: 'kb-mapped',
        buttons: mappedButtons,
      });
    }

    // Conflict keys (overrides mapped style)
    if (conflictButtons) {
      themes.push({
        class: 'kb-conflict',
        buttons: conflictButtons,
      });
    }

    return themes.length > 0 ? themes : undefined;
  }, [mappedButtons, conflictButtons]);

  const handleKeyPress = useCallback((button: string, e?: MouseEvent) => {
    const karabinerKey = toKarabinerKeyCode(button);

    // Get position for popover
    if (e?.target) {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setPopoverPosition({
        x: rect.left + rect.width / 2,
        y: rect.bottom + 4,
      });
    }

    setPopoverKey(karabinerKey);
  }, []);

  const closePopover = useCallback(() => {
    setPopoverKey(null);
    setPopoverPosition(null);
  }, []);

  const handleCreateMapping = useCallback(() => {
    if (popoverKey) {
      onCreateMapping?.(popoverKey);
      closePopover();
    }
  }, [popoverKey, onCreateMapping, closePopover]);

  const handleEditMapping = useCallback(() => {
    if (popoverKey && mappingMap.has(popoverKey)) {
      onEditMapping?.(popoverKey, mappingMap.get(popoverKey)!);
      closePopover();
    }
  }, [popoverKey, mappingMap, onEditMapping, closePopover]);

  const handleDeleteMapping = useCallback(() => {
    if (popoverKey) {
      onDeleteMapping?.(popoverKey);
      closePopover();
    }
  }, [popoverKey, onDeleteMapping, closePopover]);

  const layout = getLayoutForType(layoutType);
  const buttonWidths = BUTTON_WIDTHS[layoutType];

  // Generate CSS for button widths
  const buttonWidthStyles = useMemo(() => {
    return Object.entries(buttonWidths)
      .map(([button, width]) => {
        return `.visual-kb .hg-button[data-skbtn="${button}"] { width: ${width}; min-width: ${width}; max-width: ${width}; }`;
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

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.key-popover') && !target.closest('.hg-button')) {
        closePopover();
      }
    };

    if (popoverKey) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [popoverKey, closePopover]);

  // Get context info for the popover
  const popoverInfo = useMemo(() => {
    if (!popoverKey) return null;

    const mapsTo = mappingMap.get(popoverKey);
    const receivesFrom = reverseMap.get(popoverKey) || [];
    const hasConflict = conflictingKeys.has(popoverKey);

    return {
      key: popoverKey,
      label: getKeyLabel(popoverKey),
      mapsTo,
      mapsToLabel: mapsTo ? getKeyLabel(mapsTo) : null,
      receivesFrom,
      hasConflict,
    };
  }, [popoverKey, mappingMap, reverseMap, conflictingKeys]);

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
            <div className='w-2.5 h-2.5 rounded-sm bg-primary/20 border border-primary' />
            <span>Mapped</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='w-2.5 h-2.5 rounded-sm bg-destructive/20 border border-destructive' />
            <span>Conflict</span>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .visual-kb.simple-keyboard.hg-theme-default {
          background: var(--color-muted) !important;
          padding: 10px !important;
          border-radius: 10px !important;
          font-family: inherit !important;
        }
        .visual-kb.simple-keyboard .hg-row {
          gap: 4px !important;
          margin-bottom: 4px !important;
        }
        .visual-kb.simple-keyboard .hg-row:last-child {
          margin-bottom: 0 !important;
        }
        .visual-kb.simple-keyboard .hg-button {
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
        .visual-kb.simple-keyboard .hg-button:hover {
          background: var(--color-accent) !important;
          border-color: var(--color-primary) !important;
        }
        .visual-kb.simple-keyboard .hg-button:active {
          transform: translateY(1px) !important;
          box-shadow: none !important;
        }
        /* Keys that have mappings */
        .visual-kb.simple-keyboard .hg-button.kb-mapped {
          background: color-mix(in srgb, var(--color-primary) 15%, var(--color-background)) !important;
          border-color: var(--color-primary) !important;
          border-width: 2px !important;
          color: var(--color-primary) !important;
          font-weight: 600 !important;
        }
        .visual-kb.simple-keyboard .hg-button.kb-mapped:hover {
          background: color-mix(in srgb, var(--color-primary) 25%, var(--color-background)) !important;
        }
        /* Conflict */
        .visual-kb.simple-keyboard .hg-button.kb-conflict {
          background: color-mix(in srgb, var(--color-destructive) 15%, var(--color-background)) !important;
          border-color: var(--color-destructive) !important;
          border-width: 2px !important;
          color: var(--color-destructive) !important;
          font-weight: 600 !important;
        }
        .visual-kb.simple-keyboard .hg-button.kb-conflict:hover {
          background: color-mix(in srgb, var(--color-destructive) 25%, var(--color-background)) !important;
        }
        ${buttonWidthStyles}
      `,
        }}
      />

      <div className='bg-muted/50 rounded-lg border p-2'>
        <Keyboard
          key={mappedButtons}
          baseClass='visual-kb'
          keyboardRef={(r) =>
            (keyboardRef.current = r as typeof Keyboard | null)
          }
          layout={layout}
          display={customDisplay}
          onKeyPress={handleKeyPress}
          buttonTheme={buttonTheme}
          physicalKeyboardHighlight={true}
          physicalKeyboardHighlightBgColor='hsl(var(--accent))'
          physicalKeyboardHighlightTextColor='hsl(var(--foreground))'
          mergeDisplay={true}
          useButtonTag={true}
        />
      </div>

      {/* Context Popover */}
      {popoverKey && popoverPosition && popoverInfo && (
        <div
          className='key-popover fixed z-50 bg-popover border rounded-lg shadow-lg p-3 min-w-[200px]'
          style={{
            left: `${popoverPosition.x}px`,
            top: `${popoverPosition.y}px`,
            transform: 'translateX(-50%)',
          }}
        >
          {/* Key Header */}
          <div className='flex items-center gap-2 mb-2'>
            <code className='px-2 py-1 rounded bg-muted font-mono text-sm font-medium'>
              {popoverInfo.label}
            </code>
            {popoverInfo.hasConflict && (
              <span className='text-xs text-destructive font-medium'>
                Conflict
              </span>
            )}
          </div>

          {/* Current Mapping Info */}
          {popoverInfo.mapsTo && (
            <div className='flex items-center gap-2 text-sm mb-2 p-2 bg-muted rounded'>
              <span className='text-muted-foreground'>Maps to:</span>
              <ArrowRight className='h-3 w-3 text-muted-foreground' />
              <code className='px-1.5 py-0.5 rounded bg-background font-mono text-xs'>
                {popoverInfo.mapsToLabel}
              </code>
            </div>
          )}

          {/* Receives Input From */}
          {popoverInfo.receivesFrom.length > 0 && (
            <div className='text-sm mb-2 p-2 bg-muted rounded'>
              <span className='text-muted-foreground'>
                Receives input from:
              </span>
              <div className='flex flex-wrap gap-1 mt-1'>
                {popoverInfo.receivesFrom.map((fromKey) => (
                  <code
                    key={fromKey}
                    className='px-1.5 py-0.5 rounded bg-background font-mono text-xs'
                  >
                    {getKeyLabel(fromKey)}
                  </code>
                ))}
              </div>
            </div>
          )}

          <Separator className='my-2' />

          {/* Actions */}
          <div className='flex flex-col gap-1'>
            {popoverInfo.mapsTo ? (
              <>
                <Button
                  size='sm'
                  variant='ghost'
                  className='justify-start h-8'
                  onClick={handleEditMapping}
                >
                  <Pencil className='h-3.5 w-3.5 mr-2' />
                  Edit Mapping
                </Button>
                <Button
                  size='sm'
                  variant='ghost'
                  className='justify-start h-8 text-destructive hover:text-destructive hover:bg-destructive/10'
                  onClick={handleDeleteMapping}
                >
                  <Trash2 className='h-3.5 w-3.5 mr-2' />
                  Delete Mapping
                </Button>
              </>
            ) : (
              <Button
                size='sm'
                variant='ghost'
                className='justify-start h-8'
                onClick={handleCreateMapping}
              >
                <Plus className='h-3.5 w-3.5 mr-2' />
                Create Mapping from this key
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Help text */}
      <p className='text-xs text-muted-foreground mt-3 text-center'>
        Click on any key to view details or create/edit mappings
      </p>
    </div>
  );
}
