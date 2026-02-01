'use client';

import { useState, type ReactNode } from 'react';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ModifierSelector } from '@/components/mapping/selectors/modifier-selector';
import { KeyCodeSelector } from '@/components/mapping/selectors/key-code-selector';
import type { ToEvent } from '@/types/karabiner';
import { TO_EVENT_TYPES } from '@/lib/constants';

interface ToEventItemProps {
  event: ToEvent;
  onUpdate: (event: ToEvent) => void;
  onDelete: () => void;
  showDelete: boolean;
  keyCodeAction?: ReactNode;
}

export function ToEventItem({
  event,
  onUpdate,
  onDelete,
  showDelete,
  keyCodeAction,
}: ToEventItemProps) {
  const getEventType = (): string => {
    if (event.shell_command) return 'shell_command';
    if (event.set_variable) return 'set_variable';
    if (event.select_input_source) return 'select_input_source';
    if (event.mouse_key) return 'mouse_key';
    return 'key_code';
  };

  const eventType = getEventType();

  const updateEventType = (type: string) => {
    const newEvent: ToEvent = {};

    if (type === 'key_code') {
      newEvent.key_code = 'a';
    } else if (type === 'shell_command') {
      newEvent.shell_command = "echo 'Hello'";
    } else if (type === 'set_variable') {
      newEvent.set_variable = { name: 'variable_name', value: 1 };
    } else if (type === 'select_input_source') {
      newEvent.select_input_source = { language: 'en' };
    } else if (type === 'mouse_key') {
      newEvent.mouse_key = { x: 0, y: 0 };
    }

    onUpdate(newEvent);
  };

  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <Card className='p-3 bg-muted/30'>
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <Select value={eventType} onValueChange={updateEventType}>
            <SelectTrigger className='w-[180px] cursor-pointer'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TO_EVENT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {showDelete && (
            <Button size='icon' variant='ghost' onClick={onDelete}>
              <Trash2 className='h-4 w-4' />
            </Button>
          )}
        </div>

        {eventType === 'key_code' && (
          <div className='space-y-2'>
            <Label className='text-xs'>Key Code</Label>
            <div className='flex items-center gap-2'>
              <div className='flex-1'>
                <KeyCodeSelector
                  value={event.key_code || ''}
                  onChange={(key) => onUpdate({ ...event, key_code: key })}
                  placeholder='Select key'
                />
              </div>
              {keyCodeAction}
            </div>
          </div>
        )}

        {eventType === 'shell_command' && (
          <div className='space-y-2'>
            <Label className='text-xs'>Shell Command</Label>
            <Textarea
              value={event.shell_command || ''}
              onChange={(e) =>
                onUpdate({ ...event, shell_command: e.target.value })
              }
              placeholder="open -a 'Google Chrome'"
              className='font-mono text-xs'
              rows={3}
            />
            <p className='text-xs text-muted-foreground'>
              Example: open -a &apos;Application Name&apos; or osascript -e
              &apos;tell application &quot;System Events&quot; to keystroke
              &quot;c&quot; using command down&apos;
            </p>
          </div>
        )}

        {eventType === 'set_variable' && (
          <div className='grid grid-cols-2 gap-2'>
            <div className='space-y-1'>
              <Label className='text-xs'>Variable Name</Label>
              <Input
                value={event.set_variable?.name || ''}
                onChange={(e) =>
                  onUpdate({
                    ...event,
                    set_variable: {
                      ...(event.set_variable || { value: 1 }),
                      name: e.target.value,
                    },
                  })
                }
                placeholder='variable_name'
                className='text-xs'
              />
            </div>
            <div className='space-y-1'>
              <Label className='text-xs'>Value</Label>
              <Input
                type='number'
                value={event.set_variable?.value || 0}
                onChange={(e) =>
                  onUpdate({
                    ...event,
                    set_variable: {
                      ...(event.set_variable || { name: '' }),
                      value: Number.parseInt(e.target.value) || 0,
                    },
                  })
                }
                className='text-xs'
              />
            </div>
          </div>
        )}

        {eventType === 'select_input_source' && (
          <div className='space-y-2'>
            <Label className='text-xs'>Language Code</Label>
            <Input
              value={event.select_input_source?.language || ''}
              onChange={(e) =>
                onUpdate({
                  ...event,
                  select_input_source: { language: e.target.value },
                })
              }
              placeholder='en'
              className='text-xs'
            />
            <p className='text-xs text-muted-foreground'>
              Example: en, ja, zh-Hans
            </p>
          </div>
        )}

        {eventType === 'mouse_key' && (
          <div className='grid grid-cols-2 gap-2'>
            <div className='space-y-1'>
              <Label className='text-xs'>X Movement</Label>
              <Input
                type='number'
                value={event.mouse_key?.x || 0}
                onChange={(e) =>
                  onUpdate({
                    ...event,
                    mouse_key: {
                      ...(event.mouse_key || {}),
                      x: Number.parseInt(e.target.value) || 0,
                    },
                  })
                }
                className='text-xs'
              />
            </div>
            <div className='space-y-1'>
              <Label className='text-xs'>Y Movement</Label>
              <Input
                type='number'
                value={event.mouse_key?.y || 0}
                onChange={(e) =>
                  onUpdate({
                    ...event,
                    mouse_key: {
                      ...(event.mouse_key || {}),
                      y: Number.parseInt(e.target.value) || 0,
                    },
                  })
                }
                className='text-xs'
              />
            </div>
          </div>
        )}

        <ModifierSelector
          selected={event.modifiers || []}
          onChange={(modifiers) =>
            onUpdate({
              ...event,
              modifiers: modifiers.length > 0 ? modifiers : undefined,
            })
          }
          label='Modifiers (posted with event)'
        />

        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              className='w-full justify-between'
            >
              <span className='text-xs'>Advanced Options</span>
              {showAdvanced ? (
                <ChevronUp className='h-3 w-3' />
              ) : (
                <ChevronDown className='h-3 w-3' />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className='space-y-3 pt-2'>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id={`lazy-${event.key_code}`}
                checked={event.lazy || false}
                onCheckedChange={(checked) =>
                  onUpdate({
                    ...event,
                    lazy: checked === true ? true : undefined,
                  })
                }
              />
              <Label
                htmlFor={`lazy-${event.key_code}`}
                className='text-xs cursor-pointer'
              >
                Lazy (modifier flag)
              </Label>
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id={`repeat-${event.key_code}`}
                checked={event.repeat !== false}
                onCheckedChange={(checked) =>
                  onUpdate({
                    ...event,
                    repeat: checked === false ? false : undefined,
                  })
                }
              />
              <Label
                htmlFor={`repeat-${event.key_code}`}
                className='text-xs cursor-pointer'
              >
                Repeat (key repeat enabled, default: true)
              </Label>
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id={`halt-${event.key_code}`}
                checked={event.halt || false}
                onCheckedChange={(checked) =>
                  onUpdate({
                    ...event,
                    halt: checked === true ? true : undefined,
                  })
                }
              />
              <Label
                htmlFor={`halt-${event.key_code}`}
                className='text-xs cursor-pointer'
              >
                Halt (for to_after_key_up)
              </Label>
            </div>

            <div className='space-y-1'>
              <Label className='text-xs'>Hold Down Milliseconds</Label>
              <Input
                type='number'
                value={event.hold_down_milliseconds || 0}
                onChange={(e) => {
                  const value = Number.parseInt(e.target.value) || 0;
                  onUpdate({
                    ...event,
                    hold_down_milliseconds: value > 0 ? value : undefined,
                  });
                }}
                placeholder='0'
                className='text-xs'
              />
              <p className='text-xs text-muted-foreground'>
                Interval between key_down and key_up when sent simultaneously
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Card>
  );
}
