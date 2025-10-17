'use client';

import type { ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { DeviceTargetOption } from '@/types/profile';

interface DeviceTargetPanelProps {
  title: string;
  options: DeviceTargetOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onDeleteDevice: (deviceIndex: number) => void;
  addControl?: ReactNode;
  scrollHeightClass?: string;
}

export function DeviceTargetPanel({
  title,
  options,
  selectedValue,
  onSelect,
  onDeleteDevice,
  addControl,
  scrollHeightClass = 'h-[500px]',
}: DeviceTargetPanelProps) {
  return (
    <Card className='p-4'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='font-semibold text-sm'>{title}</h3>
        {addControl}
      </div>
      <ScrollArea className={scrollHeightClass}>
        <div className='space-y-2'>
          {options.map((option) => (
            <div
              key={option.value}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedValue === option.value
                  ? 'bg-primary/10 border-primary'
                  : 'hover:bg-muted'
              }`}
              onClick={() => onSelect(option.value)}
            >
              <span className='text-sm font-medium'>{option.label}</span>
              {option.target.type === 'device' && (
                <Button
                  size='icon'
                  variant='ghost'
                  className='h-6 w-6'
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteDevice(option.target.deviceIndex);
                  }}
                >
                  <Trash2 className='h-3 w-3' />
                </Button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
