'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Settings,
  ArrowRight,
  AlertCircle,
  CircleHelp,
  Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type {
  Manipulator,
  ToEvent,
  Condition,
  Modifiers,
} from '@/types/karabiner';
import { getCharacterWithKeyCodeLabel } from '@/lib/keyboard-layout';
import { ConditionEditor } from '@/components/mapping/conditions/condition-editor';
import { ToEventEditor } from '@/components/mapping/to-events/to-event-editor';
import { ModifierSelector as FormModifierSelector } from '@/components/mapping/selectors/modifier-selector';
import { KeyboardSelectDialog } from './keyboard-select-dialog';
import { useToast } from '@/hooks/use-toast';
import { useKeyboardLayout } from '@/components/keyboard/keyboard-layout-context';
import { cn } from '@/lib/utils';

interface ManipulatorBuilderPanelProps {
  fromKey: string;
  existingManipulators?: Manipulator[];
  onSave: (manipulators: Manipulator[]) => void;
  onCancel: () => void;
  onDelete?: () => void;
  onSelectFromKey: (keyCode: string) => void;
}

export function ManipulatorBuilderPanel({
  fromKey,
  existingManipulators = [],
  onSave,
  onCancel,
  onDelete,
  onSelectFromKey,
}: ManipulatorBuilderPanelProps) {
  const { toast } = useToast();
  const { keyboardTypeV2 } = useKeyboardLayout();
  const isEditing = existingManipulators.length > 0;
  const [validationError, setValidationError] = useState<string | null>(null);
  const [fromKeyError, setFromKeyError] = useState(false);

  // From-key keyboard dialog state
  const [isSelectingFromKey, setIsSelectingFromKey] = useState(false);
  const [pendingFromKey, setPendingFromKey] = useState<string | null>(null);

  // Initialize state from existing manipulators or create new
  const [manipulators, setManipulators] = useState<Manipulator[]>(() => {
    if (existingManipulators.length > 0) {
      return existingManipulators;
    }
    return [
      {
        type: 'basic',
        from: {
          ...(fromKey ? { key_code: fromKey } : {}),
        },
        to: [],
      },
    ];
  });

  const [selectedManipulatorIndex, setSelectedManipulatorIndex] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectingToEventIndex, setSelectingToEventIndex] = useState<
    number | null
  >(null);
  const [pendingToKey, setPendingToKey] = useState<string | null>(null);

  const currentManipulator = manipulators[selectedManipulatorIndex];

  // Sync all manipulators' from.key_code when the fromKey prop changes
  useEffect(() => {
    setManipulators((prev) =>
      prev.map((m) => {
        const { key_code, ...restFrom } = m.from;
        void key_code;
        return {
          ...m,
          from: {
            ...restFrom,
            ...(fromKey ? { key_code: fromKey } : {}),
          },
        };
      }),
    );
  }, [fromKey]);

  // Get current "to" key codes for keyboard highlighting
  const currentToKeys = useMemo(() => {
    return (currentManipulator?.to || [])
      .map((t) => t.key_code || t.consumer_key_code || '')
      .filter(Boolean);
  }, [currentManipulator]);

  const updateCurrentManipulator = useCallback(
    (updates: Partial<Manipulator>) => {
      setValidationError(null); // Clear error when user makes changes
      setFromKeyError(false);
      setManipulators((prev) => {
        const newList = [...prev];
        newList[selectedManipulatorIndex] = {
          ...newList[selectedManipulatorIndex],
          ...updates,
        };
        return newList;
      });
    },
    [selectedManipulatorIndex],
  );

  const updateFromModifiers = (
    type: 'mandatory' | 'optional',
    modifiers: string[],
  ) => {
    const newModifiers: Modifiers = { ...currentManipulator.from.modifiers };
    if (modifiers.length === 0) {
      delete newModifiers[type];
    } else {
      newModifiers[type] = modifiers;
    }

    updateCurrentManipulator({
      from: {
        ...currentManipulator.from,
        modifiers:
          Object.keys(newModifiers).length > 0 ? newModifiers : undefined,
      },
    });
  };

  const handleSelectToKey = useCallback((keyCode: string) => {
    setPendingToKey(keyCode);
  }, []);

  const openToKeyDialog = useCallback(
    (index: number) => {
      const event = currentManipulator.to?.[index];
      const currentKey = event?.key_code || event?.consumer_key_code || null;
      setPendingToKey(currentKey);
      setSelectingToEventIndex(index);
    },
    [currentManipulator.to],
  );

  const handleConfirmToKeySelect = useCallback(() => {
    if (selectingToEventIndex === null || !pendingToKey) {
      setSelectingToEventIndex(null);
      setPendingToKey(null);
      return;
    }

    const currentTo = currentManipulator.to || [];
    const nextTo = currentTo.map((event, index) => {
      if (index !== selectingToEventIndex) return event;
      const { consumer_key_code, ...rest } = event;
      void consumer_key_code;
      return { ...rest, key_code: pendingToKey };
    });

    updateCurrentManipulator({ to: nextTo });
    setSelectingToEventIndex(null);
    setPendingToKey(null);
  }, [
    currentManipulator.to,
    pendingToKey,
    selectingToEventIndex,
    updateCurrentManipulator,
  ]);

  const updateToEvents = (events: ToEvent[]) => {
    updateCurrentManipulator({ to: events });
  };

  const addToEvent = () => {
    const currentTo = currentManipulator.to || [];
    updateCurrentManipulator({ to: [...currentTo, { key_code: 'a' }] });
  };

  const updateConditions = (conditions: Condition[]) => {
    if (conditions.length === 0) {
      updateCurrentManipulator({ conditions: undefined });
    } else {
      updateCurrentManipulator({ conditions });
    }
  };

  const addManipulator = () => {
    const newManipulator: Manipulator = {
      type: 'basic',
      from: {
        ...(fromKey ? { key_code: fromKey } : {}),
        modifiers: currentManipulator.from.modifiers
          ? { ...currentManipulator.from.modifiers }
          : undefined,
      },
      to: [],
    };
    setManipulators([...manipulators, newManipulator]);
    setSelectedManipulatorIndex(manipulators.length);
  };

  const deleteManipulator = (index: number) => {
    if (manipulators.length <= 1) return;
    const newList = manipulators.filter((_, i) => i !== index);
    setManipulators(newList);
    setSelectedManipulatorIndex(Math.min(index, newList.length - 1));
  };

  const handleSave = () => {
    setValidationError(null);
    setFromKeyError(false);

    // Check if from key is set
    if (!fromKey) {
      setValidationError('Please select a "from" key.');
      setFromKeyError(true);
      toast({
        title: 'Validation Error',
        description: 'Please select a "from" key.',
        variant: 'destructive',
      });
      return;
    }

    // Filter out manipulators with no "to" events
    const validManipulators = manipulators.filter(
      (m) => m.to && m.to.length > 0,
    );

    if (validManipulators.length === 0) {
      const errorMsg =
        'At least one manipulator must have a "to" action. Add a target key or action.';
      setValidationError(errorMsg);
      toast({
        title: 'Validation Error',
        description: errorMsg,
        variant: 'destructive',
      });
      return;
    }

    // Success
    onSave(validManipulators);
    toast({
      title: isEditing ? 'Manipulator Updated' : 'Manipulator Created',
      description: `Successfully ${isEditing ? 'updated' : 'created'} ${validManipulators.length} manipulator${validManipulators.length > 1 ? 's' : ''}.`,
    });
  };

  const getMandatoryModifiers = () =>
    currentManipulator.from.modifiers?.mandatory || [];
  const getOptionalModifiers = () =>
    currentManipulator.from.modifiers?.optional || [];

  const formatKeyCode = (keyCode: string) =>
    getCharacterWithKeyCodeLabel(keyCode, keyboardTypeV2);

  const handleOpenFromKeyDialog = useCallback(() => {
    setPendingFromKey(fromKey || null);
    setIsSelectingFromKey(true);
  }, [fromKey]);

  const handleSelectFromKey = useCallback((keyCode: string) => {
    setPendingFromKey(keyCode);
  }, []);

  const handleConfirmFromKeySelect = useCallback(() => {
    if (pendingFromKey) {
      onSelectFromKey(pendingFromKey);
      setFromKeyError(false);
      setValidationError(null);
    }
    setIsSelectingFromKey(false);
    setPendingFromKey(null);
  }, [pendingFromKey, onSelectFromKey]);

  return (
    <div className='p-4 space-y-4 relative'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <h3 className='text-lg font-semibold'>
            {isEditing ? 'Edit' : 'Create'} Manipulator
          </h3>
          {fromKey ? (
            <Badge variant='outline' className='font-mono'>
              {formatKeyCode(fromKey)}
            </Badge>
          ) : (
            <Badge
              variant='outline'
              className='font-mono text-muted-foreground'
            >
              No key selected
            </Badge>
          )}
          <Button
            size='icon'
            variant='ghost'
            className='h-6 w-6'
            onClick={handleOpenFromKeyDialog}
            aria-label='Change from key'
          >
            <Pencil className='h-3.5 w-3.5' />
          </Button>
          {getMandatoryModifiers().length > 0 && (
            <span className='text-sm text-muted-foreground'>
              +{' '}
              {getMandatoryModifiers()
                .map((m) => getModifierSymbol(m))
                .join('')}
            </span>
          )}
        </div>
        <Button size='icon' variant='ghost' onClick={onCancel}>
          <X className='h-4 w-4' />
        </Button>
      </div>

      <Separator />

      {/* Manipulator tabs if multiple */}
      {manipulators.length > 1 && (
        <div className='flex items-center gap-2 flex-wrap'>
          {manipulators.map((_, index) => (
            <Button
              key={index}
              size='sm'
              variant={
                index === selectedManipulatorIndex ? 'default' : 'outline'
              }
              onClick={() => setSelectedManipulatorIndex(index)}
              className='relative pr-6'
            >
              Manipulator {index + 1}
              {manipulators.length > 1 && (
                <button
                  className='absolute right-1 top-1/2 -translate-y-1/2 hover:text-destructive'
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteManipulator(index);
                  }}
                >
                  <X className='h-3 w-3' />
                </button>
              )}
            </Button>
          ))}
          <Button size='sm' variant='outline' onClick={addManipulator}>
            <Plus className='h-3 w-3 mr-1' />
            Add Variant
          </Button>
        </div>
      )}

      <div className='max-h-[500px] overflow-y-auto pr-2'>
        <div className='space-y-4'>
          {/* From section */}
          <div className='space-y-3'>
            <div className='space-y-2'>
              <Label className='text-sm font-semibold'>Description</Label>
              <Input
                value={currentManipulator.description || ''}
                onChange={(event) => {
                  const nextDescription = event.target.value.trim();
                  updateCurrentManipulator({
                    description:
                      nextDescription.length > 0
                        ? event.target.value
                        : undefined,
                  });
                }}
                placeholder='Optional description for this manipulator'
              />
            </div>

            <Label className='text-sm font-semibold'>From Key</Label>
            <div
              className={cn(
                'flex items-center gap-2 p-3 rounded-lg',
                fromKeyError
                  ? 'bg-destructive/10 border-2 border-destructive'
                  : 'bg-muted',
              )}
            >
              {fromKey ? (
                <Badge variant='secondary' className='font-mono text-base'>
                  {formatKeyCode(fromKey)}
                </Badge>
              ) : (
                <span className='text-sm text-muted-foreground italic'>
                  No key selected
                </span>
              )}
              <Button
                size='icon'
                variant='ghost'
                className='h-6 w-6 shrink-0'
                onClick={handleOpenFromKeyDialog}
                aria-label='Change from key'
              >
                <Pencil className='h-3.5 w-3.5' />
              </Button>
              <ArrowRight className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm text-muted-foreground'>
                {currentToKeys.length > 0
                  ? currentToKeys.map((k) => formatKeyCode(k)).join(', ')
                  : 'No target keys selected'}
              </span>
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-2'>
                <div className='flex items-center gap-1'>
                  <Label className='text-xs'>Mandatory Modifiers</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon-sm'
                          className='h-5 w-5 text-muted-foreground'
                          aria-label='Mandatory modifiers help'
                        >
                          <CircleHelp className='h-3.5 w-3.5' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side='top' align='start'>
                        These modifiers must be held for this manipulator to
                        trigger.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <FormModifierSelector
                  selected={getMandatoryModifiers()}
                  onChange={(mods) => updateFromModifiers('mandatory', mods)}
                  label='Required with key'
                  showInlineLabel={false}
                />
              </div>
              <div className='space-y-2'>
                <div className='flex items-center gap-1'>
                  <Label className='text-xs'>Optional Modifiers</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon-sm'
                          className='h-5 w-5 text-muted-foreground'
                          aria-label='Optional modifiers help'
                        >
                          <CircleHelp className='h-3.5 w-3.5' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side='top' align='start'>
                        These modifiers are optional: the manipulator works with
                        or without them held.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <FormModifierSelector
                  selected={getOptionalModifiers()}
                  onChange={(mods) => updateFromModifiers('optional', mods)}
                  label='Allowed but not required'
                  showInlineLabel={false}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* To section with keyboard */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between gap-2'>
              <Label className='text-sm font-semibold'>To Events</Label>
              <Button size='sm' variant='outline' onClick={addToEvent}>
                <Plus className='mr-2 h-3 w-3' />
                Add Event
              </Button>
            </div>

            <ToEventEditor
              events={currentManipulator.to || []}
              onChange={updateToEvents}
              label=''
              showHeader={false}
              keyCodeAction={(index) => (
                <Button
                  size='sm'
                  variant={
                    selectingToEventIndex === index ? 'default' : 'outline'
                  }
                  className='shrink-0'
                  onClick={() => openToKeyDialog(index)}
                >
                  Select from Keyboard
                </Button>
              )}
            />

            <KeyboardSelectDialog
              open={selectingToEventIndex !== null}
              title='Select To Event Key'
              selectedKey={pendingToKey}
              onSelectKey={handleSelectToKey}
              onConfirm={handleConfirmToKeySelect}
              onOpenChange={(open) => {
                if (!open) {
                  setSelectingToEventIndex(null);
                  setPendingToKey(null);
                }
              }}
            />
          </div>

          <Separator />

          {/* Conditions */}
          <ConditionEditor
            conditions={currentManipulator.conditions || []}
            onChange={updateConditions}
          />

          <Separator />

          {/* Advanced options toggle */}
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setShowAdvanced(!showAdvanced)}
            className='w-full'
          >
            <Settings className='mr-2 h-4 w-4' />
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </Button>

          {showAdvanced && (
            <div className='space-y-4 pt-2'>
              <div className='space-y-2'>
                <ToEventEditor
                  events={currentManipulator.to_if_alone || []}
                  onChange={(events) => {
                    if (events.length === 0) {
                      const updated = { ...currentManipulator };
                      delete updated.to_if_alone;
                      updateCurrentManipulator(updated);
                    } else {
                      updateCurrentManipulator({ to_if_alone: events });
                    }
                  }}
                  label='To If Alone'
                  helpText='Triggered when the key is pressed and released alone.'
                />
              </div>

              <div className='space-y-2'>
                <ToEventEditor
                  events={currentManipulator.to_if_held_down || []}
                  onChange={(events) => {
                    if (events.length === 0) {
                      const updated = { ...currentManipulator };
                      delete updated.to_if_held_down;
                      updateCurrentManipulator(updated);
                    } else {
                      updateCurrentManipulator({ to_if_held_down: events });
                    }
                  }}
                  label='To If Held Down'
                  helpText='Triggered when the key is held past the hold threshold.'
                />
              </div>

              <div className='space-y-2'>
                <ToEventEditor
                  events={currentManipulator.to_after_key_up || []}
                  onChange={(events) => {
                    if (events.length === 0) {
                      const updated = { ...currentManipulator };
                      delete updated.to_after_key_up;
                      updateCurrentManipulator(updated);
                    } else {
                      updateCurrentManipulator({ to_after_key_up: events });
                    }
                  }}
                  label='To After Key Up'
                  helpText='Triggered after the original key is released.'
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* From-key keyboard dialog */}
      <KeyboardSelectDialog
        open={isSelectingFromKey}
        title='Select From Key'
        selectedKey={pendingFromKey}
        onSelectKey={handleSelectFromKey}
        onConfirm={handleConfirmFromKeySelect}
        onOpenChange={(open) => {
          if (!open) {
            setIsSelectingFromKey(false);
            setPendingFromKey(null);
          }
        }}
      />

      <Separator />

      {/* Validation Error */}
      {validationError && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className='flex items-center justify-between pt-2'>
        <div>
          {isEditing && onDelete && (
            <Button variant='destructive' size='sm' onClick={onDelete}>
              <Trash2 className='h-4 w-4 mr-2' />
              Delete All Manipulators
            </Button>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {isEditing ? 'Update' : 'Create'} Manipulator
          </Button>
        </div>
      </div>
    </div>
  );
}

function getModifierSymbol(modifier: string): string {
  const symbols: Record<string, string> = {
    command: '⌘',
    left_command: '⌘',
    right_command: '⌘',
    option: '⌥',
    left_option: '⌥',
    right_option: '⌥',
    control: '⌃',
    left_control: '⌃',
    right_control: '⌃',
    shift: '⇧',
    left_shift: '⇧',
    right_shift: '⇧',
  };
  return symbols[modifier] || modifier;
}
