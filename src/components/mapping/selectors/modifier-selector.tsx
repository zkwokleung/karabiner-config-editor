'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { X, CircleHelp } from 'lucide-react';

const MODIFIER_DISPLAY: Record<
  string,
  {
    symbol: string;
    label: string;
  }
> = {
  left_command: { symbol: '⌘', label: 'Left ⌘' },
  right_command: { symbol: '⌘', label: 'Right ⌘' },
  command: { symbol: '⌘', label: 'Any ⌘' },
  left_control: { symbol: '⌃', label: 'Left ⌃' },
  right_control: { symbol: '⌃', label: 'Right ⌃' },
  control: { symbol: '⌃', label: 'Any ⌃' },
  left_option: { symbol: '⌥', label: 'Left ⌥' },
  right_option: { symbol: '⌥', label: 'Right ⌥' },
  option: { symbol: '⌥', label: 'Any ⌥' },
  left_shift: { symbol: '⇧', label: 'Left ⇧' },
  right_shift: { symbol: '⇧', label: 'Right ⇧' },
  shift: { symbol: '⇧', label: 'Any ⇧' },
  caps_lock: { symbol: '⇪', label: 'Caps Lock' },
  fn: { symbol: 'fn', label: 'Fn' },
  any: { symbol: '✶', label: 'Any' },
};

const LEFT_RIGHT_GROUPS = [
  {
    label: 'Command',
    modifiers: ['left_command', 'right_command', 'command'],
  },
  {
    label: 'Option',
    modifiers: ['left_option', 'right_option', 'option'],
  },
  {
    label: 'Control',
    modifiers: ['left_control', 'right_control', 'control'],
  },
  {
    label: 'Shift',
    modifiers: ['left_shift', 'right_shift', 'shift'],
  },
];

const ANY_AND_OTHER = ['caps_lock', 'fn', 'any'];

const ORDERED_MODIFIERS = [
  'left_command',
  'right_command',
  'left_option',
  'right_option',
  'left_control',
  'right_control',
  'left_shift',
  'right_shift',
  'command',
  'option',
  'control',
  'shift',
  'caps_lock',
  'fn',
  'any',
];

interface ModifierSelectorProps {
  selected: string[];
  onChange: (modifiers: string[]) => void;
  label: string;
  helpText?: string;
  showInlineLabel?: boolean;
}

export function ModifierSelector({
  selected,
  onChange,
  label,
  helpText,
  showInlineLabel = true,
}: ModifierSelectorProps) {
  const toggleModifier = (modifier: string) => {
    if (selected.includes(modifier)) {
      onChange(selected.filter((m) => m !== modifier));
    } else {
      onChange([...selected, modifier]);
    }
  };

  const removeModifier = (modifier: string) => {
    onChange(selected.filter((m) => m !== modifier));
  };

  return (
    <div className='space-y-2'>
      {showInlineLabel ? (
        <div className='flex items-center gap-1'>
          <Label className='text-xs'>{label}</Label>
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
      ) : null}
      <div className='space-y-2'>
        {selected.length > 0 && (
          <div className='grid grid-cols-4 gap-2'>
            {ORDERED_MODIFIERS.filter((modifier) =>
              selected.includes(modifier),
            ).map((modifier) => (
              <div
                key={modifier}
                className='relative rounded-md border border-primary bg-muted/40 px-2 py-1'
              >
                <div className='flex flex-col items-start gap-1'>
                  <span className='font-mono text-sm leading-none'>
                    {MODIFIER_DISPLAY[modifier]?.symbol ?? modifier}
                  </span>
                  <span className='text-[10px] leading-none'>
                    {MODIFIER_DISPLAY[modifier]?.label ?? modifier}
                  </span>
                </div>
                <Button
                  size='icon-sm'
                  variant='ghost'
                  className='absolute -top-2 -right-2 h-5 w-5 bg-background'
                  onClick={() => removeModifier(modifier)}
                >
                  <X className='h-3 w-3' />
                </Button>
              </div>
            ))}
          </div>
        )}
        <Dialog>
          <DialogTrigger asChild>
            <Button size='sm' variant='outline' className='bg-transparent'>
              {selected.length === 0 ? 'Add Modifiers' : 'Edit'}
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-md'>
            <DialogHeader>
              <div className='flex items-center justify-between gap-2'>
                <DialogTitle>{label}</DialogTitle>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => onChange([])}
                  disabled={selected.length === 0}
                >
                  Clear All
                </Button>
              </div>
            </DialogHeader>
            <div className='grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto'>
              <div className='space-y-3'>
                {LEFT_RIGHT_GROUPS.map((group) => (
                  <div key={group.label} className='space-y-2'>
                    <div className='text-[11px] font-medium text-muted-foreground'>
                      {group.label}
                    </div>
                    <div className='grid grid-cols-3 gap-2'>
                      {group.modifiers.map((modifier) => (
                        <Button
                          key={modifier}
                          type='button'
                          variant={
                            selected.includes(modifier)
                              ? 'secondary'
                              : 'outline'
                          }
                          className='h-auto px-3 py-2 flex flex-col items-center gap-1'
                          onClick={() => toggleModifier(modifier)}
                        >
                          <span className='font-mono text-base leading-none'>
                            {MODIFIER_DISPLAY[modifier]?.symbol ?? modifier}
                          </span>
                          <span className='text-[10px] text-muted-foreground leading-none'>
                            {MODIFIER_DISPLAY[modifier]?.label ?? modifier}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className='space-y-3'>
                <Label className='text-xs text-muted-foreground'>Other</Label>
                <div className='grid grid-cols-2 gap-2'>
                  {ANY_AND_OTHER.map((modifier) => (
                    <Button
                      key={modifier}
                      type='button'
                      variant={
                        selected.includes(modifier) ? 'secondary' : 'outline'
                      }
                      className='h-auto px-3 py-2 flex flex-col items-center gap-1'
                      onClick={() => toggleModifier(modifier)}
                    >
                      <span className='font-mono text-base leading-none'>
                        {MODIFIER_DISPLAY[modifier]?.symbol ?? modifier}
                      </span>
                      <span className='text-[10px] text-muted-foreground leading-none'>
                        {MODIFIER_DISPLAY[modifier]?.label ?? modifier}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
