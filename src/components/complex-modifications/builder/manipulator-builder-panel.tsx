'use client';

import { useState, useCallback, useEffect } from 'react';
import { X, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Manipulator } from '@/types/karabiner';
import { getCharacterWithKeyCodeLabel } from '@/lib/keyboard-layout';
import { KeyboardSelectDialog } from './keyboard-select-dialog';
import {
  ManipulatorInputSection,
  ManipulatorOutputSections,
  type DirectToEventField,
} from './manipulator-form-sections';
import { useToast } from '@/hooks/use-toast';
import { useKeyboardLayout } from '@/components/keyboard/keyboard-layout-context';
import {
  clearEventKeyFields,
  getEventKeyField,
  getEventKeyValue,
  resolveFieldForKeyValue,
  setEventKeyValue,
} from '@/lib/karabiner-keycodes';

interface ManipulatorBuilderPanelProps {
  fromKey: string;
  existingManipulators?: Manipulator[];
  onSave: (manipulators: Manipulator[]) => void;
  onCancel: () => void;
  onDelete?: () => void;
  onSelectFromKey: (keyCode: string) => void;
}

const TO_EVENT_FIELD_LABEL: Record<DirectToEventField, string> = {
  to: 'To Event',
  to_if_alone: 'To If Alone',
  to_if_held_down: 'To If Held Down',
  to_after_key_up: 'To After Key Up',
};

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
    const initialFrom = fromKey
      ? (() => {
          const field = resolveFieldForKeyValue(fromKey);
          return field ? setEventKeyValue({}, fromKey, field) : {};
        })()
      : {};

    return [
      {
        type: 'basic',
        from: {
          ...initialFrom,
        },
        to: [],
      },
    ];
  });

  const [selectedManipulatorIndex, setSelectedManipulatorIndex] = useState(0);
  const [selectingToEvent, setSelectingToEvent] = useState<{
    field: DirectToEventField;
    index: number;
  } | null>(null);
  const [pendingToKey, setPendingToKey] = useState<string | null>(null);

  const currentManipulator = manipulators[selectedManipulatorIndex];

  // Sync all manipulators' from.key_code when the fromKey prop changes
  useEffect(() => {
    setManipulators((prev) =>
      prev.map((m) => {
        const field = fromKey ? resolveFieldForKeyValue(fromKey) : null;
        return {
          ...m,
          from: {
            ...omitFromKeyCode(m.from),
            ...(field ? setEventKeyValue({}, fromKey, field) : {}),
          },
        };
      }),
    );
  }, [fromKey]);

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

  const handleSelectToKey = useCallback((keyCode: string) => {
    setPendingToKey(keyCode);
  }, []);

  const openToKeyDialog = useCallback(
    (field: DirectToEventField, index: number) => {
      const events = currentManipulator[field] || [];
      const event = events[index];
      const currentKey = getEventKeyValue(event) || null;
      setPendingToKey(currentKey);
      setSelectingToEvent({ field, index });
    },
    [currentManipulator],
  );

  const handleConfirmToKeySelect = useCallback(() => {
    if (!selectingToEvent || !pendingToKey) {
      setSelectingToEvent(null);
      setPendingToKey(null);
      return;
    }

    const { field, index: selectedIndex } = selectingToEvent;
    const currentEvents = currentManipulator[field] || [];
    const nextEvents = currentEvents.map((event, index) => {
      if (index !== selectedIndex) return event;
      const eventField = getEventKeyField(event);
      const resolved = eventField || resolveFieldForKeyValue(pendingToKey);
      if (!resolved) {
        toast({
          title: 'Unable to resolve key field',
          description:
            'The selected key is ambiguous or unknown. Please choose a specific field.',
          variant: 'destructive',
        });
        return event; // leave unchanged
      }

      return setEventKeyValue(event, pendingToKey, resolved);
    });

    updateCurrentManipulator({ [field]: nextEvents });
    setSelectingToEvent(null);
    setPendingToKey(null);
  }, [
    currentManipulator,
    pendingToKey,
    selectingToEvent,
    updateCurrentManipulator,
  ]);

  const toEventDialogTitle =
    selectingToEvent === null
      ? 'Select To Event Key'
      : `Select ${TO_EVENT_FIELD_LABEL[selectingToEvent.field]} Key`;

  const addManipulator = () => {
    const field = fromKey ? resolveFieldForKeyValue(fromKey) : null;
    const newManipulator: Manipulator = {
      type: 'basic',
      from: {
        ...(field ? setEventKeyValue({}, fromKey, field) : {}),
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

    const hasIncompleteOtherKeyAction = manipulators.some((manipulator) =>
      manipulator.to_if_other_key_pressed?.some(
        (entry) => entry.other_keys.length === 0 || entry.to.length === 0,
      ),
    );

    if (hasIncompleteOtherKeyAction) {
      const errorMsg =
        'Each other-key action needs at least one matching key and one event to send.';
      setValidationError(errorMsg);
      toast({
        title: 'Validation Error',
        description: errorMsg,
        variant: 'destructive',
      });
      return;
    }

    const validManipulators = manipulators
      .map(normalizeManipulator)
      .filter(hasManipulatorAction);

    if (validManipulators.length === 0) {
      const errorMsg =
        'At least one manipulator must have an output action. Add a standard, conditional, delayed, or other-key event.';
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
        <div className='space-y-3'>
          <ManipulatorInputSection
            manipulator={currentManipulator}
            fromKey={fromKey}
            fromKeyError={fromKeyError}
            layoutType={keyboardTypeV2}
            onUpdate={updateCurrentManipulator}
            onSelectFromKey={onSelectFromKey}
            onOpenKeyboard={handleOpenFromKeyDialog}
            onClearErrors={() => {
              setFromKeyError(false);
              setValidationError(null);
            }}
          />

          <ManipulatorOutputSections
            manipulator={currentManipulator}
            layoutType={keyboardTypeV2}
            selectedToEvent={selectingToEvent}
            onUpdate={updateCurrentManipulator}
            onSelectToEvent={openToKeyDialog}
          />

          <KeyboardSelectDialog
            open={selectingToEvent !== null}
            title={toEventDialogTitle}
            selectedKey={pendingToKey}
            onSelectKey={handleSelectToKey}
            onConfirm={handleConfirmToKeySelect}
            onOpenChange={(open) => {
              if (!open) {
                setSelectingToEvent(null);
                setPendingToKey(null);
              }
            }}
          />
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

function omitFromKeyCode(from: Manipulator['from']): Manipulator['from'] {
  return clearEventKeyFields(from);
}

function normalizeManipulator(manipulator: Manipulator): Manipulator {
  return {
    ...manipulator,
    to: manipulator.to?.length ? manipulator.to : undefined,
    to_if_alone: manipulator.to_if_alone?.length
      ? manipulator.to_if_alone
      : undefined,
    to_if_held_down: manipulator.to_if_held_down?.length
      ? manipulator.to_if_held_down
      : undefined,
    to_if_other_key_pressed: manipulator.to_if_other_key_pressed?.length
      ? manipulator.to_if_other_key_pressed
      : undefined,
    to_after_key_up: manipulator.to_after_key_up?.length
      ? manipulator.to_after_key_up
      : undefined,
    to_delayed_action:
      manipulator.to_delayed_action?.to_if_invoked?.length ||
      manipulator.to_delayed_action?.to_if_canceled?.length
        ? manipulator.to_delayed_action
        : undefined,
  };
}

function hasManipulatorAction(manipulator: Manipulator): boolean {
  return Boolean(
    manipulator.to?.length ||
      manipulator.to_if_alone?.length ||
      manipulator.to_if_held_down?.length ||
      manipulator.to_if_other_key_pressed?.length ||
      manipulator.to_after_key_up?.length ||
      manipulator.to_delayed_action?.to_if_invoked?.length ||
      manipulator.to_delayed_action?.to_if_canceled?.length,
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
