'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
  KarabinerConfig,
  Profile,
  Rule,
  FnFunctionKey,
  Device,
  SimpleModification,
  KeyCode,
} from '@/types/karabiner';
import { useToast } from '@/hooks/use-toast';
import { ComplexModificationsEditor } from '@/components/complex-modifications-editor';
import { FnFunctionKeysEditor } from '@/components/fn-function-keys-editor';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { KeyInput } from '@/components/key-input';
import {
  findDuplicateSimpleModifications,
  type SimpleModificationDuplicate,
} from '@/lib/validation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProfileEditorProps {
  config: KarabinerConfig;
  setConfig: (config: KarabinerConfig) => void;
}

type ModificationTarget =
  | {
      type: 'profile';
    }
  | {
      type: 'device';
      deviceIndex: number;
    };

type ModificationLocation = ModificationTarget & {
  modIndex: number;
};

interface ModificationTargetOption {
  label: string;
  value: string;
  target: ModificationTarget;
}

export function ProfileEditor({ config, setConfig }: ProfileEditorProps) {
  const [selectedProfileIndex, setSelectedProfileIndex] = useState(0);
  const { toast } = useToast();

  const selectedProfile = config.profiles[selectedProfileIndex];

  const duplicates: SimpleModificationDuplicate[] =
    findDuplicateSimpleModifications(selectedProfile);

  const deviceOptions = useMemo<ModificationTargetOption[]>(() => {
    const options: ModificationTargetOption[] = [
      {
        label: 'All devices',
        value: 'profile',
        target: { type: 'profile' },
      },
    ];

    selectedProfile.devices?.forEach((device, index) => {
      options.push({
        label: formatDeviceLabel(device, index),
        value: `device-${index}`,
        target: { type: 'device', deviceIndex: index },
      });
    });

    return options;
  }, [selectedProfile.devices]);

  const deviceLabelLookup = useMemo(() => {
    const map = new Map<number, string>();
    selectedProfile.devices?.forEach((device, index) => {
      map.set(index, formatDeviceLabel(device, index));
    });
    return map;
  }, [selectedProfile.devices]);

  const duplicateMessages = useMemo(() => {
    return duplicates.map((duplicate) =>
      duplicate.scope === 'profile'
        ? `${duplicate.key} (All devices)`
        : `${duplicate.key} (${deviceLabelLookup.get(duplicate.deviceIndex ?? -1) || 'Unknown device'})`,
    );
  }, [deviceLabelLookup, duplicates]);

  // Update profile name
  const updateProfileName = (name: string) => {
    const newConfig = { ...config };
    newConfig.profiles[selectedProfileIndex].name = name;
    setConfig(newConfig);
  };

  // Add new profile
  const addProfile = () => {
    const newProfile: Profile = {
      name: `Profile ${config.profiles.length + 1}`,
      selected: false,
      simple_modifications: [],
    };
    setConfig({
      ...config,
      profiles: [...config.profiles, newProfile],
    });
    setSelectedProfileIndex(config.profiles.length);
    toast({
      title: 'Profile added',
      description: 'New profile created successfully',
    });
  };

  // Delete profile
  const deleteProfile = (index: number) => {
    if (config.profiles.length === 1) {
      toast({
        title: 'Cannot delete',
        description: 'At least one profile is required',
        variant: 'destructive',
      });
      return;
    }
    const newProfiles = config.profiles.filter((_, i) => i !== index);
    setConfig({ ...config, profiles: newProfiles });
    setSelectedProfileIndex(Math.max(0, index - 1));
    toast({
      title: 'Profile deleted',
      description: 'Profile removed successfully',
    });
  };

  // Add simple modification
  const addSimpleModification = (
    from: string,
    to: string,
    target: ModificationTarget,
  ) => {
    const newConfig = { ...config };
    const profile = newConfig.profiles[selectedProfileIndex];

    const modification = {
      from: { key_code: from },
      to: [{ key_code: to }],
    };

    if (target.type === 'profile') {
      if (!profile.simple_modifications) {
        profile.simple_modifications = [];
      }
      profile.simple_modifications.push(modification);
    } else {
      if (!profile.devices || !profile.devices[target.deviceIndex]) {
        toast({
          title: 'Unable to add',
          description: 'The selected device could not be found.',
          variant: 'destructive',
        });
        return;
      }
      const device = profile.devices[target.deviceIndex];
      if (!device.simple_modifications) {
        device.simple_modifications = [];
      }
      device.simple_modifications.push(modification);
    }

    setConfig(newConfig);
    const targetLabel =
      target.type === 'profile'
        ? 'All devices'
        : deviceLabelLookup.get(target.deviceIndex) ||
          `Device ${target.deviceIndex + 1}`;
    toast({
      title: 'Modification added',
      description: `${from} → ${to} (${targetLabel})`,
    });
  };

  // Delete simple modification
  const deleteSimpleModification = (location: ModificationLocation) => {
    const newConfig = { ...config };
    const profile = newConfig.profiles[selectedProfileIndex];

    if (location.type === 'profile') {
      profile.simple_modifications?.splice(location.modIndex, 1);
    } else if (profile.devices?.[location.deviceIndex]) {
      profile.devices[location.deviceIndex].simple_modifications?.splice(
        location.modIndex,
        1,
      );
    } else {
      toast({
        title: 'Unable to delete',
        description: 'The selected device could not be found.',
        variant: 'destructive',
      });
      return;
    }

    setConfig(newConfig);
    const targetLabel =
      location.type === 'profile'
        ? 'All devices'
        : deviceLabelLookup.get(location.deviceIndex) ||
          `Device ${location.deviceIndex + 1}`;
    toast({
      title: 'Modification deleted',
      description: `Removed mapping for ${targetLabel}`,
    });
  };

  // Update complex modifications
  const updateComplexModifications = (rules: Rule[]) => {
    const newConfig = { ...config };
    if (!newConfig.profiles[selectedProfileIndex].complex_modifications) {
      newConfig.profiles[selectedProfileIndex].complex_modifications = {
        rules: [],
      };
    }
    newConfig.profiles[selectedProfileIndex].complex_modifications!.rules =
      rules;
    setConfig(newConfig);
  };

  // Update fn function keys
  const updateFnFunctionKeys = (fnKeys: FnFunctionKey[]) => {
    const newConfig = { ...config };
    newConfig.profiles[selectedProfileIndex].fn_function_keys = fnKeys;
    setConfig(newConfig);
  };

  return (
    <div className='grid gap-6 lg:grid-cols-[300px_1fr]'>
      {/* Profile List */}
      <Card className='p-4'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='font-semibold'>Profiles</h3>
          <Button size='sm' onClick={addProfile}>
            <Plus className='h-4 w-4' />
          </Button>
        </div>
        <ScrollArea className='h-[500px]'>
          <div className='space-y-2'>
            {config.profiles.map((profile, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedProfileIndex === index
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-muted'
                }`}
                onClick={() => setSelectedProfileIndex(index)}
              >
                <span className='text-sm font-medium truncate'>
                  {profile.name}
                </span>
                {config.profiles.length > 1 && (
                  <Button
                    size='icon'
                    variant='ghost'
                    className='h-6 w-6'
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProfile(index);
                    }}
                  >
                    <Trash2 className='h-3 w-3' />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Profile Editor */}
      <Card className='p-6'>
        {/* Tabs for simple, fn function keys, and complex modifications */}
        <Tabs defaultValue='simple' className='w-full'>
          <div className='space-y-4 mb-6'>
            {/* Profile Name */}
            <div className='space-y-2'>
              <Label>Profile Name</Label>
              <Input
                value={selectedProfile.name}
                onChange={(e) => updateProfileName(e.target.value)}
                placeholder='Profile name'
              />
            </div>
          </div>

          <TabsList className='grid w-full grid-cols-3 mb-6'>
            <TabsTrigger value='simple' className='cursor-pointer'>
              Simple
            </TabsTrigger>
            <TabsTrigger value='fn' className='cursor-pointer'>
              Fn Keys
            </TabsTrigger>
            <TabsTrigger value='complex' className='cursor-pointer'>
              Complex
            </TabsTrigger>
          </TabsList>

          <TabsContent value='simple' className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold'>Simple Modifications</h3>
              <AddModificationDialog
                onAdd={addSimpleModification}
                options={deviceOptions}
                defaultValue='profile'
              />
            </div>

            {duplicateMessages.length > 0 && (
              <Alert variant='destructive'>
                <AlertTriangle className='h-4 w-4' />
                <AlertDescription>
                  <p className='font-semibold'>
                    Duplicate key mappings detected:
                  </p>
                  <p className='text-sm'>{duplicateMessages.join(', ')}</p>
                </AlertDescription>
              </Alert>
            )}

            <ScrollArea className='h-[500px]'>
              <div className='space-y-6'>
                <SimpleModificationSection
                  title='All devices'
                  modifications={selectedProfile.simple_modifications}
                  emptyMessage='No mappings for all devices yet.'
                  onDelete={(modIndex) =>
                    deleteSimpleModification({ type: 'profile', modIndex })
                  }
                />

                {selectedProfile.devices?.map((device, deviceIndex) => (
                  <SimpleModificationSection
                    key={`device-${deviceIndex}`}
                    title={
                      deviceLabelLookup.get(deviceIndex) ||
                      formatDeviceLabel(device, deviceIndex)
                    }
                    modifications={device.simple_modifications}
                    emptyMessage='No mappings for this device yet.'
                    onDelete={(modIndex) =>
                      deleteSimpleModification({
                        type: 'device',
                        deviceIndex,
                        modIndex,
                      })
                    }
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value='fn'>
            <FnFunctionKeysEditor
              fnKeys={selectedProfile.fn_function_keys || []}
              onChange={updateFnFunctionKeys}
            />
          </TabsContent>

          <TabsContent value='complex'>
            <ComplexModificationsEditor
              rules={selectedProfile.complex_modifications?.rules || []}
              onRulesChange={updateComplexModifications}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

function SimpleModificationSection({
  title,
  modifications,
  onDelete,
  emptyMessage,
}: {
  title: string;
  modifications: SimpleModification[] | undefined;
  onDelete: (index: number) => void;
  emptyMessage: string;
}) {
  const items = modifications ?? [];
  const hasModifications = items.length > 0;

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <h4 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide'>
          {title}
        </h4>
      </div>
      {hasModifications ? (
        items.map((mod, index) => {
          const toValue = Array.isArray(mod.to) ? mod.to[0] : mod.to;
          return (
            <div
              key={`${title}-${index}`}
              className='flex items-center justify-between p-4 rounded-lg border bg-card'
            >
              <div className='flex items-center gap-4'>
                <code className='px-3 py-1 rounded bg-muted text-sm font-mono'>
                  {formatKeyLabel(mod.from)}
                </code>
                <span className='text-muted-foreground'>→</span>
                <code className='px-3 py-1 rounded bg-muted text-sm font-mono'>
                  {formatKeyLabel(toValue)}
                </code>
              </div>
              <Button
                size='icon'
                variant='ghost'
                onClick={() => onDelete(index)}
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          );
        })
      ) : (
        <p className='text-sm text-muted-foreground text-center py-8'>
          {emptyMessage}
        </p>
      )}
    </div>
  );
}

function formatKeyLabel(key: KeyCode | undefined): string {
  if (!key) {
    return 'unknown';
  }
  return (
    key.key_code || key.consumer_key_code || key.pointing_button || 'unknown'
  );
}

function formatDeviceLabel(device: Device, index: number): string {
  const identifiers = device.identifiers || {};
  const descriptorParts: string[] = [];

  if (identifiers.vendor_id !== undefined) {
    descriptorParts.push(`VID ${identifiers.vendor_id}`);
  }
  if (identifiers.product_id !== undefined) {
    descriptorParts.push(`PID ${identifiers.product_id}`);
  }
  if (identifiers.is_keyboard) {
    descriptorParts.push('Keyboard');
  }
  if (identifiers.is_pointing_device) {
    descriptorParts.push('Pointing device');
  }

  if (descriptorParts.length === 0) {
    return `Device ${index + 1}`;
  }

  return `Device ${index + 1} • ${descriptorParts.join(' • ')}`;
}

function AddModificationDialog({
  onAdd,
  options,
  defaultValue,
}: {
  onAdd: (from: string, to: string, target: ModificationTarget) => void;
  options: ModificationTargetOption[];
  defaultValue?: string;
}) {
  const [open, setOpen] = useState(false);
  const [fromKey, setFromKey] = useState('');
  const [toKey, setToKey] = useState('');
  const [selectedTarget, setSelectedTarget] = useState(
    defaultValue || options[0]?.value || '',
  );

  useEffect(() => {
    if (open) {
      const fallback = defaultValue || options[0]?.value || '';
      setSelectedTarget(fallback);
    }
  }, [defaultValue, open, options]);

  const selectedOption = options.find(
    (option) => option.value === selectedTarget,
  );

  const handleAdd = () => {
    if (fromKey && toKey && selectedOption) {
      onAdd(fromKey, toKey, selectedOption.target);
      setFromKey('');
      setToKey('');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='sm'>
          <Plus className='mr-2 h-4 w-4' />
          Add Mapping
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Key Mapping</DialogTitle>
        </DialogHeader>
        <div className='space-y-4 pt-4'>
          <div className='space-y-2'>
            <Label>From Key</Label>
            <KeyInput
              value={fromKey}
              onChange={setFromKey}
              placeholder='Select or type key to remap'
            />
          </div>

          <div className='space-y-2'>
            <Label>To Key</Label>
            <KeyInput
              value={toKey}
              onChange={setToKey}
              placeholder='Select or type target key'
            />
          </div>

          <div className='space-y-2'>
            <Label>Applies To</Label>
            <Select
              value={selectedTarget}
              onValueChange={setSelectedTarget}
              disabled={options.length === 0}
            >
              <SelectTrigger className='w-full cursor-pointer'>
                <SelectValue placeholder='Select target device' />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className='cursor-pointer'
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleAdd}
            className='w-full'
            disabled={!fromKey || !toKey || !selectedOption}
          >
            Add Mapping
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
