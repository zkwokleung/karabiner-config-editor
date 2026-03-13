import { CircleHelp } from 'lucide-react';
import { MOUSE_KEY_XY_SCALE_DEFAULT } from '@/components/configurations/constants';
import { KeyboardTypeRadioGroup } from '@/components/configurations/fields/keyboard-type-radio-group';
import { Button } from '@/components/ui/button';
import { parseOptionalNumber } from '@/components/configurations/utils';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
          <div className='flex items-center gap-1'>
            <Label>Keyboard layout</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon-sm'
                    className='h-5 w-5 text-muted-foreground'
                    aria-label='Keyboard layout keycode hint'
                  >
                    <CircleHelp className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side='top' align='start'>
                  Some physical keys map to different key codes depending on the
                  type.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
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
