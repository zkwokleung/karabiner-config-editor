'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { KeyCodeSelector } from '@/components/mapping/selectors/key-code-selector';
import { ModifierSelector } from '@/components/mapping/selectors/modifier-selector';
import { ToEventEditor } from '@/components/mapping/to-events/to-event-editor';
import type {
  FromEvent,
  Modifiers,
  OtherKeyPressedEvent,
} from '@/types/karabiner';
import {
  clearEventKeyFields,
  getEventKeyValue,
  resolveFieldForKeyValue,
  setEventKeyValue,
} from '@/lib/karabiner-keycodes';
import type { KeyboardLayoutType } from '@/lib/keyboard-layout';

interface OtherKeyPressedEditorProps {
  entries: OtherKeyPressedEvent[];
  onChange: (entries: OtherKeyPressedEvent[]) => void;
  layoutType: KeyboardLayoutType;
}

function createFromEvent(keyCode = 'a'): FromEvent {
  const field = resolveFieldForKeyValue(keyCode);
  return field ? setEventKeyValue({}, keyCode, field) : {};
}

function updateModifiers(
  event: FromEvent,
  type: keyof Modifiers,
  values: string[],
): FromEvent {
  const modifiers = { ...event.modifiers };
  if (values.length > 0) modifiers[type] = values;
  else delete modifiers[type];
  return {
    ...event,
    modifiers: Object.keys(modifiers).length > 0 ? modifiers : undefined,
  };
}

export function OtherKeyPressedEditor({
  entries,
  onChange,
  layoutType,
}: OtherKeyPressedEditorProps) {
  const updateEntry = (index: number, entry: OtherKeyPressedEvent) => {
    const next = [...entries];
    next[index] = entry;
    onChange(next);
  };

  return (
    <div className='space-y-3'>
      {entries.map((entry, entryIndex) => (
        <div
          key={entryIndex}
          className='space-y-3 rounded-md border bg-muted/20 p-3'
        >
          <div className='flex items-center justify-between gap-2'>
            <Label className='text-xs font-semibold'>
              Other-key action {entryIndex + 1}
            </Label>
            <Button
              type='button'
              size='icon-sm'
              variant='ghost'
              aria-label={`Delete other-key action ${entryIndex + 1}`}
              onClick={() =>
                onChange(entries.filter((_, index) => index !== entryIndex))
              }
            >
              <Trash2 className='h-3.5 w-3.5' />
            </Button>
          </div>

          <div className='space-y-3'>
            {entry.other_keys.map((otherKey, keyIndex) => (
              <div
                key={keyIndex}
                className='space-y-2 rounded-md bg-background p-2'
              >
                <div className='flex items-center gap-2'>
                  <div className='min-w-0 flex-1'>
                    <KeyCodeSelector
                      value={getEventKeyValue(otherKey) || ''}
                      onChange={({ value, field }) => {
                        const otherKeys = [...entry.other_keys];
                        otherKeys[keyIndex] = setEventKeyValue(
                          clearEventKeyFields(otherKey),
                          value,
                          field,
                        );
                        updateEntry(entryIndex, {
                          ...entry,
                          other_keys: otherKeys,
                        });
                      }}
                      excludeNotFrom
                      layoutAware
                      layoutType={layoutType}
                    />
                  </div>
                  <Button
                    type='button'
                    size='icon-sm'
                    variant='ghost'
                    disabled={entry.other_keys.length === 1}
                    aria-label={`Delete other key ${keyIndex + 1}`}
                    onClick={() =>
                      updateEntry(entryIndex, {
                        ...entry,
                        other_keys: entry.other_keys.filter(
                          (_, index) => index !== keyIndex,
                        ),
                      })
                    }
                  >
                    <Trash2 className='h-3.5 w-3.5' />
                  </Button>
                </div>
                <div className='grid gap-2 sm:grid-cols-2'>
                  <ModifierSelector
                    selected={otherKey.modifiers?.mandatory || []}
                    onChange={(values) => {
                      const otherKeys = [...entry.other_keys];
                      otherKeys[keyIndex] = updateModifiers(
                        otherKey,
                        'mandatory',
                        values,
                      );
                      updateEntry(entryIndex, {
                        ...entry,
                        other_keys: otherKeys,
                      });
                    }}
                    label='Required modifiers'
                  />
                  <ModifierSelector
                    selected={otherKey.modifiers?.optional || []}
                    onChange={(values) => {
                      const otherKeys = [...entry.other_keys];
                      otherKeys[keyIndex] = updateModifiers(
                        otherKey,
                        'optional',
                        values,
                      );
                      updateEntry(entryIndex, {
                        ...entry,
                        other_keys: otherKeys,
                      });
                    }}
                    label='Optional modifiers'
                  />
                </div>
              </div>
            ))}
            <Button
              type='button'
              size='sm'
              variant='outline'
              onClick={() =>
                updateEntry(entryIndex, {
                  ...entry,
                  other_keys: [...entry.other_keys, createFromEvent()],
                })
              }
            >
              <Plus className='mr-2 h-3 w-3' />
              Add Other Key
            </Button>
          </div>

          <ToEventEditor
            events={entry.to}
            onChange={(to) => updateEntry(entryIndex, { ...entry, to })}
            label='Events to send'
          />
        </div>
      ))}

      <Button
        type='button'
        size='sm'
        variant='outline'
        onClick={() =>
          onChange([
            ...entries,
            {
              other_keys: [createFromEvent()],
              to: [setEventKeyValue({}, 'a', 'key_code')],
            },
          ])
        }
      >
        <Plus className='mr-2 h-3 w-3' />
        Add Other-key Action
      </Button>
    </div>
  );
}
