'use client';

import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface ManipulatorSectionProps {
  title: string;
  description?: string;
  summary?: string;
  defaultOpen?: boolean;
  action?: ReactNode;
  children: ReactNode;
}

export function ManipulatorSection({
  title,
  description,
  summary,
  defaultOpen = false,
  action,
  children,
}: ManipulatorSectionProps) {
  return (
    <Collapsible
      defaultOpen={defaultOpen}
      className='overflow-hidden rounded-lg border bg-card'
    >
      <div className='flex min-h-11 items-center gap-2 px-3'>
        <CollapsibleTrigger className='group flex min-w-0 flex-1 items-center gap-2 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'>
          <ChevronDown className='h-4 w-4 shrink-0 -rotate-90 text-muted-foreground transition-transform group-data-[state=open]:rotate-0' />
          <span className='truncate text-sm font-semibold'>{title}</span>
          {summary ? (
            <Badge variant='secondary' className='ml-auto shrink-0 font-normal'>
              {summary}
            </Badge>
          ) : null}
        </CollapsibleTrigger>
        {action ? <div className='shrink-0'>{action}</div> : null}
      </div>
      <CollapsibleContent>
        <div className='space-y-3 border-t px-3 py-3'>
          {description ? (
            <p className='text-xs text-muted-foreground'>{description}</p>
          ) : null}
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
