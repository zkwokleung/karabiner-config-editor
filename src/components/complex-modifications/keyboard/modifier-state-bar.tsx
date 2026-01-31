'use client';

import { cn } from '@/lib/utils';
import { Toggle } from '@/components/ui/toggle';

export interface ModifierState {
  command: boolean;
  option: boolean;
  control: boolean;
  shift: boolean;
}

interface ModifierStateBarProps {
  state: ModifierState;
  onChange: (state: ModifierState) => void;
  className?: string;
  disabled?: boolean;
  label?: string;
}

const MODIFIERS = [
  { key: 'command' as const, label: '⌘', title: 'Command' },
  { key: 'option' as const, label: '⌥', title: 'Option' },
  { key: 'control' as const, label: '⌃', title: 'Control' },
  { key: 'shift' as const, label: '⇧', title: 'Shift' },
];

export function ModifierStateBar({
  state,
  onChange,
  className,
  disabled = false,
  label = 'Filter by modifiers:',
}: ModifierStateBarProps) {
  const toggleModifier = (key: keyof ModifierState) => {
    onChange({
      ...state,
      [key]: !state[key],
    });
  };

  const activeCount = Object.values(state).filter(Boolean).length;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className='text-xs text-muted-foreground'>{label}</span>
      <div className='flex items-center gap-1'>
        {MODIFIERS.map((mod) => (
          <Toggle
            key={mod.key}
            pressed={state[mod.key]}
            onPressedChange={() => toggleModifier(mod.key)}
            disabled={disabled}
            size='sm'
            className={cn(
              'w-9 h-8 text-base font-medium',
              state[mod.key] && 'bg-primary text-primary-foreground',
            )}
            title={mod.title}
          >
            {mod.label}
          </Toggle>
        ))}
      </div>
      {activeCount > 0 && (
        <button
          onClick={() =>
            onChange({
              command: false,
              option: false,
              control: false,
              shift: false,
            })
          }
          className='text-xs text-muted-foreground hover:text-foreground underline'
          disabled={disabled}
        >
          Clear
        </button>
      )}
    </div>
  );
}

export function ModifierSelector({
  selected,
  onChange,
  className,
  label = 'Modifiers:',
}: {
  selected: string[];
  onChange: (modifiers: string[]) => void;
  className?: string;
  label?: string;
}) {
  const toggleModifier = (modifier: string) => {
    if (selected.includes(modifier)) {
      onChange(selected.filter((m) => m !== modifier));
    } else {
      onChange([...selected, modifier]);
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {label && <span className='text-xs text-muted-foreground'>{label}</span>}
      <div className='flex items-center gap-1'>
        {MODIFIERS.map((mod) => (
          <Toggle
            key={mod.key}
            pressed={selected.includes(mod.key)}
            onPressedChange={() => toggleModifier(mod.key)}
            size='sm'
            className={cn(
              'w-9 h-8 text-base font-medium',
              selected.includes(mod.key) &&
                'bg-primary text-primary-foreground',
            )}
            title={mod.title}
          >
            {mod.label}
          </Toggle>
        ))}
      </div>
    </div>
  );
}
