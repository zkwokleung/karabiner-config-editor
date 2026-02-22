'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { KeyCodeSelector } from '@/components/mapping/selectors/key-code-selector';
import { DeviceTargetPanel } from '@/components/profile/device-target-panel';
import type { Device, FnFunctionKey, Profile } from '@/types/karabiner';
import type { DeviceTargetOption } from '@/types/profile';
import { AddDeviceDialog } from '@/components/profile/add-device-dialog';
import {
  addDeviceToProfile,
  applyProfileUpdate,
  removeDeviceFromProfile,
} from '@/components/profile/profile-mutation-utils';

const FUNCTION_KEYS = [
  'f1',
  'f2',
  'f3',
  'f4',
  'f5',
  'f6',
  'f7',
  'f8',
  'f9',
  'f10',
  'f11',
  'f12',
  'f13',
  'f14',
  'f15',
  'f16',
  'f17',
  'f18',
  'f19',
  'f20',
] as const;

interface ProfileFnKeysEditorProps {
  profile: Profile;
  profileIndex: number;
  onProfileChange: (profile: Profile) => void;
  deviceOptions: DeviceTargetOption[];
}

export function ProfileFnKeysEditor({
  profile,
  profileIndex,
  onProfileChange,
  deviceOptions,
}: ProfileFnKeysEditorProps) {
  const [selectedTarget, setSelectedTarget] = useState<string>('profile');
  const { toast } = useToast();

  const selectedOption = useMemo(() => {
    return (
      deviceOptions.find((option) => option.value === selectedTarget) ||
      deviceOptions[0]
    );
  }, [deviceOptions, selectedTarget]);

  const currentFnKeys = useMemo(() => {
    if (!selectedOption) {
      return [];
    }

    if (selectedOption.target.type === 'profile') {
      return profile.fn_function_keys || [];
    }

    return (
      profile.devices?.[selectedOption.target.deviceIndex]?.fn_function_keys ||
      []
    );
  }, [profile, selectedOption]);

  useEffect(() => {
    setSelectedTarget('profile');
  }, [profileIndex]);

  const addDevice = (device: Device) => {
    const deviceWithDefaults: Device = {
      ...device,
      fn_function_keys: device.fn_function_keys ?? [],
    };

    if (device.simple_modifications !== undefined) {
      deviceWithDefaults.simple_modifications = device.simple_modifications;
    }

    const newIndex = profile.devices?.length ?? 0;
    const added = addDeviceToProfile(
      profile,
      onProfileChange,
      deviceWithDefaults,
    );

    if (!added) {
      return;
    }

    setSelectedTarget(`device-${newIndex}`);

    toast({
      title: 'Device added',
      description: 'Device configuration created successfully',
    });
  };

  const deleteDevice = (deviceIndex: number) => {
    if (!profile.devices || !profile.devices[deviceIndex]) {
      toast({
        title: 'Unable to delete',
        description: 'The selected device could not be found.',
        variant: 'destructive',
      });
      return;
    }

    const deleted = removeDeviceFromProfile(
      profile,
      onProfileChange,
      deviceIndex,
    );

    if (!deleted) {
      return;
    }

    setSelectedTarget('profile');

    toast({
      title: 'Device deleted',
      description: 'Device configuration removed successfully',
    });
  };

  const addFnKey = () => {
    const added = applyProfileUpdate(profile, onProfileChange, (draft) => {
      const newFnKey: FnFunctionKey = {
        from: { key_code: 'f1' },
        to: [{ key_code: 'display_brightness_decrement' }],
      };

      if (selectedOption.target.type === 'profile') {
        const mappings = draft.fn_function_keys
          ? [...draft.fn_function_keys]
          : [];
        mappings.push(newFnKey);
        draft.fn_function_keys = mappings;
        return;
      }

      const targetDevice = draft.devices?.[selectedOption.target.deviceIndex];
      if (!targetDevice) {
        toast({
          title: 'Error',
          description: 'Device not found',
          variant: 'destructive',
        });
        return false;
      }

      const devices = [...(draft.devices ?? [])];
      const device = { ...targetDevice };
      const mappings = device.fn_function_keys
        ? [...device.fn_function_keys]
        : [];
      mappings.push(newFnKey);
      device.fn_function_keys = mappings;
      devices[selectedOption.target.deviceIndex] = device;
      draft.devices = devices;
    });

    if (!added) {
      return;
    }

    toast({
      title: 'Fn key mapping added',
      description: `Added to ${selectedOption?.label || 'All devices'}`,
    });
  };

  const deleteFnKey = (index: number) => {
    const deleted = applyProfileUpdate(profile, onProfileChange, (draft) => {
      if (selectedOption.target.type === 'profile') {
        draft.fn_function_keys = draft.fn_function_keys
          ? draft.fn_function_keys.filter((_, idx) => idx !== index)
          : [];
        return;
      }

      const targetDevice = draft.devices?.[selectedOption.target.deviceIndex];
      if (!targetDevice) {
        toast({
          title: 'Error',
          description: 'Device not found',
          variant: 'destructive',
        });
        return false;
      }

      const devices = [...(draft.devices ?? [])];
      const device = { ...targetDevice };
      device.fn_function_keys = device.fn_function_keys
        ? device.fn_function_keys.filter((_, idx) => idx !== index)
        : [];
      devices[selectedOption.target.deviceIndex] = device;
      draft.devices = devices;
    });

    if (!deleted) {
      return;
    }

    toast({
      title: 'Fn key mapping deleted',
      description: 'Function key mapping removed',
    });
  };

  const updateFnKey = (index: number, from: string, to: string) => {
    applyProfileUpdate(profile, onProfileChange, (draft) => {
      const newFnKey: FnFunctionKey = {
        from: { key_code: from },
        to: [{ key_code: to }],
      };

      if (selectedOption.target.type === 'profile') {
        if (!draft.fn_function_keys || !draft.fn_function_keys[index]) {
          return false;
        }
        const mappings = [...draft.fn_function_keys];
        mappings[index] = newFnKey;
        draft.fn_function_keys = mappings;
        return;
      }

      const targetDevice = draft.devices?.[selectedOption.target.deviceIndex];
      if (!targetDevice?.fn_function_keys) {
        toast({
          title: 'Error',
          description: 'Device not found',
          variant: 'destructive',
        });
        return false;
      }

      const devices = [...(draft.devices ?? [])];
      const device = { ...targetDevice };
      const mappings = device.fn_function_keys
        ? [...device.fn_function_keys]
        : [];
      mappings[index] = newFnKey;
      device.fn_function_keys = mappings;
      devices[selectedOption.target.deviceIndex] = device;
      draft.devices = devices;
    });
  };

  return (
    <div className='grid gap-6 lg:grid-cols-[250px_1fr]'>
      <DeviceTargetPanel
        title='Device'
        options={deviceOptions}
        selectedValue={selectedTarget}
        onSelect={setSelectedTarget}
        onDeleteDevice={deleteDevice}
        addControl={<AddDeviceDialog onAdd={addDevice} />}
      />

      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-semibold'>
              {selectedOption?.label || 'Fn Function Keys'}
            </h3>
            <p className='text-sm text-muted-foreground'>
              Remap function keys (F1-F20) behavior
            </p>
          </div>
          <Button onClick={addFnKey} size='sm' className='cursor-pointer'>
            <Plus className='mr-2 h-4 w-4' />
            Add Mapping
          </Button>
        </div>

        <ScrollArea className='h-[500px]'>
          <div className='space-y-3'>
            {currentFnKeys.length === 0 && (
              <Card className='p-8'>
                <p className='text-sm text-muted-foreground text-center'>
                  No function key mappings yet.
                </p>
              </Card>
            )}

            {currentFnKeys.map((fnKey, index) => (
              <Card key={`${selectedOption?.value}-${index}`} className='p-4'>
                <div className='flex items-center gap-4'>
                  <div className='flex-1 grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label className='text-xs'>From Key</Label>
                      <Select
                        value={fnKey.from.key_code || ''}
                        onValueChange={(key) =>
                          updateFnKey(
                            index,
                            key,
                            (Array.isArray(fnKey.to)
                              ? fnKey.to[0]?.key_code
                              : fnKey.to?.key_code) || '',
                          )
                        }
                      >
                        <SelectTrigger className='cursor-pointer'>
                          <SelectValue placeholder='Select function key' />
                        </SelectTrigger>
                        <SelectContent>
                          {FUNCTION_KEYS.map((key) => (
                            <SelectItem key={key} value={key}>
                              {key.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='space-y-2'>
                      <Label className='text-xs'>To Key</Label>
                      <KeyCodeSelector
                        value={
                          (Array.isArray(fnKey.to)
                            ? fnKey.to[0]?.key_code
                            : fnKey.to?.key_code) || ''
                        }
                        onChange={(key) =>
                          updateFnKey(index, fnKey.from.key_code || '', key)
                        }
                        placeholder='Select target key'
                      />
                    </div>
                  </div>

                  <Button
                    size='icon'
                    variant='ghost'
                    onClick={() => deleteFnKey(index)}
                    className='cursor-pointer'
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
