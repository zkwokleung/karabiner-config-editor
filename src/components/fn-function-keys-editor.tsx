'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { FnFunctionKey } from '@/types/karabiner';
import { useToast } from '@/hooks/use-toast';
import { COMMON_KEYS } from '@/lib/constants';

interface FnFunctionKeysEditorProps {
  fnKeys: FnFunctionKey[];
  onChange: (fnKeys: FnFunctionKey[]) => void;
}

// Function keys that can be remapped
const FUNCTION_KEYS = [
  'f1',
  'f2',
  'f3',
  'f4',
  'f5',
  'f6',
  'f7',
  'f8',
  'f9',
  'f10',
  'f11',
  'f12',
  'f13',
  'f14',
  'f15',
  'f16',
  'f17',
  'f18',
  'f19',
  'f20',
];

export function FnFunctionKeysEditor({
  fnKeys,
  onChange,
}: FnFunctionKeysEditorProps) {
  const { toast } = useToast();

  const addFnKey = () => {
    const newFnKey: FnFunctionKey = {
      from: { key_code: 'f1' },
      to: [{ key_code: 'display_brightness_decrement' }],
    };
    onChange([...fnKeys, newFnKey]);
    toast({
      title: 'Fn key mapping added',
      description: 'New function key mapping created',
    });
  };

  const deleteFnKey = (index: number) => {
    onChange(fnKeys.filter((_, i) => i !== index));
    toast({
      title: 'Fn key mapping deleted',
      description: 'Function key mapping removed',
    });
  };

  const updateFnKey = (index: number, from: string, to: string) => {
    const newFnKeys = [...fnKeys];
    newFnKeys[index] = {
      from: { key_code: from },
      to: [{ key_code: to }],
    };
    onChange(newFnKeys);
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold'>Fn Function Keys</h3>
          <p className='text-sm text-muted-foreground'>
            Remap function keys (F1-F12) behavior
          </p>
        </div>
        <Button onClick={addFnKey} size='sm'>
          <Plus className='mr-2 h-4 w-4' />
          Add Mapping
        </Button>
      </div>

      <ScrollArea className='h-[500px]'>
        <div className='space-y-3'>
          {fnKeys.length === 0 && (
            <Card className='p-8'>
              <p className='text-sm text-muted-foreground text-center'>
                No function key mappings yet. Add one to customize F1-F12
                behavior.
              </p>
            </Card>
          )}

          {fnKeys.map((fnKey, index) => (
            <Card key={index} className='p-4'>
              <div className='flex items-center gap-4'>
                <div className='flex-1 grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label className='text-xs'>From Key</Label>
                    <Select
                      value={fnKey.from.key_code || ''}
                      onValueChange={(key) =>
                        updateFnKey(
                          index,
                          key,
                          (Array.isArray(fnKey.to)
                            ? fnKey.to[0]?.key_code
                            : fnKey.to?.key_code) || '',
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select function key' />
                      </SelectTrigger>
                      <SelectContent>
                        {FUNCTION_KEYS.map((key) => (
                          <SelectItem key={key} value={key}>
                            {key.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-xs'>To Key</Label>
                    <Select
                      value={
                        (Array.isArray(fnKey.to)
                          ? fnKey.to[0]?.key_code
                          : fnKey.to?.key_code) || ''
                      }
                      onValueChange={(key) =>
                        updateFnKey(index, fnKey.from.key_code || '', key)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select target key' />
                      </SelectTrigger>
                      <SelectContent
                        position='popper'
                        sideOffset={5}
                        className='max-h-[300px]'
                      >
                        <ScrollArea className='h-[200px]'>
                          {COMMON_KEYS.map((key) => (
                            <SelectItem key={key} value={key}>
                              {key}
                            </SelectItem>
                          ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  size='icon'
                  variant='ghost'
                  onClick={() => deleteFnKey(index)}
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
