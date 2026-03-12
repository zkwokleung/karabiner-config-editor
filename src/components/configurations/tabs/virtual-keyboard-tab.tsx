import { MOUSE_KEY_XY_SCALE_DEFAULT } from '@/components/configurations/constants';
import { KeyboardTypeRadioGroup } from '@/components/configurations/fields/keyboard-type-radio-group';
import { parseOptionalNumber } from '@/components/configurations/utils';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { VirtualHidKeyboard } from '@/types/karabiner';

interface VirtualKeyboardTabProps {
  virtualKeyboard: VirtualHidKeyboard;
  onVirtualKeyboardChange: (updates: Partial<VirtualHidKeyboard>) => void;
}

export function VirtualKeyboardTab({
  virtualKeyboard,
  onVirtualKeyboardChange,
}: VirtualKeyboardTabProps) {
  return (
    <Card className='p-4 space-y-4'>
      <div>
        <h3 className='text-sm font-semibold'>Virtual Keyboard Settings</h3>
        <p className='text-sm text-muted-foreground'>
          Configure profile-specific virtual HID keyboard behavior.
        </p>
      </div>

      <div className='space-y-3'>
        <h4 className='text-sm font-semibold'>Keyboard Type</h4>
        <div className='space-y-1.5'>
          <Label>Keyboard layout</Label>
          <KeyboardTypeRadioGroup
            value={virtualKeyboard.keyboard_type_v2}
            onValueChange={(value) =>
              onVirtualKeyboardChange({
                keyboard_type_v2: value,
              })
            }
          />
        </div>
      </div>

      <div className='space-y-3'>
        <h4 className='text-sm font-semibold'>Mouse Key</h4>
        <div className='space-y-1.5'>
          <Label htmlFor='vk-mouse-key-scale'>Mouse key XY scale</Label>
          <div className='flex items-center gap-2'>
            <Input
              id='vk-mouse-key-scale'
              type='number'
              value={
                virtualKeyboard.mouse_key_xy_scale ?? MOUSE_KEY_XY_SCALE_DEFAULT
              }
              onChange={(event) =>
                onVirtualKeyboardChange({
                  mouse_key_xy_scale: parseOptionalNumber(event.target.value),
                })
              }
              placeholder='e.g. 100'
              className='w-20'
            />
            <span className='text-sm text-muted-foreground'>%</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
