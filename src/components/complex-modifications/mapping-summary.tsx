'use client';

import { GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Manipulator } from '@/types/karabiner';

interface MappingSummaryProps {
  manipulator: Manipulator;
  manipulatorIndex: number;
  onEdit: () => void;
  onDelete: () => void;
}

export function SortableMappingSummary({
  manipulator,
  manipulatorIndex,
  onEdit,
  onDelete,
}: MappingSummaryProps) {
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

  const fromKey =
    manipulator.from.key_code || manipulator.from.consumer_key_code || '';
  const mandatory = manipulator.from.modifiers?.mandatory || [];
  const toEvents = manipulator.to || [];

  const hasAdvanced =
    manipulator.to_if_alone ||
    manipulator.to_if_held_down ||
    manipulator.to_after_key_up ||
    (manipulator.conditions && manipulator.conditions.length > 0);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className='flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group'
    >
      <div
        {...attributes}
        {...listeners}
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
            {fromKey.toUpperCase()}
          </Badge>
          <span className='text-muted-foreground'>→</span>
          {toEvents.length === 0 ? (
            <span className='text-sm text-muted-foreground'>No action</span>
          ) : (
            toEvents.slice(0, 3).map((to, i) => {
              const key = to.key_code || to.consumer_key_code || '';
              const mods = to.modifiers || [];
              return (
                <Badge key={i} variant='outline' className='font-mono text-xs'>
                  {mods.length > 0 && (
                    <span className='mr-1'>{getModifierSymbols(mods)}</span>
                  )}
                  {to.shell_command ? 'Shell' : key.toUpperCase()}
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
            {manipulator.to_after_key_up && (
              <Badge
                variant='outline'
                className='text-xs bg-purple-500/10 text-purple-600 border-purple-200'
              >
                after key up
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
        <Button size='sm' variant='ghost' onClick={onEdit}>
          Edit
        </Button>
        <Button
          size='icon'
          variant='ghost'
          className='text-destructive hover:text-destructive hover:bg-destructive/10'
          onClick={onDelete}
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}

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
