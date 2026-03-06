'use client';

import { useEffect, useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { AddDeviceDialog } from '@/components/profile/add-device-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDeviceLabel } from '@/components/profile/utils';
import type {
  Device,
  GlobalSettings,
  Profile,
  VirtualHidKeyboard,
} from '@/types/karabiner';

interface ConfigurationsEditorProps {
  profile: Profile;
  globalSettings: GlobalSettings;
  onProfileChange: (profile: Profile) => void;
  onGlobalSettingsChange: (settings: GlobalSettings) => void;
}

export function ConfigurationsEditor({
  profile,
  globalSettings,
  onProfileChange,
  onGlobalSettingsChange,
}: ConfigurationsEditorProps) {
  const [selectedDeviceIndex, setSelectedDeviceIndex] = useState<number | null>(
    profile.devices && profile.devices.length > 0 ? 0 : null,
  );

  const devices = profile.devices ?? [];

  useEffect(() => {
    setSelectedDeviceIndex((current) => {
      if (devices.length === 0) return null;
      if (current === null) return 0;
      if (current >= devices.length) return devices.length - 1;
      return current;
    });
  }, [devices.length]);

  const selectedDevice =
    selectedDeviceIndex !== null ? devices[selectedDeviceIndex] : null;

  const deviceLabels = useMemo(() => {
    return devices.map((device, index) => formatDeviceLabel(device, index));
  }, [devices]);

  const updateDevice = (index: number, updater: (device: Device) => Device) => {
    const target = devices[index];
    if (!target) return;
    const nextDevices = devices.map((device, deviceIndex) =>
      deviceIndex === index ? updater(device) : device,
    );
    onProfileChange({ ...profile, devices: nextDevices });
  };

  const addDevice = (device: Device) => {
    const nextDevices = [...devices, device];
    onProfileChange({ ...profile, devices: nextDevices });
    setSelectedDeviceIndex(nextDevices.length - 1);
  };

  const removeDevice = (index: number) => {
    const nextDevices = devices.filter(
      (_, deviceIndex) => deviceIndex !== index,
    );
    onProfileChange({ ...profile, devices: nextDevices });
    setSelectedDeviceIndex((current) => {
      if (nextDevices.length === 0) return null;
      if (current === null) return 0;
      if (current === index) return Math.min(index, nextDevices.length - 1);
      if (current > index) return current - 1;
      return current;
    });
  };

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
      ...globalSettings,
      [key]: value,
    });
    onGlobalSettingsChange(nextGlobal ?? {});
  };

  const virtualKeyboard = profile.virtual_hid_keyboard ?? {};

  return (
    <Tabs defaultValue='devices' className='w-full'>
      <TabsList className='grid w-full grid-cols-3 mb-6'>
        <TabsTrigger value='devices' className='cursor-pointer'>
          Devices
        </TabsTrigger>
        <TabsTrigger value='virtual-keyboard' className='cursor-pointer'>
          Virtual Keyboard
        </TabsTrigger>
        <TabsTrigger value='ui' className='cursor-pointer'>
          UI
        </TabsTrigger>
      </TabsList>

      <TabsContent value='devices'>
        <div className='grid gap-4 lg:grid-cols-[300px_1fr]'>
          <Card className='p-4 space-y-3'>
            <div className='flex items-center justify-between'>
              <h3 className='text-sm font-semibold'>Configured Devices</h3>
              <AddDeviceDialog
                onAdd={addDevice}
                buttonVariant='outline'
                buttonClassName='h-8 px-3'
              />
            </div>

            {devices.length === 0 ? (
              <p className='text-sm text-muted-foreground'>
                No devices configured yet.
              </p>
            ) : (
              <div className='space-y-2'>
                {deviceLabels.map((label, index) => (
                  <div
                    key={`${label}-${index}`}
                    className={`flex items-center justify-between rounded-md border p-2 ${
                      selectedDeviceIndex === index
                        ? 'border-primary bg-primary/10'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <button
                      type='button'
                      className='flex-1 text-left text-sm'
                      onClick={() => setSelectedDeviceIndex(index)}
                    >
                      {label}
                    </button>
                    <Button
                      size='icon'
                      variant='ghost'
                      className='h-6 w-6'
                      onClick={() => removeDevice(index)}
                    >
                      <Trash2 className='h-3 w-3' />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className='p-4'>
            {!selectedDevice || selectedDeviceIndex === null ? (
              <p className='text-sm text-muted-foreground'>
                Select a device to edit identifiers and device-specific
                settings.
              </p>
            ) : (
              <div className='space-y-5'>
                <div className='space-y-3'>
                  <h3 className='text-sm font-semibold'>Identifiers</h3>
                  <div className='grid gap-3 sm:grid-cols-2'>
                    <div className='space-y-1.5'>
                      <Label htmlFor='device-vendor-id'>Vendor ID</Label>
                      <Input
                        id='device-vendor-id'
                        type='number'
                        value={selectedDevice.identifiers.vendor_id ?? ''}
                        onChange={(event) => {
                          updateDevice(selectedDeviceIndex, (device) => ({
                            ...device,
                            identifiers: {
                              ...device.identifiers,
                              vendor_id: parseOptionalNumber(
                                event.target.value,
                              ),
                            },
                          }));
                        }}
                        placeholder='e.g. 1452'
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <Label htmlFor='device-product-id'>Product ID</Label>
                      <Input
                        id='device-product-id'
                        type='number'
                        value={selectedDevice.identifiers.product_id ?? ''}
                        onChange={(event) => {
                          updateDevice(selectedDeviceIndex, (device) => ({
                            ...device,
                            identifiers: {
                              ...device.identifiers,
                              product_id: parseOptionalNumber(
                                event.target.value,
                              ),
                            },
                          }));
                        }}
                        placeholder='e.g. 610'
                      />
                    </div>
                  </div>

                  <div className='grid gap-2 sm:grid-cols-2'>
                    <CheckboxField
                      id='device-is-keyboard'
                      label='Is keyboard'
                      checked={Boolean(selectedDevice.identifiers.is_keyboard)}
                      onCheckedChange={(checked) => {
                        updateDevice(selectedDeviceIndex, (device) => ({
                          ...device,
                          identifiers: {
                            ...device.identifiers,
                            is_keyboard: checked,
                          },
                        }));
                      }}
                    />
                    <CheckboxField
                      id='device-is-pointing-device'
                      label='Is pointing device'
                      checked={Boolean(
                        selectedDevice.identifiers.is_pointing_device,
                      )}
                      onCheckedChange={(checked) => {
                        updateDevice(selectedDeviceIndex, (device) => ({
                          ...device,
                          identifiers: {
                            ...device.identifiers,
                            is_pointing_device: checked,
                          },
                        }));
                      }}
                    />
                  </div>
                </div>

                <div className='space-y-3'>
                  <h3 className='text-sm font-semibold'>Device Settings</h3>
                  <div className='grid gap-2'>
                    <CheckboxField
                      id='device-ignore'
                      label='Ignore this device'
                      checked={Boolean(selectedDevice.ignore)}
                      onCheckedChange={(checked) => {
                        updateDevice(selectedDeviceIndex, (device) => ({
                          ...device,
                          ignore: checked ? true : undefined,
                        }));
                      }}
                    />
                    <CheckboxField
                      id='device-disable-built-in'
                      label='Disable built-in keyboard if this device exists'
                      checked={Boolean(
                        selectedDevice.disable_built_in_keyboard_if_exists,
                      )}
                      onCheckedChange={(checked) => {
                        updateDevice(selectedDeviceIndex, (device) => ({
                          ...device,
                          disable_built_in_keyboard_if_exists: checked
                            ? true
                            : undefined,
                        }));
                      }}
                    />
                    <CheckboxField
                      id='device-treat-as-built-in'
                      label='Treat as built-in keyboard'
                      checked={Boolean(
                        selectedDevice.treat_as_built_in_keyboard,
                      )}
                      onCheckedChange={(checked) => {
                        updateDevice(selectedDeviceIndex, (device) => ({
                          ...device,
                          treat_as_built_in_keyboard: checked
                            ? true
                            : undefined,
                        }));
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </TabsContent>

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
                globalSettings.ask_for_confirmation_before_quitting,
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
              checked={Boolean(globalSettings.check_for_updates_on_startup)}
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
              checked={Boolean(globalSettings.show_in_menu_bar)}
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
              checked={Boolean(globalSettings.show_profile_name_in_menu_bar)}
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
              checked={Boolean(globalSettings.unsafe_ui)}
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
