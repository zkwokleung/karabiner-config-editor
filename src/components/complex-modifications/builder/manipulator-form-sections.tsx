'use client';

import { CircleHelp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ConditionEditor } from '@/components/mapping/conditions/condition-editor';
import { KeyCodeSelector } from '@/components/mapping/selectors/key-code-selector';
import { ModifierSelector } from '@/components/mapping/selectors/modifier-selector';
import { ToEventEditor } from '@/components/mapping/to-events/to-event-editor';
import type {
  Manipulator,
  Modifiers,
  Parameters,
  ToEvent,
} from '@/types/karabiner';
import {
  getCharacterWithKeyCodeLabel,
  type KeyboardLayoutType,
} from '@/lib/keyboard-layout';
import { setEventKeyValue } from '@/lib/karabiner-keycodes';
import { cn } from '@/lib/utils';
import { ManipulatorSection } from './manipulator-section';
import { OtherKeyPressedEditor } from './other-key-pressed-editor';

export type DirectToEventField =
  | 'to'
  | 'to_if_alone'
  | 'to_if_held_down'
  | 'to_after_key_up';

interface ManipulatorInputSectionProps {
  manipulator: Manipulator;
  fromKey: string;
  fromKeyError: boolean;
  layoutType: KeyboardLayoutType;
  onUpdate: (updates: Partial<Manipulator>) => void;
  onSelectFromKey: (keyCode: string) => void;
  onOpenKeyboard: () => void;
  onClearErrors: () => void;
}

export function ManipulatorInputSection({
  manipulator,
  fromKey,
  fromKeyError,
  layoutType,
  onUpdate,
  onSelectFromKey,
  onOpenKeyboard,
  onClearErrors,
}: ManipulatorInputSectionProps) {
  const updateModifiers = (type: keyof Modifiers, modifiers: string[]) => {
    const nextModifiers = { ...manipulator.from.modifiers };
    if (modifiers.length > 0) nextModifiers[type] = modifiers;
    else delete nextModifiers[type];
    onUpdate({
      from: {
        ...manipulator.from,
        modifiers:
          Object.keys(nextModifiers).length > 0 ? nextModifiers : undefined,
      },
    });
  };

  return (
    <ManipulatorSection
      title='Description & From'
      summary={
        fromKey
          ? getCharacterWithKeyCodeLabel(fromKey, layoutType)
          : 'Key required'
      }
      defaultOpen
    >
      <div className='space-y-2'>
        <Label className='text-sm font-semibold'>Description</Label>
        <Input
          value={manipulator.description || ''}
          onChange={(event) => {
            const description = event.target.value;
            onUpdate({
              description:
                description.trim().length > 0 ? description : undefined,
            });
          }}
          placeholder='Optional description for this manipulator'
        />
      </div>

      <Label className='text-sm font-semibold'>From Key</Label>
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg',
          fromKeyError && 'border-2 border-destructive bg-destructive/10',
        )}
      >
        <div className='w-48'>
          <KeyCodeSelector
            value={fromKey}
            onChange={({ value }) => {
              onSelectFromKey(value);
              onClearErrors();
            }}
            placeholder='No key selected'
            excludeNotFrom
            layoutAware
            layoutType={layoutType}
          />
        </div>
        <Button
          size='sm'
          variant='outline'
          className='shrink-0'
          onClick={onOpenKeyboard}
        >
          Select from Keyboard
        </Button>
      </div>

      <div className='grid gap-3 sm:grid-cols-2'>
        <div className='space-y-2'>
          <ModifierLabel
            label='Mandatory Modifiers'
            help='These modifiers must be held for this manipulator to trigger.'
          />
          <ModifierSelector
            selected={manipulator.from.modifiers?.mandatory || []}
            onChange={(modifiers) => updateModifiers('mandatory', modifiers)}
            label='Required with key'
            showInlineLabel={false}
          />
        </div>
        <div className='space-y-2'>
          <ModifierLabel
            label='Optional Modifiers'
            help='These modifiers are optional: the manipulator works with or without them held.'
          />
          <ModifierSelector
            selected={manipulator.from.modifiers?.optional || []}
            onChange={(modifiers) => updateModifiers('optional', modifiers)}
            label='Allowed but not required'
            showInlineLabel={false}
          />
        </div>
      </div>
    </ManipulatorSection>
  );
}

function ModifierLabel({ label, help }: { label: string; help: string }) {
  return (
    <div className='flex items-center gap-1'>
      <Label className='text-xs'>{label}</Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type='button'
              variant='ghost'
              size='icon-sm'
              className='h-5 w-5 text-muted-foreground'
              aria-label={`${label} help`}
            >
              <CircleHelp className='h-3.5 w-3.5' />
            </Button>
          </TooltipTrigger>
          <TooltipContent side='top' align='start'>
            {help}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

interface ManipulatorOutputSectionsProps {
  manipulator: Manipulator;
  layoutType: KeyboardLayoutType;
  selectedToEvent: { field: DirectToEventField; index: number } | null;
  onUpdate: (updates: Partial<Manipulator>) => void;
  onSelectToEvent: (field: DirectToEventField, index: number) => void;
}

export function ManipulatorOutputSections({
  manipulator,
  layoutType,
  selectedToEvent,
  onUpdate,
  onSelectToEvent,
}: ManipulatorOutputSectionsProps) {
  const updateOptionalEvents = (
    field: Exclude<DirectToEventField, 'to'>,
    events: ToEvent[],
  ) => onUpdate({ [field]: events.length > 0 ? events : undefined });

  const renderKeyboardAction = (field: DirectToEventField, index: number) => (
    <Button
      size='sm'
      variant={
        selectedToEvent?.field === field && selectedToEvent.index === index
          ? 'default'
          : 'outline'
      }
      className='shrink-0'
      onClick={() => onSelectToEvent(field, index)}
    >
      Select from Keyboard
    </Button>
  );

  const updateParameter = (key: keyof Parameters, rawValue: string) => {
    const parameters = { ...manipulator.parameters };
    if (rawValue === '') delete parameters[key];
    else parameters[key] = Number(rawValue);
    onUpdate({
      parameters: Object.keys(parameters).length > 0 ? parameters : undefined,
    });
  };

  return (
    <>
      <ManipulatorSection
        title='To'
        summary={`${manipulator.to?.length || 0} events`}
        defaultOpen
        action={
          <Button
            size='sm'
            variant='outline'
            onClick={() =>
              onUpdate({
                to: [
                  ...(manipulator.to || []),
                  setEventKeyValue({}, 'a', 'key_code'),
                ],
              })
            }
          >
            <Plus className='mr-2 h-3 w-3' />
            Add Event
          </Button>
        }
      >
        <ToEventEditor
          events={manipulator.to || []}
          onChange={(events) =>
            onUpdate({ to: events.length > 0 ? events : undefined })
          }
          label=''
          showHeader={false}
          keyCodeAction={(index) => renderKeyboardAction('to', index)}
        />
      </ManipulatorSection>

      <ManipulatorSection
        title='Alone action'
        summary={`${manipulator.to_if_alone?.length || 0} events`}
        defaultOpen={(manipulator.to_if_alone?.length || 0) > 0}
        description='Sent when the key is pressed and released without another event.'
      >
        <ToEventEditor
          events={manipulator.to_if_alone || []}
          onChange={(events) => updateOptionalEvents('to_if_alone', events)}
          label='To If Alone'
          keyCodeAction={(index) => renderKeyboardAction('to_if_alone', index)}
        />
      </ManipulatorSection>

      <ManipulatorSection
        title='Held-down action'
        summary={`${manipulator.to_if_held_down?.length || 0} events`}
        defaultOpen={(manipulator.to_if_held_down?.length || 0) > 0}
        description='Sent after the key is held past the configured threshold.'
      >
        <ToEventEditor
          events={manipulator.to_if_held_down || []}
          onChange={(events) => updateOptionalEvents('to_if_held_down', events)}
          label='To If Held Down'
          keyCodeAction={(index) =>
            renderKeyboardAction('to_if_held_down', index)
          }
        />
      </ManipulatorSection>

      <ManipulatorSection
        title='Other-key action'
        summary={`${manipulator.to_if_other_key_pressed?.length || 0} actions`}
        defaultOpen={(manipulator.to_if_other_key_pressed?.length || 0) > 0}
        description='Changes the held key output when one of the configured other keys is pressed.'
      >
        <OtherKeyPressedEditor
          entries={manipulator.to_if_other_key_pressed || []}
          onChange={(entries) =>
            onUpdate({
              to_if_other_key_pressed: entries.length > 0 ? entries : undefined,
            })
          }
          layoutType={layoutType}
        />
      </ManipulatorSection>

      <ManipulatorSection
        title='After key-up action'
        summary={`${manipulator.to_after_key_up?.length || 0} events`}
        defaultOpen={(manipulator.to_after_key_up?.length || 0) > 0}
        description='Sent after the original key is released.'
      >
        <ToEventEditor
          events={manipulator.to_after_key_up || []}
          onChange={(events) => updateOptionalEvents('to_after_key_up', events)}
          label='To After Key Up'
          keyCodeAction={(index) =>
            renderKeyboardAction('to_after_key_up', index)
          }
        />
      </ManipulatorSection>

      <ManipulatorSection
        title='Delayed action'
        summary={`${(manipulator.to_delayed_action?.to_if_invoked?.length || 0) + (manipulator.to_delayed_action?.to_if_canceled?.length || 0)} events`}
        defaultOpen={Boolean(manipulator.to_delayed_action)}
        description='Invoked events run after the delay; canceled events run if another key interrupts the delay.'
      >
        <ToEventEditor
          events={manipulator.to_delayed_action?.to_if_invoked || []}
          onChange={(events) =>
            onUpdate({
              to_delayed_action: normalizeDelayedAction({
                ...manipulator.to_delayed_action,
                to_if_invoked: events.length > 0 ? events : undefined,
              }),
            })
          }
          label='To If Invoked'
        />
        <ToEventEditor
          events={manipulator.to_delayed_action?.to_if_canceled || []}
          onChange={(events) =>
            onUpdate({
              to_delayed_action: normalizeDelayedAction({
                ...manipulator.to_delayed_action,
                to_if_canceled: events.length > 0 ? events : undefined,
              }),
            })
          }
          label='To If Canceled'
        />
      </ManipulatorSection>

      <ManipulatorSection
        title='Conditions & Context'
        summary={`${manipulator.conditions?.length || 0} conditions`}
        defaultOpen={(manipulator.conditions?.length || 0) > 0}
      >
        <ConditionEditor
          conditions={manipulator.conditions || []}
          onChange={(conditions) =>
            onUpdate({
              conditions: conditions.length > 0 ? conditions : undefined,
            })
          }
        />
      </ManipulatorSection>

      <ManipulatorSection
        title='Timing parameters'
        summary={`${Object.keys(manipulator.parameters || {}).length} overrides`}
        defaultOpen={Boolean(manipulator.parameters)}
        description='Optional per-manipulator overrides in milliseconds.'
      >
        <div className='grid gap-3 sm:grid-cols-2'>
          {MANIPULATOR_PARAMETER_FIELDS.map(({ key, label }) => (
            <div key={key} className='space-y-1.5'>
              <Label className='text-xs' htmlFor={key}>
                {label}
              </Label>
              <Input
                id={key}
                type='number'
                min={0}
                step={1}
                value={manipulator.parameters?.[key] ?? ''}
                placeholder='Default'
                onChange={(event) => updateParameter(key, event.target.value)}
              />
            </div>
          ))}
        </div>
      </ManipulatorSection>
    </>
  );
}

const MANIPULATOR_PARAMETER_FIELDS = [
  {
    key: 'basic.simultaneous_threshold_milliseconds',
    label: 'Simultaneous threshold',
  },
  {
    key: 'basic.to_delayed_action_delay_milliseconds',
    label: 'Delayed-action delay',
  },
  {
    key: 'basic.to_if_alone_timeout_milliseconds',
    label: 'Alone timeout',
  },
  {
    key: 'basic.to_if_held_down_threshold_milliseconds',
    label: 'Held-down threshold',
  },
] as const satisfies ReadonlyArray<{
  key: keyof Parameters;
  label: string;
}>;

function normalizeDelayedAction(
  delayedAction: Manipulator['to_delayed_action'],
): Manipulator['to_delayed_action'] {
  if (
    !delayedAction?.to_if_invoked?.length &&
    !delayedAction?.to_if_canceled?.length
  ) {
    return undefined;
  }
  return delayedAction;
}
