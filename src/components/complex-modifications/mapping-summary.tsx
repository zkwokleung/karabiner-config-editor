'use client';

import { GripVertical, Route, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Manipulator, Profile } from '@/types/karabiner';
import { getCharacterWithKeyCodeLabel } from '@/lib/keyboard-layout';
import { useKeyboardLayout } from '@/components/keyboard/keyboard-layout-context';
import { getEventKeyValue } from '@/lib/karabiner-keycodes';
import {
  resolveSimpleModificationLineage,
  type KeyIdentity,
} from '@/lib/simple-modification-lineage';

interface MappingSummaryProps {
  profile: Profile;
  manipulator: Manipulator;
  manipulatorIndex: number;
  deviceLabelLookup: Map<number, string>;
  onEdit: () => void;
  onDelete: () => void;
}

export function SortableMappingSummary({
  profile,
  manipulator,
  manipulatorIndex,
  deviceLabelLookup,
  onEdit,
  onDelete,
}: MappingSummaryProps) {
  const { keyboardTypeV2 } = useKeyboardLayout();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: manipulatorIndex,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const fromKey = getEventKeyValue(manipulator.from);
  const mandatory = manipulator.from.modifiers?.mandatory || [];
  const toEvents = manipulator.to || [];
  const lineage = resolveSimpleModificationLineage(profile, manipulator);
  const affectedScopes =
    lineage?.scopes.filter((scope) => scope.affected) || [];

  const hasAdvanced =
    manipulator.to_if_alone ||
    manipulator.to_if_held_down ||
    manipulator.to_if_other_key_pressed ||
    manipulator.to_after_key_up ||
    manipulator.to_delayed_action ||
    manipulator.parameters ||
    (manipulator.conditions && manipulator.conditions.length > 0);

  const formatKeyCode = (keyCode: string) =>
    getCharacterWithKeyCodeLabel(keyCode, keyboardTypeV2);

  return (
    <div
      ref={setNodeRef}
      style={style}
      role='button'
      tabIndex={0}
      onClick={onEdit}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onEdit();
        }
      }}
      className='flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
    >
      <div
        {...attributes}
        {...listeners}
        onClick={(event) => event.stopPropagation()}
        className='cursor-grab text-muted-foreground active:cursor-grabbing'
      >
        <GripVertical className='h-4 w-4' />
      </div>

      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2 flex-wrap'>
          <Badge variant='secondary' className='font-mono'>
            {mandatory.length > 0 && (
              <span className='mr-1'>{getModifierSymbols(mandatory)}</span>
            )}
            {formatKeyCode(fromKey)}
          </Badge>
          <span className='text-muted-foreground'>→</span>
          {toEvents.length === 0 ? (
            <span className='text-sm text-muted-foreground'>No action</span>
          ) : (
            toEvents.slice(0, 3).map((to, i) => {
              const key = getEventKeyValue(to);
              const mods = to.modifiers || [];
              return (
                <Badge key={i} variant='outline' className='font-mono text-xs'>
                  {mods.length > 0 && (
                    <span className='mr-1'>{getModifierSymbols(mods)}</span>
                  )}
                  {to.shell_command ? 'Shell' : formatKeyCode(key)}
                </Badge>
              );
            })
          )}
          {toEvents.length > 3 && (
            <span className='text-xs text-muted-foreground'>
              +{toEvents.length - 3} more
            </span>
          )}
        </div>

        {manipulator.description && (
          <p className='mt-1.5 text-xs text-muted-foreground break-words'>
            {manipulator.description}
          </p>
        )}

        {lineage && affectedScopes.length > 0 && (
          <div className='mt-2 space-y-1.5 rounded-md border border-sky-500/20 bg-sky-500/5 p-2.5'>
            <div className='flex items-center gap-1.5 text-xs font-medium text-foreground'>
              <Route className='h-3.5 w-3.5 text-sky-600' />
              Simple modification lineage
            </div>
            {affectedScopes.map((scope) => {
              const scopeLabel =
                scope.kind === 'device'
                  ? deviceLabelLookup.get(scope.deviceIndex ?? -1) ||
                    `Device ${(scope.deviceIndex ?? 0) + 1}`
                  : profile.devices?.length
                    ? 'All other devices'
                    : 'All devices';

              return (
                <div
                  key={`${scope.kind}-${scope.deviceIndex ?? 'profile'}`}
                  className='flex flex-wrap items-center gap-1.5 text-xs'
                >
                  <span className='mr-1 text-muted-foreground'>
                    {scopeLabel}:
                  </span>
                  {scope.physicalSources.length > 0 ? (
                    scope.physicalSources.map((source) => (
                      <Badge
                        key={`${source.field}:${source.value}`}
                        variant='outline'
                        className='font-mono text-[11px]'
                      >
                        {formatIdentity(source, keyboardTypeV2)}
                      </Badge>
                    ))
                  ) : (
                    <span className='italic text-muted-foreground'>
                      no physical source
                    </span>
                  )}
                  <span className='text-muted-foreground'>→ post-simple</span>
                  <Badge variant='secondary' className='font-mono text-[11px]'>
                    {formatIdentity(lineage.postSimpleInput, keyboardTypeV2)}
                  </Badge>
                </div>
              );
            })}
            <p className='text-[11px] text-muted-foreground'>
              One pass only; simple mappings are not recursively chained.
            </p>
          </div>
        )}

        {hasAdvanced && (
          <div className='flex items-center gap-1.5 mt-1.5 flex-wrap'>
            {manipulator.to_if_alone && (
              <Badge
                variant='outline'
                className='text-xs bg-blue-500/10 text-blue-600 border-blue-200'
              >
                if alone
              </Badge>
            )}
            {manipulator.to_if_held_down && (
              <Badge
                variant='outline'
                className='text-xs bg-orange-500/10 text-orange-600 border-orange-200'
              >
                if held
              </Badge>
            )}
            {manipulator.to_if_other_key_pressed && (
              <Badge variant='outline' className='text-xs'>
                if other key
              </Badge>
            )}
            {manipulator.to_after_key_up && (
              <Badge
                variant='outline'
                className='text-xs bg-purple-500/10 text-purple-600 border-purple-200'
              >
                after key up
              </Badge>
            )}
            {manipulator.to_delayed_action && (
              <Badge variant='outline' className='text-xs'>
                delayed
              </Badge>
            )}
            {manipulator.parameters && (
              <Badge variant='outline' className='text-xs'>
                timing override
              </Badge>
            )}
            {manipulator.conditions && manipulator.conditions.length > 0 && (
              <Badge
                variant='outline'
                className='text-xs bg-green-500/10 text-green-600 border-green-200'
              >
                {manipulator.conditions.length} condition
                {manipulator.conditions.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
        <Button
          size='icon'
          variant='ghost'
          className='text-destructive hover:text-destructive hover:bg-destructive/10'
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}

function formatIdentity(
  identity: KeyIdentity,
  keyboardType: 'ansi' | 'iso' | 'jis',
): string {
  const keyLabel = getCharacterWithKeyCodeLabel(identity.value, keyboardType);
  if (identity.field === 'key_code') return keyLabel;
  return `${keyLabel} · ${IDENTITY_FIELD_LABELS[identity.field]}`;
}

const IDENTITY_FIELD_LABELS: Record<
  Exclude<KeyIdentity['field'], 'key_code'>,
  string
> = {
  consumer_key_code: 'consumer',
  pointing_button: 'pointing',
  apple_vendor_top_case_key_code: 'top case',
  apple_vendor_keyboard_key_code: 'Apple keyboard',
  generic_desktop: 'generic desktop',
};

function getModifierSymbols(mods: string[]): string {
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
  const unique = [...new Set(mods.map((m) => symbols[m] || ''))].filter(
    Boolean,
  );
  return unique.join('');
}
