'use client';

import { CircleHelp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Condition } from '@/types/karabiner';
import { ConditionItem } from './condition-item';

interface ConditionEditorProps {
  conditions: Condition[];
  onChange: (conditions: Condition[]) => void;
}

export function ConditionEditor({
  conditions,
  onChange,
}: ConditionEditorProps) {
  const addCondition = () => {
    const newCondition: Condition = {
      type: 'frontmost_application_if',
      bundle_identifiers: ['^com\\.example\\.app$'],
    };
    onChange([...conditions, newCondition]);
  };

  const deleteCondition = (index: number) => {
    onChange(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, updated: Condition) => {
    const newConditions = [...conditions];
    newConditions[index] = updated;
    onChange(newConditions);
  };

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between gap-2'>
        <div className='flex items-center gap-1'>
          <Label className='text-sm font-semibold'>Conditions</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  size='icon-sm'
                  variant='ghost'
                  className='h-5 w-5 text-muted-foreground'
                  aria-label='Conditions help'
                >
                  <CircleHelp className='h-3.5 w-3.5' />
                </Button>
              </TooltipTrigger>
              <TooltipContent side='top' align='start'>
                No conditions means this mapping applies in all contexts.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button
          size='sm'
          variant='outline'
          onClick={addCondition}
          className='bg-transparent shrink-0'
        >
          <Plus className='mr-2 h-3 w-3' />
          Add Condition
        </Button>
      </div>

      {conditions.length === 0 && (
        <p className='text-xs text-muted-foreground'>No conditions.</p>
      )}

      <div className='space-y-2'>
        {conditions.map((condition, index) => (
          <ConditionItem
            key={index}
            condition={condition}
            onUpdate={(updated) => updateCondition(index, updated)}
            onDelete={() => deleteCondition(index)}
          />
        ))}
      </div>
    </div>
  );
}
