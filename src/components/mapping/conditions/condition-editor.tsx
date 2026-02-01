'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
        <Label className='text-sm font-semibold'>Conditions</Label>
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
        <p className='text-xs text-muted-foreground'>
          No conditions. This mapping will apply in all contexts.
        </p>
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
