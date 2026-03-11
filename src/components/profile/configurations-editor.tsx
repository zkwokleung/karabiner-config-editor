'use client';

import { CircleHelp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type {
  ComplexModifications,
  GlobalSettings,
  Parameters,
  Profile,
  VirtualHidKeyboard,
} from '@/types/karabiner';

const PROFILE_PARAMETER_DEFAULTS: Required<Parameters> = {
  'basic.simultaneous_threshold_milliseconds': 500,
  'basic.to_delayed_action_delay_milliseconds': 500,
  'basic.to_if_alone_timeout_milliseconds': 1000,
  'basic.to_if_held_down_threshold_milliseconds': 500,
  'mouse_motion_to_scroll.speed': 100,
};

type ProfileParameterKey = keyof Parameters;

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

  const updateProfileParameter = (
    key: ProfileParameterKey,
    value: number | undefined,
  ) => {
    const currentComplex = profile.complex_modifications;
    const currentParameters = currentComplex?.parameters ?? {};
    const nextParameters = normalizeProfileParameters({
      ...currentParameters,
      [key]: value,
    });

    const nextComplex = normalizeOptionalObject<ComplexModifications>({
      ...(currentComplex ?? {}),
      parameters: nextParameters,
    });

    onProfileChange({
      ...profile,
      complex_modifications: nextComplex,
    });
  };

  const virtualKeyboard = profile.virtual_hid_keyboard ?? {};
  const profileParameters = profile.complex_modifications?.parameters ?? {};

  return (
    <Tabs defaultValue='virtual-keyboard' className='w-full'>
      <TabsList className='grid w-full grid-cols-3 mb-6'>
        <TabsTrigger value='virtual-keyboard' className='cursor-pointer'>
          Virtual Keyboard
        </TabsTrigger>
        <TabsTrigger value='parameter' className='cursor-pointer'>
          Parameter
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

      <TabsContent value='parameter'>
        <Card className='p-4 space-y-6'>
          <div>
            <h3 className='text-sm font-semibold'>Profile Parameters</h3>
            <p className='text-sm text-muted-foreground'>
              Tune timing and behavior for complex modifications in this
              profile.
            </p>
          </div>

          <div className='space-y-3'>
            <h4 className='text-sm font-semibold'>Basic Parameters</h4>
            <div className='space-y-3'>
              <ParameterInputField
                id='param-simultaneous-threshold'
                label='Simultaneous Key Press Threshold (ms)'
                description='Maximum interval allowed between key presses for Karabiner to treat them as a simultaneous chord.'
                step={10}
                defaultValue={
                  PROFILE_PARAMETER_DEFAULTS[
                    'basic.simultaneous_threshold_milliseconds'
                  ]
                }
                value={
                  profileParameters['basic.simultaneous_threshold_milliseconds']
                }
                onValueChange={(next) =>
                  updateProfileParameter(
                    'basic.simultaneous_threshold_milliseconds',
                    next,
                  )
                }
              />

              <ParameterInputField
                id='param-delayed-action-delay'
                label='Delayed Action Delay (ms)'
                description='Wait time before executing to_delayed_action when a delayed action is configured in a manipulator.'
                step={10}
                defaultValue={
                  PROFILE_PARAMETER_DEFAULTS[
                    'basic.to_delayed_action_delay_milliseconds'
                  ]
                }
                value={
                  profileParameters[
                    'basic.to_delayed_action_delay_milliseconds'
                  ]
                }
                onValueChange={(next) =>
                  updateProfileParameter(
                    'basic.to_delayed_action_delay_milliseconds',
                    next,
                  )
                }
              />

              <ParameterInputField
                id='param-to-if-alone-timeout'
                label='Tap Timeout (ms)'
                description='Maximum time a key can be held and still trigger to_if_alone behavior.'
                step={100}
                defaultValue={
                  PROFILE_PARAMETER_DEFAULTS[
                    'basic.to_if_alone_timeout_milliseconds'
                  ]
                }
                value={
                  profileParameters['basic.to_if_alone_timeout_milliseconds']
                }
                onValueChange={(next) =>
                  updateProfileParameter(
                    'basic.to_if_alone_timeout_milliseconds',
                    next,
                  )
                }
              />

              <ParameterInputField
                id='param-to-if-held-down-threshold'
                label='Hold Threshold (ms)'
                description='Minimum hold duration before to_if_held_down behavior is triggered.'
                step={10}
                defaultValue={
                  PROFILE_PARAMETER_DEFAULTS[
                    'basic.to_if_held_down_threshold_milliseconds'
                  ]
                }
                value={
                  profileParameters[
                    'basic.to_if_held_down_threshold_milliseconds'
                  ]
                }
                onValueChange={(next) =>
                  updateProfileParameter(
                    'basic.to_if_held_down_threshold_milliseconds',
                    next,
                  )
                }
              />
            </div>
          </div>

          <div className='space-y-3'>
            <h4 className='text-sm font-semibold'>
              Mouse Motion to Scroll Parameters
            </h4>
            <div className='space-y-3'>
              <ParameterInputField
                id='param-mouse-motion-speed'
                label='Scroll Conversion Speed'
                description='Multiplier used when converting mouse motion to scroll events; higher values scroll faster.'
                step={10}
                defaultValue={
                  PROFILE_PARAMETER_DEFAULTS['mouse_motion_to_scroll.speed']
                }
                value={profileParameters['mouse_motion_to_scroll.speed']}
                onValueChange={(next) =>
                  updateProfileParameter('mouse_motion_to_scroll.speed', next)
                }
              />
            </div>
          </div>
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

interface ParameterInputFieldProps {
  id: string;
  label: string;
  description: string;
  step: number;
  defaultValue: number;
  value: number | undefined;
  onValueChange: (value: number | undefined) => void;
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

function ParameterInputField({
  id,
  label,
  description,
  step,
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
          className='w-40'
          value={value ?? defaultValue}
          onChange={(event) =>
            onValueChange(parseOptionalNumber(event.target.value))
          }
        />
        <p className='text-xs text-muted-foreground'>
          (Default value is {defaultValue})
        </p>
      </div>
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

function normalizeProfileParameters(
  parameters: Parameters,
): Parameters | undefined {
  const nextEntries = Object.entries(parameters).filter(([key, value]) => {
    if (value === undefined) {
      return false;
    }

    return value !== PROFILE_PARAMETER_DEFAULTS[key as ProfileParameterKey];
  });

  if (nextEntries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(nextEntries) as Parameters;
}
