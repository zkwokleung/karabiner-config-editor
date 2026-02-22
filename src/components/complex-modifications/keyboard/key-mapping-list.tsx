'use client';

import { useMemo, type ReactNode } from 'react';
import { Plus, Trash2, ArrowRight, X, GripVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Manipulator } from '@/types/karabiner';
import { getKeyLabel } from '@/lib/keyboard-layout';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface KeyMappingListProps {
  selectedKey: string;
  manipulators: Manipulator[];
  manipulatorIndices: number[];
  onAddManipulator: () => void;
  onEditManipulator: (index: number) => void;
  onDeleteManipulator: (index: number) => void;
  onReorderManipulators: (manipulators: Manipulator[]) => void;
  onClearSelection: () => void;
}

export function KeyMappingList({
  selectedKey,
  manipulators,
  manipulatorIndices,
  onAddManipulator,
  onEditManipulator,
  onDeleteManipulator,
  onReorderManipulators,
  onClearSelection,
}: KeyMappingListProps) {
  const selectedManipulators = useMemo(() => {
    return manipulatorIndices.map((i) => ({
      index: i,
      manipulator: manipulators[i],
    }));
  }, [manipulators, manipulatorIndices]);

  const getModifierDisplay = (manipulator: Manipulator) => {
    const mandatory = manipulator.from.modifiers?.mandatory || [];
    const optional = manipulator.from.modifiers?.optional || [];

    const symbols: string[] = [];
    mandatory.forEach((m) => {
      const sym = getModifierSymbol(m);
      if (sym && !symbols.includes(sym)) symbols.push(sym);
    });

    if (symbols.length === 0 && optional.length === 0) return null;

    return (
      <span className='text-xs text-muted-foreground'>
        {symbols.length > 0 && (
          <span className='font-medium'>{symbols.join('')}</span>
        )}
        {optional.length > 0 && (
          <span className='ml-1 opacity-60'>+optional</span>
        )}
      </span>
    );
  };

  const getToDisplay = (manipulator: Manipulator) => {
    const toEvents = manipulator.to || [];
    if (toEvents.length === 0)
      return <span className='text-muted-foreground'>No action</span>;

    return toEvents.map((to, i) => {
      const key =
        to.key_code || to.consumer_key_code || to.shell_command || 'action';
      const label = to.shell_command ? 'Shell' : getKeyLabel(key);
      const modifiers = to.modifiers || [];

      return (
        <Badge key={i} variant='outline' className='font-mono text-xs'>
          {modifiers.length > 0 && (
            <span className='mr-1'>
              {modifiers.map((m) => getModifierSymbol(m)).join('')}
            </span>
          )}
          {label}
        </Badge>
      );
    });
  };

  const hasAdvancedOptions = (manipulator: Manipulator) => {
    return Boolean(
      manipulator.to_if_alone ||
        manipulator.to_if_held_down ||
        manipulator.to_after_key_up ||
        manipulator.conditions,
    );
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = manipulatorIndices.indexOf(active.id as number);
    const newIndex = manipulatorIndices.indexOf(over.id as number);
    if (oldIndex === -1 || newIndex === -1) return;

    const selectedManipulatorsOnly = manipulatorIndices.map(
      (index) => manipulators[index],
    );
    const reorderedSelectedManipulators = arrayMove(
      selectedManipulatorsOnly,
      oldIndex,
      newIndex,
    );

    const updatedManipulators = [...manipulators];
    manipulatorIndices.forEach((index, selectedIndex) => {
      updatedManipulators[index] = reorderedSelectedManipulators[selectedIndex];
    });

    onReorderManipulators(updatedManipulators);
  };

  return (
    <Card className='p-4'>
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium'>Mappings for</span>
          <Badge variant='secondary' className='font-mono text-base'>
            {getKeyLabel(selectedKey)}
          </Badge>
          <span className='text-sm text-muted-foreground'>
            ({selectedManipulators.length} mapping
            {selectedManipulators.length === 1 ? '' : 's'})
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <Button size='sm' variant='outline' onClick={onAddManipulator}>
            <Plus className='h-3 w-3 mr-1' />
            Add Mapping
          </Button>
          <Button size='icon' variant='ghost' onClick={onClearSelection}>
            <X className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {selectedManipulators.length === 0 ? (
        <div className='py-8 text-center text-sm text-muted-foreground border rounded-lg border-dashed'>
          <p>No mappings for this key yet.</p>
        </div>
      ) : (
        <ScrollArea className='max-h-[300px]'>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={manipulatorIndices}
              strategy={verticalListSortingStrategy}
            >
              <div className='space-y-2'>
                {selectedManipulators.map(({ index, manipulator }) => (
                  <SortableKeyMappingItem
                    key={index}
                    index={index}
                    manipulator={manipulator}
                    selectedKey={selectedKey}
                    onEditManipulator={onEditManipulator}
                    onDeleteManipulator={onDeleteManipulator}
                    getModifierDisplay={getModifierDisplay}
                    getToDisplay={getToDisplay}
                    hasAdvancedOptions={hasAdvancedOptions}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </ScrollArea>
      )}
    </Card>
  );
}

interface SortableKeyMappingItemProps {
  index: number;
  manipulator: Manipulator;
  selectedKey: string;
  onEditManipulator: (index: number) => void;
  onDeleteManipulator: (index: number) => void;
  getModifierDisplay: (manipulator: Manipulator) => ReactNode;
  getToDisplay: (manipulator: Manipulator) => ReactNode;
  hasAdvancedOptions: (manipulator: Manipulator) => boolean;
}

function SortableKeyMappingItem({
  index,
  manipulator,
  selectedKey,
  onEditManipulator,
  onDeleteManipulator,
  getModifierDisplay,
  getToDisplay,
  hasAdvancedOptions,
}: SortableKeyMappingItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      role='button'
      tabIndex={0}
      onClick={() => onEditManipulator(index)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onEditManipulator(index);
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
            {getKeyLabel(selectedKey)}
          </Badge>
          {getModifierDisplay(manipulator)}
          <ArrowRight className='h-3 w-3 text-muted-foreground shrink-0' />
          <div className='flex items-center gap-1 flex-wrap'>
            {getToDisplay(manipulator)}
          </div>
        </div>

        {hasAdvancedOptions(manipulator) && (
          <div className='flex items-center gap-2 mt-1.5 flex-wrap'>
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
        <Button
          size='icon'
          variant='ghost'
          className='text-destructive hover:text-destructive hover:bg-destructive/10'
          onClick={(event) => {
            event.stopPropagation();
            onDeleteManipulator(index);
          }}
        >
          <Trash2 className='h-4 w-4' />
        </Button>
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
    fn: 'fn',
  };
  return symbols[modifier] || '';
}
