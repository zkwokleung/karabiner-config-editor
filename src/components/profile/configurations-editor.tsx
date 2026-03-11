'use client';

import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
  GlobalSettings,
  Profile,
  VirtualHidKeyboard,
} from '@/types/karabiner';

interface ConfigurationsEditorProps {
  profile: Profile;
  globalSettings?: GlobalSettings;
  onProfileChange: (profile: Profile) => void;
  onGlobalSettingsChange: (settings: GlobalSettings) => void;
}

export function ConfigurationsEditor({
  profile,
  globalSettings,
  onProfileChange,
  onGlobalSettingsChange,
}: ConfigurationsEditorProps) {
  const safeGlobalSettings = globalSettings ?? {};

  const updateVirtualKeyboard = (updates: Partial<VirtualHidKeyboard>) => {
    const current = profile.virtual_hid_keyboard ?? {};
    const next = normalizeOptionalObject<VirtualHidKeyboard>({
      ...current,
      ...updates,
    });
    onProfileChange({ ...profile, virtual_hid_keyboard: next });
  };

  const updateGlobalSetting = <K extends keyof GlobalSettings>(
    key: K,
    value: GlobalSettings[K],
  ) => {
    const nextGlobal = normalizeOptionalObject<GlobalSettings>({
      ...safeGlobalSettings,
      [key]: value,
    });
    onGlobalSettingsChange(nextGlobal ?? {});
  };

  const virtualKeyboard = profile.virtual_hid_keyboard ?? {};

  return (
    <Tabs defaultValue='virtual-keyboard' className='w-full'>
      <TabsList className='grid w-full grid-cols-2 mb-6'>
        <TabsTrigger value='virtual-keyboard' className='cursor-pointer'>
          Virtual Keyboard
        </TabsTrigger>
        <TabsTrigger value='ui' className='cursor-pointer'>
          UI
        </TabsTrigger>
      </TabsList>

      <TabsContent value='virtual-keyboard'>
        <Card className='p-4 space-y-4'>
          <div>
            <h3 className='text-sm font-semibold'>Virtual Keyboard Settings</h3>
            <p className='text-sm text-muted-foreground'>
              Configure profile-specific virtual HID keyboard behavior.
            </p>
          </div>

          <div className='grid gap-3 sm:grid-cols-2'>
            <div className='space-y-1.5'>
              <Label htmlFor='vk-country-code'>Country code</Label>
              <Input
                id='vk-country-code'
                type='number'
                value={virtualKeyboard.country_code ?? ''}
                onChange={(event) =>
                  updateVirtualKeyboard({
                    country_code: parseOptionalNumber(event.target.value),
                  })
                }
                placeholder='e.g. 0'
              />
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='vk-mouse-key-scale'>Mouse key XY scale</Label>
              <Input
                id='vk-mouse-key-scale'
                type='number'
                value={virtualKeyboard.mouse_key_xy_scale ?? ''}
                onChange={(event) =>
                  updateVirtualKeyboard({
                    mouse_key_xy_scale: parseOptionalNumber(event.target.value),
                  })
                }
                placeholder='e.g. 100'
              />
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='vk-caps-delay'>Caps Lock delay (ms)</Label>
              <Input
                id='vk-caps-delay'
                type='number'
                value={virtualKeyboard.caps_lock_delay_milliseconds ?? ''}
                onChange={(event) =>
                  updateVirtualKeyboard({
                    caps_lock_delay_milliseconds: parseOptionalNumber(
                      event.target.value,
                    ),
                  })
                }
                placeholder='e.g. 0'
              />
            </div>
          </div>

          <CheckboxField
            id='vk-indicate-sticky'
            label='Indicate sticky modifier keys state'
            checked={Boolean(
              virtualKeyboard.indicate_sticky_modifier_keys_state,
            )}
            onCheckedChange={(checked) =>
              updateVirtualKeyboard({
                indicate_sticky_modifier_keys_state: checked ? true : undefined,
              })
            }
          />
        </Card>
      </TabsContent>

      <TabsContent value='ui'>
        <Card className='p-4 space-y-4'>
          <div>
            <h3 className='text-sm font-semibold'>UI Settings</h3>
            <p className='text-sm text-muted-foreground'>
              Configure Karabiner global interface preferences.
            </p>
          </div>

          <div className='grid gap-2'>
            <CheckboxField
              id='ui-ask-before-quit'
              label='Ask for confirmation before quitting'
              checked={Boolean(
                safeGlobalSettings.ask_for_confirmation_before_quitting,
              )}
              onCheckedChange={(checked) =>
                updateGlobalSetting(
                  'ask_for_confirmation_before_quitting',
                  checked ? true : undefined,
                )
              }
            />
            <CheckboxField
              id='ui-check-updates'
              label='Check for updates on startup'
              checked={Boolean(safeGlobalSettings.check_for_updates_on_startup)}
              onCheckedChange={(checked) =>
                updateGlobalSetting(
                  'check_for_updates_on_startup',
                  checked ? true : undefined,
                )
              }
            />
            <CheckboxField
              id='ui-show-menu-bar'
              label='Show icon in menu bar'
              checked={Boolean(safeGlobalSettings.show_in_menu_bar)}
              onCheckedChange={(checked) =>
                updateGlobalSetting(
                  'show_in_menu_bar',
                  checked ? true : undefined,
                )
              }
            />
            <CheckboxField
              id='ui-show-profile-name'
              label='Show profile name in menu bar'
              checked={Boolean(
                safeGlobalSettings.show_profile_name_in_menu_bar,
              )}
              onCheckedChange={(checked) =>
                updateGlobalSetting(
                  'show_profile_name_in_menu_bar',
                  checked ? true : undefined,
                )
              }
            />
            <CheckboxField
              id='ui-unsafe-mode'
              label='Enable unsafe UI mode'
              checked={Boolean(safeGlobalSettings.unsafe_ui)}
              onCheckedChange={(checked) =>
                updateGlobalSetting('unsafe_ui', checked ? true : undefined)
              }
            />
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

interface CheckboxFieldProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function CheckboxField({
  id,
  label,
  checked,
  onCheckedChange,
}: CheckboxFieldProps) {
  return (
    <div className='flex items-center gap-2'>
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(nextChecked) => onCheckedChange(Boolean(nextChecked))}
      />
      <Label htmlFor={id} className='text-sm font-normal'>
        {label}
      </Label>
    </div>
  );
}

function parseOptionalNumber(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function normalizeOptionalObject<T extends object>(value: T): T | undefined {
  const nextEntries = Object.entries(value as Record<string, unknown>).filter(
    ([, entryValue]) => entryValue !== undefined,
  );

  if (nextEntries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(nextEntries) as T;
}
