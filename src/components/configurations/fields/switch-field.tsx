import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface SwitchFieldProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function SwitchField({
  id,
  label,
  checked,
  onCheckedChange,
}: SwitchFieldProps) {
  return (
    <div className='flex items-center justify-between gap-3 rounded-md border p-2'>
      <Label htmlFor={id} className='text-sm font-normal'>
        {label}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
