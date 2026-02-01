'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { ToEvent } from '@/types/karabiner';
import type { ReactNode } from 'react';
import { ToEventItem } from './to-event-item';

interface ToEventEditorProps {
  events: ToEvent[];
  onChange: (events: ToEvent[]) => void;
  label: string;
  showHeader?: boolean;
  keyCodeAction?: (index: number) => ReactNode;
}

export function ToEventEditor({
  events,
  onChange,
  label,
  showHeader = true,
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
          <Label className='text-sm font-semibold'>{label}</Label>
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
            showDelete={events.length > 1}
            keyCodeAction={keyCodeAction ? keyCodeAction(index) : null}
          />
        ))}
      </div>
    </div>
  );
}
