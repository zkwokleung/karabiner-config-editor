import { CircleHelp } from 'lucide-react';
import { parseOptionalNumber } from '@/components/configurations/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ParameterInputFieldProps {
  id: string;
  label: string;
  description: string;
  step: number;
  unitLabel?: string;
  defaultValue: number;
  value: number | undefined;
  onValueChange: (value: number | undefined) => void;
}

export function ParameterInputField({
  id,
  label,
  description,
  step,
  unitLabel,
  defaultValue,
  value,
  onValueChange,
}: ParameterInputFieldProps) {
  return (
    <div className='space-y-1.5'>
      <div className='flex items-center gap-1.5'>
        <Label htmlFor={id}>{label}</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type='button'
                className='text-muted-foreground hover:text-foreground cursor-help'
                aria-label={`${label} help`}
              >
                <CircleHelp className='h-4 w-4' />
              </button>
            </TooltipTrigger>
            <TooltipContent side='top' align='start' className='max-w-xs'>
              {description}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className='flex items-center gap-2'>
        <Input
          id={id}
          type='number'
          step={step}
          className='w-20'
          value={value ?? defaultValue}
          onChange={(event) =>
            onValueChange(parseOptionalNumber(event.target.value))
          }
        />
        {unitLabel ? (
          <span className='text-sm text-muted-foreground'>{unitLabel}</span>
        ) : null}
        <p className='text-xs text-muted-foreground'>
          (Default value is {defaultValue})
        </p>
      </div>
    </div>
  );
}
