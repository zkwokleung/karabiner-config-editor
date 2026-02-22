'use client';

import { Plus, Trash2, X, CircleHelp } from 'lucide-react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Condition } from '@/types/karabiner';
import { CONDITION_TYPES, KEYBOARD_TYPES } from '@/lib/constants';

interface ConditionItemProps {
  condition: Condition;
  onUpdate: (condition: Condition) => void;
  onDelete: () => void;
}

export function ConditionItem({
  condition,
  onUpdate,
  onDelete,
}: ConditionItemProps) {
  const updateType = (type: string) => {
    const newCondition: Condition = { type };

    if (type.includes('frontmost_application')) {
      newCondition.bundle_identifiers = ['^com\\.example\\.app$'];
    } else if (type.includes('device')) {
      newCondition.identifiers = [{ vendor_id: 1452, product_id: 0 }];
    } else if (type.includes('keyboard_type')) {
      newCondition.keyboard_types = ['ansi'];
    } else if (type.includes('input_source')) {
      newCondition.input_source_id = ['^com\\.apple\\.keylayout\\.US$'];
    } else if (type.includes('variable')) {
      newCondition.name = 'variable_name';
      newCondition.value = 1;
    }

    onUpdate(newCondition);
  };

  const addBundleIdentifier = () => {
    const identifiers = condition.bundle_identifiers || [];
    onUpdate({
      ...condition,
      bundle_identifiers: [...identifiers, '^com\\.example\\.app$'],
    });
  };

  const updateBundleIdentifier = (index: number, value: string) => {
    const identifiers = [...(condition.bundle_identifiers || [])];
    identifiers[index] = value;
    onUpdate({ ...condition, bundle_identifiers: identifiers });
  };

  const deleteBundleIdentifier = (index: number) => {
    const identifiers = (condition.bundle_identifiers || []).filter(
      (_, i) => i !== index,
    );
    onUpdate({ ...condition, bundle_identifiers: identifiers });
  };

  return (
    <Card className='p-3 bg-muted/30'>
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <Select value={condition.type} onValueChange={updateType}>
            <SelectTrigger className='w-[250px] cursor-pointer'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent position='popper' sideOffset={5}>
              <ScrollArea className='h-[200px]'>
                {CONDITION_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
          <Button size='icon' variant='ghost' onClick={onDelete}>
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>

        {condition.type.includes('frontmost_application') && (
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-1'>
                <Label className='text-xs'>Bundle Identifiers (regex)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type='button'
                        size='icon-sm'
                        variant='ghost'
                        className='h-5 w-5 text-muted-foreground'
                        aria-label='Bundle identifier regex example'
                      >
                        <CircleHelp className='h-3.5 w-3.5' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side='top' align='start'>
                      Example: ^com\\.google\\.Chrome$ for Chrome browser
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Button size='sm' variant='ghost' onClick={addBundleIdentifier}>
                <Plus className='h-3 w-3' />
              </Button>
            </div>
            {condition.bundle_identifiers?.map((identifier, index) => (
              <div key={index} className='flex items-center gap-2'>
                <Input
                  value={identifier}
                  onChange={(e) =>
                    updateBundleIdentifier(index, e.target.value)
                  }
                  placeholder='^com\\.example\\.app$'
                  className='font-mono text-xs'
                />
                <Button
                  size='icon'
                  variant='ghost'
                  onClick={() => deleteBundleIdentifier(index)}
                >
                  <X className='h-3 w-3' />
                </Button>
              </div>
            ))}
          </div>
        )}

        {condition.type.includes('variable') && (
          <div className='grid grid-cols-2 gap-2'>
            <div className='space-y-1'>
              <Label className='text-xs'>Variable Name</Label>
              <Input
                value={condition.name || ''}
                onChange={(e) =>
                  onUpdate({ ...condition, name: e.target.value })
                }
                placeholder='variable_name'
                className='text-xs'
              />
            </div>
            <div className='space-y-1'>
              <Label className='text-xs'>Value</Label>
              <Input
                type='number'
                value={condition.value || 0}
                onChange={(e) =>
                  onUpdate({
                    ...condition,
                    value: Number.parseInt(e.target.value) || 0,
                  })
                }
                className='text-xs'
              />
            </div>
          </div>
        )}

        {condition.type.includes('keyboard_type') && (
          <div className='space-y-1'>
            <Label className='text-xs'>Keyboard Type</Label>
            <Select
              value={condition.keyboard_types?.[0] || 'ansi'}
              onValueChange={(value) =>
                onUpdate({ ...condition, keyboard_types: [value] })
              }
            >
              <SelectTrigger className='cursor-pointer'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KEYBOARD_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {condition.type.includes('input_source') && (
          <div className='space-y-1'>
            <div className='flex items-center gap-1'>
              <Label className='text-xs'>Input Source ID</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type='button'
                      size='icon-sm'
                      variant='ghost'
                      className='h-5 w-5 text-muted-foreground'
                      aria-label='Input source regex help'
                    >
                      <CircleHelp className='h-3.5 w-3.5' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side='top' align='start'>
                    Enter a regex pattern, for example:
                    ^com\\.apple\\.keylayout\\.US$
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              value={condition.input_source_id?.[0] || ''}
              onChange={(e) =>
                onUpdate({ ...condition, input_source_id: [e.target.value] })
              }
              placeholder='^com\\.apple\\.keylayout\\.US$'
              className='font-mono text-xs'
            />
          </div>
        )}

        {condition.type.includes('device') && (
          <div className='space-y-2'>
            <Label className='text-xs'>Device Identifiers</Label>
            <div className='grid grid-cols-2 gap-2'>
              <div className='space-y-1'>
                <Label className='text-xs text-muted-foreground'>
                  Vendor ID
                </Label>
                <Input
                  type='number'
                  value={condition.identifiers?.[0]?.vendor_id || 0}
                  onChange={(e) =>
                    onUpdate({
                      ...condition,
                      identifiers: [
                        {
                          ...(condition.identifiers?.[0] || {}),
                          vendor_id: Number.parseInt(e.target.value) || 0,
                        },
                      ],
                    })
                  }
                  className='text-xs'
                />
              </div>
              <div className='space-y-1'>
                <Label className='text-xs text-muted-foreground'>
                  Product ID
                </Label>
                <Input
                  type='number'
                  value={condition.identifiers?.[0]?.product_id || 0}
                  onChange={(e) =>
                    onUpdate({
                      ...condition,
                      identifiers: [
                        {
                          ...(condition.identifiers?.[0] || {}),
                          product_id: Number.parseInt(e.target.value) || 0,
                        },
                      ],
                    })
                  }
                  className='text-xs'
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
