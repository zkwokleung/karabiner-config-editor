import type { VirtualHidKeyboard } from '@/types/karabiner';

type KeyboardType = NonNullable<VirtualHidKeyboard['keyboard_type_v2']>;

const KEYBOARD_TYPE_OPTIONS: Array<{ value: KeyboardType; label: string }> = [
  {
    value: 'ansi',
    label: 'ANSI (North America, most of Asia and others)',
  },
  {
    value: 'iso',
    label: 'ISO (Europe, Latin America, Middle-East and others)',
  },
  {
    value: 'jis',
    label: 'JIS (Japanese)',
  },
];

interface KeyboardTypeRadioGroupProps {
  value: VirtualHidKeyboard['keyboard_type_v2'];
  onValueChange: (value: KeyboardType) => void;
}

export function KeyboardTypeRadioGroup({
  value,
  onValueChange,
}: KeyboardTypeRadioGroupProps) {
  const selectedValue = value ?? 'ansi';

  return (
    <div className='space-y-2'>
      {KEYBOARD_TYPE_OPTIONS.map((option) => (
        <label
          key={option.value}
          className='flex cursor-pointer items-start gap-2 rounded-md border p-2 hover:bg-muted/50'
        >
          <input
            type='radio'
            name='vk-keyboard-type'
            value={option.value}
            checked={selectedValue === option.value}
            onChange={() => onValueChange(option.value)}
            className='mt-0.5'
          />
          <span className='text-sm'>{option.label}</span>
        </label>
      ))}
    </div>
  );
}
