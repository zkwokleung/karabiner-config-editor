'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { VariableValue } from '@/types/karabiner';

type VariableValueType = 'integer' | 'boolean' | 'string';

const INTEGER_PATTERN = /^-?\d+$/;

interface VariableValueEditorProps {
  value: VariableValue;
  onChange: (value: VariableValue) => void;
}

interface ValuesByType {
  integer: number;
  boolean: boolean;
  string: string;
}

function getValueType(value: VariableValue): VariableValueType {
  if (typeof value === 'number') return 'integer';
  if (typeof value === 'boolean') return 'boolean';
  return 'string';
}

function createValuesByType(value: VariableValue): ValuesByType {
  return {
    integer: typeof value === 'number' ? value : 0,
    boolean: typeof value === 'boolean' ? value : false,
    string: typeof value === 'string' ? value : '',
  };
}

function isValueType(value: string): value is VariableValueType {
  return value === 'integer' || value === 'boolean' || value === 'string';
}

function rememberValue(values: ValuesByType, value: VariableValue) {
  if (typeof value === 'number') values.integer = value;
  else if (typeof value === 'boolean') values.boolean = value;
  else values.string = value;
}

export function VariableValueEditor({
  value,
  onChange,
}: VariableValueEditorProps) {
  const id = useId();
  const valueType = getValueType(value);
  const valuesByType = useRef(createValuesByType(value));
  const [integerDraft, setIntegerDraft] = useState(() =>
    typeof value === 'number' ? String(value) : '0',
  );

  useEffect(() => {
    rememberValue(valuesByType.current, value);
    if (typeof value === 'number') setIntegerDraft(String(value));
  }, [value]);

  const updateValue = (nextValue: VariableValue) => {
    rememberValue(valuesByType.current, nextValue);
    onChange(nextValue);
  };

  const updateValueType = (nextType: string) => {
    if (!isValueType(nextType)) return;

    rememberValue(valuesByType.current, value);
    updateValue(valuesByType.current[nextType]);
  };

  const updateInteger = (rawValue: string) => {
    setIntegerDraft(rawValue);
    if (!INTEGER_PATTERN.test(rawValue)) return;

    const nextValue = Number(rawValue);
    if (Number.isSafeInteger(nextValue)) updateValue(nextValue);
  };

  const integerIsValid = INTEGER_PATTERN.test(integerDraft);

  return (
    <div className='grid grid-cols-2 gap-2 sm:col-span-2'>
      <div className='space-y-1'>
        <Label htmlFor={`${id}-type`} className='text-xs'>
          Value Type
        </Label>
        <Select value={valueType} onValueChange={updateValueType}>
          <SelectTrigger id={`${id}-type`} className='w-full cursor-pointer'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='integer'>Integer</SelectItem>
            <SelectItem value='boolean'>Boolean</SelectItem>
            <SelectItem value='string'>String</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-1'>
        <Label htmlFor={`${id}-value`} className='text-xs'>
          Value
        </Label>
        {valueType === 'integer' ? (
          <Input
            id={`${id}-value`}
            type='number'
            step={1}
            value={integerDraft}
            aria-invalid={!integerIsValid}
            onChange={(event) => updateInteger(event.target.value)}
            onBlur={() => {
              if (!integerIsValid) setIntegerDraft(String(value));
            }}
            className='text-xs'
          />
        ) : valueType === 'boolean' ? (
          <Select
            value={String(value)}
            onValueChange={(nextValue) => updateValue(nextValue === 'true')}
          >
            <SelectTrigger id={`${id}-value`} className='w-full cursor-pointer'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='true'>True</SelectItem>
              <SelectItem value='false'>False</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Input
            id={`${id}-value`}
            type='text'
            value={typeof value === 'string' ? value : ''}
            onChange={(event) => updateValue(event.target.value)}
            placeholder='value'
            className='text-xs'
          />
        )}
      </div>
    </div>
  );
}
