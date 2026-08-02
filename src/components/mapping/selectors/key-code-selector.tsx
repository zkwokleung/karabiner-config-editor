'use client';

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Check, ChevronsUpDown, ChevronRight, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  KARABINER_KEYCODES,
  getKeyCodeField,
  getKeyCodeValue,
  findKeyCodeItem,
  findKeyCodeItemByField,
  type KeySelection,
  type KeyCodeItem,
} from '@/lib/karabiner-keycodes';
import type { KeyCodeField } from '@/lib/keycodes/types';
import {
  getCharacterWithKeyCodeLabel,
  getLayoutAwareKeyLabel,
  type KeyboardLayoutType,
} from '@/lib/keyboard-layout';
import {
  getKeySelectionFromKeyboardCode,
  isModifierKeyboardCode,
} from '@/lib/keyboard-event-keycodes';

const RECORDING_TIMEOUT_MS = 10_000;

type RecordingStatus = {
  kind: 'error' | 'info' | 'success';
  message: string;
};

interface KeyCodeSelectorProps {
  value: string;
  valueField?: KeyCodeField | null;
  onChange: (selection: KeySelection) => void;
  placeholder?: string;
  excludeNotFrom?: boolean; // Exclude keys that can't be used as "from"
  layoutAware?: boolean;
  layoutType?: KeyboardLayoutType;
}

/**
 * Advanced key code selector with categorized dropdown menu
 * Displays all Karabiner key codes organized by category with hover-based submenu
 */
export function KeyCodeSelector({
  value,
  valueField,
  onChange,
  placeholder = 'Select key...',
  excludeNotFrom = false,
  layoutAware = false,
  layoutType,
}: KeyCodeSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [menuHeight, setMenuHeight] = useState(400);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>({
    kind: 'info',
    message: '',
  });
  const controlRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const recordButtonRef = useRef<HTMLButtonElement>(null);
  const recordingStatusId = useId();

  const getItemPresentation = useMemo(() => {
    return (item: KeyCodeItem) => {
      const keyValue = getKeyCodeValue(item);

      if (layoutAware && layoutType && item.key_code) {
        const layoutLabel = getLayoutAwareKeyLabel(item.key_code, layoutType);
        return {
          keyValue,
          label: getCharacterWithKeyCodeLabel(item.key_code, layoutType),
          output: layoutLabel.output,
        };
      }

      return {
        keyValue,
        label: item.label,
        output: null,
      };
    };
  }, [layoutAware, layoutType]);

  // Find the selected item to display its label
  const selectedItem = valueField
    ? findKeyCodeItemByField(value, valueField)
    : findKeyCodeItem(value);
  const displayValue = selectedItem
    ? getItemPresentation(selectedItem).label
    : value || placeholder;

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      // Use the larger space, with padding of 16px from screen edges
      // Also account for search input (48px) and padding
      const availableSpace = Math.max(spaceBelow, spaceAbove) - 80;

      // Set a reasonable min/max height
      const calculatedHeight = Math.min(Math.max(availableSpace, 200), 600);
      setMenuHeight(calculatedHeight);
    }
  }, [open]);

  const finishRecording = useCallback(
    (status: RecordingStatus, restoreFocus = true) => {
      setIsRecording(false);
      setRecordingStatus(status);

      if (restoreFocus) {
        window.requestAnimationFrame(() => recordButtonRef.current?.focus());
      }
    },
    [],
  );

  useEffect(() => {
    if (!isRecording) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Recording owns the keystroke so global shortcuts and focused controls
      // cannot act on it as well.
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      if (event.repeat) {
        return;
      }

      if (event.code === 'Escape') {
        finishRecording({
          kind: 'info',
          message: 'Key recording cancelled.',
        });
        return;
      }

      if (
        isModifierKeyboardCode(event.code) ||
        ['Alt', 'Control', 'Meta', 'Shift'].includes(event.key)
      ) {
        setRecordingStatus({
          kind: 'error',
          message: 'Modifier keys cannot be recorded alone. Press another key.',
        });
        return;
      }

      const selection = getKeySelectionFromKeyboardCode(event.code);
      if (!selection) {
        const keyName = event.code || event.key || 'Unidentified key';
        setRecordingStatus({
          kind: 'error',
          message: `${keyName} is not supported. Press another key.`,
        });
        return;
      }

      onChange(selection);
      finishRecording({
        kind: 'success',
        message: `Recorded ${selection.value}.`,
      });
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && controlRef.current?.contains(target)) {
        return;
      }

      finishRecording({
        kind: 'info',
        message: 'Key recording cancelled.',
      });
    };

    const timeoutId = window.setTimeout(() => {
      finishRecording({
        kind: 'info',
        message: 'Key recording timed out. No key was changed.',
      });
    }, RECORDING_TIMEOUT_MS);

    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('pointerdown', handlePointerDown, true);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [finishRecording, isRecording, onChange]);

  // Filter categories and items based on search
  const filteredCategories = KARABINER_KEYCODES.map((category) => ({
    ...category,
    items: category.items.filter((item) => {
      // Exclude not_from keys if requested
      if (excludeNotFrom && item.not_from) return false;

      // Filter by search
      if (!searchValue) return true;
      const search = searchValue.toLowerCase();
      const presentation = getItemPresentation(item);
      return (
        item.label.toLowerCase().includes(search) ||
        presentation.keyValue.toLowerCase().includes(search) ||
        presentation.label.toLowerCase().includes(search) ||
        (presentation.output?.toLowerCase().includes(search) ?? false)
      );
    }),
  })).filter((category) => category.items.length > 0);

  const isCategorySelected = (categoryName: string) => {
    const category = filteredCategories.find(
      (c) => c.category === categoryName,
    );
    if (!category) return false;
    return category.items.some(
      (item) =>
        getKeyCodeValue(item) === value &&
        (!valueField || getKeyCodeField(item) === valueField),
    );
  };

  const handleSelect = (item: KeyCodeItem) => {
    const keyValue = getKeyCodeValue(item);
    const keyField = getKeyCodeField(item) || 'key_code';

    onChange({
      value: keyValue,
      field: keyField,
    });
    setOpen(false);
    setSearchValue('');
    setHoveredCategory(null);
  };

  const handleRecordingToggle = () => {
    if (isRecording) {
      finishRecording({
        kind: 'info',
        message: 'Key recording cancelled.',
      });
      return;
    }

    setOpen(false);
    setSearchValue('');
    setHoveredCategory(null);
    setRecordingStatus({
      kind: 'info',
      message: 'Listening for a physical key. Press Escape to cancel.',
    });
    setIsRecording(true);
  };

  return (
    <div ref={controlRef} className='space-y-1.5'>
      <div className='flex items-stretch gap-2'>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              ref={triggerRef}
              variant='outline'
              role='combobox'
              aria-expanded={open}
              disabled={isRecording}
              className='min-w-0 flex-1 justify-between bg-transparent font-mono text-xs'
            >
              <span className='truncate'>{displayValue}</span>
              <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-[600px] p-0' align='start'>
            <div className='border-b p-2'>
              <Input
                placeholder='Search key codes...'
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className='h-8 text-sm'
              />
            </div>
            <div className='flex' style={{ height: `${menuHeight}px` }}>
              {/* Left panel: Categories */}
              <ScrollArea className='w-[250px] border-r'>
                <div className='p-1'>
                  {filteredCategories.length === 0 ? (
                    <div className='p-4 text-center text-sm text-muted-foreground'>
                      No keys found
                      {searchValue && (
                        <div className='mt-2'>
                          <Button
                            size='sm'
                            variant='secondary'
                            onClick={() => {
                              onChange({
                                value: searchValue,
                                field: 'key_code',
                              });
                              setOpen(false);
                              setSearchValue('');
                            }}
                          >
                            Use &quot;{searchValue}&quot;
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    filteredCategories.map((category) => {
                      const isSelected = isCategorySelected(category.category);
                      const isHovered = hoveredCategory === category.category;

                      return (
                        <div
                          key={category.category}
                          onMouseEnter={() =>
                            setHoveredCategory(category.category)
                          }
                          className={cn(
                            'flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-xs font-medium transition-colors',
                            isHovered ? 'bg-accent' : 'hover:bg-accent/50',
                          )}
                        >
                          <Check
                            className={cn(
                              'h-3 w-3 shrink-0',
                              isSelected ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                          <span className='flex-1 truncate'>
                            {category.category}
                          </span>
                          <span className='text-[10px] text-muted-foreground'>
                            ({category.items.length})
                          </span>
                          <ChevronRight className='h-3 w-3 shrink-0 text-muted-foreground' />
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>

              {/* Right panel: Key codes for hovered category */}
              <ScrollArea className='flex-1'>
                <div className='p-1'>
                  {hoveredCategory ? (
                    (() => {
                      const category = filteredCategories.find(
                        (c) => c.category === hoveredCategory,
                      );
                      if (!category) return null;

                      return (
                        <div className='space-y-0.5'>
                          {category.items.map((item, index) => {
                            const presentation = getItemPresentation(item);
                            const keyValue = presentation.keyValue;
                            const isSelected =
                              value === keyValue &&
                              (!valueField ||
                                getKeyCodeField(item) === valueField);

                            return (
                              <button
                                key={`${item.label}-${index}`}
                                onClick={() => handleSelect(item)}
                                className={cn(
                                  'flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs transition-colors',
                                  isSelected
                                    ? 'bg-accent'
                                    : 'hover:bg-accent/50',
                                )}
                              >
                                <Check
                                  className={cn(
                                    'h-3 w-3 shrink-0',
                                    isSelected ? 'opacity-100' : 'opacity-0',
                                  )}
                                />
                                <span className='truncate font-mono'>
                                  {presentation.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()
                  ) : (
                    <div className='flex h-full items-center justify-center p-4 text-center text-xs text-muted-foreground'>
                      Hover over a category to view key codes
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </PopoverContent>
        </Popover>
        <Button
          ref={recordButtonRef}
          type='button'
          variant={isRecording ? 'secondary' : 'outline'}
          aria-pressed={isRecording}
          aria-describedby={recordingStatusId}
          onClick={handleRecordingToggle}
          className='px-3'
        >
          <Keyboard aria-hidden='true' />
          {isRecording ? 'Cancel' : 'Record key'}
        </Button>
      </div>
      <p
        id={recordingStatusId}
        role='status'
        aria-live={recordingStatus.kind === 'error' ? 'assertive' : 'polite'}
        className={cn(
          'text-xs',
          recordingStatus.kind === 'error'
            ? 'text-destructive'
            : 'text-muted-foreground',
          !recordingStatus.message && 'sr-only',
        )}
      >
        {recordingStatus.message}
      </p>
    </div>
  );
}
