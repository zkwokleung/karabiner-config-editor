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
import { VisualKeyboard } from '@/components/keyboard/visual-keyboard';
import {
  formatDisplayWithKeyCode,
  getCharacterWithKeyCodeLabel,
  type KeyboardLayoutType,
} from '@/lib/keyboard-layout';
import { useKeyboardLayout } from '@/components/keyboard/keyboard-layout-context';
import {
  getEventKeyField,
  getEventKeyValue,
  resolveFieldForKeyValue,
  setEventKeyValue,
  extractKeySelection,
} from '@/lib/karabiner-keycodes';
import type { KeyCodeField } from '@/lib/keycodes/types';

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
  const [editFromField, setEditFromField] = useState<KeyCodeField | null>(null);
  const [editToKey, setEditToKey] = useState<string>('');
  const [editToField, setEditToField] = useState<KeyCodeField | null>(null);
  const { toast } = useToast();
  const { keyboardTypeV2 } = useKeyboardLayout();

  const formatKeyCode = (keyCode: string) =>
    getCharacterWithKeyCodeLabel(keyCode, keyboardTypeV2);

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

  const addSimpleModification = (
    from: string,
    to: string,
    options?: {
      fromField?: KeyCodeField | null;
      toField?: KeyCodeField | null;
    },
  ) => {
    if (!from || !to) {
      return;
    }

    const target = selectedOption?.target || { type: 'profile' as const };

    const fromResolved = options?.fromField ?? resolveFieldForKeyValue(from);
    const toResolved = options?.toField ?? resolveFieldForKeyValue(to);
    if (!fromResolved || !toResolved) {
      toast({
        title: 'Unable to resolve key field',
        description:
          'One or more keys are ambiguous or unknown. Please choose explicit key fields.',
        variant: 'destructive',
      });
      return;
    }

    const modification = {
      from: setEventKeyValue({}, from, fromResolved),
      to: [setEventKeyValue({}, to, toResolved)],
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
      description: `${formatKeyCode(from)} → ${formatKeyCode(to)}`,
    });
  };

  const updateSimpleModification = (
    fromKey: string,
    newToKey: string,
    newToField?: KeyCodeField | null,
  ) => {
    if (!fromKey || !newToKey) {
      return;
    }

    const target = selectedOption?.target || { type: 'profile' as const };
    const fromFieldResolved = resolveFieldForKeyValue(fromKey);
    if (!fromFieldResolved) {
      toast({
        title: 'Unable to resolve source key field',
        description:
          'The source key is ambiguous or unknown. Please choose a specific key field.',
        variant: 'destructive',
      });
      return;
    }

    const updated = applyProfileUpdate(profile, onProfileChange, (draft) => {
      if (target.type === 'profile') {
        draft.simple_modifications = draft.simple_modifications?.map((mod) => {
          const sel = extractKeySelection(
            mod.from as unknown as Record<string, string>,
          );
          if (sel?.value === fromKey && sel?.field === fromFieldResolved) {
            const currentTo = Array.isArray(mod.to) ? mod.to[0] : mod.to;
            const currentToField = getEventKeyField(
              (typeof currentTo === 'string'
                ? { key_code: currentTo }
                : currentTo) || {},
            );
            const targetField =
              (newToField as KeyCodeField | undefined) ??
              currentToField ??
              resolveFieldForKeyValue(newToKey);
            if (!targetField) {
              toast({
                title: 'Unable to resolve key field',
                description:
                  'The target key is ambiguous or unknown. Please choose a specific field.',
                variant: 'destructive',
              });
              return mod;
            }

            return {
              ...mod,
              to: [
                setEventKeyValue(
                  (typeof currentTo === 'string'
                    ? { key_code: currentTo }
                    : currentTo) || {},
                  newToKey,
                  targetField,
                ),
              ],
            };
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
            const sel = extractKeySelection(
              mod.from as unknown as Record<string, string>,
            );
            if (sel?.value === fromKey && sel?.field === fromFieldResolved) {
              const currentTo = Array.isArray(mod.to) ? mod.to[0] : mod.to;
              const currentToField = getEventKeyField(
                (typeof currentTo === 'string'
                  ? { key_code: currentTo }
                  : currentTo) || {},
              );
              const targetField =
                (newToField as KeyCodeField | undefined) ??
                currentToField ??
                resolveFieldForKeyValue(newToKey);
              if (!targetField) {
                toast({
                  title: 'Unable to resolve key field',
                  description:
                    'The target key is ambiguous or unknown. Please choose a specific field.',
                  variant: 'destructive',
                });
                return mod;
              }

              return {
                ...mod,
                to: [
                  setEventKeyValue(
                    (typeof currentTo === 'string'
                      ? { key_code: currentTo }
                      : currentTo) || {},
                    newToKey,
                    targetField,
                  ),
                ],
              };
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
      description: `${formatKeyCode(fromKey)} → ${formatKeyCode(newToKey)}`,
    });
  };

  const deleteSimpleModificationByFromKey = (fromKey: string) => {
    const target = selectedOption?.target || { type: 'profile' as const };

    const deleted = applyProfileUpdate(profile, onProfileChange, (draft) => {
      if (target.type === 'profile') {
        draft.simple_modifications = draft.simple_modifications?.filter(
          (mod) => getEventKeyValue(mod.from) !== fromKey,
        );
      } else {
        if (!draft.devices || !draft.devices[target.deviceIndex]) {
          return false;
        }

        const devices = [...draft.devices];
        const device = { ...devices[target.deviceIndex] };
        device.simple_modifications = device.simple_modifications?.filter(
          (mod) => getEventKeyValue(mod.from) !== fromKey,
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
      description: `Removed mapping for ${formatKeyCode(fromKey)}`,
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
    setEditFromField('key_code');
    setEditToKey('');
    setEditToField(null);
    setDialogOpen(true);
  };

  const handleEditMapping = (fromKey: string, currentToKey: string) => {
    setDialogMode('edit');
    setEditFromKey(fromKey);
    setEditToKey(currentToKey);
    const existing = currentModifications.find(
      (mod) => getEventKeyValue(mod.from) === fromKey,
    );
    setEditFromField(existing ? getEventKeyField(existing.from) : 'key_code');
    const currentTo = existing
      ? Array.isArray(existing.to)
        ? existing.to[0]
        : existing.to
      : undefined;
    setEditToField(
      currentTo && typeof currentTo !== 'string'
        ? getEventKeyField(currentTo)
        : 'key_code',
    );
    setDialogOpen(true);
  };

  const handleDeleteMapping = (fromKey: string) => {
    deleteSimpleModificationByFromKey(fromKey);
  };

  const handleDialogSubmit = () => {
    if (!editFromKey || !editToKey) return;

    if (dialogMode === 'create') {
      addSimpleModification(editFromKey, editToKey, {
        fromField: editFromField,
        toField: editToField,
      });
    } else {
      updateSimpleModification(editFromKey, editToKey, editToField);
    }

    setDialogOpen(false);
    setEditFromKey('');
    setEditFromField(null);
    setEditToKey('');
    setEditToField(null);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditFromKey('');
    setEditFromField(null);
    setEditToKey('');
    setEditToField(null);
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
                  setEditFromField(null);
                  setEditToKey('');
                  setEditToField(null);
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
                              {formatKeyLabel(mod.from, keyboardTypeV2)}
                            </code>
                            <span className='text-muted-foreground'>→</span>
                            <code className='px-3 py-1 rounded bg-muted text-sm font-mono'>
                              {formatKeyLabel(toValue, keyboardTypeV2)}
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
                valueField={editFromField}
                onChange={({ value, field }) => {
                  setEditFromKey(value);
                  setEditFromField(field);
                }}
                placeholder='Select or type key to remap'
                layoutAware
                layoutType={keyboardTypeV2}
              />
            </div>

            <div className='space-y-2'>
              <Label>To Key</Label>
              <KeyInput
                value={editToKey}
                valueField={editToField}
                onChange={({ value, field }) => {
                  setEditToKey(value);
                  setEditToField(field);
                }}
                placeholder='Select or type target key'
                layoutAware
                layoutType={keyboardTypeV2}
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

function formatKeyLabel(
  key: KeyCode | null | undefined,
  layoutType: KeyboardLayoutType,
): string {
  if (!key) {
    return '-';
  }

  if (key.key_code) {
    return getCharacterWithKeyCodeLabel(key.key_code, layoutType);
  }

  if (key.consumer_key_code) {
    const label = key.consumer_key_code.replace(/_/g, ' ');
    return formatDisplayWithKeyCode(label, key.consumer_key_code);
  }

  if (key.pointing_button) {
    const label = key.pointing_button.replace(/_/g, ' ');
    return formatDisplayWithKeyCode(label, key.pointing_button);
  }

  if (key.apple_vendor_top_case_key_code) {
    const label = key.apple_vendor_top_case_key_code.replace(/_/g, ' ');
    return formatDisplayWithKeyCode(label, key.apple_vendor_top_case_key_code);
  }

  if (key.apple_vendor_keyboard_key_code) {
    const label = key.apple_vendor_keyboard_key_code.replace(/_/g, ' ');
    return formatDisplayWithKeyCode(label, key.apple_vendor_keyboard_key_code);
  }

  if (key.generic_desktop) {
    const label = key.generic_desktop.replace(/_/g, ' ');
    return formatDisplayWithKeyCode(label, key.generic_desktop);
  }

  return '-';
}
