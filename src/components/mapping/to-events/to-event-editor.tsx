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
import type { ToEvent } from '@/types/karabiner';
import type { ReactNode } from 'react';
import { ToEventItem } from './to-event-item';

interface ToEventEditorProps {
  events: ToEvent[];
  onChange: (events: ToEvent[]) => void;
  label: string;
  showHeader?: boolean;
  helpText?: string;
  keyCodeAction?: (index: number) => ReactNode;
}

export function ToEventEditor({
  events,
  onChange,
  label,
  showHeader = true,
  helpText,
  keyCodeAction,
}: ToEventEditorProps) {
  const addEvent = () => {
    onChange([...events, { key_code: 'a' }]);
  };

  const deleteEvent = (index: number) => {
    onChange(events.filter((_, i) => i !== index));
  };

  const updateEvent = (index: number, event: ToEvent) => {
    const newEvents = [...events];
    newEvents[index] = event;
    onChange(newEvents);
  };

  return (
    <div className='space-y-3'>
      {showHeader && (
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-1'>
            <Label className='text-sm font-semibold'>{label}</Label>
            {helpText ? (
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
                    {helpText}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : null}
          </div>
          <Button size='sm' variant='outline' onClick={addEvent}>
            <Plus className='mr-2 h-3 w-3' />
            Add Event
          </Button>
        </div>
      )}

      <div className='space-y-2'>
        {events.map((event, index) => (
          <ToEventItem
            key={index}
            event={event}
            onUpdate={(updated) => updateEvent(index, updated)}
            onDelete={() => deleteEvent(index)}
            showDelete
            keyCodeAction={keyCodeAction ? keyCodeAction(index) : null}
          />
        ))}
      </div>
    </div>
  );
}
