'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, ArrowRight } from 'lucide-react';
import {
  getKeyLabel,
  toKarabinerKeyCode,
  toSimpleKeyboardButton,
  type KeyboardLayoutType,
} from '@/lib/keyboard-layout';
import type { SimpleModification } from '@/types/karabiner';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { KeyboardShell } from '@/components/keyboard/keyboard-shell';

const EMPTY_CONFLICT_SET: ReadonlySet<string> = new Set();

interface VisualKeyboardProps {
  mappings?: SimpleModification[];
  conflictingKeys?: ReadonlySet<string>;
  className?: string;
  selectedKeys?: string[];
  onCreateMapping?: (fromKey: string) => void;
  onEditMapping?: (fromKey: string, currentToKey: string) => void;
  onDeleteMapping?: (fromKey: string) => void;
}

export function VisualKeyboard({
  mappings = [],
  conflictingKeys = EMPTY_CONFLICT_SET,
  className,
  selectedKeys = [],
  onCreateMapping,
  onEditMapping,
  onDeleteMapping,
}: VisualKeyboardProps) {
  const [layoutType, setLayoutType] = useState<KeyboardLayoutType>('ansi');
  const [popoverKey, setPopoverKey] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const lastPressedButtonRef = useRef<string | null>(null);
  const keyboardInstanceRef = useRef<{
    getButtonElement?: (button: string) => HTMLElement | undefined;
    keyboardDOM?: HTMLElement;
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

  // Only the label overrides are needed; KeyboardShell merges base display
  const displayOverrides = useMemo(() => {
    const overrides: Record<string, string> = {};
    mappingMap.forEach((toKeyCode, fromKeyCode) => {
      const simpleKeyboardButton = toSimpleKeyboardButton(fromKeyCode);
      const toLabel = getKeyLabel(toKeyCode);
      overrides[simpleKeyboardButton] = toLabel;
    });
    return overrides;
  }, [mappingMap]);

  const highlightLayers = useMemo(() => {
    const selectedHighlightKeys = Array.from(
      new Set([...selectedKeys, ...(selectedKey ? [selectedKey] : [])]),
    );

    return [
      { className: 'kb-mapped', keys: Array.from(mappingMap.keys()) },
      { className: 'kb-conflict', keys: Array.from(conflictingKeys) },
      { className: 'kb-selected', keys: selectedHighlightKeys },
    ];
  }, [mappingMap, conflictingKeys, selectedKey, selectedKeys]);

  const updatePopoverPosition = useCallback((button: string, e?: Event) => {
    let targetElement: HTMLElement | null = null;

    // Prefer the keyboard API to avoid DOM queries
    const buttonElement =
      keyboardInstanceRef.current?.getButtonElement?.(button);
    if (buttonElement instanceof HTMLElement) {
      targetElement = buttonElement;
    }

    if (!targetElement && e && e.target instanceof HTMLElement) {
      targetElement = e.target;
    }

    if (!targetElement) {
      const escapedButton =
        typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(button) : button;
      const fallback = document.querySelector(
        `.visual-kb .hg-button[data-skbtn="${escapedButton}"]`,
      );
      if (fallback instanceof HTMLElement) {
        targetElement = fallback;
      }
    }

    if (!targetElement) {
      const keyboardDom = keyboardInstanceRef.current?.keyboardDOM;
      if (keyboardDom) {
        const rect = keyboardDom.getBoundingClientRect();
        setPopoverPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      } else {
        setPopoverPosition(null);
      }
      return;
    }

    const rect = targetElement.getBoundingClientRect();
    setPopoverPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 4,
    });
  }, []);

  const handleKeyPress = useCallback(
    (button: string, e?: MouseEvent | KeyboardEvent) => {
      const karabinerKey = toKarabinerKeyCode(button);
      setSelectedKey(karabinerKey);
      lastPressedButtonRef.current = button;
      updatePopoverPosition(button, e);
      setPopoverKey(karabinerKey);
    },
    [updatePopoverPosition],
  );

  const closePopover = useCallback(() => {
    setPopoverKey(null);
    setPopoverPosition(null);
    setSelectedKey(null);
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

  // Close popover when clicking/tapping outside
  useEffect(() => {
    const handlePointerDown = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.key-popover') && !target.closest('.hg-button')) {
        closePopover();
      }
    };

    if (popoverKey) {
      document.addEventListener('pointerdown', handlePointerDown);
      return () =>
        document.removeEventListener('pointerdown', handlePointerDown);
    }
  }, [popoverKey, closePopover]);

  // Keep popover anchored when the viewport changes (scroll/resize)
  useEffect(() => {
    if (!popoverKey || !lastPressedButtonRef.current) return;

    const reposition = () => {
      const button = lastPressedButtonRef.current;
      if (button) {
        updatePopoverPosition(button);
      }
    };

    window.addEventListener('resize', reposition, { passive: true });
    window.addEventListener('scroll', reposition, {
      passive: true,
      capture: true,
    });

    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, {
        capture: true,
      } as EventListenerOptions);
    };
  }, [popoverKey, updatePopoverPosition]);

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

  const legend = (
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
  );

  return (
    <KeyboardShell
      className={className}
      layoutType={layoutType}
      onLayoutChange={(value) => setLayoutType(value)}
      legend={legend}
      keyboardBaseClass='visual-kb'
      highlightLayers={highlightLayers}
      display={displayOverrides}
      onKeyPress={handleKeyPress}
      keyboardRef={(instance) => {
        keyboardInstanceRef.current = instance;
      }}
      physicalKeyboardHighlight={false}
      afterKeyboard={
        <p className='text-xs text-muted-foreground mt-3 text-center'>
          Click on any key to view details or create/edit mappings
        </p>
      }
    >
      {popoverKey && popoverPosition && popoverInfo && (
        <div
          className='key-popover fixed z-50 bg-popover border rounded-lg shadow-lg p-3 min-w-[200px]'
          style={{
            left: `${popoverPosition.x}px`,
            top: `${popoverPosition.y}px`,
            transform: 'translateX(-50%)',
          }}
        >
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

          {popoverInfo.mapsTo && (
            <div className='flex items-center gap-2 text-sm mb-2 p-2 bg-muted rounded'>
              <span className='text-muted-foreground'>Maps to:</span>
              <ArrowRight className='h-3 w-3 text-muted-foreground' />
              <code className='px-1.5 py-0.5 rounded bg-background font-mono text-xs'>
                {popoverInfo.mapsToLabel}
              </code>
            </div>
          )}

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
    </KeyboardShell>
  );
}
