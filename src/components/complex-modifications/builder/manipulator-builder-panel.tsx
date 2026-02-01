'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  Settings,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type {
  Manipulator,
  ToEvent,
  Condition,
  Modifiers,
} from '@/types/karabiner';
import { getKeyLabel } from '@/lib/keyboard-layout';
import { ConditionEditor } from '@/components/mapping/conditions/condition-editor';
import { ToEventEditor } from '@/components/mapping/to-events/to-event-editor';
import { ModifierSelector as FormModifierSelector } from '@/components/mapping/selectors/modifier-selector';
import { ToEventKeyboardDialog } from './to-event-keyboard-dialog';
import { useToast } from '@/hooks/use-toast';

interface ManipulatorBuilderPanelProps {
  fromKey: string;
  existingManipulators?: Manipulator[];
  onSave: (manipulators: Manipulator[]) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function ManipulatorBuilderPanel({
  fromKey,
  existingManipulators = [],
  onSave,
  onCancel,
  onDelete,
}: ManipulatorBuilderPanelProps) {
  const { toast } = useToast();
  const isEditing = existingManipulators.length > 0;
  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize state from existing manipulators or create new
  const [manipulators, setManipulators] = useState<Manipulator[]>(() => {
    if (existingManipulators.length > 0) {
      return existingManipulators;
    }
    return [
      {
        type: 'basic',
        from: {
          key_code: fromKey,
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

  // Get current "to" key codes for keyboard highlighting
  const currentToKeys = useMemo(() => {
    return (currentManipulator?.to || [])
      .map((t) => t.key_code || t.consumer_key_code || '')
      .filter(Boolean);
  }, [currentManipulator]);

  const updateCurrentManipulator = useCallback(
    (updates: Partial<Manipulator>) => {
      setValidationError(null); // Clear error when user makes changes
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
        key_code: fromKey,
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

    // Check if from key is set
    if (!fromKey) {
      setValidationError('Please select a "from" key.');
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
        'At least one mapping must have a "to" action. Add a target key or action.';
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
      title: isEditing ? 'Mapping Updated' : 'Mapping Created',
      description: `Successfully ${isEditing ? 'updated' : 'created'} ${validManipulators.length} mapping${validManipulators.length > 1 ? 's' : ''}.`,
    });
  };

  const getMandatoryModifiers = () =>
    currentManipulator.from.modifiers?.mandatory || [];
  const getOptionalModifiers = () =>
    currentManipulator.from.modifiers?.optional || [];

  return (
    <div className='p-4 space-y-4 relative'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <h3 className='text-lg font-semibold'>
            {isEditing ? 'Edit' : 'Create'} Mapping
          </h3>
          <Badge variant='outline' className='font-mono'>
            {getKeyLabel(fromKey)}
          </Badge>
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
              Mapping {index + 1}
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
            <Label className='text-sm font-semibold'>From Key</Label>
            <div className='flex items-center gap-2 p-3 bg-muted rounded-lg'>
              <Badge variant='secondary' className='font-mono text-base'>
                {getKeyLabel(fromKey)}
              </Badge>
              <ArrowRight className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm text-muted-foreground'>
                {currentToKeys.length > 0
                  ? currentToKeys.map((k) => getKeyLabel(k)).join(', ')
                  : 'No target keys selected'}
              </span>
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-2'>
                <Label className='text-xs'>Mandatory Modifiers</Label>
                <FormModifierSelector
                  selected={getMandatoryModifiers()}
                  onChange={(mods) => updateFromModifiers('mandatory', mods)}
                  label='Required with key'
                />
              </div>
              <div className='space-y-2'>
                <Label className='text-xs'>Optional Modifiers</Label>
                <FormModifierSelector
                  selected={getOptionalModifiers()}
                  onChange={(mods) => updateFromModifiers('optional', mods)}
                  label='Allowed but not required'
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

            <ToEventKeyboardDialog
              open={selectingToEventIndex !== null}
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
                <Label className='text-xs'>
                  To If Alone (when pressed alone)
                </Label>
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
                  label=''
                />
              </div>

              <div className='space-y-2'>
                <Label className='text-xs'>To If Held Down (when held)</Label>
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
                  label=''
                />
              </div>

              <div className='space-y-2'>
                <Label className='text-xs'>
                  To After Key Up (after key released)
                </Label>
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
                  label=''
                />
              </div>
            </div>
          )}
        </div>
      </div>

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
              Delete All Mappings
            </Button>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {isEditing ? 'Update' : 'Create'} Mapping
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
