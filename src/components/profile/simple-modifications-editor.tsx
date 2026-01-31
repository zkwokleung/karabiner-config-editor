'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import type { Device, KeyCode, Profile } from '@/types/karabiner';
import type { DeviceTargetOption, DeviceScope } from '@/types/profile';
import { AddDeviceDialog } from '@/components/profile/add-device-dialog';
import { DeviceTargetPanel } from '@/components/profile/device-target-panel';
import {
  addDeviceToProfile,
  applyProfileUpdate,
  removeDeviceFromProfile,
} from '@/components/profile/profile-mutation-utils';
import { KeyInput } from '@/components/key-input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  findDuplicateSimpleModifications,
  type SimpleModificationDuplicate,
} from '@/lib/validation';
import { VisualKeyboard } from '@/components/visual-keyboard';
import { getKeyLabel } from '@/lib/keyboard-layout';

interface SimpleModificationsEditorProps {
  profile: Profile;
  onProfileChange: (profile: Profile) => void;
  profileIndex: number;
  deviceOptions: DeviceTargetOption[];
  deviceLabelLookup: Map<number, string>;
}

type ModificationLocation = DeviceScope & {
  modIndex: number;
};

export function SimpleModificationsEditor({
  profile,
  onProfileChange,
  profileIndex,
  deviceOptions,
  deviceLabelLookup,
}: SimpleModificationsEditorProps) {
  const [selectedTarget, setSelectedTarget] = useState<string>('profile');
  const [editorMode, setEditorMode] = useState<'visual' | 'list'>('visual');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editFromKey, setEditFromKey] = useState<string>('');
  const [editToKey, setEditToKey] = useState<string>('');
  const { toast } = useToast();

  const duplicates = useMemo<SimpleModificationDuplicate[]>(() => {
    return findDuplicateSimpleModifications(profile);
  }, [profile]);

  const duplicateMessages = useMemo(() => {
    return duplicates.map((duplicate) =>
      duplicate.scope === 'profile'
        ? `${duplicate.key} (All devices)`
        : `${duplicate.key} (${deviceLabelLookup.get(duplicate.deviceIndex ?? -1) || 'Unknown device'})`,
    );
  }, [deviceLabelLookup, duplicates]);

  const selectedOption = useMemo(() => {
    return (
      deviceOptions.find((option) => option.value === selectedTarget) ||
      deviceOptions[0]
    );
  }, [deviceOptions, selectedTarget]);

  const conflictingKeysSet = useMemo(() => {
    const set = new Set<string>();
    duplicates.forEach((dup) => {
      if (
        (dup.scope === 'profile' &&
          selectedOption?.target.type === 'profile') ||
        (dup.scope === 'device' &&
          selectedOption?.target.type === 'device' &&
          dup.deviceIndex === selectedOption.target.deviceIndex)
      ) {
        set.add(dup.key);
      }
    });
    return set;
  }, [duplicates, selectedOption]);

  const currentModifications = useMemo(() => {
    if (!selectedOption) {
      return [];
    }

    if (selectedOption.target.type === 'profile') {
      return profile.simple_modifications || [];
    }

    const device = profile.devices?.[selectedOption.target.deviceIndex];
    return device?.simple_modifications || [];
  }, [profile, selectedOption]);

  useEffect(() => {
    setSelectedTarget('profile');
  }, [profileIndex]);

  const addDevice = (device: Device) => {
    const deviceWithDefaults: Device = {
      ...device,
      simple_modifications: device.simple_modifications ?? [],
    };

    if (device.fn_function_keys !== undefined) {
      deviceWithDefaults.fn_function_keys = device.fn_function_keys;
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

  const addSimpleModification = (from: string, to: string) => {
    if (!from || !to) {
      return;
    }

    const target = selectedOption?.target || { type: 'profile' as const };

    const modification = {
      from: { key_code: from },
      to: [{ key_code: to }],
    };

    const updated = applyProfileUpdate(profile, onProfileChange, (draft) => {
      if (target.type === 'profile') {
        const modifications = draft.simple_modifications
          ? [...draft.simple_modifications]
          : [];
        modifications.push(modification);
        draft.simple_modifications = modifications;
      } else {
        if (!draft.devices || !draft.devices[target.deviceIndex]) {
          toast({
            title: 'Unable to add',
            description: 'The selected device could not be found.',
            variant: 'destructive',
          });
          return false;
        }

        const devices = draft.devices ? [...draft.devices] : [];
        const device = { ...devices[target.deviceIndex] };
        const deviceMods = device.simple_modifications
          ? [...device.simple_modifications]
          : [];
        deviceMods.push(modification);
        device.simple_modifications = deviceMods;
        devices[target.deviceIndex] = device;
        draft.devices = devices;
      }
    });

    if (!updated) {
      return;
    }

    toast({
      title: 'Mapping created',
      description: `${getKeyLabel(from)} → ${getKeyLabel(to)}`,
    });
  };

  const updateSimpleModification = (fromKey: string, newToKey: string) => {
    if (!fromKey || !newToKey) {
      return;
    }

    const target = selectedOption?.target || { type: 'profile' as const };

    const updated = applyProfileUpdate(profile, onProfileChange, (draft) => {
      if (target.type === 'profile') {
        draft.simple_modifications = draft.simple_modifications?.map((mod) => {
          if (mod.from.key_code === fromKey) {
            return { ...mod, to: [{ key_code: newToKey }] };
          }
          return mod;
        });
      } else {
        if (!draft.devices || !draft.devices[target.deviceIndex]) {
          return false;
        }

        const devices = [...draft.devices];
        const device = { ...devices[target.deviceIndex] };
        device.simple_modifications = device.simple_modifications?.map(
          (mod) => {
            if (mod.from.key_code === fromKey) {
              return { ...mod, to: [{ key_code: newToKey }] };
            }
            return mod;
          },
        );
        devices[target.deviceIndex] = device;
        draft.devices = devices;
      }
    });

    if (!updated) {
      return;
    }

    toast({
      title: 'Mapping updated',
      description: `${getKeyLabel(fromKey)} → ${getKeyLabel(newToKey)}`,
    });
  };

  const deleteSimpleModificationByFromKey = (fromKey: string) => {
    const target = selectedOption?.target || { type: 'profile' as const };

    const deleted = applyProfileUpdate(profile, onProfileChange, (draft) => {
      if (target.type === 'profile') {
        draft.simple_modifications = draft.simple_modifications?.filter(
          (mod) => mod.from.key_code !== fromKey,
        );
      } else {
        if (!draft.devices || !draft.devices[target.deviceIndex]) {
          return false;
        }

        const devices = [...draft.devices];
        const device = { ...devices[target.deviceIndex] };
        device.simple_modifications = device.simple_modifications?.filter(
          (mod) => mod.from.key_code !== fromKey,
        );
        devices[target.deviceIndex] = device;
        draft.devices = devices;
      }
    });

    if (!deleted) {
      return;
    }

    toast({
      title: 'Mapping removed',
      description: `Removed mapping for ${getKeyLabel(fromKey)}`,
    });
  };

  const deleteSimpleModification = (location: ModificationLocation) => {
    const deleted = applyProfileUpdate(profile, onProfileChange, (draft) => {
      if (location.type === 'profile') {
        draft.simple_modifications = draft.simple_modifications
          ? draft.simple_modifications.filter(
              (_, index) => index !== location.modIndex,
            )
          : [];
        return;
      }

      if (!draft.devices || !draft.devices[location.deviceIndex]) {
        toast({
          title: 'Unable to delete',
          description: 'The selected device could not be found.',
          variant: 'destructive',
        });
        return false;
      }

      const devices = [...draft.devices];
      const device = { ...devices[location.deviceIndex] };
      device.simple_modifications = device.simple_modifications
        ? device.simple_modifications.filter(
            (_, index) => index !== location.modIndex,
          )
        : [];
      devices[location.deviceIndex] = device;
      draft.devices = devices;
    });

    if (!deleted) {
      return;
    }

    toast({
      title: 'Mapping removed',
    });
  };

  // Handlers for visual keyboard context menu
  const handleCreateMapping = (fromKey: string) => {
    setDialogMode('create');
    setEditFromKey(fromKey);
    setEditToKey('');
    setDialogOpen(true);
  };

  const handleEditMapping = (fromKey: string, currentToKey: string) => {
    setDialogMode('edit');
    setEditFromKey(fromKey);
    setEditToKey(currentToKey);
    setDialogOpen(true);
  };

  const handleDeleteMapping = (fromKey: string) => {
    deleteSimpleModificationByFromKey(fromKey);
  };

  const handleDialogSubmit = () => {
    if (!editFromKey || !editToKey) return;

    if (dialogMode === 'create') {
      addSimpleModification(editFromKey, editToKey);
    } else {
      updateSimpleModification(editFromKey, editToKey);
    }

    setDialogOpen(false);
    setEditFromKey('');
    setEditToKey('');
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditFromKey('');
    setEditToKey('');
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
          <h3 className='text-lg font-semibold'>
            {selectedOption?.label || 'Modifications'}
          </h3>
          <Tabs
            value={editorMode}
            onValueChange={(v) => setEditorMode(v as 'visual' | 'list')}
          >
            <TabsList className='h-8'>
              <TabsTrigger value='visual' className='text-xs px-3 h-7'>
                Visual
              </TabsTrigger>
              <TabsTrigger value='list' className='text-xs px-3 h-7'>
                List
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {duplicateMessages.length > 0 && (
          <Alert variant='destructive'>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>
              <p className='font-semibold'>Duplicate key mappings detected:</p>
              <p className='text-sm'>{duplicateMessages.join(', ')}</p>
            </AlertDescription>
          </Alert>
        )}

        {editorMode === 'visual' ? (
          <Card className='p-4'>
            <VisualKeyboard
              mappings={currentModifications}
              conflictingKeys={conflictingKeysSet}
              onCreateMapping={handleCreateMapping}
              onEditMapping={handleEditMapping}
              onDeleteMapping={handleDeleteMapping}
            />
          </Card>
        ) : (
          <div className='space-y-4'>
            <div className='flex justify-end'>
              <Button
                size='sm'
                onClick={() => {
                  setDialogMode('create');
                  setEditFromKey('');
                  setEditToKey('');
                  setDialogOpen(true);
                }}
              >
                <Plus className='mr-2 h-4 w-4' />
                Add Mapping
              </Button>
            </div>
            <ScrollArea className='h-[500px]'>
              <div className='space-y-3'>
                {currentModifications.length > 0 ? (
                  currentModifications.map((mod, index) => {
                    const toRaw = Array.isArray(mod.to) ? mod.to[0] : mod.to;
                    const toValue =
                      typeof toRaw === 'string' ? { key_code: toRaw } : toRaw;
                    const location: ModificationLocation =
                      selectedOption?.target.type === 'profile'
                        ? { type: 'profile', modIndex: index }
                        : {
                            type: 'device',
                            deviceIndex:
                              selectedOption?.target.type === 'device'
                                ? selectedOption.target.deviceIndex
                                : 0,
                            modIndex: index,
                          };

                    return (
                      <Card
                        key={`${selectedOption?.value}-${index}`}
                        className='p-4'
                      >
                        <div className='flex items-center justify-between gap-4'>
                          <div className='flex items-center gap-3'>
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
                            onClick={() => deleteSimpleModification(location)}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </Card>
                    );
                  })
                ) : (
                  <p className='text-sm text-muted-foreground text-center py-8'>
                    No mappings for this device yet.
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Shared Dialog for Create/Edit */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => !open && handleDialogClose()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create'
                ? 'Create Key Mapping'
                : 'Edit Key Mapping'}
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-4 pt-4'>
            <div className='space-y-2'>
              <Label>From Key</Label>
              <KeyInput
                value={editFromKey}
                onChange={setEditFromKey}
                placeholder='Select or type key to remap'
              />
            </div>

            <div className='space-y-2'>
              <Label>To Key</Label>
              <KeyInput
                value={editToKey}
                onChange={setEditToKey}
                placeholder='Select or type target key'
              />
            </div>

            <Button
              onClick={handleDialogSubmit}
              className='w-full'
              disabled={!editFromKey || !editToKey}
            >
              {dialogMode === 'create' ? 'Create Mapping' : 'Update Mapping'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatKeyLabel(key?: KeyCode | null): string {
  if (!key) {
    return '-';
  }

  if (key.key_code) {
    return key.key_code.replace(/_/g, ' ');
  }

  if (key.consumer_key_code) {
    return key.consumer_key_code.replace(/_/g, ' ');
  }

  if (key.pointing_button) {
    return key.pointing_button.replace(/_/g, ' ');
  }

  return '-';
}
