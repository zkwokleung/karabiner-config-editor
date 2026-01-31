'use client';

import { GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import type { Rule } from '@/types/karabiner';

interface RuleListItemProps {
  rule: Rule;
  ruleIndex: number;
  selected: boolean;
  onSelect: (ruleIndex: number) => void;
  onDelete: () => void;
}

export function SortableRuleListItem({
  rule,
  ruleIndex,
  selected,
  onSelect,
  onDelete,
}: RuleListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ruleIndex });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(ruleIndex)}
      className={cn(
        'flex items-center gap-3 rounded-md border bg-card p-2 text-left transition hover:bg-muted',
        selected ? 'border-primary bg-muted' : 'border-border',
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className='flex h-full cursor-grab items-center rounded-md px-2 text-muted-foreground transition hover:bg-muted active:cursor-grabbing'
      >
        <GripVertical className='h-4 w-4' />
      </div>
      <div className='flex flex-1 flex-col gap-1'>
        <span className='text-sm font-medium'>
          {rule.description || 'Untitled rule'}
        </span>
        <Badge variant='secondary' className='w-fit'>
          {rule.manipulators.length} mapping
          {rule.manipulators.length === 1 ? '' : 's'}
        </Badge>
      </div>
      <Button
        size='icon'
        variant='ghost'
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className='h-4 w-4' />
      </Button>
    </div>
  );
}
